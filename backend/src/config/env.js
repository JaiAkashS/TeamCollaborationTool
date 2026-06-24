import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const devDefaults = {
  MONGODB_URI: "mongodb://127.0.0.1:27017/team_collaboration_tool",
  JWT_ACCESS_SECRET: "dev_access_secret_change_me",
  JWT_REFRESH_SECRET: "dev_refresh_secret_change_me",
  COOKIE_SECRET: "dev_cookie_secret_change_me"
};

const requiredEnv = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "COOKIE_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0 && isProduction) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}

if (missingEnv.length > 0 && !isProduction && process.env.NODE_ENV !== "test") {
  console.warn(
    `Using development defaults for: ${missingEnv.join(", ")}. Set them in backend/.env for a stable local setup.`
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || devDefaults.MONGODB_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || devDefaults.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || devDefaults.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  cookieSecret: process.env.COOKIE_SECRET || devDefaults.COOKIE_SECRET
};
