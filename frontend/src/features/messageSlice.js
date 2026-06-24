import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiClient } from "../services/apiClient.js";

const initialState = {
  items: [],
  pagination: {
    page: 1,
    limit: 30,
    total: 0,
    pages: 0
  },
  status: "idle",
  error: null
};

export const fetchMessagesByChannel = createAsyncThunk(
  "message/fetchMessagesByChannel",
  async ({ channelId, page = 1, limit = 30 }, thunkApi) => {
    try {
      const { data } = await apiClient.get(`/messages/channel/${channelId}`, {
        params: { page, limit }
      });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to load messages");
    }
  }
);

export const createMessage = createAsyncThunk("message/createMessage", async (payload, thunkApi) => {
  try {
    const { data } = await apiClient.post(`/messages/channel/${payload.channelId}`, payload);
    return data.message;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to send message");
  }
});

export const editMessage = createAsyncThunk("message/editMessage", async ({ messageId, text }, thunkApi) => {
  try {
    const { data } = await apiClient.patch(`/messages/${messageId}`, { text });
    return data.message;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to edit message");
  }
});

export const deleteMessage = createAsyncThunk("message/deleteMessage", async (messageId, thunkApi) => {
  try {
    const { data } = await apiClient.delete(`/messages/${messageId}`);
    return data.message;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to delete message");
  }
});

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    appendIncomingMessage(state, action) {
      // Avoid duplicates
      const exists = state.items.some((item) => item._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },
    updateMessageInStore(state, action) {
      const index = state.items.findIndex((item) => item._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteMessageInStore(state, action) {
      const index = state.items.findIndex((item) => item._id === action.payload.messageId);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          deletedAt: new Date().toISOString(),
          text: "",
          attachments: []
        };
      }
    },
    clearMessages(state) {
      state.items = [];
      state.pagination = initialState.pagination;
      state.status = "idle";
      state.error = null;
    },
    clearMessageError(state) {
      state.error = null;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMessagesByChannel.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMessagesByChannel.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
        state.status = "succeeded";
      })
      .addCase(fetchMessagesByChannel.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createMessage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Avoid duplicates in case socket already appended it
        const exists = state.items.some((item) => item._id === action.payload._id);
        if (!exists) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const {
  appendIncomingMessage,
  updateMessageInStore,
  deleteMessageInStore,
  clearMessages,
  clearMessageError
} = messageSlice.actions;
export default messageSlice.reducer;
