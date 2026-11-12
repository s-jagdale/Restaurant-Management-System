const User = require('../models/User');
const { hashPassword } = require('./auth');

async function seedAdminUser() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@spiceroute.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if an admin exists with this email or username
    let admin = await User.findOne({
      $or: [{ email: adminEmail }, { username: 'admin' }, { role: 'admin' }],
    });

    if (!admin) {
      console.log('No admin found. Seeding default admin from environment...');
      await User.create({
        name: 'System Administrator',
        username: 'admin',
        email: adminEmail,
        password: hashPassword(adminPassword),
        role: 'admin',
        active: true,
      });
      console.log(`Default admin created: ${adminEmail} (username: admin)`);
    } else {
      // Ensure existing admin account is active and has role admin
      let updated = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        updated = true;
      }
      if (!admin.active) {
        admin.active = true;
        updated = true;
      }
      if (!admin.email && adminEmail) {
        admin.email = adminEmail;
        updated = true;
      }
      if (updated) {
        await admin.save();
      }
    }
  } catch (err) {
    console.error('Error during admin auto-seed:', err.message);
  }
}

module.exports = { seedAdminUser };

