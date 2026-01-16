// Only load dotenv in local development, not in Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  try {
    require('dotenv').config();
  } catch (error) {
    console.warn('dotenv config failed:', error.message);
  }
}

let app;
try {
  const appModule = require('../src/app');
  app = appModule.app;
} catch (error) {
  console.error('Failed to load app:', error);
  // Create a minimal error handler app as fallback
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      success: false,
      message: 'Application initialization failed',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  });
}

module.exports = app;
