const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Bill = require('../models/Bill');
const httpError = require('./httpError');

const router = express.Router();

// Allowed status flow for the kitchen / waiter
const NEXT = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['served', 'cancelled'],
  served: [],
};

// Build order lines from menu item ids (prices always come from the database, never from the browser)
async function buildLines(items) {
  const ids = items.map((i) => i.menuItem);
  const docs = await MenuItem.find({ _id: { $in: ids } });
  const byId = new Map(docs.map((d) => [String(d._id), d]));
  return items.map((i) => {
    const doc = byId.get(String(i.menuItem));
    const qty = Number(i.qty);
    if (!doc) throw httpError(400, 'A selected menu item no longer exists');
    if (!doc.available) throw httpError(400, `${doc.name} is not available right now`);
    if (!Number.isInteger(qty) || qty < 1) throw httpError(400, 'Quantity must be a whole number of at least 1');
    return { menuItem: doc._id, name: doc.name, price: doc.price, qty };
  });
}

// Free the table unless another open order is still using it
async function releaseTable(tableId) {
  const stillBusy = await Order.exists({ table: tableId, status: { $nin: ['completed', 'cancelled'] } });
  if (!stillBusy) await Table.findByIdAndUpdate(tableId, { status: 'available' });
}

router.get('/', async (req, res, next) => {
  try {
    const filter = typeof req.query.status === 'string' ? { status: req.query.status } : {};
    res.json(await Order.find(filter).populate('table').sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('table');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { table, items, customerName, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) throw httpError(400, 'Add at least one item');
    const tableDoc = await Table.findById(table);
    if (!tableDoc) throw httpError(400, 'Please select a valid table');

    const lines = await buildLines(items);
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const orderNo = 'ORD-' + Date.now().toString().slice(-7);

    const order = await Order.create({ orderNo, table, customerName, notes, items: lines, subtotal });
    tableDoc.status = 'occupied';
    await tableDoc.save();
    res.status(201).json(await order.populate('table'));
  } catch (e) { next(e); }
});

// Move an order through pending -> preparing -> ready -> served (or cancel it)
router.patch('/:id/status', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw httpError(404, 'Order not found');
    const wanted = req.body.status;
    if (!(NEXT[order.status] || []).includes(wanted)) {
      throw httpError(400, `Cannot change an order from "${order.status}" to "${wanted}"`);
    }
    order.status = wanted;
    await order.save();
    if (wanted === 'cancelled') await releaseTable(order.table);
    res.json(await order.populate('table'));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw httpError(404, 'Order not found');
    if (await Bill.exists({ order: order._id })) throw httpError(409, 'This order already has a bill and cannot be deleted');
    await order.deleteOne();
    await releaseTable(order.table);
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
module.exports.releaseTable = releaseTable;
