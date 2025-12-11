// client/src/pages/Chat.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import { setMessages, addMessage, setOnlineUsers } from "../redux/chatSlice";
import ChatBox from "../components/ChatBox";
import axiosInstance from "../services/axiosInstance";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const Chat = () => {
  const { userId: selectedUserId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { messages, onlineUsers } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentReceiver, setCurrentReceiver] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      newSocket.emit("userOnline", user._id);
    });

    newSocket.on("onlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    newSocket.on("receiveMessage", (message) => {
      dispatch(addMessage(message));
    });

    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, dispatch]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await axiosInstance.get("/chat/conversations");
        setConversations(response.data.data);
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load chat history when user is selected
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!selectedUserId || !user) return;

      setLoadingMessages(true);
      try {
        const response = await axiosInstance.get(`/chat/${selectedUserId}`);
        dispatch(setMessages(response.data.data));

        // Join socket room
        if (socket) {
          socket.emit("joinRoom", {
            senderId: user._id,
            receiverId: selectedUserId,
          });
        }

        // Get receiver info
        const userList = conversations.find(
          (c) => c.user._id === selectedUserId
        );
        if (userList) {
          setCurrentReceiver(userList.user);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadChatHistory();
  }, [selectedUserId, user, socket, dispatch, conversations]);

  const handleSendMessage = (message) => {
    if (!socket || !selectedUserId || !message.trim()) return;

    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId: selectedUserId,
      message: message.trim(),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Messages
              </h2>
            </div>

            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Start chatting with a tour guide</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {conversations.map((conv) => {
                  const isOnline = onlineUsers.includes(conv.user._id);
                  const isSelected = selectedUserId === conv.user._id;

                  return (
                    <div
                      key={conv.user._id}
                      onClick={() => {
                        window.history.pushState(
                          {},
                          "",
                          `/chat/${conv.user._id}`
                        );
                        window.dispatchEvent(new PopStateEvent("popstate"));
                      }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                        isSelected
                          ? "bg-primary-50 dark:bg-gray-700 border-l-4 border-primary-600 dark:border-primary-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-bold">
                            {conv.user.name.charAt(0).toUpperCase()}
                          </div>
                          {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {conv.user.name}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="bg-primary-600 dark:bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {conv.user.role}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {conv.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Box */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
            {selectedUserId ? (
              loadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
                </div>
              ) : (
                <ChatBox
                  messages={messages}
                  currentUser={user}
                  receiver={currentReceiver}
                  onSendMessage={handleSendMessage}
                  isOnline={onlineUsers.includes(selectedUserId)}
                />
              )
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <p className="text-lg">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
