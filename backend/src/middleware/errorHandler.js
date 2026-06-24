import mongoose from "mongoose";

import { env } from "../config/env.js";

const getStatusCode = (error) => {
  if (typeof error.statusCode === "number") {
    return error.statusCode;
  }

  return 500;
};

export const notFoundHandler = (_req, res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = getStatusCode(error);
  const response = {
    success: false,
    message: error.message || "Internal server error"
  };

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(error.errors).map((item) => item.message)
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid ${error.path}`
    });
    return;
  }

  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyValue || {})[0];
    res.status(409).json({
      success: false,
      message: `${duplicateField || "Resource"} already exists`
    });
    return;
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
    return;
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  if (env.nodeEnv === "production" && statusCode >= 500) {
    response.message = "Internal server error";
  }

  res.status(statusCode).json(response);
};
