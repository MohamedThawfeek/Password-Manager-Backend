const mongoose = require("mongoose");

const dburl = process.env.DB_URI;

// Connection options to prevent timeout issues
const connectionOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5, // Maintain at least 5 socket connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  retryWrites: true,
  w: 'majority',
};

// Disable mongoose buffering globally to prevent timeout errors
mongoose.set('bufferCommands', false);

exports.connectDB = async () => {
  try {
    // Set mongoose to use the connection options globally
    mongoose.set('strictQuery', false);
    
    const db = await mongoose.connect(dburl, connectionOptions);
    console.log(`MongoDB connection established:`, db.connection.host);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return db;
  } catch (error) {
    console.error("DB connection error:", error.message);
    throw error; // Re-throw to handle in app.js
  }
};

