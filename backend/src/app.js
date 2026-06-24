import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import {
  authRoutes,
  channelRoutes,
  messageRoutes,
  notificationRoutes,
  taskRoutes,
  workspaceRoutes
} from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser(env.cookieSecret));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

if (env.nodeEnv !== "test") {
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "team-collaboration-tool-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
