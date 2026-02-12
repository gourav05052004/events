// d:\events\event\app\admin\events\page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Search, Filter, Download } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Events', href: '/admin/events', active: true },
  { label: 'Clubs', href: '/admin/clubs' },
  { label: 'Venues', href: '/admin/venues' },
];

interface AdminEvent {
  _id: string;
  title: string;
  club_name: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'CANCELLED';
  registrations: number;
  max_participants: number;
  location: string;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/events');
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
        setError('');
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      setError('An error occurred while loading events');
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.club_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'RESCHEDULED':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
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
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="RESCHEDULED">Rescheduled</option>
                    <option value="CANCELLED">Cancelled</option>
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
            {isLoading ? 'Loading...' : `Showing ${filteredEvents.length} of ${events.length} events`}
          </motion.p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Events Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl overflow-hidden border border-[#E8E8E8]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-[#E8E8E8] border-t-[#8B1E26] rounded-full animate-spin" />
                  <p className="text-[#666666]">Loading events...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E8E8E8]">
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Event</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Club</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Registrations</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event, index) => (
                      <motion.tr
                        key={event._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#F8F9FA' }}
                        className="border-b border-[#E8E8E8] hover:bg-[#F8F9FA] transition-colors"
                      >
                        <td className="px-6 py-4 text-[#2D2D2D] font-medium">{event.title}</td>
                        <td className="px-6 py-4 text-[#666666]">{event.club_name}</td>
                        <td className="px-6 py-4 text-[#666666]">
                          {new Date(event.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              event.status
                            )}`}
                          >
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#2D2D2D]">
                          <span className="text-sm">
                            {event.registrations}/{event.max_participants}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#666666] text-sm">{event.location || 'TBD'}</td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/admin/events/${event._id}`)}
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
            )}

            {!isLoading && filteredEvents.length === 0 && (
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