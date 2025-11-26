import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price cannot be negative"],
    },
    duration: {
      type: String,
      required: [true, "Please add duration"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      enum: [
        "Adventure",
        "Beach",
        "Mountain",
        "Cultural",
        "Wildlife",
        "City",
        "Cruise",
        "Other",
      ],
      default: "Other",
    },
    images: [
      {
        type: String,
      },
    ],
    maxGroupSize: {
      type: Number,
      default: 10,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Difficult"],
      default: "Moderate",
    },
    included: [
      {
        type: String,
      },
    ],
    excluded: [
      {
        type: String,
      },
    ],
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
packageSchema.index({ title: "text", description: "text", location: "text" });
packageSchema.index({ category: 1, price: 1 });

const Package = mongoose.model("Package", packageSchema);

export default Package;
