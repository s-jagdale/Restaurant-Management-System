const express = require('express');
const User = require('../models/User');
const { hashPassword } = require('../utils/auth');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All user management routes require admin role
router.use(authenticate, authorize('admin'));

// GET /api/users - list users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id - get single user
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /api/users - admin creates a staff or admin account
router.post('/', async (req, res, next) => {
  try {
    const { name, username, email, phone, password, role } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email && typeof email === 'string' ? email.trim().toLowerCase() : '';

    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    if (cleanEmail) {
      const existingEmail = await User.findOne({ email: cleanEmail });
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already registered' });
      }
    }

    const assignedRole = ['admin', 'staff', 'client'].includes(role) ? role : 'staff';

    const newUser = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: phone ? String(phone).trim() : '',
      password: hashPassword(password),
      role: assignedRole,
      active: true,
    });

    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id - update user details
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, phone, role, active, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name.trim();
    if (email !== undefined) user.email = email ? email.trim().toLowerCase() : '';
    if (phone !== undefined) user.phone = phone ? String(phone).trim() : '';
    
    if (role && ['admin', 'staff', 'client'].includes(role)) {
      if (String(req.user.id) === String(user._id) && role !== 'admin') {
        return res.status(400).json({ error: 'You cannot remove your own admin privileges' });
      }
      user.role = role;
    }

    if (active !== undefined) {
      if (String(req.user.id) === String(user._id) && !active) {
        return res.status(400).json({ error: 'You cannot deactivate your own account' });
      }
      user.active = Boolean(active);
    }

    if (password && typeof password === 'string' && password.length >= 6) {
      user.password = hashPassword(password);
    }

    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/status - toggle active status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (String(req.user.id) === String(user._id)) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    user.active = typeof req.body.active === 'boolean' ? req.body.active : !user.active;
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/role - change role
router.patch('/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'staff', 'client'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
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

// DELETE /api/users/:id - remove user
router.delete('/:id', async (req, res, next) => {
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

