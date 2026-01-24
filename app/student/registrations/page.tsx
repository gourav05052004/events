'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { EventCard } from '@/components/event-card';
import { Calendar, Trash2 } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/student/dashboard' },
  { label: 'Browse Events', href: '/student/events' },
  { label: 'My Registrations', href: '/student/registrations', active: true },
  { label: 'Favorites', href: '/student/favorites' },
  { label: 'My Profile', href: '/student/profile' },
];

const registeredEvents = [
  {
    id: '1',
    title: 'Annual Tech Summit 2025',
    date: 'Feb 15, 2025',
    time: '10:00 AM - 5:00 PM',
    location: 'Main Auditorium',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
    status: 'approved' as const,
    attendees: 245,
    maxAttendees: 500,
  },
  {
    id: '2',
    title: 'AI & Machine Learning Workshop',
    date: 'Feb 20, 2025',
    time: '2:00 PM - 6:00 PM',
    location: 'Lab 101',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=200&fit=crop',
    status: 'approved' as const,
    attendees: 120,
    maxAttendees: 200,
  },
  {
    id: '3',
    title: 'Sports Day Celebration',
    date: 'Feb 25, 2025',
    time: '8:00 AM - 3:00 PM',
    location: 'Sports Ground',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=200&fit=crop',
    status: 'approved' as const,
    attendees: 600,
    maxAttendees: 800,
  },
];

interface RegistrationItem {
  id: string;
  title: string;
  date: string;
  registeredOn: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  ticketId: string;
}

const registrations: RegistrationItem[] = [
  {
    id: '1',
    title: 'Annual Tech Summit 2025',
    date: 'Feb 15, 2025',
    registeredOn: 'Jan 20, 2025',
    status: 'confirmed',
    ticketId: 'TKT-001-2025',
  },
  {
    id: '2',
    title: 'AI & Machine Learning Workshop',
    date: 'Feb 20, 2025',
    registeredOn: 'Jan 22, 2025',
    status: 'confirmed',
    ticketId: 'TKT-002-2025',
  },
  {
    id: '3',
    title: 'Sports Day Celebration',
    date: 'Feb 25, 2025',
    registeredOn: 'Jan 18, 2025',
    status: 'confirmed',
    ticketId: 'TKT-003-2025',
  },
];

export default function StudentRegistrationsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'waitlisted':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="My Registrations" userRole="student" />
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
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">My Registrations</h1>
            <p className="text-[#666666]">View and manage all your event registrations.</p>
          </motion.div>

          {/* View Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 mb-8"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('cards')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-[#8B1E26] text-white'
                  : 'bg-white border border-[#E8E8E8] text-[#2D2D2D]'
              }`}
            >
              Cards View
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('table')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-[#8B1E26] text-white'
                  : 'bg-white border border-[#E8E8E8] text-[#2D2D2D]'
              }`}
            >
              Table View
            </motion.button>
          </motion.div>

          {/* Cards View */}
          {viewMode === 'cards' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {registeredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EventCard {...event} onClick={() => router.push(`/event/${event.id}`)} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl overflow-hidden border border-[#E8E8E8]"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E8E8E8]">
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Event</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">
                        Registered On
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Ticket ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg, index) => (
                      <motion.tr
                        key={reg.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#F8F9FA' }}
                        className="border-b border-[#E8E8E8]"
                      >
                        <td className="px-6 py-4 text-[#2D2D2D] font-medium">{reg.title}</td>
                        <td className="px-6 py-4 text-[#666666]">{reg.date}</td>
                        <td className="px-6 py-4 text-[#666666]">{reg.registeredOn}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              reg.status
                            )}`}
                          >
                            {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-[#2D2D2D]">{reg.ticketId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* No Registrations Message */}
          {registeredEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Calendar className="text-[#8B1E26] mx-auto mb-4" size={48} />
              <p className="text-[#2D2D2D] text-lg font-bold mb-2">No registrations yet</p>
              <p className="text-[#666666] mb-6">Start exploring and register for exciting events!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/student/events')}
                className="px-8 py-3 bg-[#8B1E26] text-white rounded-lg font-bold hover:shadow-lg"
              >
                Browse Events
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
