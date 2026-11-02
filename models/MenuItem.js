const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    category: {
      type: String,
      enum: ['Starter', 'Main Course', 'Bread', 'Rice', 'Dessert', 'Beverage'],
      default: 'Main Course',
    },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    description: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
