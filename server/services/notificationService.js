import Notification from "../models/Notification.js";
import NotificationPreference from "../models/NotificationPreference.js";

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Create and send notification
  async sendNotification({
    recipientId,
    senderId,
    type,
    title,
    message,
    data = {},
    priority = "normal",
  }) {
    try {
      // Check user preferences
      const preferences = await NotificationPreference.getOrCreate(recipientId);

      // Check if in-app notifications are enabled for this type
      if (!preferences.isEnabled("inApp", type)) {
        console.log(`In-app notification disabled for type: ${type}`);
        return null;
      }

      // Create notification
      const notification = await Notification.createNotification({
        recipient: recipientId,
        sender: senderId,
        type,
        title,
        message,
        data,
        priority,
      });

      // Emit real-time notification via Socket.IO
      if (this.io) {
        this.io.to(recipientId.toString()).emit("notification", {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          priority: notification.priority,
          createdAt: notification.createdAt,
          sender: notification.sender,
        });

        // Also emit unread count update
        const unreadCount = await Notification.countDocuments({
          recipient: recipientId,
          read: false,
        });

        this.io.to(recipientId.toString()).emit("unreadCountUpdate", {
          count: unreadCount,
        });
      }

      // Send browser push notification if enabled
      if (preferences.push.enabled && preferences.isEnabled("push", type)) {
        await this.sendPushNotification(
          notification,
          preferences.push.subscription
        );
      }

      return notification;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }

  // Send new message notification
  async sendMessageNotification(
    recipientId,
    senderId,
    senderName,
    messagePreview
  ) {
    return await this.sendNotification({
      recipientId,
      senderId,
      type: "message",
      title: "New Message",
      message: `${senderName}: ${messagePreview}`,
      data: {
        actionUrl: `/chat/${senderId}`,
      },
      priority: "high",
    });
  }

  // Send new review notification
  async sendReviewNotification(
    guideId,
    reviewerId,
    reviewerName,
    packageId,
    packageTitle,
    rating
  ) {
    return await this.sendNotification({
      recipientId: guideId,
      senderId: reviewerId,
      type: "new_review",
      title: "New Review Received",
      message: `${reviewerName} left a ${rating}-star review on "${packageTitle}"`,
      data: {
        packageId,
        actionUrl: `/packages/${packageId}`,
      },
      priority: "normal",
    });
  }

  // Send review reply notification
  async sendReviewReplyNotification(
    userId,
    guideId,
    guideName,
    packageId,
    packageTitle
  ) {
    return await this.sendNotification({
      recipientId: userId,
      senderId: guideId,
      type: "review_reply",
      title: "Guide Replied to Your Review",
      message: `${guideName} replied to your review on "${packageTitle}"`,
      data: {
        packageId,
        actionUrl: `/packages/${packageId}`,
      },
      priority: "normal",
    });
  }

  // Send package update notification
  async sendPackageUpdateNotification(
    userId,
    guideId,
    guideName,
    packageId,
    packageTitle,
    updateType
  ) {
    return await this.sendNotification({
      recipientId: userId,
      senderId: guideId,
      type: "package_update",
      title: "Package Updated",
      message: `"${packageTitle}" has been updated by ${guideName}`,
      data: {
        packageId,
        updateType,
        actionUrl: `/packages/${packageId}`,
      },
      priority: "normal",
    });
  }

  // Send price drop notification
  async sendPriceDropNotification(
    userId,
    packageId,
    packageTitle,
    oldPrice,
    newPrice
  ) {
    const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

    return await this.sendNotification({
      recipientId: userId,
      type: "price_drop",
      title: "Price Drop Alert!",
      message: `"${packageTitle}" is now $${newPrice} (${discount}% off!)`,
      data: {
        packageId,
        oldPrice,
        newPrice,
        discount,
        actionUrl: `/packages/${packageId}`,
      },
      priority: "high",
    });
  }

  // Send package created notification (for followers/interested users)
  async sendPackageCreatedNotification(
    userId,
    guideId,
    guideName,
    packageId,
    packageTitle
  ) {
    return await this.sendNotification({
      recipientId: userId,
      senderId: guideId,
      type: "package_created",
      title: "New Package Available",
      message: `${guideName} created a new tour: "${packageTitle}"`,
      data: {
        packageId,
        actionUrl: `/packages/${packageId}`,
      },
      priority: "low",
    });
  }

  // Send system notification
  async sendSystemNotification(userId, title, message, data = {}) {
    return await this.sendNotification({
      recipientId: userId,
      type: "system",
      title,
      message,
      data,
      priority: "normal",
    });
  }

  // Send browser push notification
  async sendPushNotification(notification, subscription) {
    // This would integrate with Web Push API
    // For now, it's a placeholder for future implementation
    console.log("Push notification would be sent:", {
      title: notification.title,
      body: notification.message,
      subscription,
    });

    // TODO: Implement actual push notification using web-push library
    // const webpush = require('web-push');
    // await webpush.sendNotification(subscription, JSON.stringify({
    //   title: notification.title,
    //   body: notification.message,
    //   icon: '/icon.png',
    //   badge: '/badge.png',
    //   data: notification.data
    // }));
  }

  // Bulk send notifications
  async sendBulkNotifications(notifications) {
    const results = await Promise.allSettled(
      notifications.map((notif) => this.sendNotification(notif))
    );

    return results.map((result, index) => ({
      recipient: notifications[index].recipientId,
      success: result.status === "fulfilled",
      notification: result.status === "fulfilled" ? result.value : null,
      error: result.status === "rejected" ? result.reason : null,
    }));
  }
}

export default NotificationService;
