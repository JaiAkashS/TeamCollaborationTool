import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const createTokenPair = (userId) => {
  const payload = { userId: userId.toString() };

  return {
    accessToken: jwt.sign(payload, env.jwtAccessSecret, {
      expiresIn: env.jwtAccessExpiresIn
    }),
    refreshToken: jwt.sign(payload, env.jwtRefreshSecret, {
      expiresIn: env.jwtRefreshExpiresIn
    })
  };
};

export const accessTokenCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: 15 * 60 * 1000
});

export const refreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
});
