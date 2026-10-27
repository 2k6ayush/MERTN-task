/**
 * public/task2/app.js
 * Task 2 – Sign Up / Log In + User CRUD
 *
 * Screens:
 *   screen-signup    → default, shown on load
 *   screen-login     → toggled when "Log In" link is clicked
 *   screen-dashboard → shown after successful sign-up or log-in
 *
 * API endpoints used:
 *   GET    /api/task2/users
 *   GET    /api/task2/users/:id
 *   POST   /api/task2/users
 *   POST   /api/task2/users/login
 *   PUT    /api/task2/users/:id
 *   DELETE /api/task2/users/:id
 *
 * NOTE: This is a college assignment demo.
 * In-memory storage is used for educational purposes.
 */

'use strict';

/* ── Screen references ───────────────────────────────────────── */
const screenSignup    = document.getElementById('screen-signup');
const screenLogin     = document.getElementById('screen-login');
const screenDashboard = document.getElementById('screen-dashboard');

/* ── Sign-up form ────────────────────────────────────────────── */
const signupForm = document.getElementById('signup-form');
const suEmail    = document.getElementById('su-email');
const suPassword = document.getElementById('su-password');
const suBtn      = document.getElementById('su-btn');
const signupMsg  = document.getElementById('signup-msg');

/* ── Log-in form ─────────────────────────────────────────────── */
const loginForm  = document.getElementById('login-form');
const liEmail    = document.getElementById('li-email');
const liPassword = document.getElementById('li-password');
const liBtn      = document.getElementById('li-btn');
const loginMsg   = document.getElementById('login-msg');

/* ── Dashboard ───────────────────────────────────────────────── */
const dashMsg       = document.getElementById('dash-msg');
const logoutBtn     = document.getElementById('logout-btn');
const usersTable    = document.getElementById('users-tbody');
const editPanel     = document.getElementById('edit-panel');
const editForm      = document.getElementById('edit-form');
const editIdInput   = document.getElementById('edit-id');
const editEmailInput= document.getElementById('edit-email');
const editPassInput = document.getElementById('edit-password');
const editSaveBtn   = document.getElementById('edit-save-btn');
const editCancelBtn = document.getElementById('edit-cancel-btn');

/* ── Delete Confirmation Modal ───────────────────────────────── */
const deleteModal    = document.getElementById('delete-modal');
const modalText      = document.getElementById('modal-text');
const modalConfirmBtn= document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

let pendingDeleteId = null;
let pendingDeleteEmail = null;

/* ── Navigation helpers ──────────────────────────────────────── */
function showScreen(name) {
  screenSignup.classList.add('hidden');
  screenLogin.classList.add('hidden');
  screenDashboard.classList.add('hidden');

  if (name === 'signup')    screenSignup.classList.remove('hidden');
  if (name === 'login')     screenLogin.classList.remove('hidden');
  if (name === 'dashboard') screenDashboard.classList.remove('hidden');
}

document.getElementById('go-login').addEventListener('click', function(e) {
  e.preventDefault();
  clearMsg(signupMsg);
  showScreen('login');
});

document.getElementById('go-signup').addEventListener('click', function(e) {
  e.preventDefault();
  clearMsg(loginMsg);
  showScreen('signup');
});

logoutBtn.addEventListener('click', function() {
  clearMsg(dashMsg);
  hideEditPanel();
  showScreen('signup');
});

/* ── Message helpers ─────────────────────────────────────────── */
function showMsg(el, text, type) {
  el.textContent = text;
  el.className   = 'msg ' + type;          // 'success' or 'error'
  clearTimeout(el._timer);
  el._timer = setTimeout(function() { clearMsg(el); }, 5000);
}

function clearMsg(el) {
  el.textContent = '';
  el.className   = 'msg hidden';
}

/* ── Simple email validator ──────────────────────────────────── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ── API helper (fetch + JSON) ───────────────────────────────── */
async function apiFetch(url, options) {
  options = options || {};
  var res  = await fetch(url, options);
  var data = await res.json().catch(function() { return {}; });
  if (!res.ok) {
    throw new Error(data.error || ('Request failed – HTTP ' + res.status));
  }
  return data;
}

/* ════════════════════════════════════════════════════════════════
   SIGN UP
════════════════════════════════════════════════════════════════ */
signupForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  clearMsg(signupMsg);

  var email    = suEmail.value.trim();
  var password = suPassword.value;

  // Client-side validation
  if (!isValidEmail(email)) {
    showMsg(signupMsg, 'Please enter a valid email address.', 'error');
    return;
  }
  if (password.length < 6) {
    showMsg(signupMsg, 'Password must be at least 6 characters.', 'error');
    return;
  }

  suBtn.disabled = true;
  try {
    await apiFetch('/api/task2/users', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ email: email, password: password }),
    });

    signupForm.reset();
    showMsg(signupMsg, 'Account created successfully! Welcome, ' + email, 'success');

    // Smooth transition to dashboard
    setTimeout(async function() {
      showScreen('dashboard');
      showMsg(dashMsg, 'Account created successfully! Welcome, ' + email, 'success');
      await loadUsers();
    }, 1200);
  } catch (err) {
    showMsg(signupMsg, err.message, 'error');
  } finally {
    suBtn.disabled = false;
  }
});

/* ════════════════════════════════════════════════════════════════
   LOG IN
════════════════════════════════════════════════════════════════ */
loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  clearMsg(loginMsg);

  var email    = liEmail.value.trim();
  var password = liPassword.value;

  if (!isValidEmail(email)) {
    showMsg(loginMsg, 'Please enter a valid email address.', 'error');
    return;
  }
  if (!password) {
    showMsg(loginMsg, 'Please enter your password.', 'error');
    return;
  }

  liBtn.disabled = true;
  try {
    var result = await apiFetch('/api/task2/users/login', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ email: email, password: password }),
    });

    loginForm.reset();
    showScreen('dashboard');
    showMsg(dashMsg, 'Welcome back, ' + result.email + '!', 'success');
    await loadUsers();
  } catch (err) {
    showMsg(loginMsg, err.message, 'error');
  } finally {
    liBtn.disabled = false;
  }
});

/* ════════════════════════════════════════════════════════════════
   LOAD USERS (READ)
════════════════════════════════════════════════════════════════ */
async function loadUsers() {
  try {
    var users = await apiFetch('/api/task2/users');
    renderTable(users);
  } catch (err) {
    showMsg(dashMsg, 'Error loading users: ' + err.message, 'error');
  }
}

function renderTable(users) {
  usersTable.innerHTML = '';

  if (!users || users.length === 0) {
    var tr  = document.createElement('tr');
    tr.className = 'empty-row';
    var td  = document.createElement('td');
    td.colSpan = 4;
    td.textContent = 'No users found.';
    tr.appendChild(td);
    usersTable.appendChild(tr);
    return;
  }

  users.forEach(function(user) {
    var tr = document.createElement('tr');

    // ID
    var tdId = document.createElement('td');
    tdId.textContent = user.id;
    tr.appendChild(tdId);

    // Email
    var tdEmail = document.createElement('td');
    tdEmail.textContent = user.email;
    tr.appendChild(tdEmail);

    // Password (masked – never show actual value)
    var tdPass = document.createElement('td');
    tdPass.textContent = '••••••••';
    tr.appendChild(tdPass);

    // Actions
    var tdAct = document.createElement('td');

    var editBtn   = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className   = 'btn-edit';
    editBtn.setAttribute('aria-label', 'Edit user ' + user.email);
    editBtn.addEventListener('click', function() { openEditPanel(user); });
    tdAct.appendChild(editBtn);

    var delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className   = 'btn-delete';
    delBtn.setAttribute('aria-label', 'Delete user ' + user.email);
    delBtn.addEventListener('click', function() { openDeleteModal(user.id, user.email); });
    tdAct.appendChild(delBtn);

    tr.appendChild(tdAct);
    usersTable.appendChild(tr);
  });
}

/* ════════════════════════════════════════════════════════════════
   EDIT (UPDATE)
════════════════════════════════════════════════════════════════ */
function openEditPanel(user) {
  editIdInput.value    = user.id;
  editEmailInput.value = user.email;
  editPassInput.value  = '';
  editPanel.classList.remove('hidden');
  editEmailInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideEditPanel() {
  editPanel.classList.add('hidden');
  editIdInput.value    = '';
  editEmailInput.value = '';
  editPassInput.value  = '';
}

editCancelBtn.addEventListener('click', function() {
  hideEditPanel();
  showMsg(dashMsg, 'Edit cancelled.', 'success');
});

editForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  var id       = editIdInput.value;
  var email    = editEmailInput.value.trim();
  var password = editPassInput.value;

  if (!isValidEmail(email)) {
    showMsg(dashMsg, 'Please enter a valid email address.', 'error');
    return;
  }

  var body = { email: email };
  if (password) {
    if (password.length < 6) {
      showMsg(dashMsg, 'New password must be at least 6 characters.', 'error');
      return;
    }
    body.password = password;
  }

  editSaveBtn.disabled = true;
  try {
    var updated = await apiFetch('/api/task2/users/' + id, {
      method : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(body),
    });
    hideEditPanel();
    showMsg(dashMsg, 'User ' + updated.email + ' updated successfully.', 'success');
    await loadUsers();
  } catch (err) {
    showMsg(dashMsg, err.message, 'error');
  } finally {
    editSaveBtn.disabled = false;
  }
});

/* ════════════════════════════════════════════════════════════════
   DELETE
════════════════════════════════════════════════════════════════ */
function openDeleteModal(id, email) {
  pendingDeleteId = id;
  pendingDeleteEmail = email;
  modalText.textContent = 'Are you sure you want to delete the user "' + email + '"?';
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  pendingDeleteEmail = null;
  deleteModal.classList.add('hidden');
}

modalCancelBtn.addEventListener('click', closeDeleteModal);

modalConfirmBtn.addEventListener('click', async function() {
  if (!pendingDeleteId) return;
  var id = pendingDeleteId;
  closeDeleteModal();

  try {
    var result = await apiFetch('/api/task2/users/' + id, { method: 'DELETE' });
    showMsg(dashMsg, result.message || 'User deleted successfully.', 'success');
    await loadUsers();
  } catch (err) {
    showMsg(dashMsg, err.message, 'error');
  }
});

// Close modal on Escape key
window.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && !deleteModal.classList.contains('hidden')) {
    closeDeleteModal();
  }
});

/* ── Initialise on load ──────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', function() {
  showScreen('signup');
});
