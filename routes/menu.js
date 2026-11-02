const crud = require('./crud');
const MenuItem = require('../models/MenuItem');

module.exports = crud(MenuItem, {
  sort: { category: 1, name: 1 },
  adminDeleteOnly: true,
});
