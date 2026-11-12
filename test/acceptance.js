/**
 * Comprehensive Automated Acceptance Tests for:
 * 1. RBAC (Admin, Staff, Client) & 403 enforcement
 * 2. Admin creating staff and staff logging in
 * 3. Client self-registration, menu browsing, and dine-in ordering
 * 4. Double-booking prevention (same table & overlapping time)
 * 5. Data isolation: Client cannot see another client's bookings or orders
 * 6. Public menu and QR table ordering
 */
require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');

async function runTests() {
  console.log('--- Starting Acceptance Test Suite ---');
  
  // Connect Mongoose if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_db');
  }

  // Start HTTP server on port 3099
  const PORT = 3099;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  const BASE = `http://127.0.0.1:${PORT}`;

  async function request(path, opts = {}) {
    const res = await fetch(`${BASE}${path}`, {
      method: opts.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        ...(opts.headers || {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // CHECK 1: Login Admin & Staff, and verify 403 on Admin Routes
    // ----------------------------------------------------
    console.log('\n[Check 1] Staff logging in cannot open admin pages & direct API calls return 403:');
    
    // Login as staff
    const staffLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'staff', password: 'staff123' },
    });
    assert(staffLogin.status === 200 && staffLogin.data.token, 'Staff can log in with username/password');
    const staffToken = staffLogin.data.token;

    // Direct API call to admin-only dashboard by staff -> Expect 403
    const staffDash = await request('/api/dashboard', { token: staffToken });
    assert(staffDash.status === 403, `Staff call to /api/dashboard returned 403 Forbidden (got ${staffDash.status})`);

    // Direct API call to admin-only user management by staff -> Expect 403
    const staffUsers = await request('/api/users', { token: staffToken });
    assert(staffUsers.status === 403, `Staff call to /api/users returned 403 Forbidden (got ${staffUsers.status})`);

    // Staff trying to delete a menu item -> Expect 403
    const menuList = await request('/api/menu');
    const dishId = menuList.data[0]?._id;
    if (dishId) {
      const staffDel = await request(`/api/menu/${dishId}`, { method: 'DELETE', token: staffToken });
      assert(staffDel.status === 403, `Staff DELETE /api/menu/:id returned 403 Forbidden (got ${staffDel.status})`);
    }

    // ----------------------------------------------------
    // CHECK 2: Admin creating staff account and staff logging in
    // ----------------------------------------------------
    console.log('\n[Check 2] Admin creates staff user and that user logs in with limited access:');
    
    // Login as admin
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'admin123' },
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin logged in');
    const adminToken = adminLogin.data.token;

    const uniqueStaffUser = 'staff_test_' + Date.now().toString().slice(-4);
    const createStaff = await request('/api/users', {
      method: 'POST',
      token: adminToken,
      body: {
        name: 'New Test Waiter',
        username: uniqueStaffUser,
        email: `${uniqueStaffUser}@spiceroute.com`,
        phone: '9811122233',
        password: 'password123',
        role: 'staff',
      },
    });
    assert(createStaff.status === 201, `Admin successfully created new staff account: ${uniqueStaffUser}`);

    // New staff user logs in
    const newStaffLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: uniqueStaffUser, password: 'password123' },
    });
    assert(newStaffLogin.status === 200 && newStaffLogin.data.user.role === 'staff', 'Newly created staff user logged in successfully');
    
    // New staff user blocked from /api/dashboard
    const newStaffDash = await request('/api/dashboard', { token: newStaffLogin.data.token });
    assert(newStaffDash.status === 403, 'New staff user blocked from dashboard (403)');

    // ----------------------------------------------------
    // CHECK 3: Client self-registration, menu browsing, dine-in ordering
    // ----------------------------------------------------
    console.log('\n[Check 3] Client registers, browses menu, places dine-in order, staff sees it:');

    const clientUsername = 'client_' + Date.now().toString().slice(-5);
    const clientReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Priya Sharma',
        username: clientUsername,
        email: `${clientUsername}@example.com`,
        phone: '9988776655',
        password: 'clientpass123',
      },
    });
    assert(clientReg.status === 201 && clientReg.data.user.role === 'client', `Client self-registered as role "client"`);
    const clientToken = clientReg.data.token;

    // Public / Client menu browsing
    const publicMenu = await request('/api/menu');
    assert(publicMenu.status === 200 && Array.isArray(publicMenu.data) && publicMenu.data.length > 0, `Public/client can browse menu (${publicMenu.data.length} dishes found)`);

    // Find table 2 or any available table
    const availTables = await request(`/api/tables/available?date=2026-11-20&time=19:00&guests=2`);
    assert(availTables.status === 200 && availTables.data.length > 0, 'Client checked live available tables');
    const tableId = availTables.data[0]._id;

    // Place Dine-in order
    const orderedDish = publicMenu.data[0];
    const clientOrder = await request('/api/orders', {
      method: 'POST',
      token: clientToken,
      body: {
        type: 'dine-in',
        table: tableId,
        items: [{ menuItem: orderedDish._id, qty: 2, note: 'Extra spicy' }],
        notes: 'Serve quickly please',
      },
    });
    assert(clientOrder.status === 201 && clientOrder.data.orderNo, `Client placed dine-in order: ${clientOrder.data?.orderNo}`);

    // Staff sees the order
    const staffOrders = await request('/api/orders', { token: staffToken });
    const staffFound = staffOrders.data.find((o) => o._id === clientOrder.data._id);
    assert(staffFound !== undefined, 'Staff orders list includes the new client order immediately');

    // ----------------------------------------------------
    // CHECK 4: Double-booking prevention
    // ----------------------------------------------------
    console.log('\n[Check 4] Two clients cannot book the same table for overlapping times:');

    const bookingDate = '2026-12-15';
    const bookingTime = '20:00';

    // Client 1 books tableId
    const book1 = await request('/api/reservations', {
      method: 'POST',
      token: clientToken,
      body: {
        table: tableId,
        date: bookingDate,
        time: bookingTime,
        guests: 2,
        customerName: 'Priya Sharma',
        phone: '9988776655',
      },
    });
    assert(book1.status === 201, `Client 1 successfully booked Table on ${bookingDate} at ${bookingTime}`);

    // Client 2 attempts to book same table at overlapping time (20:30, within 90 minutes)
    const book2 = await request('/api/reservations', {
      method: 'POST',
      token: clientToken,
      body: {
        table: tableId,
        date: bookingDate,
        time: '20:30',
        guests: 2,
        customerName: 'Another Guest',
        phone: '9911223344',
      },
    });
    assert(book2.status === 409, `Client 2 booking was blocked with 409 Conflict: "${book2.data?.error}"`);

    // ----------------------------------------------------
    // CHECK 5: Data isolation: Client cannot see another client's bookings or orders
    // ----------------------------------------------------
    console.log('\n[Check 5] Client cannot see another client\'s bookings or orders:');

    // Register second client
    const client2User = 'client2_' + Date.now().toString().slice(-5);
    const client2Reg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Arjun Verma',
        username: client2User,
        email: `${client2User}@example.com`,
        phone: '9123456780',
        password: 'password123',
      },
    });
    const client2Token = client2Reg.data.token;

    // Client 2 requests /api/reservations
    const client2Reservations = await request('/api/reservations', { token: client2Token });
    const hasClient1Res = client2Reservations.data.some((r) => r._id === book1.data._id);
    assert(!hasClient1Res, 'Client 2 reservations list does NOT contain Client 1\'s booking');

    // Client 2 requests /api/orders
    const client2Orders = await request('/api/orders', { token: client2Token });
    const hasClient1Order = client2Orders.data.some((o) => o._id === clientOrder.data._id);
    assert(!hasClient1Order, 'Client 2 orders list does NOT contain Client 1\'s order');

    // Client 2 attempts direct access to Client 1's order by ID
    const directAccess = await request(`/api/orders/${clientOrder.data._id}`, { token: client2Token });
    assert(directAccess.status === 403, `Direct access to another client's order returns 403 (got ${directAccess.status})`);

    // ----------------------------------------------------
    // CHECK 6: Previously existing features still work
    // ----------------------------------------------------
    console.log('\n[Check 6] Previously existing features still work:');
    
    // Billing generation
    // First advance client order to ready
    await request(`/api/orders/${clientOrder.data._id}/status`, {
      method: 'PATCH',
      token: staffToken,
      body: { status: 'preparing' },
    });
    await request(`/api/orders/${clientOrder.data._id}/status`, {
      method: 'PATCH',
      token: staffToken,
      body: { status: 'ready' },
    });

    const billRes = await request('/api/bills', {
      method: 'POST',
      token: staffToken,
      body: {
        order: clientOrder.data._id,
        discount: 20,
        paymentMethod: 'UPI',
      },
    });
    assert(billRes.status === 201 && billRes.data.billNo, `Staff can generate bill: ${billRes.data?.billNo}`);

    // Inventory list works for staff
    const inventory = await request('/api/inventory', { token: staffToken });
    assert(inventory.status === 200 && Array.isArray(inventory.data), 'Staff can view inventory stock');

    // Admin dashboard numbers
    const adminDash = await request('/api/dashboard', { token: adminToken });
    assert(adminDash.status === 200 && adminDash.data.revenueToday !== undefined, 'Admin dashboard returns full analytics');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log(`\n--- Test Results: ${passed} PASSED, ${failed} FAILED ---`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();

