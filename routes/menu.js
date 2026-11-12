const express = require('express');
const MenuItem = require('../models/MenuItem');
const { authenticate, authorize } = require('../middleware/auth');
const httpError = require('./httpError');

const router = express.Router();

// GET /api/menu - public, viewable by clients, guests, staff, admin
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (typeof req.query.category === 'string' && req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.available !== undefined) {
      filter.available = req.query.available === 'true';
    }
    if (req.query.isVeg !== undefined) {
      filter.isVeg = req.query.isVeg === 'true';
    }
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      filter.name = { $regex: req.query.search.trim(), $options: 'i' };
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// GET /api/menu/:id - public
router.get('/:id', async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/menu - admin only
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { name, category, price, description, image, imageUrl, available, isAvailable, isVeg } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw httpError(400, 'Dish name is required');
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      throw httpError(400, 'Price must be a non-negative number');
    }

    const item = await MenuItem.create({
      name: name.trim(),
      category: category || 'Main Course',
      price: Number(price),
      description: description ? String(description).trim() : '',
      image: imageUrl || image || '',
      available: isAvailable !== undefined ? Boolean(isAvailable) : (available !== undefined ? Boolean(available) : true),
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /api/menu/:id - admin only
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { name, category, price, description, image, imageUrl, available, isAvailable, isVeg } = req.body;
    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (category !== undefined) update.category = category;
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) < 0) throw httpError(400, 'Price must be a non-negative number');
      update.price = Number(price);
    }
    if (description !== undefined) update.description = String(description).trim();
    if (imageUrl !== undefined || image !== undefined) update.image = imageUrl || image || '';
    if (isAvailable !== undefined || available !== undefined) {
      update.available = isAvailable !== undefined ? Boolean(isAvailable) : Boolean(available);
    }
    if (isVeg !== undefined) update.isVeg = Boolean(isVeg);

    const item = await MenuItem.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/menu/:id/toggle - admin quick toggle availability
router.patch('/:id/toggle', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    item.available = !item.available;
    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/menu/:id - admin only
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
