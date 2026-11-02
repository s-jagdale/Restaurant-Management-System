// Run with: npm run seed   (clears all collections and inserts sample data)
require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Customer = require('./models/Customer');
const Staff = require('./models/Staff');
const Inventory = require('./models/Inventory');
const Reservation = require('./models/Reservation');
const Order = require('./models/Order');
const Bill = require('./models/Bill');
const User = require('./models/User');
const { hashPassword } = require('./utils/auth');

const menu = [
  ['Paneer Tikka', 'Starter', 220, 'Char-grilled cottage cheese cubes marinated in aromatic tandoori spices', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80'],
  ['Veg Manchurian', 'Starter', 180, 'Crispy vegetable dumplings tossed in a savoury Indo-Chinese garlic soy glaze', 'https://i2.wp.com/vegecravings.com/wp-content/uploads/2017/03/veg-manchurian-dry-recipe-step-by-step-instructions-10.jpg?fit=2412%2C1944&quality=65&strip=all&ssl=1'],
  ['Butter Chicken', 'Main Course', 340, 'Tender boneless chicken simmered in a velvet tomato, butter, and fenugreek gravy', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'],
  ['Paneer Butter Masala', 'Main Course', 280, 'Fresh cottage cheese simmered in rich creamy cashewnut and butter gravy', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80'],
  ['Dal Tadka', 'Main Course', 190, 'Slow-cooked yellow lentils tempered with ghee, cumin seeds, garlic, and red chilies', 'https://simplyvegetarian777.com/wp-content/uploads/2022/01/IPDAALTADKA1200.1.jpg'],
  ['Butter Naan', 'Bread', 50, 'Soft, fluffy tandoor-baked flatbread brushed with melted salted butter', 'https://tse3.mm.bing.net/th/id/OIP.lpTojzEhJFlg3PKaR5piEAHaEv?r=0&pid=Api&h=220&P=0'],
  ['Tandoori Roti', 'Bread', 25, 'Whole wheat flatbread cooked crisp on the walls of an authentic clay tandoor', 'https://www.whiskaffair.com/wp-content/uploads/2020/08/Tandoori-Roti-2-1-1200x1800.jpg'],
  ['Jeera Rice', 'Rice', 140, 'Steamed long-grain basmati rice delicately infused with roasted cumin and coriander', 'https://myfoodstory.com/wp-content/uploads/2018/07/Perfect-Jeera-Rice-Indian-Cumin-Rice-3-1080x617.jpg'],
  ['Veg Biryani', 'Rice', 230, 'Layered fragrant saffron basmati rice with spiced seasonal garden vegetables', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'],
  ['Gulab Jamun', 'Dessert', 90, 'Traditional warm reduced milk dumplings soaked in cardamom and rose syrup', 'https://greedyeats.com/wp-content/uploads/2024/10/Gulab-Jamun.jpg'],
  ['Masala Chai', 'Beverage', 40, 'Brewed royal tea infused with fresh crushed ginger, green cardamom, and cloves', 'https://tse2.mm.bing.net/th/id/OIP.L-eZYEh0a_uiUyjCGaLR1QHaE8?r=0&pid=Api&h=220&P=0'],
  ['Sweet Lassi', 'Beverage', 80, 'Creamy churned yogurt cooler served chilled with a hint of rose essence', 'https://resize.indiatvnews.com/en/resize/newbucket/1200_-/2026/04/lassi-1775806396.webp'],
].map(([name, category, price, description, image]) => ({ name, category, price, description, image }));

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_db');
  await Promise.all([MenuItem, Table, Customer, Staff, Inventory, Reservation, Order, Bill, User].map((m) => m.deleteMany({})));

  // Seed default login accounts
  await User.insertMany([
    {
      name: 'System Administrator',
      username: 'admin',
      password: hashPassword('admin123'),
      role: 'admin',
    },
    {
      name: 'Staff Waiter',
      username: 'staff',
      password: hashPassword('staff123'),
      role: 'staff',
    },
  ]);

  const items = await MenuItem.insertMany(menu);
  const tables = await Table.insertMany(
    [[1, 2], [2, 2], [3, 4], [4, 4], [5, 4], [6, 6], [7, 6], [8, 8]].map(([number, capacity]) => ({ number, capacity }))
  );
  await Customer.insertMany([
    { name: 'Rahul Deshmukh', phone: '9876500001', email: 'rahul@example.com' },
    { name: 'Sneha Kulkarni', phone: '9876500002', email: 'sneha@example.com' },
    { name: 'Amit Patil', phone: '9876500003' },
  ]);
  await Staff.insertMany([
    { name: 'Vikram Joshi', role: 'Manager', phone: '9800000001', shift: 'Morning' },
    { name: 'Sanjay More', role: 'Chef', phone: '9800000002', shift: 'Evening' },
    { name: 'Pooja Shinde', role: 'Waiter', phone: '9800000003', shift: 'Morning' },
    { name: 'Rohit Pawar', role: 'Waiter', phone: '9800000004', shift: 'Evening' },
    { name: 'Neha Gaikwad', role: 'Cashier', phone: '9800000005', shift: 'Morning' },
  ]);
  await Inventory.insertMany([
    { name: 'Basmati Rice', quantity: 40, unit: 'kg', reorderLevel: 10, supplier: 'Sai Traders' },
    { name: 'Paneer', quantity: 6, unit: 'kg', reorderLevel: 8, supplier: 'Gokul Dairy' },
    { name: 'Chicken', quantity: 15, unit: 'kg', reorderLevel: 10, supplier: 'Fresh Meats' },
    { name: 'Cooking Oil', quantity: 20, unit: 'litre', reorderLevel: 8, supplier: 'Sai Traders' },
    { name: 'Wheat Flour', quantity: 3, unit: 'kg', reorderLevel: 15, supplier: 'Sai Traders' },
    { name: 'Tea Powder', quantity: 8, unit: 'packet', reorderLevel: 3, supplier: 'Tata Distributors' },
  ]);

  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  await Reservation.create({
    customerName: 'Sneha Kulkarni', phone: '9876500002', table: tables[5]._id, guests: 5, date, time: '20:00',
  });

  // One open order so the dashboard is not empty
  const lines = [items[0], items[2], items[5]].map((m, i) => ({ menuItem: m._id, name: m.name, price: m.price, qty: i + 1 }));
  await Order.create({
    orderNo: 'ORD-SEED001', table: tables[2]._id, customerName: 'Rahul Deshmukh', items: lines,
    subtotal: lines.reduce((s, l) => s + l.price * l.qty, 0), status: 'preparing',
  });
  await Table.findByIdAndUpdate(tables[2]._id, { status: 'occupied' });

  console.log('Sample data inserted (including images, admin and staff accounts).');
  console.log('Admin login: username "admin", password "admin123"');
  console.log('Staff login: username "staff", password "staff123"');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
