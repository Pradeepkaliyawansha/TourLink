import Message from "../models/Message.js";
import NotificationService from "../services/notificationService.js";

const users = new Map(); // Store active users
let notificationService;

export const initializeSocket = (io) => {
  // Initialize notification service with io
  notificationService = new NotificationService(io);

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // User joins with their ID
    socket.on("userOnline", async (userId) => {
      users.set(userId, socket.id);
      socket.userId = userId;

      // Join user to their personal notification room
      socket.join(userId.toString());

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

        // Send notification if receiver is not in the chat room
        const receiverSocketId = users.get(receiverId);
        const isReceiverInRoom =
          receiverSocketId &&
          io.sockets.adapter.rooms.get(roomId)?.has(receiverSocketId);

        if (!isReceiverInRoom && notificationService) {
          const messagePreview =
            message.length > 50 ? message.substring(0, 50) + "..." : message;

          await notificationService.sendMessageNotification(
            receiverId,
            senderId,
            newMessage.sender.name,
            messagePreview
          );
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
        socket.leave(socket.userId.toString());
        io.emit("onlineUsers", Array.from(users.keys()));
        console.log(`❌ User ${socket.userId} disconnected`);
      }
    });
  });
};

export { notificationService };
