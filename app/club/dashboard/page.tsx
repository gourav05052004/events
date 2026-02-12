'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { StatsCard } from '@/components/stats-card';
import { EventCard } from '@/components/event-card';
import { Modal } from '@/components/modal';
import {
  Calendar,
  Users,
  CheckCircle,
  Plus,
  BarChart3,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/club/dashboard', active: true },
  { label: 'My Events', href: '/club/events' },
  { label: 'Create Event', href: '/club/create-event' },
  { label: 'Team', href: '/club/team' },
  { label: 'Settings', href: '/club/settings' },
];

interface EventTableRow {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status: 'pending' | 'approved' | 'cancelled';
  attendees: number;
  maxAttendees: number;
  category: string;
}

interface DashboardStats {
  activeEvents: number;
  totalRegistrations: number;
  completedEvents: number;
  avgAttendance: number;
}

export default function ClubDashboard() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventTableRow | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [clubName, setClubName] = useState('Tech Club');
  const [stats, setStats] = useState<DashboardStats>({
    activeEvents: 0,
    totalRegistrations: 0,
    completedEvents: 0,
    avgAttendance: 0,
  });
  const [events, setEvents] = useState<EventTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const clubId = window.localStorage.getItem('clubId');
      if (!clubId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch dashboard stats
        const statsResponse = await fetch(`/api/club/dashboard?clubId=${clubId}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setClubName(statsData.clubName || 'Tech Club');
          setStats(statsData.stats);
        }

        // Fetch events
        const eventsResponse = await fetch(`/api/club/events/list?clubId=${clubId}`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData.events || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get recent events (latest 2)
  const recentEvents = events.slice(0, 2);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Club Dashboard" userRole="club" />
      <Sidebar
        items={sidebarItems}
        onLogout={() => router.push('/')}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Welcome back, {clubName}!</h1>
            <p className="text-[#666666]">Manage your events and team collaborations.</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-4 gap-6 mb-12"
          >
            <motion.div variants={item}>
              <StatsCard
                title="Active Events"
                value={isLoading ? '-' : String(stats.activeEvents)}
                icon={<Calendar size={32} />}
                color="primary"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="Total Registrations"
                value={isLoading ? '-' : String(stats.totalRegistrations)}
                icon={<Users size={32} />}
                color="success"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="Completed Events"
                value={isLoading ? '-' : String(stats.completedEvents)}
                icon={<CheckCircle size={32} />}
                color="success"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="Avg Attendance"
                value={isLoading ? '-' : `${stats.avgAttendance}%`}
                icon={<BarChart3 size={32} />}
                color="primary"
              />
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-6 mb-12 border border-[#E8E8E8]"
          >
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/club/create-event')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B1E26] to-[#6B1520] text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                <Plus size={20} />
                Create New Event
              </motion.button>
            </div>
          </motion.div>

          {/* Recent Events Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-[#2D2D2D] mb-6">Your Recent Events</h2>
            {isLoading ? (
              <div className="text-center py-8 text-[#666666]">Loading events...</div>
            ) : recentEvents.length === 0 ? (
              <div className="text-center py-8 text-[#666666]">No events created yet. Create your first event!</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {recentEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <EventCard {...event} onClick={() => setSelectedEvent(event)} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Events Table */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#2D2D2D] mb-6">Event Management</h2>
            <div className="bg-white rounded-xl overflow-hidden border border-[#E8E8E8]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E8E8E8]">
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Event Title</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">
                        Registrations
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-[#666666]">
                          Loading events...
                        </td>
                      </tr>
                    ) : events.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-[#666666]">
                          No events found. Create your first event!
                        </td>
                      </tr>
                    ) : (
                      events.map((event) => (
                        <motion.tr
                          key={event.id}
                          whileHover={{ backgroundColor: '#F8F9FA' }}
                          className="border-b border-[#E8E8E8]"
                        >
                          <td className="px-6 py-4 text-[#2D2D2D] font-medium">{event.title}</td>
                          <td className="px-6 py-4 text-[#666666]">{event.date}</td>
                          <td className="px-6 py-4">
                            {event.status === 'approved' && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Approved
                              </span>
                            )}
                            {event.status === 'pending' && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                Pending
                              </span>
                            )}
                            {event.status === 'cancelled' && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                Cancelled
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[#2D2D2D]">
                            {event.attendees}/{event.maxAttendees}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowEventModal(true);
                                }}
                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              >
                                <Eye size={18} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                              >
                                <Edit size={18} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Event Details Modal */}
      <Modal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        title={selectedEvent?.title}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#666666]">Date</p>
              <p className="font-bold text-[#2D2D2D]">{selectedEvent.date}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">Time</p>
              <p className="font-bold text-[#2D2D2D]">{selectedEvent.time}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">Location</p>
              <p className="font-bold text-[#2D2D2D]">{selectedEvent.location}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">Status</p>
              <p className="font-bold text-[#2D2D2D]">
                {selectedEvent.status === 'approved' ? '✓ Approved' : selectedEvent.status === 'pending' ? '○ Pending' : '✕ Cancelled'}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">Registrations</p>
              <p className="font-bold text-[#2D2D2D]">
                {selectedEvent.attendees} / {selectedEvent.maxAttendees}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
