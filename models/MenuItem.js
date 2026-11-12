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
    isVeg: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual aliases for compatibility with different naming conventions
menuItemSchema.virtual('imageUrl')
  .get(function () { return this.image; })
  .set(function (val) { this.image = val; });

menuItemSchema.virtual('isAvailable')
  .get(function () { return this.available; })
  .set(function (val) { this.available = val; });

module.exports = mongoose.model('MenuItem', menuItemSchema);
