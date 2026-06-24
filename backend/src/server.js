import mongoose from "mongoose";
import http from "node:http";

import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { Channel } from "./models/index.js";
import { initializeSocket } from "./sockets/index.js";

const server = http.createServer(app);
const io = initializeSocket(server);

app.set("io", io);

const startServer = async () => {
  try {
    await connectDatabase();
    await Channel.syncIndexes();

    server.listen(env.port, () => {
      console.log(`API server listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing server...`);

  server.close(async () => {
    await mongoose.connection.close(false);
    console.log("Server and database connections closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
