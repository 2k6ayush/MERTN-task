/**
 * app.js  –  Frontend CRUD logic
 *
 * Responsibilities:
 *  1. Load and render all items from GET /api/items on page load.
 *  2. Create a new item via POST /api/items.
 *  3. Populate the form for editing via GET /api/items/:id.
 *  4. Update an item via PUT /api/items/:id.
 *  5. Delete an item via DELETE /api/items/:id after confirmation.
 *
 * Security note: user-supplied text is always set via textContent,
 * never injected with innerHTML interpolation.
 */

'use strict';

// ── DOM references ─────────────────────────────────────────────────
const form          = document.getElementById('item-form');
const formTitle     = document.getElementById('form-title');
const editIdInput   = document.getElementById('edit-id');
const nameInput     = document.getElementById('item-name');
const priceInput    = document.getElementById('item-price');
const submitBtn     = document.getElementById('submit-btn');
const cancelBtn     = document.getElementById('cancel-btn');
const tbody         = document.getElementById('items-tbody');
const statusMessage = document.getElementById('status-message');

// ── Utility: show / hide status banner ────────────────────────────
function showMessage(text, type = 'success') {
  statusMessage.textContent = text;
  statusMessage.className   = `message ${type}`;   // replaces any old class

  // Auto-hide after 4 seconds
  clearTimeout(showMessage._timer);
  showMessage._timer = setTimeout(() => {
    statusMessage.className = 'message hidden';
    statusMessage.textContent = '';
  }, 4000);
}

// ── Utility: safe fetch wrapper ────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));   // handle non-JSON gracefully

  if (!res.ok) {
    const msg = data.error || `Request failed (HTTP ${res.status}).`;
    throw new Error(msg);
  }
  return data;
}

// ── Render items table ─────────────────────────────────────────────
function renderItems(items) {
  tbody.innerHTML = '';   // clear existing rows

  if (!items || items.length === 0) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = 'No items found. Add your first item above.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  items.forEach(item => {
    const tr = document.createElement('tr');

    // ID
    const tdId = document.createElement('td');
    tdId.textContent = item.id;
    tr.appendChild(tdId);

    // Name
    const tdName = document.createElement('td');
    tdName.textContent = item.name;
    tr.appendChild(tdName);

    // Price
    const tdPrice = document.createElement('td');
    tdPrice.textContent = item.price;
    tr.appendChild(tdPrice);

    // Action buttons
    const tdAction = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className   = 'btn btn-blue btn-sm';
    editBtn.setAttribute('aria-label', `Edit item ${item.name}`);
    editBtn.dataset.id  = item.id;
    editBtn.addEventListener('click', handleEdit);
    tdAction.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className   = 'btn btn-red btn-sm';
    deleteBtn.setAttribute('aria-label', `Delete item ${item.name}`);
    deleteBtn.dataset.id  = item.id;
    deleteBtn.dataset.name = item.name;
    deleteBtn.addEventListener('click', handleDelete);
    tdAction.appendChild(deleteBtn);

    tr.appendChild(tdAction);
    tbody.appendChild(tr);
  });
}

// ── Load all items from the API ────────────────────────────────────
async function loadItems() {
  try {
    const items = await apiFetch('/api/items');
    renderItems(items);
  } catch (err) {
    showMessage(`Error loading items: ${err.message}`, 'error');
  }
}

// ── Handle form submit (Create or Update) ─────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name  = nameInput.value.trim();
  const price = priceInput.value.trim();

  // Client-side validation
  if (!name) {
    showMessage('Please enter a valid item name.', 'error');
    nameInput.focus();
    return;
  }
  if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
    showMessage('Please enter a valid non-negative price.', 'error');
    priceInput.focus();
    return;
  }

  const editingId = editIdInput.value;
  submitBtn.disabled = true;

  try {
    if (editingId) {
      // ── UPDATE ──────────────────────────────────────────────────
      const updated = await apiFetch(`/api/items/${editingId}`, {
        method : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ name, price: Number(price) }),
      });
      showMessage(`Item "${updated.name}" updated successfully.`);
    } else {
      // ── CREATE ──────────────────────────────────────────────────
      const created = await apiFetch('/api/items', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ name, price: Number(price) }),
      });
      showMessage(`Item "${created.name}" added successfully.`);
    }

    clearForm();
    await loadItems();
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

// ── Handle Edit button click ───────────────────────────────────────
async function handleEdit(e) {
  const id = e.currentTarget.dataset.id;

  try {
    const item = await apiFetch(`/api/items/${id}`);

    // Populate the form
    editIdInput.value  = item.id;
    nameInput.value    = item.name;
    priceInput.value   = item.price;

    // Switch UI to edit mode
    formTitle.textContent    = 'Edit Item';
    submitBtn.textContent    = 'Update';
    cancelBtn.classList.remove('hidden');

    nameInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showMessage(`Could not load item for editing: ${err.message}`, 'error');
  }
}

// ── Handle Delete button click ─────────────────────────────────────
async function handleDelete(e) {
  const id   = e.currentTarget.dataset.id;
  const name = e.currentTarget.dataset.name;

  const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
  if (!confirmed) return;

  try {
    const result = await apiFetch(`/api/items/${id}`, { method: 'DELETE' });
    showMessage(result.message || `Item deleted successfully.`);
    await loadItems();
  } catch (err) {
    showMessage(`Could not delete item: ${err.message}`, 'error');
  }
}

// ── Handle Cancel button click ─────────────────────────────────────
cancelBtn.addEventListener('click', () => {
  clearForm();
  showMessage('Edit cancelled.', 'success');
});

// ── Clear / reset the form ─────────────────────────────────────────
function clearForm() {
  editIdInput.value = '';
  nameInput.value   = '';
  priceInput.value  = '';

  formTitle.textContent    = 'Add New Item';
  submitBtn.textContent    = 'Submit';
  cancelBtn.classList.add('hidden');
  submitBtn.disabled       = false;
}

// ── Initial load ───────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', loadItems);
