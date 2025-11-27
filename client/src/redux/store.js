import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import packageReducer from "./packageSlice";
import chatReducer from "./chatSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    packages: packageReducer,
    chat: chatReducer,
  },
});

export default store;
