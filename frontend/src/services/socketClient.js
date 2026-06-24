import { io } from "socket.io-client";

const socketURL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const createSocketClient = (token) =>
  io(socketURL, {
    transports: ["websocket"],
    withCredentials: true,
    auth: token ? { token } : undefined
  });
