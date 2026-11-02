const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    number: { type: Number, required: [true, 'Table number is required'], unique: true, min: 1 },
    capacity: { type: Number, required: [true, 'Capacity is required'], min: 1 },
    status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
