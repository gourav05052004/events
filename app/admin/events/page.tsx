'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Search, Filter, Download } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Events', href: '/admin/events', active: true },
  { label: 'Clubs', href: '/admin/clubs' },
  { label: 'Venues', href: '/admin/venues' },
  { label: 'Activity Logs', href: '/admin/logs' },
  { label: 'Settings', href: '/admin/settings' },
];

interface AdminEvent {
  id: string;
  title: string;
  organizer: string;
  date: string;
  status: 'pending' | 'approved' | 'cancelled';
  registrations: number;
  venue: string;
  actions: number;
}

const allEvents: AdminEvent[] = [
  {
    id: '1',
    title: 'Annual Tech Summit 2025',
    organizer: 'Computer Science Club',
    date: 'Feb 15, 2025',
    status: 'approved',
    registrations: 245,
    venue: 'Main Auditorium',
    actions: 3,
  },
  {
    id: '2',
    title: 'AI & Machine Learning Workshop',
    organizer: 'Tech Club',
    date: 'Feb 20, 2025',
    status: 'approved',
    registrations: 120,
    venue: 'Lab 101',
    actions: 2,
  },
  {
    id: '3',
    title: 'Sports Day Celebration',
    organizer: 'Sports Committee',
    date: 'Feb 25, 2025',
    status: 'approved',
    registrations: 600,
    venue: 'Sports Ground',
    actions: 5,
  },
  {
    id: '4',
    title: 'Entrepreneurship Summit',
    organizer: 'Entrepreneurship Club',
    date: 'Mar 5, 2025',
    status: 'pending',
    registrations: 89,
    venue: 'Conference Hall',
    actions: 1,
  },
  {
    id: '5',
    title: 'Photography Workshop',
    organizer: 'Photography Club',
    date: 'Mar 10, 2025',
    status: 'pending',
    registrations: 45,
    venue: 'Art Studio',
    actions: 0,
  },
];

export default function AdminEventsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Event Management" userRole="admin" />
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
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">All Events</h1>
            <p className="text-[#666666]">View, approve, and manage all campus events.</p>
          </motion.div>

          {/* Controls */}
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
                  placeholder="Search events or organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Filters & Actions */}
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-3.5 text-[#8B1E26]" size={18} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-[#8B1E26] text-[#8B1E26] rounded-lg font-medium hover:bg-[#8B1E26]/5 transition-all"
                >
                  <Download size={18} />
                  Export
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#666666] mb-6"
          >
            Showing {filteredEvents.length} of {allEvents.length} events
          </motion.p>

          {/* Events Table */}
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
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Event</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Organizer</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Registrations</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Venue</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event, index) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: '#F8F9FA' }}
                      className="border-b border-[#E8E8E8] hover:bg-[#F8F9FA] transition-colors"
                    >
                      <td className="px-6 py-4 text-[#2D2D2D] font-medium">{event.title}</td>
                      <td className="px-6 py-4 text-[#666666]">{event.organizer}</td>
                      <td className="px-6 py-4 text-[#666666]">{event.date}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#2D2D2D]">{event.registrations}</td>
                      <td className="px-6 py-4 text-[#666666]">{event.venue}</td>
                      <td className="px-6 py-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/admin/events/${event.id}`)}
                          className="text-sm font-bold text-[#8B1E26] hover:underline"
                        >
                          View Details
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEvents.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-[#666666] text-lg">No events found matching your filters.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
