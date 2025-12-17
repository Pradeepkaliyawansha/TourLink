import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  getPreferences,
  updatePreferences,
  subscribeToPush,
  unsubscribeFromPush,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Notification routes
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.delete("/read", deleteReadNotifications);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

// Preference routes
router.get("/preferences", getPreferences);
router.put("/preferences", updatePreferences);

// Push notification routes
router.post("/push/subscribe", subscribeToPush);
router.post("/push/unsubscribe", unsubscribeFromPush);

export default router;
