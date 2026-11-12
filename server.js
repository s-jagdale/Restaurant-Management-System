require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { seedAdminUser } = require('./utils/seedAdmin');

const app = express();

// Security and standard middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Public and Protected API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth/users', require('./routes/users')); // Backward compatibility
app.use('/api/menu', require('./routes/menu'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/inventory', require('./routes/inventory'));

// API 404 fallback
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API route not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: Object.values(err.errors)
        .map((e) => e.message)
        .join(', '),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: `Invalid value for ${err.path}`,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate value: that entry already exists',
    });
  }

  console.error(err);

  res.status(err.status || 500).json({
    error: err.status ? err.message : 'Something went wrong on the server',
  });
});

// Server configuration
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Connect MongoDB and start server
async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is missing from environment variables');
    }

    if (!MONGO_URI.startsWith('mongodb+srv://') && !MONGO_URI.startsWith('mongodb://')) {
      throw new Error('Invalid MongoDB connection string: must start with mongodb:// or mongodb+srv://');
    }

    console.log('Connecting to MongoDB...');

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log('MongoDB connected successfully!');

    // Auto-seed default admin account if needed
    await seedAdminUser();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
}

// Start application
if (require.main === module) {
  startServer();
}

module.exports = app;
