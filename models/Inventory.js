const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Item name is required'], trim: true },
    quantity: { type: Number, required: [true, 'Quantity is required'], min: [0, 'Quantity cannot be negative'] },
    unit: { type: String, enum: ['kg', 'litre', 'piece', 'packet'], default: 'kg' },
    reorderLevel: { type: Number, default: 5, min: 0 },
    supplier: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
