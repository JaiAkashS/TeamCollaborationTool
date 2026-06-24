import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiClient } from "../services/apiClient.js";

const initialState = {
  items: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  status: "idle",
  error: null
};

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async ({ page = 1, limit = 20 } = {}, thunkApi) => {
    try {
      const { data } = await apiClient.get("/notifications", {
        params: { page, limit }
      });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to load notifications");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notification/markNotificationRead",
  async (notificationId, thunkApi) => {
    try {
      const { data } = await apiClient.patch(`/notifications/${notificationId}/read`);
      return data.notification;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to mark notification as read");
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    appendIncomingNotification(state, action) {
      // Avoid duplicates
      const exists = state.items.some((item) => item._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
        state.pagination.total += 1;
      }
    },
    clearNotifications(state) {
      state.items = [];
      state.pagination = initialState.pagination;
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const { appendIncomingNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
