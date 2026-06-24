import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiClient } from "../services/apiClient.js";

const initialState = {
  items: [],
  activeWorkspace: null,
  activityLogs: [],
  status: "idle",
  error: null
};

export const fetchWorkspaceActivity = createAsyncThunk(
  "workspace/fetchWorkspaceActivity",
  async (workspaceId, thunkApi) => {
    try {
      const { data } = await apiClient.get(`/workspaces/${workspaceId}/activity`);
      return data.activities;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to load activity logs");
    }
  }
);

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async (_, thunkApi) => {
    try {
      const { data } = await apiClient.get("/workspaces");
      return data.workspaces;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to load workspaces");
    }
  }
);

export const createWorkspace = createAsyncThunk(
  "workspace/createWorkspace",
  async (payload, thunkApi) => {
    try {
      const { data } = await apiClient.post("/workspaces", payload);
      return data.workspace;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to create workspace");
    }
  }
);

export const inviteWorkspaceMember = createAsyncThunk(
  "workspace/inviteWorkspaceMember",
  async ({ workspaceId, email, role }, thunkApi) => {
    try {
      const { data } = await apiClient.post(`/workspaces/${workspaceId}/invite`, {
        email,
        role
      });
      return data.workspace;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to invite member");
    }
  }
);

export const fetchWorkspaceById = createAsyncThunk(
  "workspace/fetchWorkspaceById",
  async (workspaceId, thunkApi) => {
    try {
      const { data } = await apiClient.get(`/workspaces/${workspaceId}`);
      return data.workspace;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to load workspace");
    }
  }
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setActiveWorkspace(state, action) {
      state.activeWorkspace = action.payload;
    },
    clearWorkspaceError(state) {
      state.error = null;
    },
    appendIncomingActivityLog(state, action) {
      const exists = state.activityLogs.some((log) => log._id === action.payload._id);
      if (!exists) {
        state.activityLogs.unshift(action.payload);
      }
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createWorkspace.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
        state.activeWorkspace = action.payload;
      })
      .addCase(inviteWorkspaceMember.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(inviteWorkspaceMember.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.activeWorkspace = action.payload;
        state.items = state.items.map((workspace) =>
          workspace._id === action.payload._id ? action.payload : workspace
        );
      })
      .addCase(inviteWorkspaceMember.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchWorkspaceById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWorkspaceById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.activeWorkspace = action.payload;
      })
      .addCase(fetchWorkspaceById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchWorkspaceActivity.fulfilled, (state, action) => {
        state.activityLogs = action.payload;
      });
  }
});

export const { setActiveWorkspace, clearWorkspaceError, appendIncomingActivityLog } = workspaceSlice.actions;
export default workspaceSlice.reducer;
