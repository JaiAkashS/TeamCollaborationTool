import { Server } from "socket.io";

import { env } from "../config/env.js";
import { socketAuth } from "./socketAuth.js";
import { registerMessageHandlers } from "./messageSocketHandlers.js";

let ioInstance = null;

export const getIO = () => ioInstance;

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigin.split(",").map((origin) => origin.trim()).filter(Boolean),
      credentials: true
    }
  });

  ioInstance = io;

  io.use(socketAuth);

  io.on("connection", (socket) => {
    // Join a user-specific room for real-time notifications
    socket.join(`user:${socket.user._id}`);

    socket.emit("connected", {
      userId: socket.user._id,
      name: socket.user.name
    });

    registerMessageHandlers(socket, io);

    socket.on("join_workspace", ({ workspaceId }) => {
      if (workspaceId) {
        socket.join(`workspace:${workspaceId}`);
      }
    });

    socket.on("leave_workspace", ({ workspaceId }) => {
      if (workspaceId) {
        socket.leave(`workspace:${workspaceId}`);
      }
    });

    socket.on("disconnect", () => {
      socket.removeAllListeners();
    });
  });

  return io;
};
