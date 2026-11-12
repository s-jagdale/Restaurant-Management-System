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

const menuData = [
  {
    name: 'Paneer Tikka',
    category: 'Starter',
    price: 220,
    description: 'Char-grilled cottage cheese cubes marinated in aromatic tandoori spices and bell peppers',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    available: true,
  },
  {
    name: 'Veg Manchurian',
    category: 'Starter',
    price: 180,
    description: 'Crispy vegetable dumplings tossed in a savoury Indo-Chinese garlic soy glaze',
    image: 'https://i2.wp.com/vegecravings.com/wp-content/uploads/2017/03/veg-manchurian-dry-recipe-step-by-step-instructions-10.jpg?fit=2412%2C1944&quality=65&strip=all&ssl=1',
    isVeg: true,
    available: true,
  },
  {
    name: 'Chicken Malai Tikka',
    category: 'Starter',
    price: 290,
    description: 'Juicy chicken breast morsels marinated with cream, cheese, cardamom, and green chilies',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    available: true,
  },
  {
    name: 'Butter Chicken',
    category: 'Main Course',
    price: 340,
    description: 'Tender boneless chicken simmered in a velvet tomato, butter, and fenugreek gravy',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    available: true,
  },
  {
    name: 'Paneer Butter Masala',
    category: 'Main Course',
    price: 280,
    description: 'Fresh cottage cheese simmered in rich creamy cashewnut and butter gravy',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    available: true,
  },
  {
    name: 'Dal Tadka',
    category: 'Main Course',
    price: 190,
    description: 'Slow-cooked yellow lentils tempered with ghee, cumin seeds, garlic, and red chilies',
    image: 'https://simplyvegetarian777.com/wp-content/uploads/2022/01/IPDAALTADKA1200.1.jpg',
    isVeg: true,
    available: true,
  },
  {
    name: 'Butter Naan',
    category: 'Bread',
    price: 50,
    description: 'Soft, fluffy tandoor-baked flatbread brushed with melted salted butter',
    image: 'https://tse3.mm.bing.net/th/id/OIP.lpTojzEhJFlg3PKaR5piEAHaEv?r=0&pid=Api&h=220&P=0',
    isVeg: true,
    available: true,
  },
  {
    name: 'Tandoori Roti',
    category: 'Bread',
    price: 25,
    description: 'Whole wheat flatbread cooked crisp on the walls of an authentic clay tandoor',
    image: 'https://www.whiskaffair.com/wp-content/uploads/2020/08/Tandoori-Roti-2-1-1200x1800.jpg',
    isVeg: true,
    available: true,
  },
  {
    name: 'Jeera Rice',
    category: 'Rice',
    price: 140,
    description: 'Steamed long-grain basmati rice delicately infused with roasted cumin and coriander',
    image: 'https://myfoodstory.com/wp-content/uploads/2018/07/Perfect-Jeera-Rice-Indian-Cumin-Rice-3-1080x617.jpg',
    isVeg: true,
    available: true,
  },
  {
    name: 'Veg Biryani',
    category: 'Rice',
    price: 230,
    description: 'Layered fragrant saffron basmati rice with spiced seasonal garden vegetables',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    available: true,
  },
  {
    name: 'Gulab Jamun',
    category: 'Dessert',
    price: 90,
    description: 'Traditional warm reduced milk dumplings soaked in cardamom and rose syrup',
    image: 'https://greedyeats.com/wp-content/uploads/2024/10/Gulab-Jamun.jpg',
    isVeg: true,
    available: true,
  },
  {
    name: 'Masala Chai',
    category: 'Beverage',
    price: 40,
    description: 'Brewed royal tea infused with fresh crushed ginger, green cardamom, and cloves',
    image: 'https://tse2.mm.bing.net/th/id/OIP.L-eZYEh0a_uiUyjCGaLR1QHaE8?r=0&pid=Api&h=220&P=0',
    isVeg: true,
    available: true,
  },
  {
    name: 'Sweet Lassi',
    category: 'Beverage',
    price: 80,
    description: 'Creamy churned yogurt cooler served chilled with a hint of rose essence',
    image: 'https://resize.indiatvnews.com/en/resize/newbucket/1200_-/2026/04/lassi-1775806396.webp',
    isVeg: true,
    available: true,
  },
];

(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_db';
  console.log('Connecting to database for seeding...');
  await mongoose.connect(uri);

  console.log('Clearing old collections...');
  await Promise.all([
    MenuItem,
    Table,
    Customer,
    Staff,
    Inventory,
    Reservation,
    Order,
    Bill,
    User,
  ].map((m) => m.deleteMany({})));

  console.log('Creating demo users (Admin, Staff, Client)...');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@spiceroute.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const [adminUser, staffUser, clientUser] = await User.insertMany([
    {
      name: 'System Administrator',
      username: 'admin',
      email: adminEmail,
      phone: '9800000000',
      password: hashPassword(adminPassword),
      role: 'admin',
      active: true,
    },
    {
      name: 'Pooja Waiter',
      username: 'staff',
      email: 'staff@spiceroute.com',
      phone: '9800000003',
      password: hashPassword('staff123'),
      role: 'staff',
      active: true,
    },
    {
      name: 'Rahul Deshmukh',
      username: 'rahul_client',
      email: 'client@example.com',
      phone: '9876500001',
      password: hashPassword('client123'),
      role: 'client',
      active: true,
    },
  ]);

  console.log('Inserting menu items...');
  const items = await MenuItem.insertMany(menuData);

  console.log('Inserting dining tables...');
  const tables = await Table.insertMany([
    { number: 1, capacity: 2, status: 'available' },
    { number: 2, capacity: 2, status: 'available' },
    { number: 3, capacity: 4, status: 'occupied' },
    { number: 4, capacity: 4, status: 'available' },
    { number: 5, capacity: 4, status: 'available' },
    { number: 6, capacity: 6, status: 'available' },
    { number: 7, capacity: 6, status: 'available' },
    { number: 8, capacity: 8, status: 'available' },
  ]);

  console.log('Inserting inventory items...');
  await Inventory.insertMany([
    { name: 'Basmati Rice', quantity: 40, unit: 'kg', reorderLevel: 10, supplier: 'Sai Traders' },
    { name: 'Paneer', quantity: 6, unit: 'kg', reorderLevel: 8, supplier: 'Gokul Dairy' },
    { name: 'Chicken', quantity: 15, unit: 'kg', reorderLevel: 10, supplier: 'Fresh Meats' },
    { name: 'Cooking Oil', quantity: 20, unit: 'litre', reorderLevel: 8, supplier: 'Sai Traders' },
    { name: 'Wheat Flour', quantity: 3, unit: 'kg', reorderLevel: 15, supplier: 'Sai Traders' },
    { name: 'Tea Powder', quantity: 8, unit: 'packet', reorderLevel: 3, supplier: 'Tata Distributors' },
  ]);

  console.log('Inserting staff roster...');
  await Staff.insertMany([
    { name: 'Vikram Joshi', role: 'Manager', phone: '9800000001', shift: 'Morning' },
    { name: 'Sanjay More', role: 'Chef', phone: '9800000002', shift: 'Evening' },
    { name: 'Pooja Shinde', role: 'Waiter', phone: '9800000003', shift: 'Morning' },
    { name: 'Rohit Pawar', role: 'Waiter', phone: '9800000004', shift: 'Evening' },
    { name: 'Neha Gaikwad', role: 'Cashier', phone: '9800000005', shift: 'Morning' },
  ]);

  console.log('Inserting customers...');
  await Customer.insertMany([
    { name: 'Rahul Deshmukh', phone: '9876500001', email: 'client@example.com' },
    { name: 'Sneha Kulkarni', phone: '9876500002', email: 'sneha@example.com' },
    { name: 'Amit Patil', phone: '9876500003' },
  ]);

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  console.log('Inserting sample reservation...');
  await Reservation.create({
    client: clientUser._id,
    customerName: clientUser.name,
    phone: clientUser.phone,
    table: tables[5]._id, // Table 6
    guests: 4,
    date: dateStr,
    time: '20:00',
    startTime: '20:00',
    endTime: '21:30',
    status: 'booked',
    notes: 'Window seat preferred if possible',
  });

  console.log('Inserting sample active order...');
  const orderLines = [
    { menuItem: items[0]._id, name: items[0].name, price: items[0].price, qty: 1, note: 'Extra crispy' },
    { menuItem: items[3]._id, name: items[3].name, price: items[3].price, qty: 1, note: 'Medium spicy' },
    { menuItem: items[6]._id, name: items[6].name, price: items[6].price, qty: 2, note: 'Well buttered' },
  ];

  await Order.create({
    orderNo: 'ORD-SEED001',
    client: clientUser._id,
    table: tables[2]._id, // Table 3
    customerName: clientUser.name,
    customerPhone: clientUser.phone,
    type: 'dine-in',
    items: orderLines,
    subtotal: orderLines.reduce((s, l) => s + l.price * l.qty, 0),
    status: 'preparing',
    notes: 'Please serve starters first',
  });

  console.log('--- Database seeding completed successfully! ---');
  console.log(`Admin login  : ${adminEmail} (or "admin") / ${adminPassword}`);
  console.log(`Staff login  : staff@spiceroute.com (or "staff") / staff123`);
  console.log(`Client login : client@example.com (or "rahul_client") / client123`);

  await mongoose.disconnect();
})().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
