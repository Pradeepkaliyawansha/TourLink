import asyncHandler from "express-async-handler";
import Message from "../models/Message.js";
import User from "../models/User.js";

// @desc    Get chat history between two users
// @route   GET /api/chat/:userId
// @access  Private
export const getChatHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  // Create room ID (consistent ordering)
  const roomId = [currentUserId.toString(), userId].sort().join("-");

  const messages = await Message.find({ roomId })
    .populate("sender", "name avatar")
    .populate("receiver", "name avatar")
    .sort({ createdAt: 1 })
    .limit(100);

  res.json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all unique users the current user has chatted with
  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("sender", "name avatar role")
    .populate("receiver", "name avatar role")
    .sort({ createdAt: -1 });

  // Extract unique users
  const conversationsMap = new Map();

  messages.forEach((msg) => {
    const otherUser =
      msg.sender._id.toString() === userId.toString()
        ? msg.receiver
        : msg.sender;

    const otherUserId = otherUser._id.toString();

    if (!conversationsMap.has(otherUserId)) {
      conversationsMap.set(otherUserId, {
        user: otherUser,
        lastMessage: msg.message,
        lastMessageTime: msg.createdAt,
        unreadCount: 0,
      });
    }

    // Count unread messages
    if (msg.receiver._id.toString() === userId.toString() && !msg.read) {
      conversationsMap.get(otherUserId).unreadCount++;
    }
  });

  const conversations = Array.from(conversationsMap.values());

  res.json({
    success: true,
    count: conversations.length,
    data: conversations,
  });
});

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:roomId
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id;

  await Message.updateMany(
    { roomId, receiver: userId, read: false },
    { read: true }
  );

  res.json({
    success: true,
    message: "Messages marked as read",
  });
});

// @desc    Delete a message
// @route   DELETE /api/chat/message/:messageId
// @access  Private
export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  // Check if user is sender
  if (message.sender.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this message");
  }

  await message.deleteOne();

  res.json({
    success: true,
    message: "Message deleted successfully",
  });
});
