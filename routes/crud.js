// Generic CRUD router so every simple module (menu, tables, staff ...) shares the same code.
const express = require('express');

module.exports = function crud(Model, opts = {}) {
  const router = express.Router();

  // If the entire resource is restricted to admin (e.g., Staff management)
  if (opts.adminOnly) {
    router.use((req, res, next) => {
      if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin privileges required for this module.' });
      }
      next();
    });
  }

  // Only plain "?field=value" filters on real schema fields are allowed (blocks operator injection).
  const buildFilter = (query) => {
    const filter = {};
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string' && Model.schema.path(key)) filter[key] = value;
    }
    return filter;
  };

  const withPopulate = (q) => (opts.populate ? q.populate(opts.populate) : q);

  router.get('/', async (req, res, next) => {
    try {
      const q = Model.find(buildFilter(req.query)).sort(opts.sort || { createdAt: -1 });
      res.json(await withPopulate(q));
    } catch (e) { next(e); }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const doc = await withPopulate(Model.findById(req.params.id));
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (e) { next(e); }
  });

  router.post('/', async (req, res, next) => {
    try {
      if (opts.adminWriteOnly && req.user && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can create new entries here.' });
      }
      if (opts.validate) await opts.validate(req.body, null);
      const doc = await Model.create(req.body);
      res.status(201).json(await withPopulate(Model.findById(doc._id)));
    } catch (e) { next(e); }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      if (opts.adminWriteOnly && req.user && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can edit entries here.' });
      }
      if (opts.validate) await opts.validate(req.body, req.params.id);
      const doc = await withPopulate(
        Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      );
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (e) { next(e); }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      if ((opts.adminOnly || opts.adminDeleteOnly) && req.user && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only administrators are permitted to delete records.' });
      }
      if (opts.beforeDelete) await opts.beforeDelete(req.params.id);
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted' });
    } catch (e) { next(e); }
  });

  return router;
};
