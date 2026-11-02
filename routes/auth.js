const express = require('express');
const User = require('../models/User');
const { hashPassword, comparePassword, createToken } = require('../utils/auth');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'staff';
    const hashedPassword = hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      password: hashedPassword,
      role: assignedRole,
    });

    const token = createToken({
      id: user._id,
      username: user.username,
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
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Your account is disabled. Please contact an admin.' });
    }

    const valid = comparePassword(String(password), user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = createToken({
      id: user._id,
      username: user.username,
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
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me - check token and get logged in user profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.active) {
      return res.status(401).json({ error: 'User account no longer active' });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/users - list registered users (admin only)
router.get('/users', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/users/:id/role - change role (admin only)
router.patch('/users/:id/role', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either admin or staff' });
    }

    if (String(req.user.id) === String(req.params.id) && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot remove your own admin privileges' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/users/:id - remove user (admin only)
router.delete('/users/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

