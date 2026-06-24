import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/authSlice.js";
import channelReducer from "../features/channelSlice.js";
import messageReducer from "../features/messageSlice.js";
import taskReducer from "../features/taskSlice.js";
import workspaceReducer from "../features/workspaceSlice.js";
import notificationReducer from "../features/notificationSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    channel: channelReducer,
    message: messageReducer,
    task: taskReducer,
    notification: notificationReducer
  },
  devTools: import.meta.env.MODE !== "production"
});

export default store;
