import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import packageReducer from "./packageSlice";
import chatReducer from "./chatSlice";
import notificationReducer from "./notificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    packages: packageReducer,
    chat: chatReducer,
    notifications: notificationReducer,
  },
});

export default store;
