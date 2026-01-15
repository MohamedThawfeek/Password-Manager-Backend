const express = require("express");
const cors = require("cors");
const router = require("./routes/router");
const { connectDB } = require("./config/db");
const app = express();
const PORT = process.env.PORT || 5001;

// Allow both production and localhost origins
const allowedOrigins = ["http://localhost:3000"];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);

// Routes
app.get("/", async (req, res) => {
  res.send({
    success: true,
    message: "Welcome to the Password Manager Backend!",
  });
});

connectDB();

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


// Only start the server if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1' && !process.env.LAMBDA_TASK_ROOT) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = { app };
