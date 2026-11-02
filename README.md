# Restaurant Management System

A complete, beginner-friendly web app built with **Node.js, Express, MongoDB (Mongoose)** and a plain **HTML/CSS/JavaScript** frontend. There is no build step and no frontend framework.

## Authentication & Roles

The system supports built-in **User Registration**, **Login (JWT & scrypt hashing)**, and **Role-Based Access Control (RBAC)**:

| Role | Access Permissions |
|---|---|
| **Admin** | Full system access: Dashboard, Orders, Billing, Menu (add/edit/delete), Tables (add/edit/delete), Reservations, Customers, Inventory (add/edit/delete), **Staff Management**, and **User Accounts Management** |
| **Staff** | Daily restaurant operations: Take & advance Orders, reserve Tables, generate Bills & receipts, view Menu & register Customers. (Staff management, user accounts, and destructive deletions are restricted) |

### Default Demo Credentials (from `npm run seed`)
- **Admin**: Username: `admin` | Password: `admin123`
- **Staff**: Username: `staff` | Password: `staff123`

---

## Modules

| Module | What it does |
|---|---|
| Auth / Users | Sign in, register, and role management (Admin / Staff) |
| Dashboard | Revenue today, active orders, occupied tables, best sellers, low-stock alerts |
| Menu | Add, edit and delete dishes; mark items sold out |
| Tables | Manage tables and seating; status updates automatically |
| Orders | Take orders, send them through pending, preparing, ready and served, or cancel |
| Billing | Generate bills with discount and tax, record payment, print receipts |
| Reservations | Book tables; blocks double booking and over-capacity bookings |
| Customers | Customer directory |
| Inventory | Track stock; items at or below the reorder level are flagged low |
| Staff | Staff list with role and shift (Admin only) |

## Run it

1. Install [Node.js](https://nodejs.org) 18 or newer and MongoDB (local, or a free MongoDB Atlas cluster).
2. In this folder run:
   ```
   npm install
   ```
3. The `.env` file is already included. Edit `MONGO_URI` if needed (the default is the local MongoDB at `mongodb://127.0.0.1:27017/restaurant_db`, which MongoDB Compass can also open). For Atlas, paste your connection string instead.
4. Optional sample data (menu, tables, staff, stock, one open order, and admin/staff users):
   ```
   npm run seed
   ```
5. Start the app and open http://localhost:3000
   ```
   npm start
   ```

## Folder structure

```
server.js          app entry point, routes and error handling
seed.js            sample data script
models/            Mongoose schemas (User, MenuItem, Table, Order, Bill ...)
routes/            one file per module; crud.js is the shared CRUD router; auth.js for auth
middleware/        auth verification and role authorization
utils/             password hashing (scrypt) & signed JWT tokens
public/            frontend: index.html, style.css, app.js
```

## REST API (Authentication & Modules)

### Auth Endpoints:
- `POST /api/auth/register` - `{ name, username, password, role }`
- `POST /api/auth/login` - `{ username, password }`
- `GET /api/auth/me` - get current user profile (requires Bearer token)
- `GET /api/auth/users` - list users (Admin only)
- `PATCH /api/auth/users/:id/role` - change user role (Admin only)

Simple modules share the same five endpoints: `GET /api/<module>`, `GET /api/<module>/:id`, `POST /api/<module>`, `PUT /api/<module>/:id`, `DELETE /api/<module>/:id`, where `<module>` is `menu`, `tables`, `customers`, `staff`, `inventory` or `reservations`.

| Method | URL | Purpose |
|---|---|---|
| GET | /api/dashboard | Summary numbers |
| GET / POST | /api/orders | List or create an order (`{ table, items: [{ menuItem, qty }], customerName, notes }`) |
| PATCH | /api/orders/:id/status | `{ "status": "preparing" }` and so on |
| GET / POST | /api/bills | List or create a bill (`{ order, discount, paymentMethod }`) |

## How the key rules work

- Passwords are securely hashed with scrypt and unique random salts using Node.js built-in cryptography.
- APIs are protected using HMAC-SHA256 JWT tokens passed via the `Authorization: Bearer <token>` header.
- Sensitive sections (Staff management, User accounts, deletion of menu/tables/inventory) require the `admin` role.
- Prices are always read from the database when an order is placed, never trusted from the browser.
- Placing an order marks its table occupied; billing or cancelling frees the table.
- Bill total = subtotal - discount + tax (`TAX_RATE` in `.env`, default 5%).
- A reservation cannot exceed the table's seats or clash with another booking at the same date and time.
