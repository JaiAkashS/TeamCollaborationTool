import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/User.js";

const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return req.cookies?.accessToken || null;
};

export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(decoded.userId).select("-password -refreshTokenHash");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
