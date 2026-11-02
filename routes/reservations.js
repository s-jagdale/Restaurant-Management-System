const crud = require('./crud');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const httpError = require('./httpError');

module.exports = crud(Reservation, {
  populate: 'table',
  sort: { date: -1, time: 1 },
  // Business rules: table must exist, must fit the guests, and must be free at that date/time.
  async validate(body, id) {
    if (!body.table) return; // schema validation reports the missing table
    const table = await Table.findById(body.table);
    if (!table) throw httpError(400, 'Selected table does not exist');
    if (body.guests && Number(body.guests) > table.capacity) {
      throw httpError(400, `Table ${table.number} seats only ${table.capacity} guests`);
    }
    if (body.date && body.time && body.status !== 'cancelled') {
      const clash = await Reservation.findOne({
        _id: { $ne: id },
        table: body.table,
        date: body.date,
        time: body.time,
        status: { $in: ['booked', 'seated'] },
      });
      if (clash) throw httpError(409, `Table ${table.number} is already reserved at ${body.time} on ${body.date}`);
    }
  },
});
