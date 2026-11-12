const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Bill = require('../models/Bill');
const httpError = require('./httpError');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Allowed status progression
const NEXT = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['served', 'completed', 'cancelled'],
  served: ['completed'],
  completed: [],
  cancelled: [],
};

// Build order lines securely from database prices
async function buildLines(items) {
  const ids = items.map((i) => i.menuItem);
  const docs = await MenuItem.find({ _id: { $in: ids } });
  const byId = new Map(docs.map((d) => [String(d._id), d]));

  return items.map((i) => {
    const doc = byId.get(String(i.menuItem));
    const qty = Number(i.qty);
    if (!doc) throw httpError(400, 'A selected dish no longer exists');
    if (!doc.available) throw httpError(400, `${doc.name} is currently sold out`);
    if (!Number.isInteger(qty) || qty < 1) throw httpError(400, 'Quantity must be at least 1');

    return {
      menuItem: doc._id,
      name: doc.name,
      price: doc.price,
      qty,
      note: i.note ? String(i.note).trim() : '',
    };
  });
}

// Free the table unless another active order is still using it
async function releaseTable(tableId) {
  if (!tableId) return;
  const stillBusy = await Order.exists({
    table: tableId,
    status: { $nin: ['completed', 'cancelled'] },
  });
  if (!stillBusy) {
    await Table.findByIdAndUpdate(tableId, { status: 'available' });
  }
}

// GET /api/orders
// Clients see only their own orders. Staff and Admin see all orders.
router.get('/', authenticate, async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'client') {
      filter.client = req.user.id;
    } else {
      if (typeof req.query.status === 'string' && req.query.status) {
        filter.status = req.query.status;
      }
    }

    const orders = await Order.find(filter)
      .populate('table')
      .populate('client', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table')
      .populate('client', 'name email phone');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (req.user.role === 'client' && String(order.client?._id || order.client) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Access denied. You can only view your own orders.' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

// POST /api/orders
// Supports:
// 1. Logged in clients
// 2. Staff/Admin entering orders
// 3. Guest ordering at a seated table via QR flow
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { table, items, customerName, customerPhone, notes, type } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw httpError(400, 'Add at least one item to place an order');
    }

    const orderType = type === 'takeaway' ? 'takeaway' : 'dine-in';
    let tableDoc = null;

    if (orderType === 'dine-in') {
      if (!table) {
        throw httpError(400, 'Please select a table for dine-in ordering');
      }
      tableDoc = await Table.findById(table);
      if (!tableDoc) {
        throw httpError(400, 'Selected table was not found');
      }
    }

    const lines = await buildLines(items);
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const orderNo = 'ORD-' + Date.now().toString().slice(-7);

    const nameToUse = (customerName || (req.user ? req.user.name : '') || 'Guest').trim();
    const phoneToUse = (customerPhone || (req.user ? req.user.phone : '') || '').trim();

    const order = await Order.create({
      orderNo,
      client: req.user ? req.user.id : null,
      table: tableDoc ? tableDoc._id : null,
      customerName: nameToUse,
      customerPhone: phoneToUse,
      type: orderType,
      items: lines,
      subtotal,
      notes: notes ? String(notes).trim() : '',
      status: 'pending',
    });

    if (tableDoc) {
      tableDoc.status = 'occupied';
      await tableDoc.save();
    }

    res.status(201).json(await order.populate('table'));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status - Staff and Admin
router.patch('/:id/status', authenticate, authorize('admin', 'staff'), async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw httpError(404, 'Order not found');

    const wanted = req.body.status;
    if (!(NEXT[order.status] || []).includes(wanted) && wanted !== order.status) {
      throw httpError(400, `Cannot advance order status from "${order.status}" to "${wanted}"`);
    }

    order.status = wanted;
    await order.save();

    if (['cancelled', 'completed'].includes(wanted) && order.table) {
      await releaseTable(order.table);
    }

    res.json(await order.populate('table'));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/orders/:id - Admin only
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw httpError(404, 'Order not found');

    if (await Bill.exists({ order: order._id })) {
      throw httpError(409, 'This order has an existing invoice and cannot be deleted');
    }

    await order.deleteOne();
    if (order.table) {
      await releaseTable(order.table);
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.releaseTable = releaseTable;
