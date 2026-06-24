import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiClient } from "../services/apiClient.js";

const initialState = {
  user: null,
  status: "idle",
  error: null
};

export const signupUser = createAsyncThunk("auth/signupUser", async (payload, thunkApi) => {
  try {
    const { data } = await apiClient.post("/auth/signup", payload);
    return data.user;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Signup failed");
  }
});

export const loginUser = createAsyncThunk("auth/loginUser", async (payload, thunkApi) => {
  try {
    const { data } = await apiClient.post("/auth/login", payload);
    return data.user;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, thunkApi) => {
  try {
    const { data } = await apiClient.get("/auth/me");
    return data.user;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to fetch user");
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, thunkApi) => {
  try {
    await apiClient.post("/auth/logout");
    return null;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data?.message || "Logout failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(signupUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.status = "idle";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
