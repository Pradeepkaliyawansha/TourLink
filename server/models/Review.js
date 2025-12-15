import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "Please provide a review title"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Please provide a review comment"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    photos: [
      {
        type: String, // Store relative paths
      },
    ],
    isVerifiedBooking: {
      type: Boolean,
      default: false,
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Auto-approve by default, can be changed to 'pending'
    },
    moderationNote: {
      type: String,
    },
    helpfulVotes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    unhelpfulVotes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    guideReply: {
      message: String,
      repliedAt: Date,
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        editedAt: Date,
        previousComment: String,
        previousRating: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
reviewSchema.index({ package: 1, createdAt: -1 });
reviewSchema.index({ user: 1, package: 1 }, { unique: true }); // One review per user per package
reviewSchema.index({ rating: 1 });
reviewSchema.index({ moderationStatus: 1 });

// Virtual for helpful vote count
reviewSchema.virtual("helpfulCount").get(function () {
  return this.helpfulVotes.length;
});

// Virtual for unhelpful vote count
reviewSchema.virtual("unhelpfulCount").get(function () {
  return this.unhelpfulVotes.length;
});

// Ensure virtuals are included in JSON
reviewSchema.set("toJSON", { virtuals: true });
reviewSchema.set("toObject", { virtuals: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
