import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/User.js";

const parseCookieHeader = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((cookies, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) {
      return cookies;
    }

    cookies[rawKey] = decodeURIComponent(rawValue.join("=") || "");
    return cookies;
  }, {});

const extractSocketToken = (socket) => {
  const headerToken = socket.handshake.headers.authorization;

  if (headerToken?.startsWith("Bearer ")) {
    return headerToken.slice(7);
  }

  const cookies = parseCookieHeader(socket.handshake.headers.cookie || "");

  if (cookies.accessToken) {
    return cookies.accessToken;
  }

  return socket.handshake.auth?.token || null;
};

export const socketAuth = async (socket, next) => {
  try {
    const token = extractSocketToken(socket);

    if (!token) {
      next(new Error("Authentication required"));
      return;
    }

    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(decoded.userId).select("_id name email avatarUrl");

    if (!user) {
      next(new Error("User not found"));
      return;
    }

    socket.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
