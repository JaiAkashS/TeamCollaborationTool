import mongoose from "mongoose";

import { env } from "./env.js";

export const connectDatabase = async () => {
  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== "production"
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};
