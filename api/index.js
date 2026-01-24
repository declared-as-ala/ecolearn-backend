// This file is required for Vercel serverless deployment
// It exports the Express app as a serverless function
const app = require('../server');

// Ensure MongoDB connection is established
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (MONGODB_URI && mongoose.connection.readyState === 0) {
  mongoose.connect(MONGODB_URI).catch(err => {
    console.error('MongoDB connection error in serverless function:', err);
  });
}

// Export the app as the handler for Vercel
module.exports = app;






