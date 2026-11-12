const express = require('express');
const Bill = require('../models/Bill');
const Order = require('../models/Order');
const httpError = require('./httpError');
const { releaseTable } = require('./orders');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const taxRate = () => Number(process.env.TAX_RATE ?? 5);
const round = (n) => Math.round(n * 100) / 100;

router.get('/settings', (req, res) => res.json({ taxRate: taxRate() }));

// Billing history and bill creation restricted to staff and admin
router.use(authenticate, authorize('admin', 'staff'));

router.get('/', async (req, res, next) => {
  try {
    res.json(
      await Bill.find().populate({ path: 'order', populate: { path: 'table' } }).sort({ createdAt: -1 })
    );
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id).populate({ path: 'order', populate: { path: 'table' } });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (e) { next(e); }
});

// Generate a bill for an order: subtotal - discount + tax, then close the order and free the table
router.post('/', async (req, res, next) => {
  try {
    const order = await Order.findById(req.body.order);
    if (!order) throw httpError(404, 'Order not found');
    if (!['ready', 'served'].includes(order.status)) {
      throw httpError(400, 'Only ready or served orders can be billed');
    }
    if (await Bill.exists({ order: order._id })) throw httpError(409, 'This order is already billed');

    const discount = Number(req.body.discount || 0);
    if (!(discount >= 0) || discount > order.subtotal) throw httpError(400, 'Discount must be between 0 and the subtotal');

    const rate = taxRate();
    const tax = round(((order.subtotal - discount) * rate) / 100);
    const total = round(order.subtotal - discount + tax);

    const bill = await Bill.create({
      billNo: 'BILL-' + Date.now().toString().slice(-7),
      order: order._id,
      subtotal: order.subtotal,
      discount,
      taxRate: rate,
      tax,
      total,
      paymentMethod: req.body.paymentMethod || 'Cash',
    });

    order.status = 'completed';
    await order.save();
    await releaseTable(order.table);

    res.status(201).json(await bill.populate({ path: 'order', populate: { path: 'table' } }));
  } catch (e) { next(e); }
});

module.exports = router;
