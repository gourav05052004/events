const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/events_db';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');
};

const checkDatabase = async () => {
  try {
    await connectDB();

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Collections in database:');
    collections.forEach(c => console.log('  -', c.name));

    // Check event_registrations
    const db = mongoose.connection.db;
    const registrationsCollection = db.collection('event_registrations');
    const allRegistrations = await registrationsCollection.find({}).toArray();
    
    console.log('\n📊 Event Registrations Data:');
    console.log('  Total registrations:', allRegistrations.length);
    if (allRegistrations.length > 0) {
      console.log('\n  First 5 registrations:');
      allRegistrations.slice(0, 5).forEach((reg, idx) => {
        console.log(`\n  Registration ${idx + 1}:`);
        console.log('    _id:', reg._id);
        console.log('    event_id:', reg.event_id);
        console.log('    event_id type:', typeof reg.event_id);
        console.log('    student_id:', reg.student_id);
        console.log('    student_id type:', typeof reg.student_id);
        console.log('    status:', reg.status);
      });
    }

    // Check students
    const studentsCollection = db.collection('students');
    const allStudents = await studentsCollection.find({}).toArray();
    console.log('\n👥 Students in database:');
    console.log('  Total students:', allStudents.length);
    if (allStudents.length > 0) {
      console.log('  First 3 students:');
      allStudents.slice(0, 3).forEach((student, idx) => {
        console.log(`\n  Student ${idx + 1}:`);
        console.log('    _id:', student._id);
        console.log('    _id type:', typeof student._id);
        console.log('    email:', student.email);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkDatabase();
