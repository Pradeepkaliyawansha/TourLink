import express from "express";
import {
  getChatHistory,
  getConversations,
  markAsRead,
  deleteMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/:userId", protect, getChatHistory);
router.put("/read/:roomId", protect, markAsRead);
router.delete("/message/:messageId", protect, deleteMessage);

export default router;
