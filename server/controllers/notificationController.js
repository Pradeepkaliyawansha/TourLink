import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";
import NotificationPreference from "../models/NotificationPreference.js";

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

  // Check authorization
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

// @desc    Mark notification as unread
// @route   PUT /api/notifications/:id/unread
// @access  Private
export const markAsUnread = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  notification.read = false;
  notification.readAt = null;
  await notification.save();

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

// @desc    Mark multiple notifications as read
// @route   PUT /api/notifications/mark-read-bulk
// @access  Private
export const markMultipleAsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds)) {
    res.status(400);
    throw new Error("Please provide an array of notification IDs");
  }

  const result = await Notification.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: req.user._id,
      read: false,
    },
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

// @desc    Delete all notifications
// @route   DELETE /api/notifications/all
// @access  Private
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    recipient: req.user._id,
  });

  res.json({
    success: true,
    message: `Deleted ${result.deletedCount} notifications`,
    deletedCount: result.deletedCount,
  });
});

// @desc    Delete multiple notifications
// @route   DELETE /api/notifications/bulk
// @access  Private
export const deleteMultipleNotifications = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds)) {
    res.status(400);
    throw new Error("Please provide an array of notification IDs");
  }

  const result = await Notification.deleteMany({
    _id: { $in: notificationIds },
    recipient: req.user._id,
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
  const preferences = await NotificationPreference.getOrCreate(req.user._id);

  res.json({
    success: true,
    data: preferences,
  });
});

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
export const updatePreferences = asyncHandler(async (req, res) => {
  let preferences = await NotificationPreference.findOne({
    user: req.user._id,
  });

  if (!preferences) {
    preferences = await NotificationPreference.create({
      user: req.user._id,
      ...req.body,
    });
  } else {
    // Update preferences
    Object.assign(preferences, req.body);
    await preferences.save();
  }

  res.json({
    success: true,
    data: preferences,
    message: "Notification preferences updated successfully",
  });
});

// @desc    Reset preferences to default
// @route   PUT /api/notifications/preferences/reset
// @access  Private
export const resetPreferences = asyncHandler(async (req, res) => {
  let preferences = await NotificationPreference.findOne({
    user: req.user._id,
  });

  if (preferences) {
    await preferences.deleteOne();
  }

  // Create new preferences with defaults
  preferences = await NotificationPreference.create({
    user: req.user._id,
  });

  res.json({
    success: true,
    data: preferences,
    message: "Notification preferences reset to defaults",
  });
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
    preferences = await NotificationPreference.create({
      user: req.user._id,
    });
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

// @desc    Test notification (for development)
// @route   POST /api/notifications/test
// @access  Private
export const sendTestNotification = asyncHandler(async (req, res) => {
  const { type = "system", title, message } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error("Please provide title and message");
  }

  const notification = await Notification.createNotification({
    recipient: req.user._id,
    type,
    title,
    message,
    priority: "normal",
  });

  // Emit via Socket.IO if available
  const io = req.app.locals.io;
  if (io) {
    io.to(req.user._id.toString()).emit("notification", {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      createdAt: notification.createdAt,
    });
  }

  res.json({
    success: true,
    message: "Test notification sent",
    data: notification,
  });
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
export const getNotificationStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get total counts
  const totalCount = await Notification.countDocuments({ recipient: userId });
  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    read: false,
  });
  const readCount = totalCount - unreadCount;

  // Get counts by type
  const typeStats = await Notification.aggregate([
    { $match: { recipient: userId } },
    { $group: { _id: "$type", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Get counts by priority
  const priorityStats = await Notification.aggregate([
    { $match: { recipient: userId } },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  // Get recent notification count (last 24 hours)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await Notification.countDocuments({
    recipient: userId,
    createdAt: { $gte: yesterday },
  });

  // Get recent unread count
  const recentUnreadCount = await Notification.countDocuments({
    recipient: userId,
    read: false,
    createdAt: { $gte: yesterday },
  });

  res.json({
    success: true,
    data: {
      total: totalCount,
      read: readCount,
      unread: unreadCount,
      recent24h: recentCount,
      recentUnread24h: recentUnreadCount,
      byType: typeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: priorityStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    },
  });
});

// @desc    Get notifications by type
// @route   GET /api/notifications/type/:type
// @access  Private
export const getNotificationsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { page = 1, limit = 20, read } = req.query;

  const validTypes = [
    "message",
    "booking_confirmation",
    "booking_request",
    "package_update",
    "new_review",
    "review_reply",
    "price_drop",
    "package_created",
    "system",
  ];

  if (!validTypes.includes(type)) {
    res.status(400);
    throw new Error("Invalid notification type");
  }

  const query = { recipient: req.user._id, type };

  if (read !== undefined) {
    query.read = read === "true";
  }

  const skip = (Number(page) - 1) * Number(limit);

  const notifications = await Notification.find(query)
    .populate("sender", "name avatar")
    .populate("data.packageId", "title images")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Notification.countDocuments(query);

  res.json({
    success: true,
    count: notifications.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: notifications,
  });
});

// @desc    Check if user has specific notification
// @route   GET /api/notifications/check/:type/:referenceId
// @access  Private
export const checkNotificationExists = asyncHandler(async (req, res) => {
  const { type, referenceId } = req.params;

  let query = {
    recipient: req.user._id,
    type,
  };

  // Check in data fields based on type
  if (type === "new_review" || type === "package_update") {
    query["data.packageId"] = referenceId;
  } else if (type === "message") {
    query["data.messageId"] = referenceId;
  }

  const exists = await Notification.exists(query);

  res.json({
    success: true,
    exists: !!exists,
  });
});

// @desc    Get recent notifications (last 7 days)
// @route   GET /api/notifications/recent
// @access  Private
export const getRecentNotifications = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const notifications = await Notification.find({
    recipient: req.user._id,
    createdAt: { $gte: sevenDaysAgo },
  })
    .populate("sender", "name avatar")
    .populate("data.packageId", "title images")
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// Export all functions
export default {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  markMultipleAsRead,
  deleteNotification,
  deleteReadNotifications,
  deleteAllNotifications,
  deleteMultipleNotifications,
  getPreferences,
  updatePreferences,
  resetPreferences,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestNotification,
  getNotificationStats,
  getNotificationsByType,
  checkNotificationExists,
  getRecentNotifications,
};
