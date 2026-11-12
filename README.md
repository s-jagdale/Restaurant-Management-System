# Spice Route — Restaurant Management & Dining System

A modern full-stack Restaurant Management System built with **Node.js, Express, MongoDB (Mongoose)** and a responsive, vanilla **HTML/CSS/JavaScript** frontend (no heavy frameworks or compilation steps required).

Live Deployed URL: [https://restaurant-management-system-fqyo.onrender.com](https://restaurant-management-system-fqyo.onrender.com)

---

## 👥 Role-Based Access Control (RBAC)

The system enforces strict multi-role authentication with server-side middleware verification:

| Feature / Action | Admin | Staff | Client | Public / Guest |
|---|:---:|:---:|:---:|:---:|
| **Dashboard & Revenue Analytics** | ✅ | ❌ (403) | ❌ (403) | ❌ (401) |
| **User & Staff Account Management** | ✅ | ❌ (403) | ❌ (403) | ❌ (401) |
| **Menu Items (Add / Edit / Delete / Prices)** | ✅ | ❌ (View only) | ❌ (View only) | ❌ (View only) |
| **Menu Item Availability Toggle** | ✅ | ❌ | ❌ | ❌ |
| **Dining Tables (Add / Edit / Delete)** | ✅ | ❌ | ❌ | ❌ |
| **Table Status Updates (Available / Occupied)** | ✅ | ✅ | ❌ | ❌ |
| **Kitchen Orders (View all / Change status)** | ✅ | ✅ | ❌ (Own only) | ❌ |
| **Take Dine-In / Walk-in Orders** | ✅ | ✅ | ❌ | ❌ |
| **Billing & Invoices (Generate / Print)** | ✅ | ✅ | ❌ | ❌ |
| **Reservations (Confirm / Seat / View all)** | ✅ | ✅ | ❌ (Own only) | ❌ |
| **Digital Menu Browsing** | ✅ | ✅ | ✅ | ✅ |
| **Online Dine-In & Takeaway Ordering** | ✅ | ✅ | ✅ | ✅ (QR Flow) |
| **Table Reservation with Collision Checks** | ✅ | ✅ | ✅ | ❌ (Login required) |
| **My Bookings & Orders (Track & Cancel)** | ❌ | ❌ | ✅ (Own records) | ❌ |

---

## 🍽️ Client Module Highlights

1. **Client Home (`#/client-home`)**: Welcoming restaurant atmosphere, signature chef highlights, dining hours, and one-click actions to reserve a table or open the digital menu.
2. **Digital Menu (`#/client-menu` or `#/menu`)**:
   - Categorized by Starters, Main Course, Breads, Rice, Desserts, and Beverages.
   - Dietary filter toggle: **All**, **🌱 Pure Veg**, and **🍗 Non-Veg**.
   - Live availability tags: items marked "Sold Out" cannot be added to cart.
   - Customized item notes (e.g. "Less spicy", "No onion", "Extra chutney").
3. **Dining Cart & Ordering (`#/cart`)**:
   - **Dine-In**: Select table or pre-fill from QR code link.
   - **Takeaway**: Customer pickup name and phone number.
   - Price calculation: item quantities, item notes, item subtotals, and 5% GST breakdown.
4. **Table Reservations (`#/reserve`)**:
   - Real-time availability check via `/api/tables/available`.
   - Rejects past dates and past times for today.
   - Prevents double-booking: enforces a 90-minute dining interval for active bookings.
   - Displays only tables with capacity $\ge$ guest count.
5. **My Dining Activity (`#/my-orders`)**:
   - **My Reservations**: View status (`booked`, `confirmed`, `seated`, `cancelled`). Cancel reservations before scheduled start time.
   - **My Orders**: Real-time order progress timeline (`pending` $\rightarrow$ `preparing` $\rightarrow$ `ready` $\rightarrow$ `served` $\rightarrow$ `completed`).
   - Auto-polls every 6 seconds for live updates as the kitchen cooks.
6. **QR Table Flow**:
   - Guests scanning table QR codes open `/#/menu?table=<tableNumber>`.
   - The app detects the seated table and locks it into the cart for instant Dine-In ordering.
   - Supports guest checkout (Name + Phone) without forcing account creation.

---

## 🔑 Default Credentials & Accounts

Run `npm run seed` to initialize test accounts:

| Role | Email / Username | Password | Notes |
|---|---|---|---|
| **Admin** | `admin@spiceroute.com` (or `admin`) | `admin123` | Auto-seeded from `ADMIN_EMAIL` & `ADMIN_PASSWORD` env vars |
| **Staff** | `staff@spiceroute.com` (or `staff`) | `staff123` | Created by Admin |
| **Client** | `client@example.com` (or `rahul_client`) | `client123` | Self-registered client |

---

## 📁 Project Architecture

```
├── server.js               # Express entry point, security headers, route mounting, MongoDB connection
├── seed.js                 # Sample database seeder (menu, tables, staff, users, active orders)
├── models/
│   ├── User.js             # User schema (roles: admin, staff, client; active status)
│   ├── MenuItem.js         # Menu item schema (isVeg, available, imageUrl, category, price)
│   ├── Table.js            # Table schema (number, capacity, status)
│   ├── Reservation.js      # Reservation schema (client ref, date, time, guests, status)
│   ├── Order.js            # Order schema (client ref, table ref, type, items with notes, subtotal)
│   ├── Bill.js             # Invoice & billing schema
│   ├── Customer.js         # Customer directory schema
│   ├── Staff.js            # Staff roster schema
│   └── Inventory.js        # Ingredient stock & low-stock alerts
├── routes/
│   ├── auth.js             # Public /login, /register (clients only), /me, /logout
│   ├── users.js            # Admin-only user management (create staff, toggle active, edit, delete)
│   ├── menu.js             # Public GET; Admin-only POST, PUT, DELETE, and toggle availability
│   ├── tables.js           # Public /available; Staff/Admin GET & status update; Admin write/delete
│   ├── reservations.js     # Client creates & views own; Staff/Admin views all & updates status
│   ├── orders.js           # Client creates & views own; Guest QR orders; Staff/Admin status pipeline
│   ├── bills.js            # Staff/Admin billing and invoice generation
│   ├── dashboard.js        # Admin-only revenue and operations analytics
│   ├── customers.js        # Protected customer directory CRUD
│   ├── staff.js            # Admin-only staff roster CRUD
│   └── inventory.js        # Protected inventory management CRUD
├── middleware/
│   └── auth.js             # authenticate, authorize(...roles), optionalAuth
├── utils/
│   ├── auth.js             # Scrypt password hashing with unique salt & HMAC-SHA256 JWT tokens
│   └── seedAdmin.js        # Startup auto-seed for default administrator account
├── public/
│   ├── index.html          # App shell, responsive client header, admin sidebar
│   ├── style.css           # Modern theme, food cards, veg/non-veg symbols, responsive layout
│   └── app.js              # Client & admin SPAs, hash router, cart management, real-time polling
├── .env.example            # Environment template for local & production deployment
└── README.md
```

---

## 🚀 Setup & Local Execution

### Prerequisites
- Node.js 18.x or newer
- MongoDB Atlas or local MongoDB instance (`mongodb://127.0.0.1:27017/restaurant_db`)

### Instructions
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Populate `.env`:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/restaurant_db
   TAX_RATE=5
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=production
   ADMIN_EMAIL=admin@spiceroute.com
   ADMIN_PASSWORD=admin123
   ```
4. Seed sample data (clears old records and inserts sample menu, tables, staff, and users):
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm start
   ```
6. Open your browser:
   - Client Portal: `http://localhost:3000/#/client-home`
   - Digital Menu: `http://localhost:3000/#/client-menu`
   - Staff / Admin Portal: `http://localhost:3000/#/orders` or `http://localhost:3000/#/dashboard`

---

## ☁️ Deployment Notes (Render & MongoDB Atlas)

### Render Configuration
1. **Service Type**: Web Service
2. **Environment**: Node
3. **Build Command**:
   ```bash
   npm install
   ```
4. **Start Command**:
   ```bash
   npm start
   ```
5. **Environment Variables on Render**:
   - `MONGO_URI`: Your MongoDB Atlas SRV connection string.
   - `JWT_SECRET`: Random 32+ character secret string.
   - `ADMIN_EMAIL`: Email of administrator (e.g. `admin@spiceroute.com`).
   - `ADMIN_PASSWORD`: Strong administrator password (e.g. `admin123`).
   - `TAX_RATE`: `5`
   - `NODE_ENV`: `production`

### MongoDB Atlas Network Access
Render's free and standard instances use dynamic IP addresses. To ensure Render can reach Atlas:
1. Log into [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to **Security** $\rightarrow$ **Network Access**.
3. Click **Add IP Address**.
4. Click **Allow Access from Anywhere** (`0.0.0.0/0`) and click **Confirm**.
5. Go to **Database Access** and verify your database user has `readWriteAnyDatabase` or read/write privileges on your cluster.
