// d:\events\event\app\admin\events\page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { formatDateRange } from '@/lib/utils';
import { Search, Filter, Download, LayoutList, LayoutGrid, CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import {
  AcademicYearSelector,
  getAcademicYearRange,
  getAcademicYears,
} from '@/components/academic-year-selector';

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
  club_logo?: string;
  date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'CANCELLED';
  registrations: number;
  max_participants: number;
  location: string;
  event_type: string;
  poster_url?: string;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const { activeStartYear } = getAcademicYears();
  const [selectedYear, setSelectedYear] = useState(activeStartYear);

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, [selectedYear]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { yearStart, yearEnd } = getAcademicYearRange(selectedYear);
      const response = await fetch(
        `/api/admin/events?yearStart=${encodeURIComponent(yearStart)}&yearEnd=${encodeURIComponent(yearEnd)}`
      );
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

  const getCardStatusLabel = (status: AdminEvent['status']) => {
    if (status === 'APPROVED') return 'APPROVED';
    if (status === 'PENDING') return 'PENDING';
    return 'REJECTED';
  };

  const getCardStatusColor = (status: AdminEvent['status']) => {
    if (status === 'APPROVED') return 'bg-green-500 text-white';
    if (status === 'PENDING') return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
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
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">All Events</h1>
                <p className="text-[#666666]">View, approve, and manage all campus events.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={
                      viewMode === 'table'
                        ? 'bg-red-800 text-white p-2 rounded-md'
                        : 'bg-white text-gray-500 border border-gray-200 p-2 rounded-md hover:bg-gray-50'
                    }
                    aria-label="Table view"
                  >
                    <LayoutList size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={
                      viewMode === 'card'
                        ? 'bg-red-800 text-white p-2 rounded-md'
                        : 'bg-white text-gray-500 border border-gray-200 p-2 rounded-md hover:bg-gray-50'
                    }
                    aria-label="Card view"
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>
                <AcademicYearSelector selectedYear={selectedYear} onChange={setSelectedYear} />
              </div>
            </div>
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

          {viewMode === 'table' ? (
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
                          onClick={() => router.push(`/admin/events/${event._id}`)}
                          className="border-b border-[#E8E8E8] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 text-[#2D2D2D] font-medium">{event.title}</td>
                          <td className="px-6 py-4 text-[#666666]">{event.club_name}</td>
                          <td className="px-6 py-4 text-[#666666]">
                            {formatDateRange(event.date, event.end_date, 'en-GB')}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/events/${event._id}`);
                              }}
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
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-[#E8E8E8] border-t-[#8B1E26] rounded-full animate-spin" />
                    <p className="text-[#666666]">Loading events...</p>
                  </div>
                </div>
              ) : filteredEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12"
                >
                  <p className="text-[#666666] text-lg">No events found matching your filters.</p>
                </motion.div>
              ) : (
                filteredEvents.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => router.push(`/admin/events/${event._id}`)}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer"
                  >
                    <div className="relative h-48 w-full">
                      {event.poster_url ? (
                        <img
                          src={event.poster_url}
                          alt={event.title}
                          className="w-full h-full object-cover rounded-t-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-red-800 to-red-600 rounded-t-xl" />
                      )}

                      <span
                        className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${getCardStatusColor(
                          event.status
                        )}`}
                      >
                        {getCardStatusLabel(event.status)}
                      </span>

                      <div className="absolute bottom-0 left-0 m-3 w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden">
                        {event.club_logo ? (
                          <img
                            src={event.club_logo}
                            alt={event.club_name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <span className="text-red-800 font-bold text-lg">
                            {event.club_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-3">
                      <h3 className="font-bold text-lg text-gray-900 mb-3">{event.title}</h3>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays size={16} className="text-red-800" />
                        <span>{formatDateRange(event.date, event.end_date, 'en-GB')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-red-800" />
                        <span>{event.start_time} - {event.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-red-800" />
                        <span>{event.location || 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} className="text-red-800" />
                        <span>{event.registrations}/{event.max_participants} attendees</span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400 uppercase tracking-wide">{event.event_type}</span>

                        <button
                          onClick={() => router.push(`/admin/events/${event._id}`)}
                          className="text-red-800 font-semibold text-sm hover:text-red-900 cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}