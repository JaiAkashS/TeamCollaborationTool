import { randomBytes } from "node:crypto";

import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { createTokenPair } from "./tokenService.js";

const sanitizeUser = (user) => user.toJSON();

export const registerUser = async ({ name, email, password, avatarUrl }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Email is already in use");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    avatarUrl: avatarUrl || null
  });

  const { accessToken, refreshToken } = createTokenPair(user._id);
  await user.setRefreshToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password +refreshTokenHash");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const { accessToken, refreshToken } = createTokenPair(user._id);
  await user.setRefreshToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id);

  return {
    user: sanitizeUser(safeUser),
    accessToken,
    refreshToken
  };
};

export const refreshTokens = async ({ refreshToken }) => {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    throw error;
  }

  const payload = jwt.verify(refreshToken, env.jwtRefreshSecret);

  const user = await User.findById(payload.userId).select("+refreshTokenHash");

  if (!user || !(await user.compareRefreshToken(refreshToken))) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const tokens = createTokenPair(user._id);
  await user.setRefreshToken(tokens.refreshToken);
  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id);

  return {
    user: sanitizeUser(safeUser),
    ...tokens
  };
};

export const logoutUser = async ({ userId }) => {
  const user = await User.findById(userId).select("+refreshTokenHash");

  if (!user) {
    return null;
  }

  user.refreshTokenHash = null;
  await user.save({ validateBeforeSave: false });
  return true;
};

export const getProfile = async ({ userId }) => {
  const user = await User.findById(userId);
  return user ? sanitizeUser(user) : null;
};

export const createDemoUser = async () => {
  const suffix = randomBytes(2).toString("hex");
  return registerUser({
    name: `Demo ${suffix}`,
    email: `demo-${suffix}@example.com`,
    password: "Password123!"
  });
};
