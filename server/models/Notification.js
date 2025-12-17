import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: [
        "message",
        "booking_confirmation",
        "booking_request",
        "package_update",
        "new_review",
        "review_reply",
        "price_drop",
        "package_created",
        "system",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
      },
      reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
      actionUrl: String,
      metadata: mongoose.Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
  try {
    const notification = await this.create(data);
    return notification.populate([
      { path: "sender", select: "name avatar" },
      { path: "data.packageId", select: "title images" },
    ]);
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Method to mark as read
notificationSchema.methods.markAsRead = async function () {
  this.read = true;
  this.readAt = new Date();
  return await this.save();
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
