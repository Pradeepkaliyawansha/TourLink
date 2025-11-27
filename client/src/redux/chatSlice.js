import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  onlineUsers: [],
  currentChat: null,
  typing: false,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    setTyping: (state, action) => {
      state.typing = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  setMessages,
  addMessage,
  setOnlineUsers,
  setCurrentChat,
  setTyping,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
