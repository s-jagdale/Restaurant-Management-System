const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customerName: { type: String, required: [true, 'Customer name is required'], trim: true },
    phone: { type: String, required: [true, 'Phone is required'], trim: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: [true, 'Table is required'] },
    guests: { type: Number, required: [true, 'Number of guests is required'], min: 1 },
    date: { type: String, required: [true, 'Date is required'], match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'] },
    time: { type: String, required: [true, 'Time is required'], match: [/^\d{2}:\d{2}$/, 'Time must be HH:MM'] },
    startTime: { type: String, default: function () { return this.time; } },
    endTime: { type: String, default: '' },
    status: {
      type: String,
      enum: ['booked', 'confirmed', 'seated', 'completed', 'cancelled'],
      default: 'booked',
    },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual alias specialRequest <-> notes
reservationSchema.virtual('specialRequest')
  .get(function () { return this.notes; })
  .set(function (val) { this.notes = val; });

module.exports = mongoose.model('Reservation', reservationSchema);
