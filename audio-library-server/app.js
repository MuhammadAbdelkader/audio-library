const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const globalErrorHandler = require('./middlewares/globalErrorHandler.js');

// Import routes
const authRoutes = require('./routes/auth.routes.js');
const profileRoutes = require('./routes/profile.routes.js');
const audioRoutes = require('./routes/audio.routes.js');
const adminRoutes = require('./routes/admin.routes.js');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Audio Library API is running!' });
});

// Global Error Handler (MUST be last)
app.use(globalErrorHandler);

module.exports = app;
