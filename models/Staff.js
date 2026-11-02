const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    role: { type: String, enum: ['Manager', 'Chef', 'Waiter', 'Cashier', 'Cleaner'], default: 'Waiter' },
    phone: { type: String, trim: true, default: '' },
    shift: { type: String, enum: ['Morning', 'Evening', 'Night'], default: 'Morning' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', staffSchema);
