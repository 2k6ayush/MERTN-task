/**
 * tests/api.test.js
 * Automated REST API test suite for both Task 1 (items) and Task 2 (users).
 *
 * Uses Node.js built-in test runner (node:test) and assertions (node:assert).
 * Run with:
 *   npm test
 */

'use strict';

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http   = require('http');
const { createApp } = require('../server');

// ── Test server helper ─────────────────────────────────────────────────────
function startServer(initialItems, initialUsers) {
  return new Promise((resolve, reject) => {
    const app    = createApp({ initialItems, initialUsers });
    const server = http.createServer(app);

    // Port 0 binds to a free port chosen by the OS
    server.listen(0, '127.0.0.1', () => {
      const port    = server.address().port;
      const baseUrl = `http://127.0.0.1:${port}`;
      resolve({
        server,
        baseUrl,
        close: () => new Promise(res => server.close(res)),
      });
    });

    server.on('error', reject);
  });
}

// ── HTTP helpers using global fetch ────────────────────────────────────────
async function get(baseUrl, path) {
  return fetch(`${baseUrl}${path}`);
}

async function post(baseUrl, path, body) {
  return fetch(`${baseUrl}${path}`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(body),
  });
}

async function put(baseUrl, path, body) {
  return fetch(`${baseUrl}${path}`, {
    method : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(body),
  });
}

async function del(baseUrl, path) {
  return fetch(`${baseUrl}${path}`, { method: 'DELETE' });
}

// ── Seed data ─────────────────────────────────────────────────────────────
const SEED_ITEMS = [
  { id: 1, name: 'Book', price: 250 },
  { id: 2, name: 'Pen',  price: 25  },
];

const SEED_USERS = [
  { id: 1, email: 'alice@example.com', password: 'password123' },
  { id: 2, email: 'bob@example.com',   password: 'password123' },
];

// ═══════════════════════════════════════════════════════════════════════════
// TASK 1 TEST SUITES
// ═══════════════════════════════════════════════════════════════════════════

// ── 1. GET /api/items ─────────────────────────────────────────────────────
describe('Task 1: GET /api/items', () => {
  let srv;
  before(async () => { srv = await startServer(SEED_ITEMS); });
  after(async  () => { await srv.close(); });

  test('returns 200 and the two initial records', async () => {
    const res   = await get(srv.baseUrl, '/api/items');
    const items = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(items), 'Response should be an array');
    assert.strictEqual(items.length, 2);
    assert.deepStrictEqual(items[0], { id: 1, name: 'Book', price: 250 });
    assert.deepStrictEqual(items[1], { id: 2, name: 'Pen',  price: 25  });
  });
});

// ── 2. GET /api/items/:id ─────────────────────────────────────────────────
describe('Task 1: GET /api/items/:id', () => {
  let srv;
  before(async () => { srv = await startServer(SEED_ITEMS); });
  after(async  () => { await srv.close(); });

  test('returns 200 and the correct item for a known ID', async () => {
    const res  = await get(srv.baseUrl, '/api/items/1');
    const item = await res.json();

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(item, { id: 1, name: 'Book', price: 250 });
  });

  test('returns 404 for an unknown ID', async () => {
    const res  = await get(srv.baseUrl, '/api/items/999');
    const body = await res.json();

    assert.strictEqual(res.status, 404);
    assert.ok(body.error, 'Response should contain an error message');
  });
});

// ── 3. POST /api/items ────────────────────────────────────────────────────
describe('Task 1: POST /api/items', () => {
  let srv;
  before(async () => { srv = await startServer(SEED_ITEMS); });
  after(async  () => { await srv.close(); });

  test('creates a new item and returns 201', async () => {
    const res  = await post(srv.baseUrl, '/api/items', { name: 'Notebook', price: 50 });
    const item = await res.json();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(item.name,  'Notebook');
    assert.strictEqual(item.price, 50);
    assert.ok(typeof item.id === 'number' && item.id > 0, 'ID should be a positive number');
  });

  test('returns 400 when name is empty string', async () => {
    const res  = await post(srv.baseUrl, '/api/items', { name: '', price: 10 });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.ok(body.error);
  });

  test('returns 400 when name is missing', async () => {
    const res  = await post(srv.baseUrl, '/api/items', { price: 10 });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.ok(body.error);
  });

  test('returns 400 when price is missing', async () => {
    const res  = await post(srv.baseUrl, '/api/items', { name: 'Widget' });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.ok(body.error);
  });

  test('returns 400 when price is negative', async () => {
    const res  = await post(srv.baseUrl, '/api/items', { name: 'Widget', price: -5 });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.ok(body.error);
  });

  test('returns 400 when price is non-numeric', async () => {
    const res  = await post(srv.baseUrl, '/api/items', { name: 'Widget', price: 'abc' });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.ok(body.error);
  });
});

// ── 4. PUT /api/items/:id ─────────────────────────────────────────────────
describe('Task 1: PUT /api/items/:id', () => {
  let srv;
  before(async () => { srv = await startServer(SEED_ITEMS); });
  after(async  () => { await srv.close(); });

  test('updates an existing item and returns 200', async () => {
    const res  = await put(srv.baseUrl, '/api/items/1', { name: 'Book', price: 300 });
    const item = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(item.id,    1);
    assert.strictEqual(item.name,  'Book');
    assert.strictEqual(item.price, 300);
  });

  test('returns 404 for an unknown ID', async () => {
    const res  = await put(srv.baseUrl, '/api/items/999', { name: 'Ghost', price: 1 });
    const body = await res.json();

    assert.strictEqual(res.status, 404);
    assert.ok(body.error);
  });
});

// ── 5. DELETE /api/items/:id ──────────────────────────────────────────────
describe('Task 1: DELETE /api/items/:id', () => {
  let srv;
  beforeEach(async () => { srv = await startServer(SEED_ITEMS); });
  after(async () => { if (srv) await srv.close(); });

  test('deletes an existing item and returns 200 with a success message', async () => {
    const res  = await del(srv.baseUrl, '/api/items/1');
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(body.message, 'Response should contain a message');

    const checkRes = await get(srv.baseUrl, '/api/items/1');
    assert.strictEqual(checkRes.status, 404);

    await srv.close();
    srv = null;
  });

  test('returns 404 when deleting an unknown ID', async () => {
    const res  = await del(srv.baseUrl, '/api/items/999');
    const body = await res.json();

    assert.strictEqual(res.status, 404);
    assert.ok(body.error);

    await srv.close();
    srv = null;
  });
});

// ── 6. Unknown API routes ─────────────────────────────────────────────────
describe('Task 1: Unknown API routes', () => {
  let srv;
  before(async () => { srv = await startServer(SEED_ITEMS); });
  after(async  () => { await srv.close(); });

  test('GET /api/unknown returns 404', async () => {
    const res  = await get(srv.baseUrl, '/api/unknown');
    const body = await res.json();

    assert.strictEqual(res.status, 404);
    assert.ok(body.error);
  });
});

// ── 7. Malformed JSON body ────────────────────────────────────────────────
describe('Task 1: Malformed JSON handling', () => {
  let srv;
  before(async () => { srv = await startServer(SEED_ITEMS); });
  after(async  () => { await srv.close(); });

  test('POST with malformed JSON returns 400, not a crash', async () => {
    const res = await fetch(`${srv.baseUrl}/api/items`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : '{ invalid json !!!',
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error, 'Should return a JSON error message');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TASK 2 TEST SUITES
// ═══════════════════════════════════════════════════════════════════════════

// ── 8. GET /api/task2/users ───────────────────────────────────────────────
describe('Task 2: GET /api/task2/users', () => {
  let srv;
  before(async () => { srv = await startServer(SEED_ITEMS, SEED_USERS); });
  after(async  () => { await srv.close(); });

  test('returns 200 and list of initial users without password field', async () => {
    const res   = await get(srv.baseUrl, '/api/task2/users');
    const users = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(users), 'Response should be an array');
    assert.strictEqual(users.length, 2);
    assert.strictEqual(users[0].email, 'alice@example.com');
    assert.strictEqual(users[0].password, undefined, 'Password must not be returned');
    assert.strictEqual(users[1].email, 'bob@example.com');
    assert.strictEqual(users[1].password, undefined, 'Password must not be returned');
  });
});

// ── 9. GET /api/task2/users/:id ───────────────────────────────────────────
describe('Task 2: GET /api/task2/users/:id', () => {
  let srv;
  before(async () => { srv = await startServer(SEED_ITEMS, SEED_USERS); });
  after(async  () => { await srv.close(); });

  test('returns 200 and user by ID without password', async () => {
    const res  = await get(srv.baseUrl, '/api/task2/users/1');
    const user = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(user.id, 1);
    assert.strictEqual(user.email, 'alice@example.com');
    assert.strictEqual(user.password, undefined, 'Password must not be returned');
  });

  test('returns 404 for unknown user ID', async () => {
    const res  = await get(srv.baseUrl, '/api/task2/users/999');
    const body = await res.json();

    assert.strictEqual(res.status, 404);
    assert.ok(body.error);
  });
});

// ── 10. POST /api/task2/users (Sign Up / Create) ──────────────────────────
describe('Task 2: POST /api/task2/users', () => {
  let srv;
  beforeEach(async () => { srv = await startServer(SEED_ITEMS, SEED_USERS); });
  after(async () => { if (srv) await srv.close(); });

  test('creates a new user and returns 201 without password', async () => {
    const res  = await post(srv.baseUrl, '/api/task2/users', {
      email   : 'charlie@example.com',
      password: 'password123',
    });
    const user = await res.json();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(user.email, 'charlie@example.com');
    assert.ok(typeof user.id === 'number' && user.id > 0);
    assert.strictEqual(user.password, undefined, 'Password must not be returned');

    await srv.close();
    srv = null;
  });

  test('rejects an invalid email with 400', async () => {
    const res  = await post(srv.baseUrl, '/api/task2/users', {
      email   : 'invalid-email',
      password: 'password123',
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.ok(body.error);

    await srv.close();
    srv = null;
  });

  test('rejects missing email with 400', async () => {
    const res  = await post(srv.baseUrl, '/api/task2/users', {
      password: 'password123',
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.ok(body.error);

    await srv.close();
    srv = null;
  });

  test('rejects missing password with 400', async () => {
    const res  = await post(srv.baseUrl, '/api/task2/users', {
      email: 'user@example.com',
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.ok(body.error);

    await srv.close();
    srv = null;
  });

  test('rejects short password (<6 chars) with 400', async () => {
    const res  = await post(srv.baseUrl, '/api/task2/users', {
      email   : 'user@example.com',
      password: '123',
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.ok(body.error);

    await srv.close();
    srv = null;
  });

  test('rejects duplicate email with 409', async () => {
    const res  = await post(srv.baseUrl, '/api/task2/users', {
      email   : 'alice@example.com',
      password: 'password123',
    });
    const body = await res.json();

    assert.strictEqual(res.status, 409);
    assert.ok(body.error);

    await srv.close();
    srv = null;
  });
});

// ── 11. POST /api/task2/users/login (Authentication) ──────────────────────
describe('Task 2: POST /api/task2/users/login', () => {
  let srv;
  before(async () => { srv = await startServer(SEED_ITEMS, SEED_USERS); });
  after(async  () => { await srv.close(); });

  test('authenticates valid credentials with 200', async () => {
    const res  = await post(srv.baseUrl, '/api/task2/users/login', {
      email   : 'alice@example.com',
      password: 'password123',
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.email, 'alice@example.com');
  });

  test('rejects invalid password with 401', async () => {
    const res  = await post(srv.baseUrl, '/api/task2/users/login', {
      email   : 'alice@example.com',
      password: 'wrongpassword',
    });
    const body = await res.json();

    assert.strictEqual(res.status, 401);
    assert.ok(body.error);
  });

  test('rejects non-existent email with 401', async () => {
    const res  = await post(srv.baseUrl, '/api/task2/users/login', {
      email   : 'nobody@example.com',
      password: 'password123',
    });
    const body = await res.json();

    assert.strictEqual(res.status, 401);
    assert.ok(body.error);
  });

  test('rejects missing fields with 400', async () => {
    const res  = await post(srv.baseUrl, '/api/task2/users/login', { email: 'alice@example.com' });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.ok(body.error);
  });
});

// ── 12. PUT /api/task2/users/:id (Update) ─────────────────────────────────
describe('Task 2: PUT /api/task2/users/:id', () => {
  let srv;
  beforeEach(async () => { srv = await startServer(SEED_ITEMS, SEED_USERS); });
  after(async () => { if (srv) await srv.close(); });

  test('updates an existing user email and returns 200', async () => {
    const res  = await put(srv.baseUrl, '/api/task2/users/1', {
      email: 'alice.updated@example.com',
    });
    const user = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(user.id, 1);
    assert.strictEqual(user.email, 'alice.updated@example.com');
    assert.strictEqual(user.password, undefined);

    await srv.close();
    srv = null;
  });

  test('updates password when provided', async () => {
    const res  = await put(srv.baseUrl, '/api/task2/users/1', {
      email   : 'alice@example.com',
      password: 'newpassword123',
    });
    assert.strictEqual(res.status, 200);

    // Verify login with new password works
    const loginRes = await post(srv.baseUrl, '/api/task2/users/login', {
      email   : 'alice@example.com',
      password: 'newpassword123',
    });
    assert.strictEqual(loginRes.status, 200);

    await srv.close();
    srv = null;
  });

  test('rejects duplicate email with 409', async () => {
    const res  = await put(srv.baseUrl, '/api/task2/users/1', {
      email: 'bob@example.com',
    });
    const body = await res.json();

    assert.strictEqual(res.status, 409);
    assert.ok(body.error);

    await srv.close();
    srv = null;
  });

  test('returns 404 for unknown user ID', async () => {
    const res  = await put(srv.baseUrl, '/api/task2/users/999', {
      email: 'ghost@example.com',
    });
    const body = await res.json();

    assert.strictEqual(res.status, 404);
    assert.ok(body.error);

    await srv.close();
    srv = null;
  });
});

// ── 13. DELETE /api/task2/users/:id (Delete) ──────────────────────────────
describe('Task 2: DELETE /api/task2/users/:id', () => {
  let srv;
  beforeEach(async () => { srv = await startServer(SEED_ITEMS, SEED_USERS); });
  after(async () => { if (srv) await srv.close(); });

  test('deletes an existing user and returns 200', async () => {
    const res  = await del(srv.baseUrl, '/api/task2/users/1');
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(body.message);

    // Confirm user is deleted
    const checkRes = await get(srv.baseUrl, '/api/task2/users/1');
    assert.strictEqual(checkRes.status, 404);

    await srv.close();
    srv = null;
  });

  test('returns 404 for unknown user ID', async () => {
    const res  = await del(srv.baseUrl, '/api/task2/users/999');
    const body = await res.json();

    assert.strictEqual(res.status, 404);
    assert.ok(body.error);

    await srv.close();
    srv = null;
  });
});
