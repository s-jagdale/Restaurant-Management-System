const express = require('express');
const Table = require('../models/Table');
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const httpError = require('./httpError');

const router = express.Router();

// Helper to convert HH:MM to minutes from midnight
function toMinutes(timeStr) {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Helper to get today's date in YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// GET /api/tables/available?date=&time=&guests=
// Publicly accessible so clients and guests can check live table availability
router.get('/available', optionalAuth, async (req, res, next) => {
  try {
    const { date, time, guests } = req.query;

    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required to check availability' });
    }

    const today = getTodayString();
    if (date < today) {
      return res.status(400).json({ error: 'Cannot check availability for past dates' });
    }

    const guestCount = Number(guests) || 1;
    if (guestCount < 1) {
      return res.status(400).json({ error: 'Guest count must be at least 1' });
    }

    // 1. Find all tables that have sufficient capacity
    const eligibleTables = await Table.find({ capacity: { $gte: guestCount } }).sort({ capacity: 1, number: 1 });

    if (!eligibleTables.length) {
      return res.json([]);
    }

    // 2. Find all active reservations on that date
    const reqMinutes = toMinutes(time);
    const reservations = await Reservation.find({
      date,
      status: { $in: ['booked', 'confirmed', 'seated'] },
    });

    // A dining reservation slot is 90 minutes. If another reservation starts within 90 minutes, it's conflicting.
    const conflictingTableIds = new Set();
    for (const r of reservations) {
      const resMinutes = toMinutes(r.time || r.startTime);
      if (Math.abs(reqMinutes - resMinutes) < 90) {
        conflictingTableIds.add(String(r.table));
      }
    }

    // Filter eligible tables not in conflict
    const availableTables = eligibleTables.filter((t) => !conflictingTableIds.has(String(t._id)));

    res.json(availableTables);
  } catch (err) {
    next(err);
  }
});

// GET /api/tables - staff and admin
router.get('/', authenticate, authorize('admin', 'staff'), async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.json(tables);
  } catch (err) {
    next(err);
  }
});

// GET /api/tables/:id - staff and admin
router.get('/:id', authenticate, authorize('admin', 'staff'), async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  } catch (err) {
    next(err);
  }
});

// POST /api/tables - admin only
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { number, capacity, status } = req.body;
    if (!number || Number(number) < 1) throw httpError(400, 'Valid table number is required');
    if (!capacity || Number(capacity) < 1) throw httpError(400, 'Valid capacity is required');

    const existing = await Table.findOne({ number: Number(number) });
    if (existing) throw httpError(409, `Table ${number} already exists`);

    const table = await Table.create({
      number: Number(number),
      capacity: Number(capacity),
      status: status || 'available',
    });

    res.status(201).json(table);
  } catch (err) {
    next(err);
  }
});

// PUT /api/tables/:id - admin can edit details; staff can only update status
router.put('/:id', authenticate, authorize('admin', 'staff'), async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ error: 'Table not found' });

    if (req.user.role === 'staff') {
      // Staff can only modify status
      if (req.body.status && ['available', 'occupied', 'reserved'].includes(req.body.status)) {
        table.status = req.body.status;
      }
    } else {
      // Admin can modify everything
      if (req.body.number !== undefined) table.number = Number(req.body.number);
      if (req.body.capacity !== undefined) table.capacity = Number(req.body.capacity);
      if (req.body.status !== undefined) table.status = req.body.status;
    }

    await table.save();
    res.json(table);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tables/:id/status - staff and admin update table status
router.patch('/:id/status', authenticate, authorize('admin', 'staff'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['available', 'occupied', 'reserved'].includes(status)) {
      throw httpError(400, 'Invalid table status');
    }
    const table = await Table.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tables/:id - admin only
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const openOrder = await Order.exists({ table: req.params.id, status: { $nin: ['completed', 'cancelled'] } });
    const upcoming = await Reservation.exists({ table: req.params.id, status: { $in: ['booked', 'confirmed'] } });
    if (openOrder || upcoming) {
      throw httpError(409, 'Table has an active dining order or booked reservation and cannot be removed');
    }

    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json({ message: 'Table deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
