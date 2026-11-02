const crud = require('./crud');
module.exports = crud(require('../models/Customer'), { sort: { name: 1 } });
