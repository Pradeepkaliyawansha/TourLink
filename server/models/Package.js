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
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

packageSchema.virtual("reviewCount", {
  ref: "Review",
  localField: "_id",
  foreignField: "package",
  count: true,
});

// Index for search optimization
packageSchema.index({ title: "text", description: "text", location: "text" });
packageSchema.index({ category: 1, price: 1 });
packageSchema.index({ rating: -1 });
packageSchema.index({ createdAt: -1 });

const Package = mongoose.model("Package", packageSchema);

export default Package;
