/**
 * tests/api.test.js
 *
 * Automated backend API tests using Node.js built-in test runner
 * (node:test) and the built-in fetch API (Node >= 18).
 *
 * Each test starts the Express app on a random free port and tears
 * it down afterwards – no shared global server, full isolation.
 *
 * Run with:   npm test
 */

'use strict';

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http   = require('node:http');
const { createApp } = require('../server');

// ── Helper: start a temporary server ──────────────────────────────────────
/**
 * startServer(initialItems?)
 * Returns { server, baseUrl, close }.
 * Uses port 0 so the OS assigns a free port automatically.
 */
function startServer(initialItems) {
  return new Promise((resolve) => {
    const app    = createApp(initialItems);
    const server = http.createServer(app);

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      const baseUrl  = `http://127.0.0.1:${port}`;

      resolve({
        server,
        baseUrl,
        close: () => new Promise(res => server.close(res)),
      });
    });
  });
}

// ── Helper: convenience fetch wrappers ────────────────────────────────────
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

// ── Default seed data (mirrors server.js initial state) ───────────────────
const SEED = [
  { id: 1, name: 'Book', price: 250 },
  { id: 2, name: 'Pen',  price: 25  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Test suites
// ═══════════════════════════════════════════════════════════════════════════

// ── 1. GET /api/items ─────────────────────────────────────────────────────
describe('GET /api/items', () => {
  let srv;
  before(async () => { srv = await startServer(SEED); });
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
describe('GET /api/items/:id', () => {
  let srv;
  before(async () => { srv = await startServer(SEED); });
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
describe('POST /api/items', () => {
  let srv;
  before(async () => { srv = await startServer(SEED); });
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
describe('PUT /api/items/:id', () => {
  let srv;
  before(async () => { srv = await startServer(SEED); });
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
describe('DELETE /api/items/:id', () => {
  let srv;
  // Use a fresh copy so delete tests don't interfere with each other.
  beforeEach(async () => { srv = await startServer(SEED); });
  // eslint-disable-next-line no-undef
  after(async () => { if (srv) await srv.close(); });

  test('deletes an existing item and returns 200 with a success message', async () => {
    const res  = await del(srv.baseUrl, '/api/items/1');
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(body.message, 'Response should contain a message');

    // Confirm the item is gone
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
describe('Unknown API routes', () => {
  let srv;
  before(async () => { srv = await startServer(SEED); });
  after(async  () => { await srv.close(); });

  test('GET /api/unknown returns 404', async () => {
    const res  = await get(srv.baseUrl, '/api/unknown');
    const body = await res.json();

    assert.strictEqual(res.status, 404);
    assert.ok(body.error);
  });
});

// ── 7. Malformed JSON body ────────────────────────────────────────────────
describe('Malformed JSON handling', () => {
  let srv;
  before(async () => { srv = await startServer(SEED); });
  after(async  () => { await srv.close(); });

  test('POST with malformed JSON returns 400, not a crash', async () => {
    const res = await fetch(`${srv.baseUrl}/api/items`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : '{ invalid json !!!',
    });

    // Must not be 500 (crash) – 400 is expected
    assert.ok(res.status === 400 || res.status === 400, `Expected 400, got ${res.status}`);
    const body = await res.json();
    assert.ok(body.error, 'Should return a JSON error message');
  });
});
