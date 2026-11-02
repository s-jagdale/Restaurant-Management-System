/* Restaurant Management System - plain JavaScript frontend */

// ---------- helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '\u20B9' + Number(n || 0).toFixed(2);
const badge = (v, label) => `<span class="badge ${esc(String(v).toLowerCase().replace(/ /g, '-'))}">${esc(label ?? v)}</span>`;
const todayStr = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

const DEFAULT_DISH_IMG = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';

function getPhotoForDish(name, category = '') {
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();

  const PHOTO_MAP = [
    { keys: ['paneer tikka', 'tikka'], url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80' },
    { keys: ['butter chicken', 'murg'], url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80' },
    { keys: ['biryani', 'pulao'], url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
    { keys: ['naan', 'kulcha', 'flatbread'], url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80' },
    { keys: ['roti', 'chapati', 'paratha'], url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
    { keys: ['dal', 'tadka', 'lentil', 'daal'], url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
    { keys: ['paneer', 'palak', 'shahi paneer', 'kadai paneer'], url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80' },
    { keys: ['manchurian', 'chilli', 'chinese'], url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80' },
    { keys: ['rice', 'jeera rice', 'fried rice'], url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80' },
    { keys: ['gulab jamun', 'jamun', 'rasgulla', 'sweet', 'mithai'], url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' },
    { keys: ['chai', 'tea', 'masala chai'], url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80' },
    { keys: ['lassi', 'smoothie', 'yogurt'], url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80' },
    { keys: ['pizza'], url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80' },
    { keys: ['burger'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
    { keys: ['pasta', 'spaghetti'], url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80' },
    { keys: ['noodles', 'chowmein'], url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80' },
    { keys: ['soup'], url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80' },
    { keys: ['salad'], url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80' },
    { keys: ['dosa', 'idli', 'vada', 'sambar'], url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80' },
    { keys: ['ice cream', 'sundae'], url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80' },
    { keys: ['coffee', 'cappuccino', 'latte'], url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
    { keys: ['cake', 'pastry', 'brownie'], url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80' },
    { keys: ['fish', 'prawn', 'seafood'], url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80' },
    { keys: ['chicken', 'kebab'], url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80' },
  ];

  for (const item of PHOTO_MAP) {
    if (item.keys.some(k => n.includes(k))) return item.url;
  }

  if (c.includes('starter')) return 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80';
  if (c.includes('bread')) return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80';
  if (c.includes('rice')) return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80';
  if (c.includes('dessert')) return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80';
  if (c.includes('beverage')) return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80';

  return DEFAULT_DISH_IMG;
}

// ---------- state & auth ----------
let currentUser = null;
let menuViewMode = 'grid'; // 'grid' or 'table'

function getToken() {
  return localStorage.getItem('rms_token');
}

function setAuth(token, user) {
  localStorage.setItem('rms_token', token);
  localStorage.setItem('rms_user', JSON.stringify(user));
  currentUser = user;
}

function clearAuth() {
  localStorage.removeItem('rms_token');
  localStorage.removeItem('rms_user');
  currentUser = null;
}

async function api(url, method = 'GET', body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !url.includes('/api/auth/login') && !url.includes('/api/auth/register')) {
    clearAuth();
    showAuth('login');
    throw new Error('Session expired. Please log in.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

let toastTimer;
function toast(msg, isError = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'show' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = ''), 3200);
}

function openModal(title, html, wide = false) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="overlay"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2>${html}</div></div>`;
  root.querySelector('.overlay').addEventListener('mousedown', (e) => { if (e.target.classList.contains('overlay')) closeModal(); });
  const first = root.querySelector('input, select, textarea, button');
  if (first) first.focus();
  return root.querySelector('.modal');
}
const closeModal = () => ($('#modal-root').innerHTML = '');
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

async function confirmAction(message) { return window.confirm(message); }

// ---------- auth screen ----------
function showAuth(tab = 'login') {
  $('#sidebar').style.display = 'none';
  $('#view').style.display = 'none';
  const root = $('#auth-root');
  root.style.display = 'block';

  root.innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="auth-logo-badge">🌶️</div>
          <h1>Spice Route</h1>
          <p>Restaurant Management System</p>
        </div>

        <div class="auth-tabs">
          <button type="button" class="auth-tab ${tab === 'login' ? 'active' : ''}" id="tab-login">Sign In</button>
          <button type="button" class="auth-tab ${tab === 'register' ? 'active' : ''}" id="tab-register">Register</button>
        </div>

        <div id="auth-form-wrap">
          ${tab === 'login' ? renderLoginForm() : renderRegisterForm()}
        </div>

        <div class="demo-box">
          <small>Instant demo access (one-click login):</small>
          <div class="demo-btns">
            <button type="button" class="btn small" id="demo-admin">👑 Admin Demo</button>
            <button type="button" class="btn small" id="demo-staff">👤 Staff Demo</button>
          </div>
        </div>
      </div>
    </div>
  `;

  $('#tab-login').onclick = () => showAuth('login');
  $('#tab-register').onclick = () => showAuth('register');

  $('#demo-admin').onclick = async () => {
    try {
      const data = await api('/api/auth/login', 'POST', { username: 'admin', password: 'admin123' });
      setAuth(data.token, data.user);
      toast(`Signed in as ${data.user.name} (Admin)`);
      initApp();
    } catch (e) {
      toast(e.message, true);
    }
  };

  $('#demo-staff').onclick = async () => {
    try {
      const data = await api('/api/auth/login', 'POST', { username: 'staff', password: 'staff123' });
      setAuth(data.token, data.user);
      toast(`Signed in as ${data.user.name} (Staff)`);
      initApp();
    } catch (e) {
      toast(e.message, true);
    }
  };

  const form = $('#auth-form');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (tab === 'login') {
        const username = $('#auth_user').value.trim();
        const password = $('#auth_pass').value;
        try {
          const res = await api('/api/auth/login', 'POST', { username, password });
          setAuth(res.token, res.user);
          toast(`Welcome back, ${res.user.name}!`);
          initApp();
        } catch (err) {
          toast(err.message, true);
        }
      } else {
        const name = $('#reg_name').value.trim();
        const username = $('#reg_user').value.trim();
        const password = $('#reg_pass').value;
        const role = $('#reg_role').value;
        try {
          const res = await api('/api/auth/register', 'POST', { name, username, password, role });
          setAuth(res.token, res.user);
          toast(`Account created! Welcome, ${res.user.name}`);
          initApp();
        } catch (err) {
          toast(err.message, true);
        }
      }
    };
  }
}

function renderLoginForm() {
  return `
    <form id="auth-form">
      <div class="field">
        <label for="auth_user">Username</label>
        <input id="auth_user" type="text" placeholder="e.g. admin or staff" required autocomplete="username" autofocus>
      </div>
      <div class="field">
        <label for="auth_pass">Password</label>
        <input id="auth_pass" type="password" placeholder="Enter your password" required autocomplete="current-password">
      </div>
      <button class="btn primary" style="width:100%;margin-top:10px">Sign In</button>
    </form>
  `;
}

function renderRegisterForm() {
  return `
    <form id="auth-form">
      <div class="field">
        <label for="reg_name">Full Name</label>
        <input id="reg_name" type="text" placeholder="e.g. Vikram Joshi" required autofocus>
      </div>
      <div class="field">
        <label for="reg_user">Username</label>
        <input id="reg_user" type="text" placeholder="At least 3 characters" minlength="3" required autocomplete="username">
      </div>
      <div class="field">
        <label for="reg_pass">Password</label>
        <input id="reg_pass" type="password" placeholder="At least 6 characters" minlength="6" required autocomplete="new-password">
      </div>
      <div class="field">
        <label for="reg_role">Role</label>
        <select id="reg_role">
          <option value="staff">Staff (Orders, Tables, Billing, Reservations)</option>
          <option value="admin">Admin (Full Access & Staff Management)</option>
        </select>
      </div>
      <button class="btn primary" style="width:100%;margin-top:10px">Create Account</button>
    </form>
  `;
}

function renderUserProfile() {
  const slot = $('#user-profile-slot');
  if (!slot || !currentUser) return;
  const isAdmin = currentUser.role === 'admin';
  const initial = (currentUser.name || 'U')[0].toUpperCase();
  slot.innerHTML = `
    <div class="user-profile">
      <div class="user-card">
        <div class="user-avatar">${initial}</div>
        <div class="user-details">
          <span class="user-name" title="${esc(currentUser.name)}">${esc(currentUser.name)}</span>
          <div class="user-meta">
            <span class="badge ${isAdmin ? 'admin' : 'staff'}">${esc(currentUser.role)}</span>
            <span class="user-handle">@${esc(currentUser.username)}</span>
          </div>
        </div>
      </div>
      <button type="button" class="btn-logout" id="logout-btn">
        <span>Sign Out</span>
      </button>
    </div>
  `;
  $('#logout-btn').onclick = () => {
    clearAuth();
    toast('Signed out');
    showAuth('login');
  };
}

function renderRestrictedNotice(title = 'Admin Privileges Required') {
  const view = $('#view');
  view.innerHTML = `
    <div class="restricted-notice">
      <h2>🛡️ ${esc(title)}</h2>
      <p>You are signed in as <strong>${esc(currentUser.name)}</strong> (Role: <span class="badge staff">${esc(currentUser.role)}</span>).<br>
      This section contains administrative settings and is restricted to administrators.</p>
      <button class="btn primary" onclick="location.hash='#/orders'">Go to Orders</button>
    </div>
  `;
}

// ---------- config for the simple CRUD modules ----------
const STATUS_TABLE = ['available', 'occupied', 'reserved'];
const RESOURCES = {
  menu: {
    title: 'Menu', single: 'dish', endpoint: '/api/menu', adminDeleteOnly: true, icon: '📖', isMenu: true,
    cols: [
      ['Dish', (r) => `<div style="display:flex;align-items:center;gap:10px"><img src="${esc(r.image || DEFAULT_DISH_IMG)}" class="dish-thumb" referrerpolicy="no-referrer" onerror="this.src='${DEFAULT_DISH_IMG}'"><strong>${esc(r.name)}</strong></div>`],
      ['Category', (r) => `<span class="badge info">${esc(r.category)}</span>`],
      ['Price', (r) => `<strong style="color:var(--emerald-text)">${money(r.price)}</strong>`],
      ['Description', (r) => `<span style="color:var(--text-muted);font-size:13px">${esc(r.description)}</span>`],
      ['Status', (r) => (r.available ? badge('available', 'available') : badge('cancelled', 'sold out'))]
    ],
    fields: [
      { k: 'name', label: 'Dish Name', type: 'text', required: true },
      { k: 'category', label: 'Category', type: 'select', options: ['Starter', 'Main Course', 'Bread', 'Rice', 'Dessert', 'Beverage'] },
      { k: 'price', label: 'Price (\u20B9)', type: 'number', required: true, min: 0 },
      { k: 'image', label: 'Dish Image URL (Unsplash or web image)', type: 'url', placeholder: 'https://images.unsplash.com/...' },
      { k: 'description', label: 'Description', type: 'textarea' },
      { k: 'available', label: 'Available to order', type: 'checkbox', default: true },
    ],
  },
  tables: {
    title: 'Tables', single: 'table', endpoint: '/api/tables', adminDeleteOnly: true, icon: '🪑',
    cols: [['Table', (r) => `<strong>Table ${esc(r.number)}</strong>`], ['Capacity', (r) => `${esc(r.capacity)} Guests`], ['Status', (r) => badge(r.status)]],
    fields: [
      { k: 'number', label: 'Table Number', type: 'number', required: true, min: 1 },
      { k: 'capacity', label: 'Seating Capacity', type: 'number', required: true, min: 1 },
      { k: 'status', label: 'Current Status', type: 'select', options: STATUS_TABLE },
    ],
  },
  reservations: {
    title: 'Reservations', single: 'reservation', endpoint: '/api/reservations', icon: '📅',
    cols: [['Customer', (r) => `<strong>${esc(r.customerName)}</strong>`], ['Phone', (r) => esc(r.phone)], ['Table', (r) => r.table ? `<span class="badge info">Table ${esc(r.table.number)}</span>` : '-'],
      ['Guests', (r) => `${esc(r.guests)} ppl`], ['Date & Time', (r) => `${esc(r.date)} @ ${esc(r.time)}`], ['Status', (r) => badge(r.status)]],
    fields: [
      { k: 'customerName', label: 'Customer Name', type: 'text', required: true },
      { k: 'phone', label: 'Phone Number', type: 'text', required: true },
      { k: 'table', label: 'Select Table', type: 'ref', endpoint: '/api/tables', optionLabel: (t) => `Table ${t.number} (seats ${t.capacity})`, required: true },
      { k: 'guests', label: 'Number of Guests', type: 'number', required: true, min: 1 },
      { k: 'date', label: 'Reservation Date', type: 'date', required: true, default: todayStr() },
      { k: 'time', label: 'Reservation Time', type: 'time', required: true, default: '20:00' },
      { k: 'status', label: 'Status', type: 'select', options: ['booked', 'seated', 'completed', 'cancelled'] },
      { k: 'notes', label: 'Special Requests / Notes', type: 'textarea' },
    ],
  },
  customers: {
    title: 'Customers', single: 'customer', endpoint: '/api/customers', icon: '👥',
    cols: [['Name', (r) => `<strong>${esc(r.name)}</strong>`], ['Phone', (r) => esc(r.phone)], ['Email', (r) => esc(r.email || '-')], ['Notes', (r) => esc(r.notes || '-')]],
    fields: [
      { k: 'name', label: 'Customer Name', type: 'text', required: true },
      { k: 'phone', label: 'Phone Number', type: 'text', required: true },
      { k: 'email', label: 'Email Address', type: 'email' },
      { k: 'notes', label: 'Customer Preferences / Notes', type: 'textarea' },
    ],
  },
  staff: {
    title: 'Staff Management', single: 'staff member', endpoint: '/api/staff', adminOnly: true, icon: '👨‍💼',
    cols: [['Name', (r) => `<strong>${esc(r.name)}</strong>`], ['Role', (r) => `<span class="badge info">${esc(r.role)}</span>`], ['Shift', (r) => esc(r.shift)], ['Phone', (r) => esc(r.phone)],
      ['Status', (r) => (r.active ? badge('available', 'active') : badge('cancelled', 'inactive'))]],
    fields: [
      { k: 'name', label: 'Staff Member Name', type: 'text', required: true },
      { k: 'role', label: 'Assigned Role', type: 'select', options: ['Manager', 'Chef', 'Waiter', 'Cashier', 'Cleaner'] },
      { k: 'shift', label: 'Shift Timing', type: 'select', options: ['Morning', 'Evening', 'Night'] },
      { k: 'phone', label: 'Contact Phone', type: 'text' },
      { k: 'active', label: 'Currently employed / active', type: 'checkbox', default: true },
    ],
  },
  inventory: {
    title: 'Inventory Stock', single: 'stock item', endpoint: '/api/inventory', adminDeleteOnly: true, icon: '📦',
    cols: [['Item', (r) => `<strong>${esc(r.name)}</strong>`], ['Current Stock', (r) => `<strong>${esc(r.quantity)} ${esc(r.unit)}</strong>`], ['Reorder Level', (r) => `${esc(r.reorderLevel)} ${esc(r.unit)}`],
      ['Supplier', (r) => esc(r.supplier || '-')], ['Alert', (r) => r.quantity <= r.reorderLevel ? '<span class="badge bad">Low Stock</span>' : '<span class="badge ok">Sufficient</span>']],
    fields: [
      { k: 'name', label: 'Ingredient / Item Name', type: 'text', required: true },
      { k: 'quantity', label: 'Current Quantity', type: 'number', required: true, min: 0 },
      { k: 'unit', label: 'Measurement Unit', type: 'select', options: ['kg', 'litre', 'piece', 'packet'] },
      { k: 'reorderLevel', label: 'Low Stock Alert Level', type: 'number', min: 0, default: 5 },
      { k: 'supplier', label: 'Supplier Name', type: 'text' },
    ],
  },
};

// ---------- generic list + add/edit/delete screen ----------
async function renderResource(key) {
  const cfg = RESOURCES[key];
  if (cfg.adminOnly && currentUser?.role !== 'admin') {
    return renderRestrictedNotice();
  }

  const isAdmin = currentUser?.role === 'admin';
  const view = $('#view');
  
  view.innerHTML = `
    <div class="page-head">
      <div class="page-head-title">
        <h1>${cfg.title}</h1>
      </div>
      <div class="tools">
        ${cfg.isMenu ? `
          <button class="btn small" id="toggle-view">${menuViewMode === 'grid' ? '📋 Table View' : '🎴 Photo Cards'}</button>
        ` : ''}
        <input id="search" type="search" placeholder="Search ${cfg.title.toLowerCase()}..." aria-label="Search">
        <button class="btn primary" id="add">+ Add ${cfg.single}</button>
      </div>
    </div>
    <div id="content-container"></div>
  `;

  let rows = [];

  function draw() {
    const q = $('#search').value.toLowerCase();
    const shown = rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q));
    const container = $('#content-container');

    if (!shown.length) {
      container.innerHTML = `<div class="empty">${rows.length ? 'No matches found.' : `No ${cfg.title.toLowerCase()} recorded yet. Use "+ Add ${esc(cfg.single)}" to create one.`}</div>`;
      return;
    }

    if (cfg.isMenu && menuViewMode === 'grid') {
      // Render as rich Food Cards
      container.innerHTML = `
        <div class="dish-grid">
          ${shown.map((r) => `
            <div class="dish-card">
              <div class="dish-card-img-wrap">
                <img src="${esc(r.image || DEFAULT_DISH_IMG)}" class="dish-card-img" alt="${esc(r.name)}" referrerpolicy="no-referrer" onerror="this.src='${DEFAULT_DISH_IMG}'">
                <span class="dish-card-cat">${esc(r.category)}</span>
                <span class="dish-card-status">${r.available ? badge('available', 'available') : badge('cancelled', 'sold out')}</span>
              </div>
              <div class="dish-card-body">
                <div class="dish-card-header">
                  <h3 class="dish-card-title">${esc(r.name)}</h3>
                  <span class="dish-card-price">${money(r.price)}</span>
                </div>
                <p class="dish-card-desc">${esc(r.description || 'Delicious freshly prepared authentic dish.')}</p>
                <div class="dish-card-actions">
                  <button class="btn small" data-edit="${esc(r._id)}">Edit</button>
                  ${isAdmin ? `<button class="btn small danger" data-del="${esc(r._id)}">Delete</button>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      // Render standard Table
      container.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr>${cfg.cols.map((c) => `<th>${c[0]}</th>`).join('')}<th></th></tr></thead>
            <tbody>${
              shown.map((r) => `<tr>${cfg.cols.map((c) => `<td>${c[1](r)}</td>`).join('')}<td class="actions">
                <button class="btn small" data-edit="${esc(r._id)}">Edit</button>
                ${isAdmin || !cfg.adminDeleteOnly ? `<button class="btn small danger" data-del="${esc(r._id)}">Delete</button>` : ''}
              </td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  async function load() {
    try { rows = await api(cfg.endpoint); draw(); } catch (e) { toast(e.message, true); }
  }

  if (cfg.isMenu) {
    const toggleBtn = $('#toggle-view');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        menuViewMode = menuViewMode === 'grid' ? 'table' : 'grid';
        toggleBtn.textContent = menuViewMode === 'grid' ? '📋 Table View' : '🎴 Photo Cards';
        draw();
      };
    }
  }

  async function form(record) {
    await Promise.all(cfg.fields.filter((f) => f.type === 'ref').map(async (f) => { f.items = await api(f.endpoint); }));
    const html = cfg.fields.map((f) => {
      const val = record ? record[f.k] : f.default;
      const id = 'f_' + f.k;
      const req = f.required ? 'required' : '';
      if (f.type === 'checkbox') return `<div class="field check"><label><input type="checkbox" id="${id}" ${val === false ? '' : (val ?? false) ? 'checked' : ''}> ${esc(f.label)}</label></div>`;
      let input;
      if (f.type === 'select') input = `<select id="${id}">${f.options.map((o) => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
      else if (f.type === 'ref') {
        const cur = val && val._id ? val._id : val;
        input = `<select id="${id}" ${req}><option value="">Select Table...</option>${f.items.map((o) => `<option value="${esc(o._id)}" ${o._id === cur ? 'selected' : ''}>${esc(f.optionLabel(o))}</option>`).join('')}</select>`;
      } else if (f.type === 'textarea') input = `<textarea id="${id}" rows="2">${esc(val)}</textarea>`;
      else input = `<input id="${id}" type="${f.type}" value="${esc(val)}" placeholder="${esc(f.placeholder || '')}" ${req} ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.type === 'number' ? 'step="any"' : ''}>`;
      
      let extra = '';
      if (cfg.isMenu && f.k === 'image') {
        extra = `
          <div style="display:flex;gap:10px;margin-top:6px;align-items:center">
            <button type="button" class="btn small" id="btn-auto-pic">✨ Auto-Find Picture by Name</button>
            <small style="color:var(--text-muted)">Auto-selects image based on dish name</small>
          </div>
          <div class="image-preview-wrap">
            <img id="dish-preview-img" src="${val || DEFAULT_DISH_IMG}" alt="Dish preview" referrerpolicy="no-referrer" onerror="this.src='${DEFAULT_DISH_IMG}'">
            <span class="image-preview-label">Live Photo Preview</span>
          </div>
        `;
      }
      return `<div class="field"><label for="${id}">${esc(f.label)}</label>${input}${extra}</div>`;
    }).join('');

    const modal = openModal(`${record ? 'Edit' : 'Add'} ${cfg.single}`, `<form id="f" novalidate>${html}<div class="foot"><button type="button" class="btn" id="cancel">Cancel</button><button class="btn primary">Save Changes</button></div></form>`);

    if (cfg.isMenu) {
      const imgInput = $('#f_image', modal);
      const preview = $('#dish-preview-img', modal);
      const nameInput = $('#f_name', modal);
      const catInput = $('#f_category', modal);
      const autoBtn = $('#btn-auto-pic', modal);

      if (imgInput && preview) {
        imgInput.addEventListener('input', () => {
          preview.src = imgInput.value.trim() || DEFAULT_DISH_IMG;
        });
      }
      if (autoBtn && nameInput && imgInput && preview) {
        autoBtn.onclick = () => {
          const matchUrl = getPhotoForDish(nameInput.value, catInput ? catInput.value : '');
          imgInput.value = matchUrl;
          preview.src = matchUrl;
          toast(`Selected matching photo for "${nameInput.value || 'dish'}"`);
        };
      }
    }

    $('#cancel', modal).onclick = closeModal;
    $('#f', modal).onsubmit = async (e) => {
      e.preventDefault();
      const body = {};
      for (const f of cfg.fields) {
        const el = $('#f_' + f.k, modal);
        body[f.k] = f.type === 'checkbox' ? el.checked : f.type === 'number' ? (el.value === '' ? undefined : Number(el.value)) : el.value;
      }
      if (cfg.isMenu && !body.image) {
        body.image = getPhotoForDish(body.name, body.category);
      }
      try {
        await api(record ? `${cfg.endpoint}/${record._id}` : cfg.endpoint, record ? 'PUT' : 'POST', body);
        closeModal(); toast(record ? 'Changes saved' : `${cfg.single[0].toUpperCase() + cfg.single.slice(1)} added`); load();
      } catch (err) { toast(err.message, true); }
    };
  }

  $('#add').onclick = () => form(null);
  $('#search').oninput = draw;
  $('#content-container').onclick = async (e) => {
    const edit = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
    if (edit) form(rows.find((r) => r._id === edit.dataset.edit));
    if (del && (await confirmAction('Delete this record? This action cannot be undone.'))) {
      try { await api(`${cfg.endpoint}/${del.dataset.del}`, 'DELETE'); toast('Deleted'); load(); } catch (err) { toast(err.message, true); }
    }
  };
  load();
}

// ---------- user accounts management (admin only) ----------
async function renderUsers() {
  if (currentUser?.role !== 'admin') {
    return renderRestrictedNotice();
  }

  const view = $('#view');
  view.innerHTML = `
    <div class="page-head">
      <div class="page-head-title">
        <h1>User Accounts</h1>
      </div>
      <div class="tools">
        <input id="user-search" type="search" placeholder="Search accounts..." aria-label="Search">
      </div>
    </div>
    <div class="table-wrap" id="user-list"></div>
  `;

  let users = [];

  function draw() {
    const q = $('#user-search').value.toLowerCase();
    const shown = users.filter((u) => !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
    if (!shown.length) {
      $('#user-list').innerHTML = '<div class="empty">No users found.</div>';
      return;
    }
    $('#user-list').innerHTML = `
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Username</th>
            <th>Role</th>
            <th>Registered On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${shown.map((u) => {
            const isSelf = String(u._id) === String(currentUser.id);
            return `
              <tr>
                <td><strong>${esc(u.name)}</strong> ${isSelf ? '<small style="color:var(--text-muted)">(You)</small>' : ''}</td>
                <td>@${esc(u.username)}</td>
                <td><span class="badge ${u.role === 'admin' ? 'admin' : 'staff'}">${esc(u.role)}</span></td>
                <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                <td class="actions">
                  ${!isSelf ? `
                    <button class="btn small" data-role-swap="${esc(u._id)}" data-role="${u.role}">
                      Switch to ${u.role === 'admin' ? 'Staff' : 'Admin'}
                    </button>
                    <button class="btn small danger" data-user-del="${esc(u._id)}">Remove</button>
                  ` : '<span style="color:var(--text-muted);font-size:13px;font-weight:600">Current Session</span>'}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  async function load() {
    try {
      users = await api('/api/auth/users');
      draw();
    } catch (e) {
      toast(e.message, true);
    }
  }

  $('#user-search').oninput = draw;
  $('#user-list').onclick = async (e) => {
    const swap = e.target.closest('[data-role-swap]');
    const del = e.target.closest('[data-user-del]');

    if (swap) {
      const targetRole = swap.dataset.role === 'admin' ? 'staff' : 'admin';
      try {
        await api(`/api/auth/users/${swap.dataset.roleSwap}/role`, 'PATCH', { role: targetRole });
        toast(`Role changed to ${targetRole}`);
        load();
      } catch (err) {
        toast(err.message, true);
      }
    }

    if (del && (await confirmAction('Permanently remove this user account?'))) {
      try {
        await api(`/api/auth/users/${del.dataset.userDel}`, 'DELETE');
        toast('User removed');
        load();
      } catch (err) {
        toast(err.message, true);
      }
    }
  };

  load();
}

// ---------- dashboard ----------
async function renderDashboard() {
  const view = $('#view');
  view.innerHTML = `
    <div class="welcome-banner">
      <div class="welcome-text">
        <h2>Welcome back, ${esc(currentUser.name)}! 👋</h2>
        <p>Spice Route dining room operations are live. Monitor real-time kitchen orders, table turnover, and revenue.</p>
      </div>
      <div class="welcome-badge">
        <span class="live-dot"></span> Kitchen Service Active
      </div>
    </div>
    <div class="page-head"><h1>Dashboard Overview</h1></div>
    <div id="dash"></div>
  `;
  try {
    const d = await api('/api/dashboard');
    $('#dash').innerHTML = `
      <div class="stats">
        <div class="stat lead">
          <span>💰 Revenue Today</span>
          <strong>${money(d.revenueToday)}</strong>
        </div>
        <div class="stat">
          <span>📋 Orders Today</span>
          <strong>${d.ordersToday}</strong>
        </div>
        <div class="stat">
          <span>⚡ Active Orders</span>
          <strong>${d.activeOrders}</strong>
        </div>
        <div class="stat">
          <span>🪑 Tables Occupied</span>
          <strong>${d.tablesOccupied} <small style="font-size:16px;color:var(--text-muted)">/ ${d.tablesTotal}</small></strong>
        </div>
        <div class="stat">
          <span>📅 Reservations Today</span>
          <strong>${d.reservationsToday}</strong>
        </div>
        <div class="stat">
          <span>🍲 Dishes on Menu</span>
          <strong>${d.menuCount}</strong>
        </div>
      </div>
      <div class="panels">
        <div class="panel">
          <h2><span>🔥 Top Selling Dishes</span></h2>
          <ul>
            ${d.topItems.length ? d.topItems.map((i, idx) => `
              <li>
                <span><strong>#${idx + 1}</strong> ${esc(i._id)}</span>
                <span class="badge info">${i.qty} sold</span>
              </li>
            `).join('') : '<li class="none">No orders recorded today.</li>'}
          </ul>
        </div>
        <div class="panel">
          <h2><span>⚠️ Low Stock Alerts</span></h2>
          <ul>
            ${d.lowStock.length ? d.lowStock.map((i) => `
              <li>
                <span>${esc(i.name)}</span>
                <span class="badge bad">${esc(i.quantity)} ${esc(i.unit)} left</span>
              </li>
            `).join('') : '<li class="none">All stock levels are sufficient.</li>'}
          </ul>
        </div>
      </div>
    `;
  } catch (e) { toast(e.message, true); }
}

// ---------- orders ----------
const NEXT_STEP = {
  pending: ['preparing', '▶ Start Preparing'],
  preparing: ['ready', '✓ Mark Ready'],
  ready: ['served', '🍽️ Mark Served'],
};

async function renderOrders() {
  const view = $('#view');
  view.innerHTML = `
    <div class="page-head">
      <h1>Active Kitchen & Dining Orders</h1>
      <div class="tools">
        <select id="filter" aria-label="Filter orders" style="width:auto">
          <option value="active">Active Orders</option>
          <option value="all">All Orders</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button class="btn primary" id="new">+ New Order</button>
      </div>
    </div>
    <div id="orders" class="orders"></div>
  `;
  let orders = [];

  function draw() {
    const f = $('#filter').value;
    const shown = orders.filter((o) => f === 'all' || (f === 'active' ? !['completed', 'cancelled'].includes(o.status) : o.status === f));
    if (!shown.length) {
      $('#orders').innerHTML = '<div class="empty" style="grid-column:1/-1">No orders found. Click "+ New Order" to place one.</div>';
      return;
    }
    $('#orders').innerHTML = shown.map((o) => `
      <article class="order">
        <header>
          <div>
            <strong>${esc(o.orderNo)}</strong>
            <small>Table ${esc(o.table?.number ?? '-')}${o.customerName ? ' • ' + esc(o.customerName) : ''}</small>
          </div>
          ${badge(o.status)}
        </header>
        <ul>
          ${o.items.map((i) => `
            <li>
              <span><span class="item-qty-badge">${esc(i.qty)}×</span> ${esc(i.name)}</span>
              <strong>${money(i.price * i.qty)}</strong>
            </li>
          `).join('')}
        </ul>
        ${o.notes ? `<div class="order-note">📝 ${esc(o.notes)}</div>` : ''}
        <div class="total">
          <span>Subtotal</span>
          <span>${money(o.subtotal)}</span>
        </div>
        <div class="btns">
          ${NEXT_STEP[o.status] ? `<button class="btn small primary" data-next="${o._id}" data-status="${NEXT_STEP[o.status][0]}">${NEXT_STEP[o.status][1]}</button>` : ''}
          ${['ready', 'served'].includes(o.status) ? `<button class="btn small accent" data-bill="${o._id}">💳 Generate Bill</button>` : ''}
          ${['pending', 'preparing', 'ready'].includes(o.status) ? `<button class="btn small danger" data-cancel="${o._id}">Cancel</button>` : ''}
        </div>
      </article>
    `).join('');
  }

  async function load() { try { orders = await api('/api/orders'); draw(); } catch (e) { toast(e.message, true); } }

  async function setStatus(id, status) {
    try { await api(`/api/orders/${id}/status`, 'PATCH', { status }); toast('Order status updated'); load(); } catch (e) { toast(e.message, true); }
  }

  async function newOrder() {
    const [tables, menu] = await Promise.all([api('/api/tables'), api('/api/menu?available=true')]);
    if (!tables.length || !menu.length) { toast('Add at least one table and one available dish first', true); return; }
    const cats = [...new Set(menu.map((m) => m.category))];
    const modal = openModal('Take New Order', `<form id="of" novalidate>
      <div class="row2">
        <div class="field">
          <label for="o_table">Assign Table</label>
          <select id="o_table">${tables.map((t) => `<option value="${t._id}" ${t.status !== 'available' ? 'disabled' : ''}>Table ${t.number} (${t.status})</option>`).join('')}</select>
        </div>
        <div class="field">
          <label for="o_cust">Customer Name (Optional)</label>
          <input id="o_cust" placeholder="e.g. Rahul">
        </div>
      </div>
      <label>Select Dishes</label>
      <div class="menu-pick">
        ${cats.map((c) => `
          <div class="cat">${esc(c)}</div>
          ${menu.filter((m) => m.category === c).map((m) => `
            <div class="line">
              <div class="dish-line-left">
                <img src="${esc(m.image || DEFAULT_DISH_IMG)}" class="dish-thumb" alt="${esc(m.name)}" referrerpolicy="no-referrer" onerror="this.src='${DEFAULT_DISH_IMG}'">
                <div>
                  <strong>${esc(m.name)}</strong>
                  <small style="color:var(--text-muted);display:block">${money(m.price)}</small>
                </div>
              </div>
              <input type="number" min="0" value="0" data-id="${m._id}" data-price="${m.price}" aria-label="Quantity of ${esc(m.name)}">
            </div>
          `).join('')}
        `).join('')}
      </div>
      <div class="field"><label for="o_notes">Kitchen Notes</label><input id="o_notes" placeholder="e.g. Less spicy, no onion"></div>
      <div class="summary big"><span>Total Estimated</span><span id="o_total">${money(0)}</span></div>
      <div class="foot"><button type="button" class="btn" id="cancel">Cancel</button><button class="btn primary">Send to Kitchen</button></div></form>`, true);
    
    const inputs = [...modal.querySelectorAll('[data-id]')];
    const recalc = () => { $('#o_total', modal).textContent = money(inputs.reduce((s, i) => s + Math.max(0, Math.floor(Number(i.value) || 0)) * Number(i.dataset.price), 0)); };
    inputs.forEach((i) => i.addEventListener('input', recalc));
    $('#cancel', modal).onclick = closeModal;
    $('#of', modal).onsubmit = async (e) => {
      e.preventDefault();
      const items = inputs.filter((i) => Number(i.value) > 0).map((i) => ({ menuItem: i.dataset.id, qty: Math.floor(Number(i.value)) }));
      if (!items.length) return toast('Select at least one dish for the order', true);
      try {
        await api('/api/orders', 'POST', { table: $('#o_table', modal).value, customerName: $('#o_cust', modal).value, notes: $('#o_notes', modal).value, items });
        closeModal(); toast('Order sent to kitchen!'); load();
      } catch (err) { toast(err.message, true); }
    };
  }

  async function billModal(order) {
    const { taxRate } = await api('/api/bills/settings');
    const modal = openModal(`Generate Bill: ${order.orderNo}`, `<form id="bf" novalidate>
      <div class="summary"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
      <div class="field"><label for="b_disc">Discount Amount (\u20B9)</label><input id="b_disc" type="number" min="0" max="${order.subtotal}" value="0" step="any"></div>
      <div class="summary"><span>Tax (${taxRate}%)</span><span id="b_tax"></span></div>
      <div class="summary big"><span>Grand Total</span><span id="b_total"></span></div>
      <div class="field" style="margin-top:16px"><label for="b_pay">Payment Method</label><select id="b_pay"><option>Cash</option><option>UPI</option><option>Card</option></select></div>
      <div class="foot"><button type="button" class="btn" id="cancel">Cancel</button><button class="btn primary">Accept Payment & Print Receipt</button></div></form>`);
    const calc = () => {
      const d = Math.min(Math.max(Number($('#b_disc', modal).value) || 0, 0), order.subtotal);
      const tax = Math.round(((order.subtotal - d) * taxRate)) / 100;
      $('#b_tax', modal).textContent = money(tax);
      $('#b_total', modal).textContent = money(order.subtotal - d + tax);
    };
    $('#b_disc', modal).oninput = calc; calc();
    $('#cancel', modal).onclick = closeModal;
    $('#bf', modal).onsubmit = async (e) => {
      e.preventDefault();
      try {
        const bill = await api('/api/bills', 'POST', { order: order._id, discount: Number($('#b_disc', modal).value) || 0, paymentMethod: $('#b_pay', modal).value });
        closeModal(); toast('Payment recorded successfully'); load(); printReceipt(bill);
      } catch (err) { toast(err.message, true); }
    };
  }

  $('#new').onclick = newOrder;
  $('#filter').onchange = draw;
  $('#orders').onclick = (e) => {
    const next = e.target.closest('[data-next]'), cancel = e.target.closest('[data-cancel]'), bill = e.target.closest('[data-bill]');
    if (next) setStatus(next.dataset.next, next.dataset.status);
    if (cancel && window.confirm('Cancel this active order?')) setStatus(cancel.dataset.cancel, 'cancelled');
    if (bill) billModal(orders.find((o) => o._id === bill.dataset.bill));
  };
  load();
}

// ---------- billing ----------
function printReceipt(bill) {
  const o = bill.order || {};
  const w = window.open('', '_blank', 'width=420,height=640');
  if (!w) return toast('Allow pop-ups to print the receipt', true);
  w.document.write(`<!DOCTYPE html><html><head><title>${esc(bill.billNo)}</title><style>
    body{font:14px/1.5 monospace;max-width:340px;margin:20px auto;color:#000}h1{font-size:18px;text-align:center;margin:0}
    p.c{text-align:center;margin:2px 0 12px}.r{display:flex;justify-content:space-between}hr{border:0;border-top:1px dashed #000}
    .t{font-weight:bold;font-size:16px}</style></head><body>
    <h1>Spice Route</h1><p class="c">Restaurant Receipt</p>
    <div class="r"><span>${esc(bill.billNo)}</span><span>${new Date(bill.createdAt).toLocaleString()}</span></div>
    <div>Table ${esc(o.table?.number ?? '-')} ${o.customerName ? '| ' + esc(o.customerName) : ''}</div><hr>
    ${(o.items || []).map((i) => `<div class="r"><span>${esc(i.qty)} x ${esc(i.name)}</span><span>${money(i.price * i.qty)}</span></div>`).join('')}<hr>
    <div class="r"><span>Subtotal</span><span>${money(bill.subtotal)}</span></div>
    <div class="r"><span>Discount</span><span>-${money(bill.discount)}</span></div>
    <div class="r"><span>Tax (${esc(bill.taxRate)}%)</span><span>${money(bill.tax)}</span></div><hr>
    <div class="r t"><span>TOTAL</span><span>${money(bill.total)}</span></div>
    <div>Paid by ${esc(bill.paymentMethod)}</div><p class="c">Thank you, visit again!</p>
    <script>window.onload=function(){window.print()}<\/script></body></html>`);
  w.document.close();
}

async function renderBilling() {
  $('#view').innerHTML = '<div class="page-head"><h1>Invoices & Billing History</h1></div><div class="table-wrap" id="list"></div>';
  try {
    const bills = await api('/api/bills');
    if (!bills.length) { $('#list').innerHTML = '<div class="empty">No bills recorded yet. Open Orders and click "Generate Bill" on ready or served orders.</div>'; return; }
    $('#list').innerHTML = `<table><thead><tr><th>Bill #</th><th>Order #</th><th>Table</th><th>Date</th><th>Subtotal</th><th>Discount</th><th>Tax</th><th>Total Paid</th><th>Method</th><th></th></tr></thead><tbody>${
      bills.map((b) => `<tr><td><strong>${esc(b.billNo)}</strong></td><td>${esc(b.order?.orderNo)}</td><td>Table ${esc(b.order?.table?.number ?? '-')}</td><td>${new Date(b.createdAt).toLocaleDateString()}</td>
      <td>${money(b.subtotal)}</td><td>${money(b.discount)}</td><td>${money(b.tax)}</td><td><strong style="color:var(--emerald-text)">${money(b.total)}</strong></td><td><span class="badge ok">${esc(b.paymentMethod)}</span></td>
      <td class="actions"><button class="btn small" data-print="${b._id}">🖨️ Receipt</button></td></tr>`).join('')}</tbody></table>`;
    $('#list').onclick = (e) => { const p = e.target.closest('[data-print]'); if (p) printReceipt(bills.find((b) => b._id === p.dataset.print)); };
  } catch (e) { toast(e.message, true); }
}

// ---------- dynamic navigation & router ----------
const ALL_ROUTES = [
  ['dashboard', 'Dashboard', renderDashboard, ['admin', 'staff'], '📊'],
  ['orders', 'Orders', renderOrders, ['admin', 'staff'], '🍳'],
  ['billing', 'Billing', renderBilling, ['admin', 'staff'], '💳'],
  ['menu', 'Menu', () => renderResource('menu'), ['admin', 'staff'], '📖'],
  ['tables', 'Tables', () => renderResource('tables'), ['admin', 'staff'], '🪑'],
  ['reservations', 'Reservations', () => renderResource('reservations'), ['admin', 'staff'], '📅'],
  ['customers', 'Customers', () => renderResource('customers'), ['admin', 'staff'], '👥'],
  ['inventory', 'Inventory', () => renderResource('inventory'), ['admin', 'staff'], '📦'],
  ['staff', 'Staff', () => renderResource('staff'), ['admin'], '👨‍💼'],
  ['users', 'User Accounts', renderUsers, ['admin'], '🔐'],
];

function route() {
  if (!currentUser) return;

  const userRole = currentUser.role || 'staff';
  const availableRoutes = ALL_ROUTES.filter((r) => r[3].includes(userRole));

  let name = location.hash.replace('#/', '') || 'dashboard';

  // Check if trying to access restricted route
  const target = ALL_ROUTES.find((x) => x[0] === name);
  if (target && !target[3].includes(userRole)) {
    $('#nav').innerHTML = availableRoutes
      .map((x) => `<a href="#/${x[0]}"><span class="nav-icon">${x[4]}</span><span class="nav-label">${x[1]}</span></a>`)
      .join('');
    closeModal();
    renderRestrictedNotice();
    return;
  }

  const active = availableRoutes.find((x) => x[0] === name) || availableRoutes[0];
  if (active[0] !== name) {
    location.hash = `#/${active[0]}`;
    return;
  }

  $('#nav').innerHTML = availableRoutes
    .map((x) => `<a href="#/${x[0]}" class="${x[0] === active[0] ? 'active' : ''}" ${x[0] === active[0] ? 'aria-current="page"' : ''}><span class="nav-icon">${x[4]}</span><span class="nav-label">${x[1]}</span></a>`)
    .join('');

  closeModal();
  active[2]();
}

window.addEventListener('hashchange', route);

async function initApp() {
  const token = getToken();
  if (!token) {
    showAuth('login');
    return;
  }

  try {
    const res = await api('/api/auth/me');
    currentUser = res.user;
    $('#auth-root').style.display = 'none';
    $('#sidebar').style.display = '';
    $('#view').style.display = '';
    renderUserProfile();
    route();
  } catch (err) {
    clearAuth();
    showAuth('login');
  }
}

// Start app
initApp();
