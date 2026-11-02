const crud = require('./crud');
const Staff = require('../models/Staff');

module.exports = crud(Staff, {
  sort: { name: 1 },
  adminOnly: true,
});
