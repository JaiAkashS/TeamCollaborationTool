import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiClient } from "../services/apiClient.js";

const initialState = {
  items: [],
  status: "idle",
  error: null
};

export const fetchTasksByWorkspace = createAsyncThunk(
  "task/fetchTasksByWorkspace",
  async ({ workspaceId, status }, thunkApi) => {
    try {
      const { data } = await apiClient.get(`/tasks/workspace/${workspaceId}`, {
        params: status ? { status } : undefined
      });
      return data.tasks;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to load tasks");
    }
  }
);

export const createTask = createAsyncThunk("task/createTask", async (payload, thunkApi) => {
  try {
    const { data } = await apiClient.post(`/tasks/workspace/${payload.workspaceId}`, payload);
    return data.task;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to create task");
  }
});

export const updateTask = createAsyncThunk(
  "task/updateTask",
  async ({ workspaceId, taskId, payload }, thunkApi) => {
    try {
      const { data } = await apiClient.patch(`/tasks/workspace/${workspaceId}/${taskId}`, payload);
      return data.task;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to update task");
    }
  }
);

export const addTaskComment = createAsyncThunk(
  "task/addTaskComment",
  async ({ workspaceId, taskId, text }, thunkApi) => {
    try {
      const { data } = await apiClient.post(`/tasks/workspace/${workspaceId}/${taskId}/comments`, { text });
      return data.task;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to add comment");
    }
  }
);

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    clearTasks(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
    clearTaskError(state) {
      state.error = null;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTasksByWorkspace.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTasksByWorkspace.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTasksByWorkspace.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(addTaskComment.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const { clearTasks, clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;
