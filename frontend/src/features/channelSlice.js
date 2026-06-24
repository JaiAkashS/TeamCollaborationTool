import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiClient } from "../services/apiClient.js";

const initialState = {
  items: [],
  activeChannel: null,
  status: "idle",
  error: null
};

export const fetchChannelsByWorkspace = createAsyncThunk(
  "channel/fetchChannelsByWorkspace",
  async (workspaceId, thunkApi) => {
    try {
      const { data } = await apiClient.get(`/channels/workspace/${workspaceId}`);
      return data.channels;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to load channels");
    }
  }
);

export const createChannel = createAsyncThunk("channel/createChannel", async (payload, thunkApi) => {
  try {
    const { data } = await apiClient.post(`/channels/workspace/${payload.workspaceId}`, payload);
    return data.channel;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to create channel");
  }
});

export const joinChannel = createAsyncThunk("channel/joinChannel", async (channelId, thunkApi) => {
  try {
    const { data } = await apiClient.post(`/channels/${channelId}/join`);
    return data.channel;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to join channel");
  }
});

export const leaveChannel = createAsyncThunk("channel/leaveChannel", async (channelId, thunkApi) => {
  try {
    const { data } = await apiClient.post(`/channels/${channelId}/leave`);
    return data.channel;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to leave channel");
  }
});

const channelSlice = createSlice({
  name: "channel",
  initialState,
  reducers: {
    setActiveChannel(state, action) {
      state.activeChannel = action.payload;
    },
    clearChannels(state) {
      state.items = [];
      state.activeChannel = null;
      state.status = "idle";
      state.error = null;
    },
    clearChannelError(state) {
      state.error = null;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchChannelsByWorkspace.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchChannelsByWorkspace.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchChannelsByWorkspace.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createChannel.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createChannel.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.push(action.payload);
      })
      .addCase(createChannel.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(joinChannel.fulfilled, (state, action) => {
        const index = state.items.findIndex((ch) => ch._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.activeChannel?._id === action.payload._id) {
          state.activeChannel = action.payload;
        }
      })
      .addCase(leaveChannel.fulfilled, (state, action) => {
        const index = state.items.findIndex((ch) => ch._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.activeChannel?._id === action.payload._id) {
          state.activeChannel = action.payload;
        }
      });
  }
});

export const { setActiveChannel, clearChannels, clearChannelError } = channelSlice.actions;
export default channelSlice.reducer;
