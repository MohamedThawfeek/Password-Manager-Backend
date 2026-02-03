const mongoose = require("mongoose");

/**
 * Middleware to ensure database connection is ready before processing requests
 * This is especially important for serverless environments
 */
exports.checkDatabaseConnection = async (req, res, next) => {
  // Check if mongoose is connected
  if (mongoose.connection.readyState === 1) {
    // Connection is ready
    return next();
  }

  // If not connected, try to connect
  if (mongoose.connection.readyState === 0) {
    try {
      const { connectDB } = require("../config/db");
      await connectDB();
      return next();
    } catch (error) {
      console.error("Database connection failed in middleware:", error.message);
      return res.status(500).json({
        success: false,
        responseCode: 500,
        message: "Database connection unavailable",
        db_error: error.message,
      });
    }
  }

  // Connection is in connecting state (readyState === 2)
  // Wait a bit and check again
  const maxWaitTime = 5000; // 5 seconds
  const startTime = Date.now();

  while (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 0) {
    if (Date.now() - startTime > maxWaitTime) {
      return res.status(500).json({
        success: false,
        responseCode: 500,
        message: "Database connection timeout",
        db_error: "Connection is taking too long to establish",
      });
    }
    // Wait 100ms before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // If connection state is 0 (disconnected), try to reconnect
  if (mongoose.connection.readyState === 0) {
    try {
      const { connectDB } = require("../config/db");
      await connectDB();
      return next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        responseCode: 500,
        message: "Database connection failed",
        db_error: error.message,
      });
    }
  }

  return next();
};
