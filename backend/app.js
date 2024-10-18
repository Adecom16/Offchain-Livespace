// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import MongoDB configuration
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const sessionRoutes = require('./routes/session');
const interactionRoutes = require('./routes/Interaction');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // For parsing application/json

// Connect to MongoDB
connectDB();

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/interactions', interactionRoutes);

// Root route for checking if server is up
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    message: 'API route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
  });
});

module.exports = app;
