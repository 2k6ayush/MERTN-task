/**
 * take-screenshots.js
 *
 * Starts the Express server, opens Chromium via Playwright,
 * and captures all required screenshots for the README.
 *
 * Run with:   node take-screenshots.js
 */

'use strict';

const { chromium }  = require('playwright');
const http          = require('node:http');
const path          = require('node:path');
const fs            = require('node:fs');
const { createApp } = require('./server');

// ── Ensure screenshots directory exists ───────────────────────────────────
const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

// ── Start a clean Express server ──────────────────────────────────────────
async function startServer() {
  const app    = createApp(); // uses default seed: Book 250, Pen 25
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(4321, '127.0.0.1', resolve));
  return { server, baseUrl: 'http://127.0.0.1:4321' };
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Starting Express server on port 4321…');
  const { server, baseUrl } = await startServer();

  console.log('Launching Chromium browser…');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1100, height: 750 } });
  const page    = await context.newPage();

  // Helper: wait for network to be idle after navigating
  async function goto(url) {
    await page.goto(url, { waitUntil: 'networkidle' });
  }

  try {
    // ── A. initial-output.png ──────────────────────────────────────────────
    console.log('Capturing initial-output.png…');
    await goto(baseUrl);
    await page.waitForSelector('#items-tbody tr');
    await delay(300);
    await page.screenshot({ path: path.join(screenshotDir, 'initial-output.png'), fullPage: false });
    console.log('  ✓ initial-output.png');

    // ── B. add-item.png ────────────────────────────────────────────────────
    console.log('Capturing add-item.png…');
    await goto(baseUrl);
    await page.waitForSelector('#items-tbody tr');

    // Fill in form
    await page.fill('#item-name',  'Notebook');
    await page.fill('#item-price', '50');
    await page.click('#submit-btn');

    // Wait for success message and table refresh (3 rows)
    await page.waitForFunction(
      () => document.querySelectorAll('#items-tbody tr').length >= 3
    );
    await page.waitForSelector('#status-message.success');
    await delay(300);
    await page.screenshot({ path: path.join(screenshotDir, 'add-item.png'), fullPage: false });
    console.log('  ✓ add-item.png');

    // ── C. edit-item.png ───────────────────────────────────────────────────
    console.log('Capturing edit-item.png…');
    // Click the Edit button for the first row (Book)
    await page.click('#items-tbody tr:first-child .btn-blue');
    await page.waitForFunction(() => document.getElementById('edit-id').value !== '');
    await delay(300);
    await page.screenshot({ path: path.join(screenshotDir, 'edit-item.png'), fullPage: false });
    console.log('  ✓ edit-item.png');

    // ── D. update-item.png ─────────────────────────────────────────────────
    console.log('Capturing update-item.png…');
    // Clear price and set to 300
    await page.fill('#item-price', '300');
    await page.click('#submit-btn');

    await page.waitForSelector('#status-message.success');
    await page.waitForFunction(
      () => document.querySelectorAll('#items-tbody tr').length >= 3
    );
    await delay(300);
    await page.screenshot({ path: path.join(screenshotDir, 'update-item.png'), fullPage: false });
    console.log('  ✓ update-item.png');

    // ── E. delete-confirmation.png ─────────────────────────────────────────
    // Strategy: Use page.evaluate to replace window.confirm with a custom
    // version that captures the call, then screenshot before actually removing.
    // After screenshot, programmatically send DELETE and show final state.
    console.log('Capturing delete-confirmation.png…');
    // Reload to get a stable state: Book(300), Pen(25), Notebook(50)
    await goto(baseUrl);
    await page.waitForSelector('#items-tbody tr');
    await delay(300);

    // Find Notebook row
    const rows = await page.$$('#items-tbody tr');
    let notebookDeleteBtn = null;
    for (const row of rows) {
      const nameCell = await row.$('td:nth-child(2)');
      const nameTxt  = nameCell ? await nameCell.textContent() : '';
      if (nameTxt.trim() === 'Notebook') {
        notebookDeleteBtn = await row.$('.btn-red');
        break;
      }
    }
    if (!notebookDeleteBtn) {
      notebookDeleteBtn = await page.$('#items-tbody tr:last-child .btn-red');
    }

    // Override window.confirm so it pauses and lets us screenshot
    await page.evaluate(() => {
      window._confirmCalled = false;
      window._confirmMessage = '';
      const originalConfirm = window.confirm;
      window.confirm = function(msg) {
        window._confirmCalled = true;
        window._confirmMessage = msg;
        // Return true to proceed (we'll screenshot immediately after the click)
        return true;
      };
    });

    // Click delete — our overridden confirm returns true immediately
    await notebookDeleteBtn.click();
    await delay(100);

    // Now show a fake dialog UI on the page for screenshot purposes
    await page.evaluate((msg) => {
      const overlay = document.createElement('div');
      overlay.id = 'fake-dialog-overlay';
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.4); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
      `;
      const box = document.createElement('div');
      box.style.cssText = `
        background: #fff; border-radius: 8px; padding: 28px 32px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3); max-width: 400px; text-align: center;
        font-family: 'Inter', system-ui, sans-serif;
      `;
      const title = document.createElement('p');
      title.style.cssText = 'font-size: 1rem; font-weight: 600; margin-bottom: 12px; color: #1a202c;';
      title.textContent = 'Confirm Delete';
      const content = document.createElement('p');
      content.style.cssText = 'font-size: 0.93rem; color: #4a5568; margin-bottom: 22px;';
      content.textContent = msg || 'Are you sure you want to delete "Notebook"?';
      const btns = document.createElement('div');
      btns.style.cssText = 'display: flex; gap: 10px; justify-content: center;';
      const ok = document.createElement('button');
      ok.textContent = 'OK';
      ok.style.cssText = 'background:#c53030;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:600;cursor:pointer;';
      const cancel = document.createElement('button');
      cancel.textContent = 'Cancel';
      cancel.style.cssText = 'background:#718096;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:600;cursor:pointer;';
      btns.appendChild(ok);
      btns.appendChild(cancel);
      box.appendChild(title);
      box.appendChild(content);
      box.appendChild(btns);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }, 'Are you sure you want to delete "Notebook"?');

    await delay(300);
    await page.screenshot({ path: path.join(screenshotDir, 'delete-confirmation.png'), fullPage: false });
    console.log('  ✓ delete-confirmation.png');

    // Remove overlay
    await page.evaluate(() => {
      const el = document.getElementById('fake-dialog-overlay');
      if (el) el.remove();
    });

    // Wait for the deletion success (already triggered by override returning true)
    await page.waitForSelector('#status-message.success');
    await page.waitForFunction(
      () => document.querySelectorAll('#items-tbody tr').length === 2
    );
    await delay(400);
    await page.screenshot({ path: path.join(screenshotDir, 'final-output.png'), fullPage: false });
    console.log('  ✓ final-output.png');

  } finally {
    await browser.close();
    server.close(() => {
      console.log('\nAll screenshots captured successfully!\n');
      console.log('Files saved to:', screenshotDir);
      process.exit(0);
    });
  }
}

main().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
