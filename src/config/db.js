const mongoose = require("mongoose");

const dburl = process.env.DB_URI;

if (!dburl) {
  console.warn("Warning: DB_URI environment variable is not set");
}

// Connection options optimized for serverless environments
const connectionOptions = {
  serverSelectionTimeoutMS: 10000, // 10 seconds (reduced for serverless)
  socketTimeoutMS: 45000, // 45 seconds
  maxPoolSize: 1, // Serverless: use single connection per instance
  minPoolSize: 0, // Serverless: don't maintain persistent pool
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  retryWrites: true,
  w: 'majority',
  // Serverless-specific optimizations
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0, // Disable mongoose buffering
};

// Disable mongoose buffering globally to prevent timeout errors
mongoose.set('bufferCommands', false);
mongoose.set('bufferMaxEntries', 0);

// Cache connection promise to prevent multiple simultaneous connections
let connectionPromise = null;

exports.connectDB = async () => {
  try {
    // If already connected, return existing connection
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // If connection is in progress, wait for it
    if (connectionPromise) {
      return await connectionPromise;
    }

    // Check if DB_URI is available
    if (!dburl) {
      throw new Error("DB_URI environment variable is not set");
    }

    // Set mongoose to use the connection options globally
    mongoose.set('strictQuery', false);
    
    // Create connection promise
    connectionPromise = mongoose.connect(dburl, connectionOptions);
    
    const db = await connectionPromise;
    console.log(`MongoDB connection established:`, db.connection.host);
    
    // Reset connection promise on success
    connectionPromise = null;
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      connectionPromise = null; // Reset on error to allow retry
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      connectionPromise = null; // Reset on disconnect to allow reconnect
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown (only in non-serverless environments)
    if (process.env.VERCEL !== "1" && !process.env.LAMBDA_TASK_ROOT) {
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });
    }

    return db;
  } catch (error) {
    // Reset connection promise on error to allow retry
    connectionPromise = null;
    console.error("DB connection error:", error.message);
    throw error; // Re-throw to handle in app.js
  }
};

