const mongoose = require("mongoose");

const dburl = process.env.DB_URI;

exports.connectDB = async () => {
  try {
    const db = await mongoose.connect(dburl);
    console.log(`MongoDB connection established:`, db.connection.host);
  } catch (error) {
    console.log("DB connection error:", error.message);
  }
};

