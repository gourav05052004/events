const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Resource schema inline
const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['HALL', 'ROOM', 'LAB'], required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    amenities: { type: [String], default: [] },
    manager: { type: String, required: true },
    contact: { type: String, required: true },
    booked_events: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'resources' }
);

const Resource = mongoose.model('Resource', resourceSchema);

const venuesData = [
  {
    name: 'Main Auditorium',
    location: 'Building A, Ground Floor',
    capacity: 800,
    type: 'HALL',
    amenities: ['Projector', 'Sound System', 'Stage', 'Lighting'],
    manager: 'Mr. Sharma',
    contact: 'auditorium@vit.ac.in',
  },
  {
    name: 'Conference Hall',
    location: 'Building B, 2nd Floor',
    capacity: 250,
    type: 'ROOM',
    amenities: ['WiFi', 'Video Conference', 'Whiteboard', 'AC'],
    manager: 'Ms. Patel',
    contact: 'conference@vit.ac.in',
  },
  {
    name: 'Sports Ground',
    location: 'Campus South Field',
    capacity: 2000,
    type: 'HALL',
    amenities: ['Equipment Storage', 'Seating', 'Medical Unit', 'Parking'],
    manager: 'Mr. Kumar',
    contact: 'sports@vit.ac.in',
  },
  {
    name: 'Lab 101',
    location: 'Building C, 1st Floor',
    capacity: 60,
    type: 'LAB',
    amenities: ['Computers', 'Equipment', 'Safety Kit', 'WiFi'],
    manager: 'Dr. Singh',
    contact: 'lab101@vit.ac.in',
  },
  {
    name: 'Art Studio',
    location: 'Building D, Ground Floor',
    capacity: 100,
    type: 'ROOM',
    amenities: ['Art Supplies', 'Gallery Space', 'Natural Light', 'Storage'],
    manager: 'Ms. Verma',
    contact: 'artstudio@vit.ac.in',
  },
  {
    name: 'Seminar Room 201',
    location: 'Building E, 2nd Floor',
    capacity: 80,
    type: 'ROOM',
    amenities: ['Projector', 'Whiteboard', 'WiFi', 'Comfortable Seating'],
    manager: 'Mr. Reddy',
    contact: 'seminar201@vit.ac.in',
  },
  {
    name: 'Open Lawn',
    location: 'Campus Central',
    capacity: 1500,
    type: 'HALL',
    amenities: ['Open Space', 'Tent Setup', 'Parking', 'Restrooms'],
    manager: 'Mr. Iyer',
    contact: 'openlawn@vit.ac.in',
  },
  {
    name: 'Library Hall',
    location: 'Building F, 3rd Floor',
    capacity: 150,
    type: 'HALL',
    amenities: ['Quiet Environment', 'WiFi', 'Tables', 'AC'],
    manager: 'Ms. Desai',
    contact: 'libraryhall@vit.ac.in',
  },
];

async function seedVenues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/events');
    console.log('Connected to MongoDB');

    // Clear existing resources
    await Resource.deleteMany({});
    console.log('Cleared existing resources');

    // Insert venues
    const result = await Resource.insertMany(venuesData);
    console.log(`Seeded ${result.length} venues successfully`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding venues:', error);
    process.exit(1);
  }
}

seedVenues();
