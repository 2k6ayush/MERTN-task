/**
 * server.js
 * Express.js REST API for CRUD Operations on an Array of Items.
 * Uses an in-memory JavaScript array as the data store.
 */

'use strict';

const express = require('express');
const path    = require('path');

/**
 * createApp()
 * Factory function that builds and returns a configured Express app.
 * Accepting an optional initial items array allows tests to start
 * with a clean, predictable dataset without touching the live server.
 */
function createApp(initialItems) {
  const app = express();

  // ── In-memory data store ──────────────────────────────────────────────
  let items = initialItems
    ? JSON.parse(JSON.stringify(initialItems))   // deep copy so tests are isolated
    : [
        { id: 1, name: 'Book', price: 250 },
        { id: 2, name: 'Pen',  price: 25  },
      ];

  // Counter used to generate unique IDs.
  let nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

  // ── Middleware ────────────────────────────────────────────────────────
  app.use(express.json());                             // parse JSON bodies
  app.use(express.static(path.join(__dirname, 'public'))); // serve frontend

  // Catch malformed JSON bodies
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Malformed JSON in request body.' });
    }
    next(err);
  });

  // ── Helper ────────────────────────────────────────────────────────────
  /**
   * validateItemBody(body)
   * Returns { valid: true } or { valid: false, error: '...' }.
   */
  function validateItemBody(body) {
    const { name, price } = body;

    if (name === undefined || name === null) {
      return { valid: false, error: 'Field "name" is required.' };
    }
    if (typeof name !== 'string' || name.trim() === '') {
      return { valid: false, error: 'Field "name" must be a non-empty string.' };
    }
    if (price === undefined || price === null) {
      return { valid: false, error: 'Field "price" is required.' };
    }
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return { valid: false, error: 'Field "price" must be a valid number.' };
    }
    if (numericPrice < 0) {
      return { valid: false, error: 'Field "price" must be zero or a positive number.' };
    }

    return { valid: true };
  }

  // ── Routes ────────────────────────────────────────────────────────────

  // GET /api/items  –  Return all items
  app.get('/api/items', (req, res) => {
    res.json(items);
  });

  // GET /api/items/:id  –  Return one item
  app.get('/api/items/:id', (req, res) => {
    const id   = parseInt(req.params.id, 10);
    const item = items.find(i => i.id === id);

    if (!item) {
      return res.status(404).json({ error: `Item with id ${id} not found.` });
    }
    res.json(item);
  });

  // POST /api/items  –  Create a new item
  app.post('/api/items', (req, res) => {
    const validation = validateItemBody(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const newItem = {
      id   : nextId++,
      name : req.body.name.trim(),
      price: Number(req.body.price),
    };

    items.push(newItem);
    res.status(201).json(newItem);
  });

  // PUT /api/items/:id  –  Update an existing item
  app.put('/api/items/:id', (req, res) => {
    const id    = parseInt(req.params.id, 10);
    const index = items.findIndex(i => i.id === id);

    if (index === -1) {
      return res.status(404).json({ error: `Item with id ${id} not found.` });
    }

    const validation = validateItemBody(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    items[index] = {
      id   : items[index].id,
      name : req.body.name.trim(),
      price: Number(req.body.price),
    };

    res.json(items[index]);
  });

  // DELETE /api/items/:id  –  Delete an item
  app.delete('/api/items/:id', (req, res) => {
    const id    = parseInt(req.params.id, 10);
    const index = items.findIndex(i => i.id === id);

    if (index === -1) {
      return res.status(404).json({ error: `Item with id ${id} not found.` });
    }

    const deleted = items.splice(index, 1)[0];
    res.json({ message: `Item "${deleted.name}" deleted successfully.`, item: deleted });
  });

  // 404 handler for unknown /api/* routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Global error handler (must have 4 parameters)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Malformed JSON in request body.' });
    }
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}

// ── Start server when run directly ────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const app  = createApp();

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT',  () => server.close(() => process.exit(0)));
}

module.exports = { createApp };
