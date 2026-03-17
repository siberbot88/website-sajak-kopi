const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Admin = require('../models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sajakkopi';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Terhubung ke MongoDB');

    await Admin.deleteMany({});
    console.log('Koleksi admin dibersihkan');

    const admin = new Admin({
      username: 'admin',
      password: 'admin123'
    });
    await admin.save();
    console.log('Admin berhasil dibuat:');
    console.log('  Username: admin');
    console.log('  Password: admin123');

    await mongoose.connection.close();
    console.log('Seeding admin selesai.');
    process.exit(0);
  } catch (err) {
    console.error('Gagal membuat admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
