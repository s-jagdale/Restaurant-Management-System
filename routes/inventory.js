const crud = require('./crud');
const Inventory = require('../models/Inventory');

module.exports = crud(Inventory, {
  sort: { name: 1 },
  adminDeleteOnly: true,
});
