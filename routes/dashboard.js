const express = require('express');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const Inventory = require('../models/Inventory');
const MenuItem = require('../models/MenuItem');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Dashboard analytics & revenue reports are strictly for Admin
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const [revenue, ordersToday, activeOrders, tables, reservationsToday, lowStock, menuCount, topItems] =
      await Promise.all([
        Bill.aggregate([{ $match: { createdAt: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
        Order.countDocuments({ createdAt: { $gte: startOfDay }, status: { $ne: 'cancelled' } }),
        Order.countDocuments({ status: { $nin: ['completed', 'cancelled'] } }),
        Table.find(),
        Reservation.countDocuments({ date: today, status: { $in: ['booked', 'confirmed', 'seated'] } }),
        Inventory.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] } }).sort({ quantity: 1 }),
        MenuItem.countDocuments(),
        Order.aggregate([
          { $match: { status: { $ne: 'cancelled' } } },
          { $unwind: '$items' },
          { $group: { _id: '$items.name', qty: { $sum: '$items.qty' } } },
          { $sort: { qty: -1 } },
          { $limit: 5 },
        ]),
      ]);

    res.json({
      revenueToday: revenue[0]?.total || 0,
      ordersToday,
      activeOrders,
      tablesTotal: tables.length,
      tablesOccupied: tables.filter((t) => t.status === 'occupied').length,
      reservationsToday,
      menuCount,
      lowStock,
      topItems,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
