/* Restaurant Management System - Unified Client & Staff/Admin Application */

// ---------- Global Helpers & Formatting ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

const money = (n) => '\u20B9' + Number(n || 0).toFixed(2);
const badge = (v, label) =>
  `<span class="badge ${esc(String(v).toLowerCase().replace(/ /g, '-'))}">${esc(label ?? v)}</span>`;

const todayStr = () => {
  const d = new Date();
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const DEFAULT_DISH_IMG =
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';

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
    if (item.keys.some((k) => n.includes(k))) return item.url;
  }

  if (c.includes('starter')) return 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80';
  if (c.includes('bread')) return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80';
  if (c.includes('rice')) return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80';
  if (c.includes('dessert')) return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80';
  if (c.includes('beverage')) return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80';

  return DEFAULT_DISH_IMG;
}

// ---------- State & Authentication ----------
let currentUser = null;
let menuViewMode = 'grid'; // For admin menu view: 'grid' or 'table'
let activePollingTimer = null;

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
  if (!t) return;
  t.textContent = msg;
  t.className = 'show' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = ''), 3400);
}

function openModal(title, html, wide = false) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="overlay"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2>${html}</div></div>`;
  root.querySelector('.overlay').addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('overlay')) closeModal();
  });
  const first = root.querySelector('input, select, textarea, button');
  if (first) first.focus();
  return root.querySelector('.modal');
}

const closeModal = () => {
  const root = $('#modal-root');
  if (root) root.innerHTML = '';
};
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

async function confirmAction(message) {
  return window.confirm(message);
}

// Stop polling when navigating away
function clearActivePolling() {
  if (activePollingTimer) {
    clearInterval(activePollingTimer);
    activePollingTimer = null;
  }
}

// ---------- Shopping Cart Management ----------
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('rms_cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('rms_cart', JSON.stringify(cart));
  updateCartBadge();
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.qty || 0), 0);
}

function updateCartBadge() {
  const count = getCartCount();
  const badgeEl = $('#cart-count');
  if (badgeEl) {
    badgeEl.textContent = count;
    badgeEl.style.display = count > 0 ? 'inline-block' : 'inline-block';
  }
}

function addToCart(dish, qty = 1, note = '') {
  const cart = getCart();
  const existing = cart.find((i) => i.menuItem === dish._id && (i.note || '') === (note || ''));
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      menuItem: dish._id,
      name: dish.name,
      price: dish.price,
      qty,
      image: dish.image || DEFAULT_DISH_IMG,
      isVeg: dish.isVeg !== false,
      note: note.trim(),
    });
  }
  saveCart(cart);
  toast(`Added ${qty}× ${dish.name} to order`);
}

function updateCartQty(menuItemId, note, newQty) {
  let cart = getCart();
  if (newQty <= 0) {
    cart = cart.filter((i) => !(i.menuItem === menuItemId && (i.note || '') === (note || '')));
  } else {
    const item = cart.find((i) => i.menuItem === menuItemId && (i.note || '') === (note || ''));
    if (item) item.qty = newQty;
  }
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem('rms_cart');
  updateCartBadge();
}

// Helper to extract table from QR link: /#/menu?table=3 or /#/?table=3
function getUrlTableParam() {
  const hash = location.hash;
  if (!hash.includes('?')) return null;
  const qStr = hash.split('?')[1];
  const params = new URLSearchParams(qStr);
  return params.get('table') || params.get('tableId');
}

// ---------- Auth Screen (Login & Register) ----------
function showAuth(tab = 'login') {
  clearActivePolling();
  $('#sidebar').style.display = 'none';
  $('#client-header').style.display = 'none';
  $('#view').style.display = 'none';
  const root = $('#auth-root');
  root.style.display = 'block';

  root.innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="auth-logo-badge">🌶️</div>
          <h1>Spice Route</h1>
          <p>Restaurant Management & Dining Portal</p>
        </div>

        <div class="auth-tabs">
          <button type="button" class="auth-tab ${tab === 'login' ? 'active' : ''}" id="tab-login">Sign In</button>
          <button type="button" class="auth-tab ${tab === 'register' ? 'active' : ''}" id="tab-register">Register as Guest</button>
        </div>

        <div id="auth-form-wrap">
          ${tab === 'login' ? renderLoginForm() : renderRegisterForm()}
        </div>

        <div class="demo-box">
          <small>Instant demo access (one-click login):</small>
          <div class="demo-btns" style="display:flex;gap:6px;flex-wrap:wrap">
            <button type="button" class="btn small" id="demo-admin">👑 Admin</button>
            <button type="button" class="btn small" id="demo-staff">👤 Staff</button>
            <button type="button" class="btn small" id="demo-client">🍽️ Client Demo</button>
          </div>
          <div style="margin-top:10px;text-align:center">
            <a href="#/client-home" style="color:var(--text-muted);font-size:12.5px;font-weight:600;text-decoration:none">
              ← Continue as Guest to Digital Menu
            </a>
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
      redirectAfterLogin();
    } catch (e) {
      toast(e.message, true);
    }
  };

  $('#demo-staff').onclick = async () => {
    try {
      const data = await api('/api/auth/login', 'POST', { username: 'staff', password: 'staff123' });
      setAuth(data.token, data.user);
      toast(`Signed in as ${data.user.name} (Staff)`);
      redirectAfterLogin();
    } catch (e) {
      toast(e.message, true);
    }
  };

  $('#demo-client').onclick = async () => {
    try {
      const data = await api('/api/auth/login', 'POST', { username: 'rahul_client', password: 'client123' });
      setAuth(data.token, data.user);
      toast(`Signed in as ${data.user.name} (Client)`);
      redirectAfterLogin();
    } catch (e) {
      toast(e.message, true);
    }
  };

  const form = $('#auth-form');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (tab === 'login') {
        const identifier = $('#auth_user').value.trim();
        const password = $('#auth_pass').value;
        try {
          const res = await api('/api/auth/login', 'POST', { identifier, password });
          setAuth(res.token, res.user);
          toast(`Welcome, ${res.user.name}!`);
          redirectAfterLogin();
        } catch (err) {
          toast(err.message, true);
        }
      } else {
        const name = $('#reg_name').value.trim();
        const email = $('#reg_email').value.trim();
        const phone = $('#reg_phone').value.trim();
        const username = $('#reg_user').value.trim();
        const password = $('#reg_pass').value;

        try {
          const res = await api('/api/auth/register', 'POST', {
            name,
            email,
            phone,
            username,
            password,
          });
          setAuth(res.token, res.user);
          toast(`Account created! Welcome, ${res.user.name}`);
          redirectAfterLogin();
        } catch (err) {
          toast(err.message, true);
        }
      }
    };
  }
}

function redirectAfterLogin() {
  if (!currentUser) return;
  if (currentUser.role === 'admin') {
    location.hash = '#/dashboard';
  } else if (currentUser.role === 'staff') {
    location.hash = '#/orders';
  } else {
    location.hash = '#/client-home';
  }
  initApp();
}

function renderLoginForm() {
  return `
    <form id="auth-form">
      <div class="field">
        <label for="auth_user">Email or Username</label>
        <input id="auth_user" type="text" placeholder="e.g. admin@spiceroute.com or staff" required autocomplete="username" autofocus>
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
        <input id="reg_name" type="text" placeholder="e.g. Rahul Deshmukh" required autofocus>
      </div>
      <div class="field">
        <label for="reg_email">Email Address</label>
        <input id="reg_email" type="email" placeholder="e.g. rahul@example.com" required autocomplete="email">
      </div>
      <div class="row2">
        <div class="field">
          <label for="reg_user">Username</label>
          <input id="reg_user" type="text" placeholder="At least 3 chars" minlength="3" required autocomplete="username">
        </div>
        <div class="field">
          <label for="reg_phone">Phone Number</label>
          <input id="reg_phone" type="tel" placeholder="e.g. 9876543210" required autocomplete="tel">
        </div>
      </div>
      <div class="field">
        <label for="reg_pass">Password</label>
        <input id="reg_pass" type="password" placeholder="At least 6 characters" minlength="6" required autocomplete="new-password">
      </div>
      <button class="btn primary" style="width:100%;margin-top:10px">Create Client Account</button>
    </form>
  `;
}

// ---------- UI Headers & Layouts ----------
function renderClientHeader() {
  const isClient = !currentUser || currentUser.role === 'client';
  if (!isClient) return;

  $('#sidebar').style.display = 'none';
  $('#client-header').style.display = 'block';
  document.body.classList.add('client-mode');

  // Update Nav Links Active Class
  const currentHash = location.hash.split('?')[0] || '#/client-home';
  const links = $$('#client-nav a');
  links.forEach((a) => {
    if (a.getAttribute('href') === currentHash) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });

  updateCartBadge();

  // Render User slot
  const slot = $('#client-user-slot');
  if (slot) {
    if (currentUser) {
      slot.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px">
          <span class="client-user-btn" title="${esc(currentUser.email || currentUser.username)}">
            👤 ${esc(currentUser.name.split(' ')[0])}
          </span>
          <button type="button" class="btn small" id="c-logout-btn" style="padding:5px 10px;font-size:12px">Sign Out</button>
        </div>
      `;
      $('#c-logout-btn').onclick = () => {
        clearAuth();
        toast('Signed out');
        location.hash = '#/client-home';
        initApp();
      };
    } else {
      slot.innerHTML = `
        <button type="button" class="btn small primary" id="c-login-btn">Sign In</button>
      `;
      $('#c-login-btn').onclick = () => showAuth('login');
    }
  }
}

function renderSidebar() {
  if (!currentUser || currentUser.role === 'client') return;

  $('#client-header').style.display = 'none';
  $('#sidebar').style.display = 'flex';
  document.body.classList.remove('client-mode');

  const isAdmin = currentUser.role === 'admin';
  const initial = (currentUser.name || 'U')[0].toUpperCase();

  const slot = $('#user-profile-slot');
  if (slot) {
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
}

function render403Forbidden(title = 'Access Forbidden (403)') {
  clearActivePolling();
  const view = $('#view');
  view.style.display = 'block';
  const roleName = currentUser ? currentUser.role : 'Guest';
  const returnHash = currentUser?.role === 'admin' ? '#/dashboard' : currentUser?.role === 'staff' ? '#/orders' : '#/client-home';

  view.innerHTML = `
    <div class="restricted-notice">
      <h2>🛡️ ${esc(title)}</h2>
      <p>You do not have permission to view or manage this module.<br>
      Current role: <span class="badge ${roleName}">${roleName}</span>.</p>
      <button class="btn primary" onclick="location.hash='${returnHash}'">Return to Home</button>
    </div>
  `;
}

// ==========================================================================
// CLIENT MODULE VIEWS
// ==========================================================================

// 1. Client Home View
async function renderClientHome() {
  clearActivePolling();
  renderClientHeader();
  const view = $('#view');
  view.style.display = 'block';

  view.innerHTML = `
    <section class="client-hero">
      <div class="hero-pill">✨ Royal Culinary Tradition • Authentic Flavors</div>
      <h1>Spice Route Fine Dining</h1>
      <p>Immerse yourself in rich heritage, slow-simmered gravies, and aromatic clay-oven delicacies prepared fresh by our master chefs.</p>
      <div class="hero-actions">
        <a href="#/reserve" class="btn-hero-primary">🍽️ Reserve a Table</a>
        <a href="#/client-menu" class="btn-hero-secondary">📖 Explore Digital Menu</a>
      </div>
    </section>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon-box">🥘</div>
        <div class="feature-body">
          <h3>Handcrafted Dishes</h3>
          <p>Authentic regional curries, tandoori breads, and fragrant basmati biryanis prepared to order.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon-box">📱</div>
        <div class="feature-body">
          <h3>Contactless QR Ordering</h3>
          <p>Scan your table's QR code to order directly from your smartphone with no wait time.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon-box">🥂</div>
        <div class="feature-body">
          <h3>Instant Table Reservations</h3>
          <p>Live table availability checks with immediate instant booking confirmation.</p>
        </div>
      </div>
    </div>

    <div class="client-section-head">
      <div>
        <h2>Chef's Recommended Highlights</h2>
        <p>Most beloved signature dishes crafted with house-ground spice blends.</p>
      </div>
      <a href="#/client-menu" class="btn small" style="font-weight:700">View Full Menu →</a>
    </div>

    <div id="home-featured-dishes" class="dish-grid">
      <div class="empty">Loading dishes...</div>
    </div>

    <div style="margin-top:48px;background:#ffffff;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);padding:32px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:24px;align-items:center">
      <div>
        <h3 style="font-size:18px;margin-bottom:6px">Dining Hours & Location</h3>
        <p style="color:var(--text-muted);margin:0;font-size:14px">Lunch: 11:30 AM – 3:30 PM &nbsp;•&nbsp; Dinner: 7:00 PM – 11:30 PM</p>
        <p style="color:var(--text-muted);margin:4px 0 0;font-size:14px">📍 Heritage Boulevard, Food Street, Pune • Contact: +91 98000 00000</p>
      </div>
      <a href="#/reserve" class="btn primary" style="padding:12px 24px;border-radius:var(--radius-pill)">Book for Tonight</a>
    </div>
  `;

  try {
    const items = await api('/api/menu?available=true');
    const featured = items.slice(0, 4);
    const container = $('#home-featured-dishes');
    if (!featured.length) {
      container.innerHTML = '<div class="empty">No menu items found.</div>';
      return;
    }

    container.innerHTML = featured
      .map(
        (dish) => `
        <div class="client-dish-card">
          <div class="client-dish-img-wrap">
            <img src="${esc(dish.image || DEFAULT_DISH_IMG)}" class="client-dish-img" alt="${esc(dish.name)}" referrerpolicy="no-referrer" onerror="this.src='${DEFAULT_DISH_IMG}'">
            <span class="client-dish-badge-top">
              <span class="diet-icon ${dish.isVeg !== false ? 'veg' : 'non-veg'}"></span>
              ${dish.isVeg !== false ? 'Pure Veg' : 'Non-Veg'}
            </span>
          </div>
          <div class="client-dish-body">
            <div class="client-dish-header">
              <span class="client-dish-title">${esc(dish.name)}</span>
              <span class="client-dish-price">${money(dish.price)}</span>
            </div>
            <p class="client-dish-desc">${esc(dish.description || 'Authentic traditional recipe prepared with fresh ingredients.')}</p>
            <div class="client-dish-footer">
              <span style="font-size:12.5px;color:var(--text-muted)">${esc(dish.category)}</span>
              <button class="btn-add-cart" data-quick-add="${esc(dish._id)}">+ Add</button>
            </div>
          </div>
        </div>
      `
      )
      .join('');

    container.onclick = (e) => {
      const btn = e.target.closest('[data-quick-add]');
      if (btn) {
        const dish = items.find((d) => d._id === btn.dataset.quickAdd);
        if (dish) addToCart(dish, 1, '');
      }
    };
  } catch (err) {
    $('#home-featured-dishes').innerHTML = `<div class="empty">Could not load menu: ${esc(err.message)}</div>`;
  }
}

// 2. Client Digital Menu View
async function renderClientMenu() {
  clearActivePolling();
  renderClientHeader();
  const view = $('#view');
  view.style.display = 'block';

  const tableParam = getUrlTableParam();

  view.innerHTML = `
    ${
      tableParam
        ? `
      <div class="qr-table-banner">
        <div>
          <strong>🪑 Dine-In at Table ${esc(tableParam)} Active</strong>
          <span>Your order will be linked directly to Table ${esc(tableParam)} for express kitchen service.</span>
        </div>
        <button class="btn small" onclick="location.hash='#/cart'">Proceed to Cart ➔</button>
      </div>
    `
        : ''
    }

    <div class="client-section-head">
      <div>
        <h1>Digital Food & Drinks Menu</h1>
        <p>Explore our kitchen specialties, filtered by category and dietary preference.</p>
      </div>
    </div>

    <div class="menu-toolbar">
      <div class="menu-search-row">
        <div class="menu-search-box">
          <span class="menu-search-icon">🔍</span>
          <input type="search" id="menu-search" placeholder="Search dishes by name or ingredients..." aria-label="Search menu">
        </div>

        <div class="diet-filter-tabs">
          <button type="button" class="diet-tab-btn active" data-diet="all">All Dishes</button>
          <button type="button" class="diet-tab-btn" data-diet="veg">
            <span class="diet-icon veg"></span> Veg Only
          </button>
          <button type="button" class="diet-tab-btn" data-diet="nonveg">
            <span class="diet-icon non-veg"></span> Non-Veg
          </button>
        </div>
      </div>

      <div class="category-chips" id="cat-chips">
        <button type="button" class="cat-chip active" data-cat="all">All Categories</button>
        <button type="button" class="cat-chip" data-cat="Starter">Starters</button>
        <button type="button" class="cat-chip" data-cat="Main Course">Main Course</button>
        <button type="button" class="cat-chip" data-cat="Bread">Breads & Tandoor</button>
        <button type="button" class="cat-chip" data-cat="Rice">Rice & Biryani</button>
        <button type="button" class="cat-chip" data-cat="Dessert">Desserts</button>
        <button type="button" class="cat-chip" data-cat="Beverage">Beverages</button>
      </div>
    </div>

    <div id="menu-cards-container" class="dish-grid">
      <div class="empty">Loading delicious dishes...</div>
    </div>
  `;

  let dishes = [];
  let selectedCategory = 'all';
  let selectedDiet = 'all';

  function drawMenu() {
    const q = ($('#menu-search')?.value || '').toLowerCase().trim();
    const container = $('#menu-cards-container');
    if (!container) return;

    const filtered = dishes.filter((dish) => {
      // Category filter
      if (selectedCategory !== 'all' && dish.category !== selectedCategory) return false;
      // Diet filter
      if (selectedDiet === 'veg' && dish.isVeg === false) return false;
      if (selectedDiet === 'nonveg' && dish.isVeg !== false) return false;
      // Search
      if (q && !dish.name.toLowerCase().includes(q) && !(dish.description || '').toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="empty" style="grid-column:1/-1">No dishes match the selected filters.</div>';
      return;
    }

    container.innerHTML = filtered
      .map((dish) => {
        const isAvailable = dish.available !== false && dish.isAvailable !== false;
        return `
        <div class="client-dish-card ${!isAvailable ? 'sold-out' : ''}">
          <div class="client-dish-img-wrap">
            <img src="${esc(dish.image || DEFAULT_DISH_IMG)}" class="client-dish-img" alt="${esc(dish.name)}" referrerpolicy="no-referrer" onerror="this.src='${DEFAULT_DISH_IMG}'">
            <span class="client-dish-badge-top">
              <span class="diet-icon ${dish.isVeg !== false ? 'veg' : 'non-veg'}"></span>
              ${dish.isVeg !== false ? 'Pure Veg' : 'Non-Veg'}
            </span>
          </div>
          <div class="client-dish-body">
            <div class="client-dish-header">
              <span class="client-dish-title">${esc(dish.name)}</span>
              <span class="client-dish-price">${money(dish.price)}</span>
            </div>
            <p class="client-dish-desc">${esc(dish.description || 'Delicately spiced and prepared fresh.')}</p>
            <div class="client-dish-footer">
              <div>
                ${isAvailable ? '<span class="badge ok">Available</span>' : '<span class="badge bad">Sold Out</span>'}
              </div>
              <button class="btn-add-cart" data-dish-id="${esc(dish._id)}" ${!isAvailable ? 'disabled' : ''}>
                ${isAvailable ? '+ Add to Order' : 'Unavailable'}
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  try {
    dishes = await api('/api/menu');
    drawMenu();
  } catch (err) {
    $('#menu-cards-container').innerHTML = `<div class="empty">Failed to load menu: ${esc(err.message)}</div>`;
  }

  // Category buttons click
  $('#cat-chips').onclick = (e) => {
    const chip = e.target.closest('[data-cat]');
    if (chip) {
      $$('.cat-chip', $('#cat-chips')).forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      selectedCategory = chip.dataset.cat;
      drawMenu();
    }
  };

  // Diet filter tabs click
  $$('.diet-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      $$('.diet-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDiet = btn.dataset.diet;
      drawMenu();
    };
  });

  // Search input
  $('#menu-search').oninput = drawMenu;

  // Add to Cart modal click
  $('#menu-cards-container').onclick = (e) => {
    const btn = e.target.closest('[data-dish-id]');
    if (btn && !btn.disabled) {
      const dish = dishes.find((d) => d._id === btn.dataset.dishId);
      if (dish) promptAddToCart(dish);
    }
  };
}

// Modal for adding item to cart with quantity & custom note
function promptAddToCart(dish) {
  const modal = openModal(
    `Add to Order: ${dish.name}`,
    `
    <form id="add-cart-form">
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:16px">
        <img src="${esc(dish.image || DEFAULT_DISH_IMG)}" style="width:70px;height:70px;border-radius:var(--radius-md);object-fit:cover" referrerpolicy="no-referrer">
        <div>
          <h3 style="font-size:17px;margin:0">${esc(dish.name)}</h3>
          <span style="font-weight:700;color:#047857;font-size:16px">${money(dish.price)}</span>
          <div style="margin-top:4px">
            <span class="diet-icon ${dish.isVeg !== false ? 'veg' : 'non-veg'}"></span>
            <small style="color:var(--text-muted)">${dish.isVeg !== false ? 'Vegetarian' : 'Non-Vegetarian'}</small>
          </div>
        </div>
      </div>

      <div class="field">
        <label>Select Quantity</label>
        <div style="display:flex;align-items:center;gap:12px">
          <button type="button" class="btn" id="qty-minus" style="width:36px;height:36px;padding:0;font-size:18px">-</button>
          <input id="item-qty" type="number" min="1" max="50" value="1" style="width:70px;text-align:center;font-weight:700;font-size:16px" readonly>
          <button type="button" class="btn" id="qty-plus" style="width:36px;height:36px;padding:0;font-size:18px">+</button>
        </div>
      </div>

      <div class="field">
        <label for="item-note">Preparation Instructions / Notes (Optional)</label>
        <input id="item-note" placeholder="e.g. Less spicy, extra onions, dressing on side">
      </div>

      <div class="foot">
        <button type="button" class="btn" id="cancel-add">Cancel</button>
        <button class="btn primary" id="confirm-add">Add to Cart</button>
      </div>
    </form>
  `
  );

  const qtyInput = $('#item-qty', modal);
  $('#qty-minus', modal).onclick = () => {
    let q = Number(qtyInput.value) || 1;
    if (q > 1) qtyInput.value = q - 1;
  };
  $('#qty-plus', modal).onclick = () => {
    let q = Number(qtyInput.value) || 1;
    qtyInput.value = q + 1;
  };
  $('#cancel-add', modal).onclick = closeModal;

  $('#add-cart-form', modal).onsubmit = (e) => {
    e.preventDefault();
    const qty = Number(qtyInput.value) || 1;
    const note = $('#item-note', modal).value;
    addToCart(dish, qty, note);
    closeModal();
  };
}

// 3. Cart & Order Placement View
async function renderCart() {
  clearActivePolling();
  renderClientHeader();
  const view = $('#view');
  view.style.display = 'block';

  const cart = getCart();
  const qrTable = getUrlTableParam();

  if (!cart.length) {
    view.innerHTML = `
      <div class="cart-items-panel" style="max-width:600px;margin:40px auto;text-align:center;padding:48px 24px">
        <div style="font-size:56px;margin-bottom:16px">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p style="color:var(--text-muted);margin-bottom:24px">You haven't added any dishes to your order yet.</p>
        <a href="#/client-menu" class="btn primary" style="padding:12px 28px;border-radius:var(--radius-pill)">Browse Digital Menu</a>
      </div>
    `;
    return;
  }

  view.innerHTML = `
    <div class="client-section-head">
      <div>
        <h1>Your Dining Cart & Checkout</h1>
        <p>Review items, specify table or takeaway, and place your order.</p>
      </div>
      <button class="btn small danger" id="clear-cart-btn">Clear Cart</button>
    </div>

    <div class="cart-layout">
      <div class="cart-items-panel">
        <div class="cart-order-types">
          <button type="button" class="cart-type-btn active" data-type="dine-in" id="type-dine">
            <span style="font-size:20px">🪑</span>
            <span>Dine-In</span>
          </button>
          <button type="button" class="cart-type-btn" data-type="takeaway" id="type-takeaway">
            <span style="font-size:20px">🛍️</span>
            <span>Takeaway</span>
          </button>
        </div>

        <div id="dine-in-fields">
          <div class="field">
            <label for="order-table">Select Seated Table Number</label>
            <select id="order-table">
              <option value="">Loading tables...</option>
            </select>
            <small style="color:var(--text-muted);display:block;margin-top:4px">Your food will be served directly to this table.</small>
          </div>
        </div>

        <div id="takeaway-fields" style="display:none">
          <div class="row2">
            <div class="field">
              <label for="takeaway-name">Pickup Name</label>
              <input id="takeaway-name" value="${esc(currentUser ? currentUser.name : '')}" placeholder="e.g. Rahul Deshmukh">
            </div>
            <div class="field">
              <label for="takeaway-phone">Contact Phone</label>
              <input id="takeaway-phone" value="${esc(currentUser ? currentUser.phone : '')}" placeholder="e.g. 9876543210">
            </div>
          </div>
        </div>

        <h3 style="font-size:16px;margin:24px 0 12px;border-bottom:1px solid var(--border-subtle);padding-bottom:8px">Order Items (${cart.length})</h3>
        <div id="cart-item-list"></div>

        <div class="field" style="margin-top:20px">
          <label for="order-general-notes">Special Kitchen Instructions (Optional)</label>
          <textarea id="order-general-notes" rows="2" placeholder="e.g. Please serve all items hot together, or water bottle required."></textarea>
        </div>
      </div>

      <div class="cart-summary-panel">
        <h3 style="font-size:17px;margin-bottom:16px">Bill Summary</h3>
        <div class="summary"><span>Item Subtotal</span><span id="c-subtotal">₹0.00</span></div>
        <div class="summary"><span>Estimated Tax (5% GST)</span><span id="c-tax">₹0.00</span></div>
        <div class="summary big" style="margin-top:12px;padding-top:12px;border-top:1.5px dashed var(--border-subtle)">
          <span>Grand Total</span>
          <span id="c-total" style="color:#047857">₹0.00</span>
        </div>

        <button class="btn primary" id="btn-submit-order" style="width:100%;padding:14px;font-size:16px;border-radius:var(--radius-pill);margin-top:24px">
          ⚡ Place Order to Kitchen
        </button>

        ${
          !currentUser
            ? `
          <div style="margin-top:14px;background:#f8fafc;border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:10px;text-align:center;font-size:12.5px;color:var(--text-muted)">
            Ordering as Guest. <a href="#/login" style="color:var(--text-main);font-weight:700">Sign in</a> to view live order history.
          </div>
        `
            : ''
        }
      </div>
    </div>
  `;

  let orderType = 'dine-in';

  // Toggle Dine-in vs Takeaway
  $('#type-dine').onclick = () => {
    orderType = 'dine-in';
    $('#type-dine').classList.add('active');
    $('#type-takeaway').classList.remove('active');
    $('#dine-in-fields').style.display = 'block';
    $('#takeaway-fields').style.display = 'none';
  };

  $('#type-takeaway').onclick = () => {
    orderType = 'takeaway';
    $('#type-takeaway').classList.add('active');
    $('#type-dine').classList.remove('active');
    $('#dine-in-fields').style.display = 'none';
    $('#takeaway-fields').style.display = 'block';
  };

  // Populate tables list
  try {
    const tables = await api('/api/tables/available?date=' + todayStr() + '&time=12:00&guests=1').catch(() => []);
    const allTables = tables.length ? tables : await api('/api/tables').catch(() => []);
    const select = $('#order-table');
    if (select) {
      if (!allTables.length) {
        select.innerHTML = '<option value="">No tables configured</option>';
      } else {
        select.innerHTML = allTables
          .map((t) => {
            const isMatch = qrTable && (String(t.number) === String(qrTable) || String(t._id) === String(qrTable));
            return `<option value="${t._id}" ${isMatch ? 'selected' : ''}>Table ${t.number} (Seats ${t.capacity})</option>`;
          })
          .join('');
      }
    }
  } catch {
    // fallback
  }

  function drawCartItems() {
    const items = getCart();
    const container = $('#cart-item-list');
    if (!items.length) {
      renderCart();
      return;
    }

    container.innerHTML = items
      .map(
        (i) => `
      <div class="cart-item-row" data-id="${esc(i.menuItem)}" data-note="${esc(i.note || '')}">
        <div class="cart-item-info">
          <img src="${esc(i.image || DEFAULT_DISH_IMG)}" class="cart-item-thumb" referrerpolicy="no-referrer" onerror="this.src='${DEFAULT_DISH_IMG}'">
          <div class="cart-item-details">
            <strong>${esc(i.name)}</strong>
            <small>${money(i.price)} each</small>
            ${i.note ? `<br><span class="cart-item-note-tag">📝 ${esc(i.note)}</span>` : ''}
          </div>
        </div>

        <div class="cart-qty-ctrls">
          <button type="button" class="cart-qty-btn" data-qty-dec>-</button>
          <span class="cart-qty-val">${i.qty}</span>
          <button type="button" class="cart-qty-btn" data-qty-inc>+</button>
        </div>

        <div style="font-weight:700;min-width:70px;text-align:right">
          ${money(i.price * i.qty)}
        </div>

        <button type="button" class="btn small danger" data-remove style="padding:4px 8px;font-size:12px" title="Remove">✕</button>
      </div>
    `
      )
      .join('');

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const tax = Math.round(subtotal * 5) / 100;
    const total = subtotal + tax;

    $('#c-subtotal').textContent = money(subtotal);
    $('#c-tax').textContent = money(tax);
    $('#c-total').textContent = money(total);
  }

  drawCartItems();

  $('#clear-cart-btn').onclick = () => {
    if (confirm('Empty entire cart?')) {
      clearCart();
      renderCart();
    }
  };

  $('#cart-item-list').onclick = (e) => {
    const row = e.target.closest('.cart-item-row');
    if (!row) return;
    const id = row.dataset.id;
    const note = row.dataset.note;
    const item = getCart().find((i) => i.menuItem === id && (i.note || '') === note);
    if (!item) return;

    if (e.target.closest('[data-qty-inc]')) {
      updateCartQty(id, note, item.qty + 1);
      drawCartItems();
    } else if (e.target.closest('[data-qty-dec]')) {
      updateCartQty(id, note, item.qty - 1);
      drawCartItems();
    } else if (e.target.closest('[data-remove]')) {
      updateCartQty(id, note, 0);
      drawCartItems();
    }
  };

  // Submit Order
  $('#btn-submit-order').onclick = async () => {
    const items = getCart();
    if (!items.length) return toast('Cart is empty', true);

    let tableId = null;
    let customerName = currentUser ? currentUser.name : '';
    let customerPhone = currentUser ? currentUser.phone : '';

    if (orderType === 'dine-in') {
      tableId = $('#order-table').value;
      if (!tableId) return toast('Please select your table for Dine-In', true);
    } else {
      customerName = ($('#takeaway-name').value || '').trim();
      customerPhone = ($('#takeaway-phone').value || '').trim();
      if (!customerName) return toast('Please provide a name for takeaway pickup', true);
    }

    // If not logged in, prompt guest for name and phone if missing
    if (!customerName) {
      customerName = window.prompt('Enter your name for the order:', 'Valued Guest');
      if (!customerName) return;
    }

    const payload = {
      type: orderType,
      table: tableId || undefined,
      customerName,
      customerPhone,
      notes: $('#order-general-notes').value.trim(),
      items: items.map((i) => ({ menuItem: i.menuItem, qty: i.qty, note: i.note })),
    };

    try {
      $('#btn-submit-order').disabled = true;
      $('#btn-submit-order').textContent = 'Submitting order...';
      const order = await api('/api/orders', 'POST', payload);
      clearCart();
      toast(`Order placed successfully! (${order.orderNo})`);
      if (currentUser && currentUser.role === 'client') {
        location.hash = '#/my-orders';
      } else {
        view.innerHTML = `
          <div class="cart-items-panel" style="max-width:580px;margin:40px auto;text-align:center;padding:48px 24px">
            <div style="font-size:56px;margin-bottom:16px">🎉</div>
            <h2>Order Sent to Kitchen!</h2>
            <p style="font-size:16px;color:var(--text-main);font-weight:700">Order Number: ${esc(order.orderNo)}</p>
            <p style="color:var(--text-muted);margin-bottom:24px">Our chefs are preparing your delicious food. Table: ${esc(order.table?.number ? 'Table ' + order.table.number : 'Takeaway')}</p>
            <a href="#/client-menu" class="btn primary">Back to Menu</a>
          </div>
        `;
      }
    } catch (err) {
      toast(err.message, true);
      $('#btn-submit-order').disabled = false;
      $('#btn-submit-order').textContent = '⚡ Place Order to Kitchen';
    }
  };
}

// 4. Table Reservation View (Client)
async function renderReservation() {
  clearActivePolling();
  renderClientHeader();
  const view = $('#view');
  view.style.display = 'block';

  view.innerHTML = `
    <div class="client-section-head">
      <div>
        <h1>Reserve a Dining Table</h1>
        <p>Select your desired date, time slot, and guest count to view live available tables.</p>
      </div>
    </div>

    <div class="reserve-card">
      <form id="res-form" novalidate>
        <div class="row2">
          <div class="field">
            <label for="res-date">Reservation Date</label>
            <input type="date" id="res-date" min="${todayStr()}" value="${todayStr()}" required>
          </div>
          <div class="field">
            <label for="res-time">Dining Time Slot</label>
            <select id="res-time">
              <option value="12:00">12:00 PM (Lunch)</option>
              <option value="12:30">12:30 PM (Lunch)</option>
              <option value="13:00">01:00 PM (Lunch)</option>
              <option value="13:30">01:30 PM (Lunch)</option>
              <option value="14:00">02:00 PM (Lunch)</option>
              <option value="19:00" selected>07:00 PM (Dinner)</option>
              <option value="19:30">07:30 PM (Dinner)</option>
              <option value="20:00">08:00 PM (Dinner)</option>
              <option value="20:30">08:30 PM (Dinner)</option>
              <option value="21:00">09:00 PM (Dinner)</option>
              <option value="21:30">09:30 PM (Dinner)</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label for="res-guests">Number of Guests</label>
          <input type="number" id="res-guests" min="1" max="20" value="2" required>
        </div>

        <div class="field">
          <label>Select Table from Live Available Tables</label>
          <div id="avail-tables-box" class="table-slot-grid">
            <div class="empty">Checking live table availability...</div>
          </div>
          <input type="hidden" id="selected-table-id" required>
        </div>

        <div class="row2" style="margin-top:20px">
          <div class="field">
            <label for="res-name">Customer Full Name</label>
            <input id="res-name" value="${esc(currentUser ? currentUser.name : '')}" placeholder="e.g. Sneha Kulkarni" required>
          </div>
          <div class="field">
            <label for="res-phone">Contact Phone Number</label>
            <input id="res-phone" type="tel" value="${esc(currentUser ? currentUser.phone : '')}" placeholder="e.g. 9876543210" required>
          </div>
        </div>

        <div class="field">
          <label for="res-notes">Special Requests / Seating Preferences (Optional)</label>
          <textarea id="res-notes" rows="2" placeholder="e.g. Anniversary celebration, quiet corner table, baby chair needed."></textarea>
        </div>

        <button class="btn primary" id="btn-confirm-reserve" style="width:100%;padding:14px;font-size:16px;border-radius:var(--radius-pill);margin-top:16px">
          ✓ Confirm Table Reservation
        </button>
      </form>
    </div>
  `;

  let selectedTable = null;

  async function updateAvailableTables() {
    const date = $('#res-date').value;
    const time = $('#res-time').value;
    const guests = $('#res-guests').value;
    const box = $('#avail-tables-box');

    box.innerHTML = '<div class="empty" style="grid-column:1/-1">Checking live tables...</div>';

    try {
      const avail = await api(`/api/tables/available?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&guests=${encodeURIComponent(guests)}`);
      if (!avail.length) {
        box.innerHTML = '<div class="empty bad" style="grid-column:1/-1">❌ No tables available for this slot and party size. Please pick another time or date.</div>';
        selectedTable = null;
        $('#selected-table-id').value = '';
        return;
      }

      box.innerHTML = avail
        .map(
          (t, idx) => `
        <div class="table-slot-btn ${idx === 0 ? 'selected' : ''}" data-tid="${t._id}">
          <strong>Table ${t.number}</strong>
          <small>Seats up to ${t.capacity}</small>
        </div>
      `
        )
        .join('');

      selectedTable = avail[0]._id;
      $('#selected-table-id').value = avail[0]._id;

      $$('.table-slot-btn', box).forEach((btn) => {
        btn.onclick = () => {
          $$('.table-slot-btn', box).forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedTable = btn.dataset.tid;
          $('#selected-table-id').value = btn.dataset.tid;
        };
      });
    } catch (err) {
      box.innerHTML = `<div class="empty" style="grid-column:1/-1">Error checking availability: ${esc(err.message)}</div>`;
    }
  }

  $('#res-date').onchange = updateAvailableTables;
  $('#res-time').onchange = updateAvailableTables;
  $('#res-guests').oninput = updateAvailableTables;

  updateAvailableTables();

  $('#res-form').onsubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast('Please sign in or register to confirm a table reservation', true);
      showAuth('login');
      return;
    }

    const table = $('#selected-table-id').value;
    if (!table) return toast('Please select an available table', true);

    const date = $('#res-date').value;
    const time = $('#res-time').value;
    const guests = Number($('#res-guests').value) || 1;
    const customerName = $('#res-name').value.trim();
    const phone = $('#res-phone').value.trim();
    const notes = $('#res-notes').value.trim();

    try {
      $('#btn-confirm-reserve').disabled = true;
      $('#btn-confirm-reserve').textContent = 'Booking reservation...';

      await api('/api/reservations', 'POST', {
        table,
        date,
        time,
        guests,
        customerName,
        phone,
        notes,
      });

      toast('Table reserved successfully!');
      location.hash = '#/my-orders';
    } catch (err) {
      toast(err.message, true);
      $('#btn-confirm-reserve').disabled = false;
      $('#btn-confirm-reserve').textContent = '✓ Confirm Table Reservation';
    }
  };
}

// 5. My Activity View (Client Reservations & Orders)
async function renderMyActivity() {
  clearActivePolling();
  renderClientHeader();

  if (!currentUser) {
    showAuth('login');
    return;
  }

  const view = $('#view');
  view.style.display = 'block';

  view.innerHTML = `
    <div class="client-section-head">
      <div>
        <h1>My Dining Activity</h1>
        <p>Monitor your active table bookings and kitchen order statuses in real time.</p>
      </div>
    </div>

    <div class="activity-tabs">
      <button type="button" class="activity-tab-btn active" id="act-tab-res">📅 My Table Reservations</button>
      <button type="button" class="activity-tab-btn" id="act-tab-ord">🍳 My Kitchen Orders</button>
    </div>

    <div id="activity-content">
      <div class="empty">Loading your activity...</div>
    </div>
  `;

  let currentTab = 'res';

  $('#act-tab-res').onclick = () => {
    currentTab = 'res';
    $('#act-tab-res').classList.add('active');
    $('#act-tab-ord').classList.remove('active');
    loadReservations();
  };

  $('#act-tab-ord').onclick = () => {
    currentTab = 'ord';
    $('#act-tab-ord').classList.add('active');
    $('#act-tab-res').classList.remove('active');
    loadOrders();
  };

  async function loadReservations() {
    try {
      const resList = await api('/api/reservations');
      const container = $('#activity-content');
      if (!container) return;

      if (!resList.length) {
        container.innerHTML = `
          <div class="cart-items-panel" style="text-align:center;padding:36px">
            <p style="color:var(--text-muted);margin-bottom:16px">You have no upcoming table reservations.</p>
            <a href="#/reserve" class="btn primary">Reserve a Table Now</a>
          </div>
        `;
        return;
      }

      container.innerHTML = resList
        .map((r) => {
          const isCancelable = ['booked', 'confirmed'].includes(r.status);
          return `
          <div class="activity-card">
            <div class="activity-card-header">
              <div>
                <strong style="font-size:16px">Table ${esc(r.table?.number ?? '-')} • ${esc(r.guests)} Guests</strong>
                <div style="font-size:13px;color:var(--text-muted);margin-top:2px">
                  📅 ${esc(r.date)} at ${esc(r.time)}
                </div>
              </div>
              <div>${badge(r.status)}</div>
            </div>

            <div style="font-size:13.5px;color:var(--text-muted)">
              <span>Contact: ${esc(r.customerName)} (${esc(r.phone)})</span>
              ${r.notes ? `<div style="margin-top:4px;color:var(--text-main)">📝 Special Request: ${esc(r.notes)}</div>` : ''}
            </div>

            ${
              isCancelable
                ? `
              <div style="display:flex;justify-content:flex-end;margin-top:8px">
                <button class="btn small danger" data-cancel-res="${esc(r._id)}">Cancel Reservation</button>
              </div>
            `
                : ''
            }
          </div>
        `;
        })
        .join('');

      container.onclick = async (e) => {
        const btn = e.target.closest('[data-cancel-res]');
        if (btn && confirm('Are you sure you want to cancel this reservation?')) {
          try {
            await api(`/api/reservations/${btn.dataset.cancelRes}/cancel`, 'PATCH');
            toast('Reservation cancelled');
            loadReservations();
          } catch (err) {
            toast(err.message, true);
          }
        }
      };
    } catch (err) {
      $('#activity-content').innerHTML = `<div class="empty">Failed to load reservations: ${esc(err.message)}</div>`;
    }
  }

  async function loadOrders() {
    try {
      const orders = await api('/api/orders');
      const container = $('#activity-content');
      if (!container) return;

      if (!orders.length) {
        container.innerHTML = `
          <div class="cart-items-panel" style="text-align:center;padding:36px">
            <p style="color:var(--text-muted);margin-bottom:16px">You have placed no dining orders yet.</p>
            <a href="#/client-menu" class="btn primary">Explore Digital Menu</a>
          </div>
        `;
        return;
      }

      container.innerHTML = orders
        .map(
          (o) => `
        <div class="activity-card">
          <div class="activity-card-header">
            <div>
              <strong style="font-size:16px">${esc(o.orderNo)}</strong>
              <div style="font-size:13px;color:var(--text-muted);margin-top:2px">
                ${o.type === 'takeaway' ? '🛍️ Takeaway' : `🪑 Table ${esc(o.table?.number ?? '-')}`} • ${new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div>${badge(o.status)}</div>
          </div>

          <ul style="list-style:none;padding:0;margin:6px 0">
            ${o.items
              .map(
                (i) => `
              <li style="display:flex;justify-content:space-between;padding:4px 0;font-size:13.5px">
                <span>
                  <strong>${i.qty}×</strong> ${esc(i.name)}
                  ${i.note ? `<small style="color:#b45309"> (${esc(i.note)})</small>` : ''}
                </span>
                <span>${money(i.price * i.qty)}</span>
              </li>
            `
              )
              .join('')}
          </ul>

          <div style="display:flex;justify-content:space-between;border-top:1px dashed var(--border-subtle);padding-top:8px;font-weight:700">
            <span>Total Paid/Due</span>
            <span style="color:#047857">${money(o.subtotal)}</span>
          </div>
        </div>
      `
        )
        .join('');
    } catch (err) {
      $('#activity-content').innerHTML = `<div class="empty">Failed to load orders: ${esc(err.message)}</div>`;
    }
  }

  // Load initial tab
  loadReservations();

  // Auto-refresh polling every 6 seconds for live status updates
  activePollingTimer = setInterval(() => {
    if (currentTab === 'ord') loadOrders();
    else loadReservations();
  }, 6000);
}

// ==========================================================================
// ADMIN & STAFF MODULES (POS / RESTAURANT MANAGEMENT)
// ==========================================================================

// Config for standard CRUD resources
const STATUS_TABLE = ['available', 'occupied', 'reserved'];
const RESOURCES = {
  menu: {
    title: 'Menu Management',
    single: 'dish',
    endpoint: '/api/menu',
    adminWriteOnly: true,
    adminDeleteOnly: true,
    icon: '📖',
    isMenu: true,
    cols: [
      [
        'Dish',
        (r) =>
          `<div style="display:flex;align-items:center;gap:10px">
            <span class="diet-icon ${r.isVeg !== false ? 'veg' : 'non-veg'}"></span>
            <img src="${esc(r.image || DEFAULT_DISH_IMG)}" class="dish-thumb" referrerpolicy="no-referrer" onerror="this.src='${DEFAULT_DISH_IMG}'">
            <strong>${esc(r.name)}</strong>
          </div>`,
      ],
      ['Category', (r) => `<span class="badge info">${esc(r.category)}</span>`],
      ['Price', (r) => `<strong style="color:var(--emerald-text)">${money(r.price)}</strong>`],
      ['Type', (r) => (r.isVeg !== false ? '<span style="color:#16a34a;font-weight:700">Veg</span>' : '<span style="color:#dc2626;font-weight:700">Non-Veg</span>')],
      ['Status', (r) => (r.available !== false && r.isAvailable !== false ? badge('available', 'available') : badge('cancelled', 'sold out'))],
    ],
    fields: [
      { k: 'name', label: 'Dish Name', type: 'text', required: true },
      { k: 'category', label: 'Category', type: 'select', options: ['Starter', 'Main Course', 'Bread', 'Rice', 'Dessert', 'Beverage'] },
      { k: 'price', label: 'Price (\u20B9)', type: 'number', required: true, min: 0 },
      { k: 'isVeg', label: 'Vegetarian Dish', type: 'checkbox', default: true },
      { k: 'image', label: 'Dish Image URL', type: 'url', placeholder: 'https://images.unsplash.com/...' },
      { k: 'description', label: 'Description', type: 'textarea' },
      { k: 'available', label: 'Available to order (in stock)', type: 'checkbox', default: true },
    ],
  },
  tables: {
    title: 'Table Management',
    single: 'table',
    endpoint: '/api/tables',
    adminWriteOnly: true, // Only admin can create new tables; staff can update status
    adminDeleteOnly: true,
    icon: '🪑',
    cols: [
      ['Table', (r) => `<strong>Table ${esc(r.number)}</strong>`],
      ['Capacity', (r) => `${esc(r.capacity)} Guests`],
      ['Status', (r) => badge(r.status)],
    ],
    fields: [
      { k: 'number', label: 'Table Number', type: 'number', required: true, min: 1 },
      { k: 'capacity', label: 'Seating Capacity', type: 'number', required: true, min: 1 },
      { k: 'status', label: 'Current Status', type: 'select', options: STATUS_TABLE },
    ],
  },
  reservations: {
    title: 'Table Reservations',
    single: 'reservation',
    endpoint: '/api/reservations',
    icon: '📅',
    cols: [
      ['Customer', (r) => `<strong>${esc(r.customerName)}</strong>`],
      ['Phone', (r) => esc(r.phone)],
      ['Table', (r) => (r.table ? `<span class="badge info">Table ${esc(r.table.number)}</span>` : '-')],
      ['Guests', (r) => `${esc(r.guests)} ppl`],
      ['Date & Time', (r) => `${esc(r.date)} @ ${esc(r.time)}`],
      ['Status', (r) => badge(r.status)],
    ],
    fields: [
      { k: 'customerName', label: 'Customer Name', type: 'text', required: true },
      { k: 'phone', label: 'Phone Number', type: 'text', required: true },
      { k: 'table', label: 'Select Table', type: 'ref', endpoint: '/api/tables', optionLabel: (t) => `Table ${t.number} (seats ${t.capacity})`, required: true },
      { k: 'guests', label: 'Number of Guests', type: 'number', required: true, min: 1 },
      { k: 'date', label: 'Reservation Date', type: 'date', required: true, default: todayStr() },
      { k: 'time', label: 'Reservation Time', type: 'time', required: true, default: '20:00' },
      { k: 'status', label: 'Status', type: 'select', options: ['booked', 'confirmed', 'seated', 'completed', 'cancelled'] },
      { k: 'notes', label: 'Special Requests / Notes', type: 'textarea' },
    ],
  },
  customers: {
    title: 'Customer Directory',
    single: 'customer',
    endpoint: '/api/customers',
    icon: '👥',
    cols: [
      ['Name', (r) => `<strong>${esc(r.name)}</strong>`],
      ['Phone', (r) => esc(r.phone)],
      ['Email', (r) => esc(r.email || '-')],
      ['Notes', (r) => esc(r.notes || '-')],
    ],
    fields: [
      { k: 'name', label: 'Customer Name', type: 'text', required: true },
      { k: 'phone', label: 'Phone Number', type: 'text', required: true },
      { k: 'email', label: 'Email Address', type: 'email' },
      { k: 'notes', label: 'Preferences / Notes', type: 'textarea' },
    ],
  },
  staff: {
    title: 'Staff Management',
    single: 'staff member',
    endpoint: '/api/staff',
    adminOnly: true,
    icon: '👨‍💼',
    cols: [
      ['Name', (r) => `<strong>${esc(r.name)}</strong>`],
      ['Role', (r) => `<span class="badge info">${esc(r.role)}</span>`],
      ['Shift', (r) => esc(r.shift)],
      ['Phone', (r) => esc(r.phone)],
      ['Status', (r) => (r.active ? badge('available', 'active') : badge('cancelled', 'inactive'))],
    ],
    fields: [
      { k: 'name', label: 'Staff Member Name', type: 'text', required: true },
      { k: 'role', label: 'Assigned Role', type: 'select', options: ['Manager', 'Chef', 'Waiter', 'Cashier', 'Cleaner'] },
      { k: 'shift', label: 'Shift Timing', type: 'select', options: ['Morning', 'Evening', 'Night'] },
      { k: 'phone', label: 'Contact Phone', type: 'text' },
      { k: 'active', label: 'Currently employed / active', type: 'checkbox', default: true },
    ],
  },
  inventory: {
    title: 'Inventory Stock',
    single: 'stock item',
    endpoint: '/api/inventory',
    adminDeleteOnly: true,
    icon: '📦',
    cols: [
      ['Item', (r) => `<strong>${esc(r.name)}</strong>`],
      ['Current Stock', (r) => `<strong>${esc(r.quantity)} ${esc(r.unit)}</strong>`],
      ['Reorder Level', (r) => `${esc(r.reorderLevel)} ${esc(r.unit)}`],
      ['Supplier', (r) => esc(r.supplier || '-')],
      ['Alert', (r) => (r.quantity <= r.reorderLevel ? '<span class="badge bad">Low Stock</span>' : '<span class="badge ok">Sufficient</span>')],
    ],
    fields: [
      { k: 'name', label: 'Item Name', type: 'text', required: true },
      { k: 'quantity', label: 'Quantity', type: 'number', required: true, min: 0 },
      { k: 'unit', label: 'Measurement Unit', type: 'select', options: ['kg', 'litre', 'piece', 'packet'] },
      { k: 'reorderLevel', label: 'Low Stock Level', type: 'number', min: 0, default: 5 },
      { k: 'supplier', label: 'Supplier Name', type: 'text' },
    ],
  },
};

// Generic resource list + add/edit/delete for admin & staff
async function renderResource(key) {
  clearActivePolling();
  renderSidebar();

  const cfg = RESOURCES[key];
  if (!cfg) return;

  const isAdmin = currentUser?.role === 'admin';
  const isStaff = currentUser?.role === 'staff';

  if (cfg.adminOnly && !isAdmin) {
    return render403Forbidden('Admin Privileges Required');
  }

  const view = $('#view');
  view.style.display = 'block';

  view.innerHTML = `
    <div class="page-head">
      <div class="page-head-title">
        <h1>${cfg.title}</h1>
      </div>
      <div class="tools">
        ${
          cfg.isMenu
            ? `
          <button class="btn small" id="toggle-view">${menuViewMode === 'grid' ? '📋 Table View' : '🎴 Photo Cards'}</button>
        `
            : ''
        }
        <input id="search" type="search" placeholder="Search ${cfg.title.toLowerCase()}..." aria-label="Search">
        ${isAdmin || (!cfg.adminWriteOnly && !cfg.adminOnly) ? `<button class="btn primary" id="add">+ Add ${cfg.single}</button>` : ''}
      </div>
    </div>
    <div id="content-container"></div>
  `;

  let rows = [];

  function draw() {
    const q = ($('#search')?.value || '').toLowerCase();
    const shown = rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q));
    const container = $('#content-container');
    if (!container) return;

    if (!shown.length) {
      container.innerHTML = `<div class="empty">${rows.length ? 'No matches found.' : `No ${cfg.title.toLowerCase()} recorded yet.`}</div>`;
      return;
    }

    if (cfg.isMenu && menuViewMode === 'grid') {
      container.innerHTML = `
        <div class="dish-grid">
          ${shown
            .map(
              (r) => `
            <div class="dish-card">
              <div class="dish-card-img-wrap">
                <img src="${esc(r.image || DEFAULT_DISH_IMG)}" class="dish-card-img" alt="${esc(r.name)}" referrerpolicy="no-referrer" onerror="this.src='${DEFAULT_DISH_IMG}'">
                <span class="dish-card-cat">${esc(r.category)}</span>
                <span class="dish-card-status">${r.available !== false && r.isAvailable !== false ? badge('available', 'available') : badge('cancelled', 'sold out')}</span>
              </div>
              <div class="dish-card-body">
                <div class="dish-card-header">
                  <div style="display:flex;align-items:center;gap:6px">
                    <span class="diet-icon ${r.isVeg !== false ? 'veg' : 'non-veg'}"></span>
                    <h3 class="dish-card-title">${esc(r.name)}</h3>
                  </div>
                  <span class="dish-card-price">${money(r.price)}</span>
                </div>
                <p class="dish-card-desc">${esc(r.description || 'Authentic freshly prepared dish.')}</p>
                <div class="dish-card-actions">
                  ${isAdmin ? `<button class="btn small" data-edit="${esc(r._id)}">Edit</button>` : ''}
                  ${isAdmin ? `<button class="btn small danger" data-del="${esc(r._id)}">Delete</button>` : ''}
                  ${isAdmin ? `<button class="btn small" data-toggle-avail="${esc(r._id)}">${r.available !== false && r.isAvailable !== false ? 'Mark Sold Out' : 'Mark Available'}</button>` : ''}
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr>${cfg.cols.map((c) => `<th>${c[0]}</th>`).join('')}<th>Actions</th></tr></thead>
            <tbody>
              ${shown
                .map(
                  (r) => `
                <tr>
                  ${cfg.cols.map((c) => `<td>${c[1](r)}</td>`).join('')}
                  <td class="actions">
                    ${key === 'reservations' && ['booked', 'confirmed'].includes(r.status) ? `<button class="btn small ok" data-seat-res="${esc(r._id)}">Seat</button>` : ''}
                    ${key === 'reservations' && r.status === 'booked' ? `<button class="btn small primary" data-confirm-res="${esc(r._id)}">Confirm</button>` : ''}
                    ${isAdmin || key === 'tables' || (!cfg.adminWriteOnly && !cfg.adminOnly) ? `<button class="btn small" data-edit="${esc(r._id)}">${key === 'tables' && isStaff ? 'Update Status' : 'Edit'}</button>` : ''}
                    ${isAdmin ? `<button class="btn small danger" data-del="${esc(r._id)}">Delete</button>` : ''}
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  async function load() {
    try {
      rows = await api(cfg.endpoint);
      draw();
    } catch (e) {
      toast(e.message, true);
    }
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

  // Auto-refresh for reservations
  if (key === 'reservations') {
    activePollingTimer = setInterval(load, 8000);
  }

  async function openFormModal(record) {
    // If staff editing table, only allow editing status
    const fieldsToRender = isStaff && key === 'tables' ? cfg.fields.filter((f) => f.k === 'status') : cfg.fields;

    await Promise.all(
      fieldsToRender
        .filter((f) => f.type === 'ref')
        .map(async (f) => {
          f.items = await api(f.endpoint);
        })
    );

    const html = fieldsToRender
      .map((f) => {
        const val = record ? record[f.k] : f.default;
        const id = 'f_' + f.k;
        const req = f.required ? 'required' : '';
        if (f.type === 'checkbox') {
          return `<div class="field check"><label><input type="checkbox" id="${id}" ${val === false ? '' : val ?? false ? 'checked' : ''}> ${esc(f.label)}</label></div>`;
        }
        let input;
        if (f.type === 'select') {
          input = `<select id="${id}">${f.options.map((o) => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
        } else if (f.type === 'ref') {
          const cur = val && val._id ? val._id : val;
          input = `<select id="${id}" ${req}><option value="">Select Table...</option>${f.items.map((o) => `<option value="${esc(o._id)}" ${o._id === cur ? 'selected' : ''}>${esc(f.optionLabel(o))}</option>`).join('')}</select>`;
        } else if (f.type === 'textarea') {
          input = `<textarea id="${id}" rows="2">${esc(val)}</textarea>`;
        } else {
          input = `<input id="${id}" type="${f.type}" value="${esc(val)}" placeholder="${esc(f.placeholder || '')}" ${req} ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.type === 'number' ? 'step="any"' : ''}>`;
        }

        let extra = '';
        if (cfg.isMenu && f.k === 'image') {
          extra = `
          <div style="display:flex;gap:10px;margin-top:6px;align-items:center">
            <button type="button" class="btn small" id="btn-auto-pic">✨ Auto-Find Picture by Name</button>
          </div>
          <div class="image-preview-wrap">
            <img id="dish-preview-img" src="${val || DEFAULT_DISH_IMG}" alt="Dish preview" referrerpolicy="no-referrer" onerror="this.src='${DEFAULT_DISH_IMG}'">
          </div>
        `;
        }
        return `<div class="field"><label for="${id}">${esc(f.label)}</label>${input}${extra}</div>`;
      })
      .join('');

    const modal = openModal(
      `${record ? 'Edit' : 'Add'} ${cfg.single}`,
      `<form id="f" novalidate>${html}<div class="foot"><button type="button" class="btn" id="cancel">Cancel</button><button class="btn primary">Save Changes</button></div></form>`
    );

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
      for (const f of fieldsToRender) {
        const el = $('#f_' + f.k, modal);
        body[f.k] = f.type === 'checkbox' ? el.checked : f.type === 'number' ? (el.value === '' ? undefined : Number(el.value)) : el.value;
      }
      if (cfg.isMenu && !body.image) {
        body.image = getPhotoForDish(body.name, body.category);
      }
      try {
        await api(record ? `${cfg.endpoint}/${record._id}` : cfg.endpoint, record ? 'PUT' : 'POST', body);
        closeModal();
        toast(record ? 'Changes saved' : `${cfg.single} added`);
        load();
      } catch (err) {
        toast(err.message, true);
      }
    };
  }

  const addBtn = $('#add');
  if (addBtn) addBtn.onclick = () => openFormModal(null);
  $('#search').oninput = draw;

  $('#content-container').onclick = async (e) => {
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-del]');
    const toggleAvail = e.target.closest('[data-toggle-avail]');
    const confirmRes = e.target.closest('[data-confirm-res]');
    const seatRes = e.target.closest('[data-seat-res]');

    if (edit) openFormModal(rows.find((r) => r._id === edit.dataset.edit));
    if (del && (await confirmAction('Delete this record? Action cannot be undone.'))) {
      try {
        await api(`${cfg.endpoint}/${del.dataset.del}`, 'DELETE');
        toast('Deleted');
        load();
      } catch (err) {
        toast(err.message, true);
      }
    }
    if (toggleAvail) {
      try {
        await api(`/api/menu/${toggleAvail.dataset.toggleAvail}/toggle`, 'PATCH');
        toast('Availability updated');
        load();
      } catch (err) {
        toast(err.message, true);
      }
    }
    if (confirmRes) {
      try {
        await api(`/api/reservations/${confirmRes.dataset.confirmRes}/status`, 'PATCH', { status: 'confirmed' });
        toast('Reservation confirmed');
        load();
      } catch (err) {
        toast(err.message, true);
      }
    }
    if (seatRes) {
      try {
        await api(`/api/reservations/${seatRes.dataset.seatRes}/status`, 'PATCH', { status: 'seated' });
        toast('Guests marked as seated. Table is now occupied.');
        load();
      } catch (err) {
        toast(err.message, true);
      }
    }
  };

  load();
}

// ---------- Users Management (Admin Only) ----------
async function renderUsers() {
  clearActivePolling();
  renderSidebar();

  if (currentUser?.role !== 'admin') {
    return render403Forbidden('Admin Privileges Required to Manage Accounts');
  }

  const view = $('#view');
  view.style.display = 'block';

  view.innerHTML = `
    <div class="page-head">
      <div class="page-head-title">
        <h1>User Account Management</h1>
      </div>
      <div class="tools">
        <input id="user-search" type="search" placeholder="Search accounts..." aria-label="Search">
        <button class="btn primary" id="add-user-btn">+ Add Staff Account</button>
      </div>
    </div>
    <div class="table-wrap" id="user-list"></div>
  `;

  let users = [];

  function draw() {
    const q = ($('#user-search')?.value || '').toLowerCase();
    const shown = users.filter(
      (u) =>
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
    const container = $('#user-list');
    if (!container) return;

    if (!shown.length) {
      container.innerHTML = '<div class="empty">No accounts found.</div>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Username</th>
            <th>Email / Phone</th>
            <th>Role</th>
            <th>Account Status</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${shown
            .map((u) => {
              const isSelf = String(u._id) === String(currentUser.id);
              const isActive = u.active !== false && u.isActive !== false;
              return `
              <tr>
                <td><strong>${esc(u.name)}</strong> ${isSelf ? '<small style="color:var(--text-muted)">(Current)</small>' : ''}</td>
                <td>@${esc(u.username)}</td>
                <td>
                  <div>${esc(u.email || '-')}</div>
                  <small style="color:var(--text-muted)">${esc(u.phone || '')}</small>
                </td>
                <td><span class="badge ${u.role}">${esc(u.role)}</span></td>
                <td>${isActive ? '<span class="badge ok">Active</span>' : '<span class="badge bad">Disabled</span>'}</td>
                <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                <td class="actions">
                  ${
                    !isSelf
                      ? `
                    <button class="btn small" data-toggle-status="${esc(u._id)}" title="Deactivate or reactivate account">
                      ${isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn small" data-role-swap="${esc(u._id)}" data-role="${u.role}">
                      Switch to ${u.role === 'admin' ? 'Staff' : 'Admin'}
                    </button>
                    <button class="btn small danger" data-user-del="${esc(u._id)}">Remove</button>
                  `
                      : '<span style="color:var(--text-muted);font-size:12px">Active Session</span>'
                  }
                </td>
              </tr>
            `;
            })
            .join('')}
        </tbody>
      </table>
    `;
  }

  async function load() {
    try {
      users = await api('/api/users');
      draw();
    } catch (e) {
      toast(e.message, true);
    }
  }

  $('#user-search').oninput = draw;

  // Add new staff account modal
  $('#add-user-btn').onclick = () => {
    const modal = openModal(
      'Create New Staff Account',
      `
      <form id="create-user-form" novalidate>
        <div class="field">
          <label for="u_name">Full Name</label>
          <input id="u_name" required placeholder="e.g. Vikram Joshi">
        </div>
        <div class="row2">
          <div class="field">
            <label for="u_user">Username</label>
            <input id="u_user" required minlength="3" placeholder="e.g. vikram_staff">
          </div>
          <div class="field">
            <label for="u_role">Role</label>
            <select id="u_role">
              <option value="staff" selected>Staff (Orders, Tables, Billing)</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
          </div>
        </div>
        <div class="row2">
          <div class="field">
            <label for="u_email">Email Address</label>
            <input id="u_email" type="email" placeholder="e.g. vikram@spiceroute.com">
          </div>
          <div class="field">
            <label for="u_phone">Contact Phone</label>
            <input id="u_phone" type="tel" placeholder="e.g. 9800000001">
          </div>
        </div>
        <div class="field">
          <label for="u_pass">Initial Password</label>
          <input id="u_pass" type="password" required minlength="6" placeholder="At least 6 characters">
        </div>
        <div class="foot">
          <button type="button" class="btn" id="cancel-create-user">Cancel</button>
          <button class="btn primary">Create Account</button>
        </div>
      </form>
    `
    );

    $('#cancel-create-user', modal).onclick = closeModal;
    $('#create-user-form', modal).onsubmit = async (e) => {
      e.preventDefault();
      try {
        await api('/api/users', 'POST', {
          name: $('#u_name', modal).value.trim(),
          username: $('#u_user', modal).value.trim(),
          role: $('#u_role', modal).value,
          email: $('#u_email', modal).value.trim(),
          phone: $('#u_phone', modal).value.trim(),
          password: $('#u_pass', modal).value,
        });
        closeModal();
        toast('Staff account created successfully');
        load();
      } catch (err) {
        toast(err.message, true);
      }
    };
  };

  $('#user-list').onclick = async (e) => {
    const swap = e.target.closest('[data-role-swap]');
    const del = e.target.closest('[data-user-del]');
    const statusBtn = e.target.closest('[data-toggle-status]');

    if (statusBtn) {
      try {
        await api(`/api/users/${statusBtn.dataset.toggleStatus}/status`, 'PATCH');
        toast('User status updated');
        load();
      } catch (err) {
        toast(err.message, true);
      }
    }

    if (swap) {
      const targetRole = swap.dataset.role === 'admin' ? 'staff' : 'admin';
      try {
        await api(`/api/users/${swap.dataset.roleSwap}/role`, 'PATCH', { role: targetRole });
        toast(`Role changed to ${targetRole}`);
        load();
      } catch (err) {
        toast(err.message, true);
      }
    }

    if (del && (await confirmAction('Permanently remove this user account?'))) {
      try {
        await api(`/api/users/${del.dataset.userDel}`, 'DELETE');
        toast('User deleted');
        load();
      } catch (err) {
        toast(err.message, true);
      }
    }
  };

  load();
}

// ---------- Dashboard Overview (Admin Only) ----------
async function renderDashboard() {
  clearActivePolling();
  renderSidebar();

  if (currentUser?.role !== 'admin') {
    return render403Forbidden('Admin Privileges Required to View Dashboard');
  }

  const view = $('#view');
  view.style.display = 'block';

  view.innerHTML = `
    <div class="welcome-banner">
      <div class="welcome-text">
        <h2>Welcome back, ${esc(currentUser.name)}! 👋</h2>
        <p>Spice Route dining room operations are live. Monitor real-time kitchen orders, table turnover, and revenue.</p>
      </div>
      <div class="welcome-badge">
        <span class="live-dot"></span> Live Dining Room Operations
      </div>
    </div>
    <div class="page-head"><h1>Dashboard & Revenue Analytics</h1></div>
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
            ${
              d.topItems.length
                ? d.topItems
                    .map(
                      (i, idx) => `
              <li>
                <span><strong>#${idx + 1}</strong> ${esc(i._id)}</span>
                <span class="badge info">${i.qty} sold</span>
              </li>
            `
                    )
                    .join('')
                : '<li class="none">No orders recorded today.</li>'
            }
          </ul>
        </div>
        <div class="panel">
          <h2><span>⚠️ Low Stock Alerts</span></h2>
          <ul>
            ${
              d.lowStock.length
                ? d.lowStock
                    .map(
                      (i) => `
              <li>
                <span>${esc(i.name)}</span>
                <span class="badge bad">${esc(i.quantity)} ${esc(i.unit)} left</span>
              </li>
            `
                    )
                    .join('')
                : '<li class="none">All stock levels are sufficient.</li>'
            }
          </ul>
        </div>
      </div>
    `;
  } catch (e) {
    toast(e.message, true);
  }
}

// ---------- Kitchen & Dining Orders View (Staff & Admin) ----------
const NEXT_STEP = {
  pending: ['preparing', '▶ Start Preparing'],
  preparing: ['ready', '✓ Mark Ready'],
  ready: ['served', '🍽️ Mark Served'],
};

async function renderOrders() {
  clearActivePolling();
  renderSidebar();

  const view = $('#view');
  view.style.display = 'block';

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
    const f = $('#filter')?.value || 'active';
    const shown = orders.filter((o) =>
      f === 'all' ? true : f === 'active' ? !['completed', 'cancelled'].includes(o.status) : o.status === f
    );
    const container = $('#orders');
    if (!container) return;

    if (!shown.length) {
      container.innerHTML = '<div class="empty" style="grid-column:1/-1">No orders found. Client orders will appear here automatically.</div>';
      return;
    }

    container.innerHTML = shown
      .map(
        (o) => `
      <article class="order">
        <header>
          <div>
            <strong>${esc(o.orderNo)}</strong>
            <small>
              ${o.type === 'takeaway' ? '🛍️ Takeaway' : `Table ${esc(o.table?.number ?? '-')}`}
              ${o.customerName ? ' • ' + esc(o.customerName) : ''}
            </small>
          </div>
          ${badge(o.status)}
        </header>
        <ul>
          ${o.items
            .map(
              (i) => `
            <li>
              <span>
                <span class="item-qty-badge">${esc(i.qty)}×</span> ${esc(i.name)}
                ${i.note ? `<div style="font-size:11.5px;color:#b45309;margin-left:26px">📝 ${esc(i.note)}</div>` : ''}
              </span>
              <strong>${money(i.price * i.qty)}</strong>
            </li>
          `
            )
            .join('')}
        </ul>
        ${o.notes ? `<div class="order-note">📝 Order Note: ${esc(o.notes)}</div>` : ''}
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
    `
      )
      .join('');
  }

  async function load() {
    try {
      orders = await api('/api/orders');
      draw();
    } catch (e) {
      toast(e.message, true);
    }
  }

  async function setStatus(id, status) {
    try {
      await api(`/api/orders/${id}/status`, 'PATCH', { status });
      toast('Order status updated');
      load();
    } catch (e) {
      toast(e.message, true);
    }
  }

  async function newOrder() {
    const [tables, menu] = await Promise.all([api('/api/tables'), api('/api/menu?available=true')]);
    if (!tables.length || !menu.length) {
      toast('Add at least one table and one dish first', true);
      return;
    }
    const cats = [...new Set(menu.map((m) => m.category))];

    const modal = openModal(
      'Take New Order',
      `
      <form id="of" novalidate>
        <div class="row2">
          <div class="field">
            <label for="o_type">Order Type</label>
            <select id="o_type">
              <option value="dine-in">Dine-In (Table Seated)</option>
              <option value="takeaway">Takeaway (Pickup)</option>
            </select>
          </div>
          <div class="field" id="wrap_table">
            <label for="o_table">Assign Table</label>
            <select id="o_table">${tables.map((t) => `<option value="${t._id}">Table ${t.number} (${t.status})</option>`).join('')}</select>
          </div>
        </div>
        <div class="field">
          <label for="o_cust">Customer Name / Phone</label>
          <input id="o_cust" placeholder="e.g. Rahul Deshmukh">
        </div>
        <label>Select Dishes</label>
        <div class="menu-pick">
          ${cats
            .map(
              (c) => `
            <div class="cat">${esc(c)}</div>
            ${menu
              .filter((m) => m.category === c)
              .map(
                (m) => `
              <div class="line">
                <div class="dish-line-left">
                  <span class="diet-icon ${m.isVeg !== false ? 'veg' : 'non-veg'}"></span>
                  <img src="${esc(m.image || DEFAULT_DISH_IMG)}" class="dish-thumb" referrerpolicy="no-referrer" onerror="this.src='${DEFAULT_DISH_IMG}'">
                  <div>
                    <strong>${esc(m.name)}</strong>
                    <small style="color:var(--text-muted);display:block">${money(m.price)}</small>
                  </div>
                </div>
                <input type="number" min="0" value="0" data-id="${m._id}" data-price="${m.price}" aria-label="Qty">
              </div>
            `
              )
              .join('')}
          `
            )
            .join('')}
        </div>
        <div class="field"><label for="o_notes">Kitchen Notes</label><input id="o_notes" placeholder="e.g. Less spicy, no onion"></div>
        <div class="summary big"><span>Total Estimated</span><span id="o_total">${money(0)}</span></div>
        <div class="foot"><button type="button" class="btn" id="cancel">Cancel</button><button class="btn primary">Send to Kitchen</button></div>
      </form>
    `,
      true
    );

    $('#o_type', modal).onchange = (e) => {
      $('#wrap_table', modal).style.display = e.target.value === 'takeaway' ? 'none' : 'block';
    };

    const inputs = [...modal.querySelectorAll('[data-id]')];
    const recalc = () => {
      $('#o_total', modal).textContent = money(
        inputs.reduce((s, i) => s + Math.max(0, Math.floor(Number(i.value) || 0)) * Number(i.dataset.price), 0)
      );
    };
    inputs.forEach((i) => i.addEventListener('input', recalc));
    $('#cancel', modal).onclick = closeModal;

    $('#of', modal).onsubmit = async (e) => {
      e.preventDefault();
      const items = inputs.filter((i) => Number(i.value) > 0).map((i) => ({ menuItem: i.dataset.id, qty: Math.floor(Number(i.value)) }));
      if (!items.length) return toast('Select at least one dish', true);

      const type = $('#o_type', modal).value;
      const table = type === 'dine-in' ? $('#o_table', modal).value : undefined;

      try {
        await api('/api/orders', 'POST', {
          type,
          table,
          customerName: $('#o_cust', modal).value,
          notes: $('#o_notes', modal).value,
          items,
        });
        closeModal();
        toast('Order sent to kitchen!');
        load();
      } catch (err) {
        toast(err.message, true);
      }
    };
  }

  async function billModal(order) {
    const { taxRate } = await api('/api/bills/settings');
    const modal = openModal(
      `Generate Bill: ${order.orderNo}`,
      `
      <form id="bf" novalidate>
        <div class="summary"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
        <div class="field"><label for="b_disc">Discount Amount (\u20B9)</label><input id="b_disc" type="number" min="0" max="${order.subtotal}" value="0" step="any"></div>
        <div class="summary"><span>Tax (${taxRate}%)</span><span id="b_tax"></span></div>
        <div class="summary big"><span>Grand Total</span><span id="b_total"></span></div>
        <div class="field" style="margin-top:16px"><label for="b_pay">Payment Method</label><select id="b_pay"><option>Cash</option><option>UPI</option><option>Card</option></select></div>
        <div class="foot"><button type="button" class="btn" id="cancel">Cancel</button><button class="btn primary">Accept Payment & Print Receipt</button></div>
      </form>
    `
    );

    const calc = () => {
      const d = Math.min(Math.max(Number($('#b_disc', modal).value) || 0, 0), order.subtotal);
      const tax = Math.round((order.subtotal - d) * taxRate) / 100;
      $('#b_tax', modal).textContent = money(tax);
      $('#b_total', modal).textContent = money(order.subtotal - d + tax);
    };
    $('#b_disc', modal).oninput = calc;
    calc();

    $('#cancel', modal).onclick = closeModal;
    $('#bf', modal).onsubmit = async (e) => {
      e.preventDefault();
      try {
        const bill = await api('/api/bills', 'POST', {
          order: order._id,
          discount: Number($('#b_disc', modal).value) || 0,
          paymentMethod: $('#b_pay', modal).value,
        });
        closeModal();
        toast('Payment recorded successfully');
        load();
        printReceipt(bill);
      } catch (err) {
        toast(err.message, true);
      }
    };
  }

  $('#new').onclick = newOrder;
  $('#filter').onchange = draw;
  $('#orders').onclick = (e) => {
    const next = e.target.closest('[data-next]');
    const cancel = e.target.closest('[data-cancel]');
    const bill = e.target.closest('[data-bill]');

    if (next) setStatus(next.dataset.next, next.dataset.status);
    if (cancel && window.confirm('Cancel this active order?')) setStatus(cancel.dataset.cancel, 'cancelled');
    if (bill) billModal(orders.find((o) => o._id === bill.dataset.bill));
  };

  load();

  // Auto-refresh orders every 6 seconds so incoming client orders appear live
  activePollingTimer = setInterval(load, 6000);
}

// ---------- Billing & Invoicing View (Staff & Admin) ----------
function printReceipt(bill) {
  const o = bill.order || {};
  const w = window.open('', '_blank', 'width=420,height=640');
  if (!w) return toast('Allow pop-ups to print receipt', true);
  w.document.write(`<!DOCTYPE html><html><head><title>${esc(bill.billNo)}</title><style>
    body{font:14px/1.5 monospace;max-width:340px;margin:20px auto;color:#000}h1{font-size:18px;text-align:center;margin:0}
    p.c{text-align:center;margin:2px 0 12px}.r{display:flex;justify-content:space-between}hr{border:0;border-top:1px dashed #000}
    .t{font-weight:bold;font-size:16px}</style></head><body>
    <h1>Spice Route</h1><p class="c">Restaurant Receipt</p>
    <div class="r"><span>${esc(bill.billNo)}</span><span>${new Date(bill.createdAt).toLocaleString()}</span></div>
    <div>${o.type === 'takeaway' ? 'Takeaway' : `Table ${esc(o.table?.number ?? '-')}`} ${o.customerName ? '| ' + esc(o.customerName) : ''}</div><hr>
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
  clearActivePolling();
  renderSidebar();

  const view = $('#view');
  view.style.display = 'block';
  view.innerHTML = '<div class="page-head"><h1>Invoices & Billing History</h1></div><div class="table-wrap" id="list"></div>';

  try {
    const bills = await api('/api/bills');
    const container = $('#list');
    if (!bills.length) {
      container.innerHTML = '<div class="empty">No bills recorded yet. Open Orders and click "Generate Bill" on ready/served orders.</div>';
      return;
    }
    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Bill #</th><th>Order #</th><th>Table</th><th>Date</th><th>Subtotal</th><th>Discount</th><th>Tax</th><th>Total Paid</th><th>Method</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${bills
            .map(
              (b) => `
            <tr>
              <td><strong>${esc(b.billNo)}</strong></td>
              <td>${esc(b.order?.orderNo)}</td>
              <td>${b.order?.type === 'takeaway' ? 'Takeaway' : `Table ${esc(b.order?.table?.number ?? '-')}`}</td>
              <td>${new Date(b.createdAt).toLocaleDateString()}</td>
              <td>${money(b.subtotal)}</td>
              <td>${money(b.discount)}</td>
              <td>${money(b.tax)}</td>
              <td><strong style="color:var(--emerald-text)">${money(b.total)}</strong></td>
              <td><span class="badge ok">${esc(b.paymentMethod)}</span></td>
              <td class="actions"><button class="btn small" data-print="${b._id}">🖨️ Receipt</button></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
    container.onclick = (e) => {
      const p = e.target.closest('[data-print]');
      if (p) printReceipt(bills.find((b) => b._id === p.dataset.print));
    };
  } catch (e) {
    toast(e.message, true);
  }
}

// ==========================================================================
// ROUTER & NAVIGATION CONTROLLER
// ==========================================================================

const SIDEBAR_ROUTES = [
  ['dashboard', 'Dashboard', renderDashboard, ['admin'], '📊'],
  ['orders', 'Orders', renderOrders, ['admin', 'staff'], '🍳'],
  ['billing', 'Billing', renderBilling, ['admin', 'staff'], '💳'],
  ['menu', 'Menu Items', () => renderResource('menu'), ['admin', 'staff'], '📖'],
  ['tables', 'Tables', () => renderResource('tables'), ['admin', 'staff'], '🪑'],
  ['reservations', 'Reservations', () => renderResource('reservations'), ['admin', 'staff'], '📅'],
  ['customers', 'Customers', () => renderResource('customers'), ['admin', 'staff'], '👥'],
  ['inventory', 'Inventory', () => renderResource('inventory'), ['admin', 'staff'], '📦'],
  ['staff', 'Staff Roster', () => renderResource('staff'), ['admin'], '👨‍💼'],
  ['users', 'User Accounts', renderUsers, ['admin'], '🔐'],
];

function route() {
  clearActivePolling();
  closeModal();

  const fullHash = location.hash || '#/client-home';
  const cleanPath = fullHash.split('?')[0].replace('#/', '') || 'client-home';

  // 1. Client & Guest Public Routes
  if (['client-home', 'client-menu', 'cart', 'reserve', 'my-orders'].includes(cleanPath)) {
    if (cleanPath === 'client-home') return renderClientHome();
    if (cleanPath === 'client-menu') return renderClientMenu();
    if (cleanPath === 'cart') return renderCart();
    if (cleanPath === 'reserve') return renderReservation();
    if (cleanPath === 'my-orders') return renderMyActivity();
  }

  // 2. Menu path redirection: if client visits #/menu, send to #/client-menu
  if (cleanPath === 'menu') {
    if (!currentUser || currentUser.role === 'client') {
      return renderClientMenu();
    }
  }

  // 3. Admin / Staff Module Routing
  if (!currentUser) {
    // Attempting to access admin or staff route while unauthenticated
    showAuth('login');
    return;
  }

  const userRole = currentUser.role || 'client';

  // If a client tries to access dashboard or orders
  if (userRole === 'client') {
    return render403Forbidden('Client Accounts Cannot Access Staff Management');
  }

  // Filter available routes for this role
  const availableRoutes = SIDEBAR_ROUTES.filter((r) => r[3].includes(userRole));
  const activeRoute = availableRoutes.find((r) => r[0] === cleanPath);

  // If forbidden route for staff (e.g. staff visiting #/dashboard or #/users)
  const isRestrictedTarget = SIDEBAR_ROUTES.find((r) => r[0] === cleanPath);
  if (isRestrictedTarget && !isRestrictedTarget[3].includes(userRole)) {
    $('#nav').innerHTML = availableRoutes
      .map((x) => `<a href="#/${x[0]}"><span class="nav-icon">${x[4]}</span><span class="nav-label">${x[1]}</span></a>`)
      .join('');
    return render403Forbidden();
  }

  const active = activeRoute || availableRoutes[0];
  if (active[0] !== cleanPath) {
    location.hash = `#/${active[0]}`;
    return;
  }

  $('#nav').innerHTML = availableRoutes
    .map(
      (x) => `
      <a href="#/${x[0]}" class="${x[0] === active[0] ? 'active' : ''}" ${x[0] === active[0] ? 'aria-current="page"' : ''}>
        <span class="nav-icon">${x[4]}</span>
        <span class="nav-label">${x[1]}</span>
      </a>
    `
    )
    .join('');

  active[2]();
}

window.addEventListener('hashchange', route);

async function initApp() {
  const token = getToken();
  if (token) {
    try {
      const res = await api('/api/auth/me');
      currentUser = res.user;
    } catch {
      clearAuth();
    }
  }

  $('#auth-root').style.display = 'none';

  // If URL has no hash, set sensible default by role
  if (!location.hash || location.hash === '#/') {
    if (currentUser?.role === 'admin') location.hash = '#/dashboard';
    else if (currentUser?.role === 'staff') location.hash = '#/orders';
    else location.hash = '#/client-home';
  } else {
    route();
  }
}

// Start application
initApp();
