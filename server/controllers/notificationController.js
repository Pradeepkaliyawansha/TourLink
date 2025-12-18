import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";
import NotificationPreference from "../models/NotificationPreference.js";

// Helper function to create default preferences
const createDefaultPreferences = (userId) => {
  return {
    user: userId,
    email: {
      enabled: true,
      types: {
        message: true,
        booking_confirmation: true,
        booking_request: true,
        package_update: true,
        new_review: true,
        review_reply: true,
        price_drop: true,
        package_created: false,
        system: true,
      },
      frequency: "instant",
    },
    inApp: {
      enabled: true,
      types: {
        message: true,
        booking_confirmation: true,
        booking_request: true,
        package_update: true,
        new_review: true,
        review_reply: true,
        price_drop: true,
        package_created: true,
        system: true,
      },
      sound: true,
      desktop: true,
    },
    push: {
      enabled: false,
      subscription: null,
      types: {
        message: true,
        booking_confirmation: true,
        booking_request: true,
        package_update: false,
        new_review: true,
        review_reply: true,
        price_drop: false,
        package_created: false,
        system: true,
      },
    },
    doNotDisturb: {
      enabled: false,
      startTime: "22:00",
      endTime: "08:00",
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    digest: {
      enabled: false,
      frequency: "daily",
      time: "09:00",
      types: [
        "booking_confirmation",
        "booking_request",
        "new_review",
        "review_reply",
      ],
    },
    muted: {
      users: [],
      packages: [],
    },
    language: "en",
  };
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, read, type } = req.query;

  const query = { recipient: req.user._id };

  if (read !== undefined) {
    query.read = read === "true";
  }

  if (type) {
    query.type = type;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const notifications = await Notification.find(query)
    .populate("sender", "name avatar")
    .populate("data.packageId", "title images")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: notifications,
  });
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.json({
    success: true,
    unreadCount,
  });
});

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
    .populate("sender", "name avatar")
    .populate("data.packageId", "title images");

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to access this notification");
  }

  res.json({
    success: true,
    data: notification,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await notification.markAsRead();

  res.json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true, readAt: new Date() }
  );

  res.json({
    success: true,
    message: `Marked ${result.modifiedCount} notifications as read`,
    modifiedCount: result.modifiedCount,
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await notification.deleteOne();

  res.json({
    success: true,
    message: "Notification deleted",
  });
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read
// @access  Private
export const deleteReadNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    recipient: req.user._id,
    read: true,
  });

  res.json({
    success: true,
    message: `Deleted ${result.deletedCount} notifications`,
    deletedCount: result.deletedCount,
  });
});

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
export const getPreferences = asyncHandler(async (req, res) => {
  try {
    console.log(`📋 Fetching preferences for user: ${req.user._id}`);

    let preferences = await NotificationPreference.findOne({
      user: req.user._id,
    });

    if (!preferences) {
      console.log(`🆕 Creating default preferences for user: ${req.user._id}`);

      const defaultPrefs = createDefaultPreferences(req.user._id);
      preferences = await NotificationPreference.create(defaultPrefs);

      console.log(`✅ Default preferences created successfully`);
    }

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("❌ Error in getPreferences:", error);

    // Send detailed error for debugging
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification preferences",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
export const updatePreferences = asyncHandler(async (req, res) => {
  try {
    console.log(`📝 Updating preferences for user: ${req.user._id}`);

    let preferences = await NotificationPreference.findOne({
      user: req.user._id,
    });

    if (!preferences) {
      console.log(
        `🆕 Creating preferences during update for user: ${req.user._id}`
      );

      const defaultPrefs = createDefaultPreferences(req.user._id);
      preferences = new NotificationPreference(defaultPrefs);
    }

    // Update nested objects carefully
    if (req.body.email) {
      if (req.body.email.enabled !== undefined) {
        preferences.email.enabled = req.body.email.enabled;
      }
      if (req.body.email.types) {
        Object.assign(preferences.email.types, req.body.email.types);
      }
      if (req.body.email.frequency) {
        preferences.email.frequency = req.body.email.frequency;
      }
    }

    if (req.body.inApp) {
      if (req.body.inApp.enabled !== undefined) {
        preferences.inApp.enabled = req.body.inApp.enabled;
      }
      if (req.body.inApp.types) {
        Object.assign(preferences.inApp.types, req.body.inApp.types);
      }
      if (req.body.inApp.sound !== undefined) {
        preferences.inApp.sound = req.body.inApp.sound;
      }
      if (req.body.inApp.desktop !== undefined) {
        preferences.inApp.desktop = req.body.inApp.desktop;
      }
    }

    if (req.body.push) {
      if (req.body.push.enabled !== undefined) {
        preferences.push.enabled = req.body.push.enabled;
      }
      if (req.body.push.types) {
        Object.assign(preferences.push.types, req.body.push.types);
      }
      if (req.body.push.subscription !== undefined) {
        preferences.push.subscription = req.body.push.subscription;
      }
    }

    if (req.body.doNotDisturb) {
      Object.assign(preferences.doNotDisturb, req.body.doNotDisturb);
    }

    if (req.body.digest) {
      Object.assign(preferences.digest, req.body.digest);
    }

    if (req.body.language) {
      preferences.language = req.body.language;
    }

    await preferences.save();

    console.log(`✅ Preferences updated successfully`);

    res.json({
      success: true,
      data: preferences,
      message: "Notification preferences updated successfully",
    });
  } catch (error) {
    console.error("❌ Error in updatePreferences:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
      error: error.message,
    });
  }
});

// @desc    Reset preferences to default
// @route   PUT /api/notifications/preferences/reset
// @access  Private
export const resetPreferences = asyncHandler(async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({
      user: req.user._id,
    });

    if (preferences) {
      await preferences.deleteOne();
    }

    const defaultPrefs = createDefaultPreferences(req.user._id);
    preferences = await NotificationPreference.create(defaultPrefs);

    res.json({
      success: true,
      data: preferences,
      message: "Notification preferences reset to defaults",
    });
  } catch (error) {
    console.error("Error resetting preferences:", error);
    res.status(500);
    throw new Error("Failed to reset preferences");
  }
});

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/push/subscribe
// @access  Private
export const subscribeToPush = asyncHandler(async (req, res) => {
  const { subscription } = req.body;

  if (!subscription) {
    res.status(400);
    throw new Error("Subscription data required");
  }

  let preferences = await NotificationPreference.findOne({
    user: req.user._id,
  });

  if (!preferences) {
    const defaultPrefs = createDefaultPreferences(req.user._id);
    preferences = await NotificationPreference.create(defaultPrefs);
  }

  preferences.push.enabled = true;
  preferences.push.subscription = subscription;
  await preferences.save();

  res.json({
    success: true,
    message: "Successfully subscribed to push notifications",
    data: preferences.push,
  });
});

// @desc    Unsubscribe from push notifications
// @route   POST /api/notifications/push/unsubscribe
// @access  Private
export const unsubscribeFromPush = asyncHandler(async (req, res) => {
  const preferences = await NotificationPreference.findOne({
    user: req.user._id,
  });

  if (preferences) {
    preferences.push.enabled = false;
    preferences.push.subscription = null;
    await preferences.save();
  }

  res.json({
    success: true,
    message: "Successfully unsubscribed from push notifications",
  });
});

// Export all functions
export default {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  getPreferences,
  updatePreferences,
  resetPreferences,
  subscribeToPush,
  unsubscribeFromPush,
};
