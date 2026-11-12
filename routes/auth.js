const express = require('express');
const User = require('../models/User');
const { hashPassword, comparePassword, createToken } = require('../utils/auth');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map();
function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 20;

  const record = loginAttempts.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  if (record.count >= maxAttempts) {
    return res.status(429).json({
      error: 'Too many login attempts from this IP. Please try again after 15 minutes.',
    });
  }

  record.count += 1;
  loginAttempts.set(ip, record);
  next();
}

// POST /api/auth/register (Client self-registration only)
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, username, phone, password } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email && typeof email === 'string' ? email.trim().toLowerCase() : '';
    let cleanUsername = username && typeof username === 'string' ? username.trim().toLowerCase() : '';

    if (!cleanUsername && cleanEmail) {
      cleanUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '');
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    // Check duplicate username
    const existingUsername = await User.findOne({ username: cleanUsername });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    // Check duplicate email if email provided
    if (cleanEmail) {
      const existingEmail = await User.findOne({ email: cleanEmail });
      if (existingEmail) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
    }

    // Staff cannot self-register; public registration is STRICTLY for clients
    const role = 'client';
    const hashedPassword = hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: phone ? String(phone).trim() : '',
      password: hashedPassword,
      role,
      active: true,
    });

    const token = createToken({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login (supports email or username)
router.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginId = (identifier || email || username || '').toString().trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    // Lookup user by email OR username
    const user = await User.findOne({
      $or: [{ username: loginId }, { email: loginId }],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact an administrator.' });
    }

    const valid = comparePassword(String(password), user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    const token = createToken({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me - check token and get profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.active) {
      return res.status(401).json({ error: 'User account not found or disabled' });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
