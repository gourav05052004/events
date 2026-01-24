'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Search, Filter, Download, MapPin, Users, Calendar } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Clubs', href: '/admin/clubs' },
  { label: 'Venues', href: '/admin/venues', active: true },
  { label: 'Activity Logs', href: '/admin/logs' },
  { label: 'Settings', href: '/admin/settings' },
];

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  type: string;
  amenities: string[];
  bookedEvents: number;
  availability: 'available' | 'partially_booked' | 'full_booked';
  manager: string;
  contact: string;
}

const allVenues: Venue[] = [
  {
    id: '1',
    name: 'Main Auditorium',
    location: 'Building A, Ground Floor',
    capacity: 800,
    type: 'Auditorium',
    amenities: ['Projector', 'Sound System', 'Stage', 'Lighting'],
    bookedEvents: 12,
    availability: 'partially_booked',
    manager: 'Mr. Sharma',
    contact: 'auditorium@vit.ac.in',
  },
  {
    id: '2',
    name: 'Conference Hall',
    location: 'Building B, 2nd Floor',
    capacity: 250,
    type: 'Conference',
    amenities: ['WiFi', 'Video Conference', 'Whiteboard', 'AC'],
    bookedEvents: 18,
    availability: 'partially_booked',
    manager: 'Ms. Patel',
    contact: 'conference@vit.ac.in',
  },
  {
    id: '3',
    name: 'Sports Ground',
    location: 'Campus South Field',
    capacity: 2000,
    type: 'Outdoor',
    amenities: ['Equipment Storage', 'Seating', 'Medical Unit', 'Parking'],
    bookedEvents: 8,
    availability: 'available',
    manager: 'Mr. Kumar',
    contact: 'sports@vit.ac.in',
  },
  {
    id: '4',
    name: 'Lab 101',
    location: 'Building C, 1st Floor',
    capacity: 60,
    type: 'Laboratory',
    amenities: ['Computers', 'Equipment', 'Safety Kit', 'WiFi'],
    bookedEvents: 14,
    availability: 'partially_booked',
    manager: 'Dr. Singh',
    contact: 'lab101@vit.ac.in',
  },
  {
    id: '5',
    name: 'Art Studio',
    location: 'Building D, Ground Floor',
    capacity: 100,
    type: 'Studio',
    amenities: ['Art Supplies', 'Gallery Space', 'Natural Light', 'Storage'],
    bookedEvents: 9,
    availability: 'available',
    manager: 'Ms. Verma',
    contact: 'artstudio@vit.ac.in',
  },
  {
    id: '6',
    name: 'Seminar Room 201',
    location: 'Building E, 2nd Floor',
    capacity: 80,
    type: 'Seminar',
    amenities: ['Projector', 'Whiteboard', 'WiFi', 'Comfortable Seating'],
    bookedEvents: 22,
    availability: 'full_booked',
    manager: 'Mr. Reddy',
    contact: 'seminar201@vit.ac.in',
  },
  {
    id: '7',
    name: 'Open Lawn',
    location: 'Campus Central',
    capacity: 1500,
    type: 'Outdoor',
    amenities: ['Open Space', 'Tent Setup', 'Parking', 'Restrooms'],
    bookedEvents: 6,
    availability: 'available',
    manager: 'Mr. Iyer',
    contact: 'openlawn@vit.ac.in',
  },
  {
    id: '8',
    name: 'Library Hall',
    location: 'Building F, 3rd Floor',
    capacity: 150,
    type: 'Hall',
    amenities: ['Quiet Environment', 'WiFi', 'Tables', 'AC'],
    bookedEvents: 5,
    availability: 'available',
    manager: 'Ms. Desai',
    contact: 'libraryhall@vit.ac.in',
  },
];

export default function AdminVenuesPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const filteredVenues = allVenues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.manager.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability =
      availabilityFilter === 'all' || venue.availability === availabilityFilter;
    return matchesSearch && matchesAvailability;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'partially_booked':
        return 'bg-yellow-100 text-yellow-700';
      case 'full_booked':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'Available';
      case 'partially_booked':
        return 'Partially Booked';
      case 'full_booked':
        return 'Fully Booked';
      default:
        return availability;
    }
  };

  const stats = [
    {
      label: 'Total Venues',
      value: allVenues.length,
      icon: MapPin,
      color: 'text-blue-600',
    },
    {
      label: 'Available Venues',
      value: allVenues.filter((v) => v.availability === 'available').length,
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      label: 'Total Capacity',
      value: allVenues.reduce((sum, v) => sum + v.capacity, 0).toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
    },
    {
      label: 'Total Bookings',
      value: allVenues.reduce((sum, v) => sum + v.bookedEvents, 0),
      icon: Calendar,
      color: 'text-orange-600',
    },
  ];

  const handleExport = () => {
    const csv = [
      ['Name', 'Location', 'Capacity', 'Type', 'Booked Events', 'Availability', 'Manager', 'Contact'].join(','),
      ...filteredVenues.map((v) =>
        [v.name, v.location, v.capacity, v.type, v.bookedEvents, getAvailabilityLabel(v.availability), v.manager, v.contact].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'venues.csv';
    a.click();
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Venue Management" userRole="admin" />
      <Sidebar
        items={sidebarItems}
        onLogout={() => router.push('/')}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Venue Management</h1>
            <p className="text-[#666666]">Manage all college venues and their bookings</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 border border-[#E8E8E8]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#666666] text-sm font-medium mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-[#2D2D2D]">{stat.value}</p>
                    </div>
                    <Icon className={`w-10 h-10 ${stat.color}`} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-[#E8E8E8]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-4 top-3.5 text-[#8B1E26]" size={20} />
                <input
                  type="text"
                  placeholder="Search venues, location, or manager..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Filters & Actions */}
              <div className="flex gap-3">
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                >
                  <option value="all">All Availability</option>
                  <option value="available">Available</option>
                  <option value="partially_booked">Partially Booked</option>
                  <option value="full_booked">Fully Booked</option>
                </select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-[#8B1E26] text-[#8B1E26] rounded-lg font-medium hover:bg-[#8B1E26]/5 transition-all"
                >
                  <Download size={18} />
                  Export
                </motion.button>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-[#666666] mt-4 text-sm">
              Showing <span className="font-semibold">{filteredVenues.length}</span> of <span className="font-semibold">{allVenues.length}</span> venues
            </p>
          </motion.div>

          {/* Venues Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl overflow-hidden border border-[#E8E8E8]"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#E8E8E8]">
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Venue Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Capacity</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Booked Events</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Manager</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVenues.length > 0 ? (
                    filteredVenues.map((venue, index) => (
                      <motion.tr
                        key={venue.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#F8F9FA' }}
                        className="border-b border-[#E8E8E8] hover:bg-[#F8F9FA] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-[#8B1E26]" />
                            <div>
                              <p className="font-medium text-[#2D2D2D]">{venue.name}</p>
                              <p className="text-sm text-[#666666]">{venue.contact}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#2D2D2D]">{venue.location}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">{venue.type}</span>
                        </td>
                        <td className="px-6 py-4 text-[#2D2D2D] font-medium">{venue.capacity.toLocaleString()}</td>
                        <td className="px-6 py-4 text-[#2D2D2D] font-medium">{venue.bookedEvents}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(venue.availability)}`}>
                            {getAvailabilityLabel(venue.availability)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#2D2D2D]">{venue.manager}</td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-sm font-bold text-[#8B1E26] hover:underline"
                          >
                            Edit
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <p className="text-[#666666]">No venues found matching your filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
