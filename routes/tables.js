const crud = require('./crud');
const Table = require('../models/Table');
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const httpError = require('./httpError');

module.exports = crud(Table, {
  sort: { number: 1 },
  adminDeleteOnly: true,
  async beforeDelete(id) {
    const openOrder = await Order.exists({ table: id, status: { $nin: ['completed', 'cancelled'] } });
    const upcoming = await Reservation.exists({ table: id, status: 'booked' });
    if (openOrder || upcoming) throw httpError(409, 'Table has an open order or booked reservation');
  },
});
