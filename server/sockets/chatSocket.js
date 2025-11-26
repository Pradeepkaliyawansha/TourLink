import Message from "../models/Message.js";
import User from "../models/User.js";

const users = new Map(); // Store active users

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // User joins with their ID
    socket.on("userOnline", async (userId) => {
      users.set(userId, socket.id);
      socket.userId = userId;

      // Notify all clients about online users
      io.emit("onlineUsers", Array.from(users.keys()));

      console.log(`👤 User ${userId} is now online`);
    });

    // Join a specific chat room
    socket.on("joinRoom", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("-");
      socket.join(roomId);
      socket.currentRoom = roomId;
      console.log(`🏠 User ${senderId} joined room: ${roomId}`);
    });

    // Send message
    socket.on("sendMessage", async (data) => {
      try {
        const { senderId, receiverId, message } = data;

        // Create room ID
        const roomId = [senderId, receiverId].sort().join("-");

        // Save message to database
        const newMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          message,
          roomId,
        });

        // Populate sender and receiver info
        await newMessage.populate("sender", "name avatar");
        await newMessage.populate("receiver", "name avatar");

        // Emit to room
        io.to(roomId).emit("receiveMessage", newMessage);

        // If receiver is online, send notification
        const receiverSocketId = users.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageNotification", {
            from: senderId,
            message: message.substring(0, 50),
            timestamp: newMessage.createdAt,
          });
        }

        console.log(`📨 Message sent in room ${roomId}`);
      } catch (error) {
        console.error("❌ Error sending message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("-");
      socket.to(roomId).emit("userTyping", { userId: senderId });
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("-");
      socket.to(roomId).emit("userStoppedTyping", { userId: senderId });
    });

    // Leave room
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`👋 User left room: ${roomId}`);
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        users.delete(socket.userId);
        io.emit("onlineUsers", Array.from(users.keys()));
        console.log(`❌ User ${socket.userId} disconnected`);
      }
    });
  });
};
