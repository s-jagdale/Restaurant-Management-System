const express = require('express');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { authenticate, authorize } = require('../middleware/auth');
const httpError = require('./httpError');

const router = express.Router();

function toMinutes(timeStr) {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

function getTodayString() {
  const d = new Date();
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function getCurrentMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

// GET /api/reservations
// Clients see only their own reservations. Staff and Admin see all reservations.
router.get('/', authenticate, async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'client') {
      filter.client = req.user.id;
    } else {
      if (typeof req.query.date === 'string' && req.query.date) filter.date = req.query.date;
      if (typeof req.query.status === 'string' && req.query.status) filter.status = req.query.status;
    }

    const reservations = await Reservation.find(filter)
      .populate('table')
      .populate('client', 'name email phone')
      .sort({ date: -1, time: 1 });

    res.json(reservations);
  } catch (err) {
    next(err);
  }
});

// GET /api/reservations/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('table')
      .populate('client', 'name email phone');

    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    if (req.user.role === 'client' && String(reservation.client?._id || reservation.client) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Access denied. You can only view your own reservations.' });
    }

    res.json(reservation);
  } catch (err) {
    next(err);
  }
});

// POST /api/reservations
// Clients or staff/admin can book a reservation
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { customerName, phone, table, guests, date, time, notes, specialRequest } = req.body;

    if (!date || !time) throw httpError(400, 'Date and time are required');
    if (!table) throw httpError(400, 'Please select a table');
    if (!guests || Number(guests) < 1) throw httpError(400, 'Number of guests must be at least 1');

    const today = getTodayString();
    if (date < today) {
      throw httpError(400, 'Reservations cannot be made for past dates');
    }

    const reqMinutes = toMinutes(time);
    if (date === today && reqMinutes < getCurrentMinutes()) {
      throw httpError(400, 'Reservation time has already passed for today');
    }

    const tableDoc = await Table.findById(table);
    if (!tableDoc) throw httpError(400, 'Selected table does not exist');

    if (Number(guests) > tableDoc.capacity) {
      throw httpError(400, `Table ${tableDoc.number} seats up to ${tableDoc.capacity} guests. Selected guests: ${guests}`);
    }

    // Overlapping booking prevention: 90 minute dining window
    const clash = await Reservation.findOne({
      table,
      date,
      status: { $in: ['booked', 'confirmed', 'seated'] },
    });

    if (clash) {
      const clashMinutes = toMinutes(clash.time || clash.startTime);
      if (Math.abs(reqMinutes - clashMinutes) < 90) {
        throw httpError(409, `Table ${tableDoc.number} is already reserved at ${clash.time} on ${date}. Please select another time or table.`);
      }
    }

    const nameToUse = customerName || req.user.name || 'Valued Guest';
    const phoneToUse = phone || req.user.phone || '';
    if (!phoneToUse) throw httpError(400, 'Contact phone number is required');

    // Calculate estimated end time (+90 mins)
    const endMinutes = reqMinutes + 90;
    const endH = String(Math.floor(endMinutes / 60) % 24).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    const reservation = await Reservation.create({
      client: req.user.role === 'client' ? req.user.id : (req.body.client || null),
      customerName: nameToUse.trim(),
      phone: phoneToUse.trim(),
      table,
      guests: Number(guests),
      date,
      time,
      startTime: time,
      endTime,
      notes: specialRequest || notes || '',
      status: 'booked',
    });

    res.status(201).json(await reservation.populate('table'));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/reservations/:id/cancel - client can cancel own reservation before start time
router.patch('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('table');
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    if (req.user.role === 'client') {
      if (String(reservation.client) !== String(req.user.id)) {
        return res.status(403).json({ error: 'You can only cancel your own reservations' });
      }

      // Check if reservation start time has already passed
      const today = getTodayString();
      const reqMinutes = toMinutes(reservation.time || reservation.startTime);
      if (reservation.date < today || (reservation.date === today && reqMinutes <= getCurrentMinutes())) {
        return res.status(400).json({ error: 'Reservations can only be cancelled before their scheduled start time' });
      }
    }

    reservation.status = 'cancelled';
    await reservation.save();
    res.json(reservation);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/reservations/:id/status - staff and admin can update status
router.patch('/:id/status', authenticate, authorize('admin', 'staff'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['booked', 'confirmed', 'seated', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw httpError(400, `Invalid reservation status. Allowed: ${validStatuses.join(', ')}`);
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    reservation.status = status;
    await reservation.save();

    // If seated, mark table as occupied
    if (status === 'seated' && reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, { status: 'occupied' });
    }

    res.json(await reservation.populate('table'));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reservations/:id - admin only
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ message: 'Reservation deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
