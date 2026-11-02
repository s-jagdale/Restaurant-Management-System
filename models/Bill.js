const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    billNo: { type: String, unique: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Card'], default: 'Cash' },
    status: { type: String, enum: ['paid'], default: 'paid' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);
