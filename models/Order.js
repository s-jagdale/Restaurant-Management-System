const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true }, // snapshot
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    note: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
    customerName: { type: String, trim: true, default: '' },
    customerPhone: { type: String, trim: true, default: '' },
    type: {
      type: String,
      enum: ['dine-in', 'takeaway'],
      default: 'dine-in',
    },
    items: { type: [orderItemSchema], validate: [(v) => v.length > 0, 'Add at least one item'] },
    subtotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual alias total <-> subtotal
orderSchema.virtual('total')
  .get(function () { return this.subtotal; })
  .set(function (val) { this.subtotal = val; });

module.exports = mongoose.model('Order', orderSchema);
