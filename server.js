
'use strict';

const express = require('express');
const path    = require('path');


function createApp(options) {
  options = options || {};
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  let items = options.initialItems
    ? JSON.parse(JSON.stringify(options.initialItems))
    : [
        { id: 1, name: 'Book', price: 250 },
        { id: 2, name: 'Pen',  price: 25  },
      ];
  let nextItemId = items.reduce((max, i) => Math.max(max, i.id), 0) + 1;

  function validateItemBody(body) {
    const { name, price } = body;
    if (name === undefined || name === null)
      return { valid: false, error: 'Field "name" is required.' };
    if (typeof name !== 'string' || name.trim() === '')
      return { valid: false, error: 'Field "name" must be a non-empty string.' };
    if (price === undefined || price === null)
      return { valid: false, error: 'Field "price" is required.' };
    const num = Number(price);
    if (isNaN(num))
      return { valid: false, error: 'Field "price" must be a valid number.' };
    if (num < 0)
      return { valid: false, error: 'Field "price" must be zero or a positive number.' };
    return { valid: true };
  }

  app.get('/api/items', (req, res) => res.json(items));

  app.get('/api/items/:id', (req, res) => {
    const id   = parseInt(req.params.id, 10);
    const item = items.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: `Item with id ${id} not found.` });
    res.json(item);
  });

  app.post('/api/items', (req, res) => {
    const v = validateItemBody(req.body);
    if (!v.valid) return res.status(400).json({ error: v.error });
    const newItem = { id: nextItemId++, name: req.body.name.trim(), price: Number(req.body.price) };
    items.push(newItem);
    res.status(201).json(newItem);
  });

  app.put('/api/items/:id', (req, res) => {
    const id  = parseInt(req.params.id, 10);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ error: `Item with id ${id} not found.` });
    const v = validateItemBody(req.body);
    if (!v.valid) return res.status(400).json({ error: v.error });
    items[idx] = { id, name: req.body.name.trim(), price: Number(req.body.price) };
    res.json(items[idx]);
  });

  app.delete('/api/items/:id', (req, res) => {
    const id  = parseInt(req.params.id, 10);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ error: `Item with id ${id} not found.` });
    const deleted = items.splice(idx, 1)[0];
    res.json({ message: `Item "${deleted.name}" deleted successfully.`, item: deleted });
  });

  let users = options.initialUsers !== undefined
    ? JSON.parse(JSON.stringify(options.initialUsers))
    : [
        { id: 1, email: 'alice@example.com', password: 'password123' },
        { id: 2, email: 'bob@example.com',   password: 'password123' },
      ];
  let nextUserId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;

  function isValidEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function safeUser(u) {
    return { id: u.id, email: u.email };
  }

  app.get('/task2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'task2', 'index.html'));
  });

  app.get('/api/task2/users', (req, res) => {
    res.json(users.map(safeUser));
  });

  app.get('/api/task2/users/:id', (req, res) => {
    const id   = parseInt(req.params.id, 10);
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: `User with id ${id} not found.` });
    res.json(safeUser(user));
  });

  app.post('/api/task2/users', (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !isValidEmail(email))
      return res.status(400).json({ error: 'A valid email address is required.' });
    if (!password || typeof password !== 'string' || password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const duplicate = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (duplicate)
      return res.status(409).json({ error: `Email "${email.trim()}" is already registered.` });

    const newUser = { id: nextUserId++, email: email.trim(), password };
    users.push(newUser);
    res.status(201).json(safeUser(newUser));
  });

  app.post('/api/task2/users/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password.' });
    if (user.password !== password)
      return res.status(401).json({ error: 'Invalid email or password.' });

    res.json({ message: 'Login successful.', email: user.email });
  });

  app.put('/api/task2/users/:id', (req, res) => {
    const id  = parseInt(req.params.id, 10);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ error: `User with id ${id} not found.` });

    const { email, password } = req.body || {};
    if (!email || !isValidEmail(email))
      return res.status(400).json({ error: 'A valid email address is required.' });

    const conflict = users.find(u => u.id !== id && u.email.toLowerCase() === email.trim().toLowerCase());
    if (conflict)
      return res.status(409).json({ error: `Email "${email.trim()}" is already used by another account.` });

    users[idx].email = email.trim();
    if (password !== undefined && password !== null && password !== '') {
      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }
      users[idx].password = password;
    }
    res.json(safeUser(users[idx]));
  });

  app.delete('/api/task2/users/:id', (req, res) => {
    const id  = parseInt(req.params.id, 10);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ error: `User with id ${id} not found.` });
    const deleted = users.splice(idx, 1)[0];
    res.json({ message: `User "${deleted.email}" deleted successfully.` });
  });

  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

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

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const app  = createApp();

  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`  Task 1: http://localhost:${PORT}/`);
    console.log(`  Task 2: http://localhost:${PORT}/task2`);
  });

  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT',  () => server.close(() => process.exit(0)));
}

module.exports = { createApp };
