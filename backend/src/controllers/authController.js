import { asyncHandler } from "../middleware/index.js";
import {
  accessTokenCookieOptions,
  loginUser,
  logoutUser,
  refreshTokens,
  refreshTokenCookieOptions,
  registerUser
} from "../services/index.js";


const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", accessTokenCookieOptions());
  res.clearCookie("refreshToken", refreshTokenCookieOptions());
};

export const signup = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  setAuthCookies(res, result);

  res.status(201).json({
    success: true,
    user: result.user
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  setAuthCookies(res, result);

  res.status(200).json({
    success: true,
    user: result.user
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await refreshTokens({
    refreshToken: req.cookies?.refreshToken || req.body.refreshToken
  });
  setAuthCookies(res, result);

  res.status(200).json({
    success: true,
    user: result.user
  });
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser({ userId: req.user._id });
  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});
