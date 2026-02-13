'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { EventCard } from '@/components/event-card';
import { formatDateRange } from '@/lib/utils';
import { Calendar, Trash2, Loader } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/student/dashboard' },
  { label: 'Browse Events', href: '/student/events' },
  { label: 'My Registrations', href: '/student/registrations', active: true },
  { label: 'My Profile', href: '/student/profile' },
];

interface EventData {
  _id: string;
  title: string;
  date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  location: string;
  poster_url?: string;
  registrations: number;
  max_participants: number;
}

interface RegistrationItem {
  id: string;
  title: string;
  date: string;
  registeredOn: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  ticketId: string;
  location: string;
  time: string;
  image?: string;
  attendees: number;
  maxAttendees: number;
}

export default function StudentRegistrationsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentRegistrations();
  }, []);

  const fetchStudentRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        router.push('/login');
        return;
      }

      // Fetch student's registrations
      const registrationsResponse = await fetch('/api/student/registrations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!registrationsResponse.ok) {
        if (registrationsResponse.status === 401) {
          toast.error('Your session expired. Please login again');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch registrations');
      }

      const registrationsData = await registrationsResponse.json();

      // Transform API data directly without needing to fetch events separately
      const enrichedRegistrations: RegistrationItem[] = registrationsData.registrations
        .map((reg: any) => {
          const event = reg.event;
          if (!event) return null;

          const eventDate = formatDateRange(event.date, event.end_date, 'en-GB');

          const registeredDate = new Date(reg.registered_at).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return {
            id: event._id,
            title: event.title,
            date: eventDate,
            registeredOn: registeredDate,
            status: (reg.status.toLowerCase() === 'confirmed' ? 'confirmed' : 'waitlisted') as 'confirmed' | 'waitlisted',
            ticketId: `TKT-${reg._id.toString().slice(-8).toUpperCase()}`,
            location: event.location,
            time: `${event.start_time} - ${event.end_time}`,
            image: event.poster_url,
            attendees: event.registrations,
            maxAttendees: event.max_participants,
          };
        })
        .filter((reg: RegistrationItem | null): reg is RegistrationItem => reg !== null);

      setRegistrations(enrichedRegistrations);
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to load registrations';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Fetch registrations error:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCancelRegistration = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        router.push('/login');
        return;
      }

      // Cancel registration
      const response = await fetch(`/api/student/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Your session expired. Please login again');
          router.push('/login');
          return;
        }
        throw new Error('Failed to cancel registration');
      }

      setRegistrations(registrations.filter((r) => r.id !== eventId));
      toast.success('Registration cancelled successfully');
    } catch (error) {
      const errorMsg = (error as Error).message;
      toast.error(errorMsg);
      console.error('Cancel error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="My Registrations" userRole="student" />
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
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">My Registrations</h1>
            <p className="text-[#666666]">View and manage all your event registrations.</p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12"
            >
              <Loader className="w-8 h-8 text-[#8B1E26] animate-spin mr-3" />
              <p className="text-[#666666] text-lg">Loading your registrations...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
            >
              <p className="text-red-700 font-bold mb-2">Failed to Load Registrations</p>
              <p className="text-red-600 mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchStudentRegistrations}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

          {/* View Toggle */}
          {!loading && registrations.length > 0 && (
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
          )}

          {/* Cards View */}
          {!loading && viewMode === 'cards' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {registrations.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EventCard
                    id={event.id}
                    title={event.title}
                    date={event.date}
                    time={event.time || 'Time TBA'}
                    location={event.location || 'Location TBA'}
                    image={event.image || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop'}
                    status={event.status === 'confirmed' ? 'approved' : 'pending'}
                    attendees={event.attendees}
                    maxAttendees={event.maxAttendees}
                    onClick={() => router.push(`/event/${event.id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Table View */}
          {!loading && viewMode === 'table' && (
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
                        className="border-b border-[#E8E8E8] cursor-pointer"
                        onClick={() => router.push(`/event/${reg.id}`)}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelRegistration(reg.id);
                            }}
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
          {!loading && registrations.length === 0 && !error && (
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
