const express = require("express");
const cors = require("cors");
const router = require("./routes/router");
const { connectDB } = require("./config/db");
const { checkDatabaseConnection } = require("./middleware/db-check");
const app = express();
const PORT = process.env.PORT || 5001;

// Allow both production and localhost origins
const allowedOrigins = ["http://localhost:3000"];
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);

// Database connection check middleware (especially useful for serverless)
app.use(checkDatabaseConnection);

// Routes
app.get("/", async (req, res) => {
  res.send({
    success: true,
    message: "Welcome to the Password Manager Backend!",
  });
});

app.use(router);

app.use((req, res, next) => {
  // res.header("Access-Control-Allow-Origin", "*"); // or specific domain
  // res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  // res.header(
  //   "Access-Control-Allow-Headers",
  //   "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  // );
  next();
});

// 404 handler - must be last route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    resultCode: -1021,
    message: "API end point is not available.",
  });
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Only connect to database if not in serverless environment
    // In serverless, connection will be handled by middleware on first request
    if (process.env.VERCEL !== "1" && !process.env.LAMBDA_TASK_ROOT) {
      await connectDB();
      console.log("Database connected successfully");
      
      // Start HTTP server only in non-serverless environments
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } else {
      // In serverless, just log that we're ready
      console.log("Serverless function initialized - database will connect on first request");
    }
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    // For regular server, exit if connection fails
    if (process.env.VERCEL !== "1" && !process.env.LAMBDA_TASK_ROOT) {
      process.exit(1);
    }
    // For serverless, log error but don't exit (connection will retry via middleware)
  }
};

// Initialize server (database connection handled differently for serverless)
// Use setImmediate to avoid blocking module export in serverless
if (process.env.VERCEL !== "1" && !process.env.LAMBDA_TASK_ROOT) {
  startServer();
} else {
  // In serverless, don't connect immediately - let middleware handle it
  setImmediate(() => {
    console.log("Serverless environment detected - lazy database connection enabled");
  });
}

module.exports = { app };
