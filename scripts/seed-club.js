/**
 * CLUB SEEDING SCRIPT
 * Run this once to create a club user
 *
 * Execute with: node scripts/seed-club.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const clubSchema = new mongoose.Schema({
  club_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  faculty_coordinator_name: { type: String, required: true },
  description: { type: String, default: '' },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

const Club = mongoose.model('Club', clubSchema);

async function seedClub() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Error: MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const email = 'club@college.edu';
    const existingClub = await Club.findOne({ email });
    if (existingClub) {
      console.log(`⚠️  Club already exists with email: ${email}`);
      console.log(`   Club: ${existingClub.club_name}`);
      console.log(`   Created: ${existingClub.created_at}`);
      await mongoose.disconnect();
      return;
    }

    const password = 'Club@123456';
    const salt = await bcryptjs.genSalt(10);
    const password_hash = await bcryptjs.hash(password, salt);

    const club = await Club.create({
      club_name: 'Tech Club',
      email,
      password_hash,
      faculty_coordinator_name: 'Dr. Patel',
      description: 'Campus technology and innovation club',
      is_active: true,
    });

    console.log('✅ Club created successfully!');
    console.log('\n📋 Club Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${club.email}`);
    console.log(`   Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📌 Next Steps:');
    console.log('1. Use these credentials to login as club');
    console.log('2. Change the password after first login');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedClub();
