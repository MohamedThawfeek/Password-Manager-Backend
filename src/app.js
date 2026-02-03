const express = require("express");
const cors = require("cors");
const router = require("./routes/router");
const { connectDB } = require("./config/db");
const { checkDatabaseConnection } = require("./middleware/db-check");
const app = express();
const PORT = process.env.PORT || 5001;
const expressFileUpload = require("express-fileupload");

// Allow both production and localhost origins
const allowedOrigins = ["http://localhost:3000"];
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);

app.use(expressFileUpload());

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
  res.header('Access-Control-Allow-Origin', '*'); // or specific domain
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// 404 handler - must be last route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    resultCode: -1021,
    message: "API end point is not available."
  });
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
    
    // Only start HTTP server if not in serverless environment
    if (process.env.VERCEL !== '1' && !process.env.LAMBDA_TASK_ROOT) {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    // For regular server, exit if connection fails
    if (process.env.VERCEL !== '1' && !process.env.LAMBDA_TASK_ROOT) {
      process.exit(1);
    }
    // For serverless, log error but don't exit (connection might retry on first request)
  }
};

// Initialize database connection (for both serverless and regular environments)
startServer();

module.exports = { app };
