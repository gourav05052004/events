/**
 * ADMIN SEEDING SCRIPT
 * Run this once to create the first admin user
 * 
 * Execute with: node scripts/seed-admin.js
 * Or add to package.json: "seed": "node scripts/seed-admin.js"
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Admin schema definition (for seeding)
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const Admin = mongoose.model('Admin', adminSchema);

async function seedAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Error: MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@college.edu' });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists with email: admin@college.edu');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Created: ${existingAdmin.created_at}`);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const password = 'Admin@123456';
    const salt = await bcryptjs.genSalt(10);
    const password_hash = await bcryptjs.hash(password, salt);

    // Create admin
    const admin = await Admin.create({
      name: 'Administrator',
      email: 'admin@college.edu',
      password_hash,
    });

    console.log('✅ Admin created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    admin@college.edu`);
    console.log(`   Password: Admin@123456`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📌 Next Steps:');
    console.log('1. Use these credentials to login at /api/auth/admin-login');
    console.log('2. POST request with: { email: "admin@college.edu", password: "Admin@123456" }');
    console.log('3. Change password after first login');
    console.log('\n⚠️  IMPORTANT: Change the default password immediately!');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();
