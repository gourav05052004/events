'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { StatsCard } from '@/components/stats-card';
import { Modal } from '@/components/modal';
import {
  Calendar,
  Users,
  Building2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard', active: true },
  { label: 'Events', href: '/admin/events' },
  { label: 'Clubs', href: '/admin/clubs' },
  { label: 'Venues', href: '/admin/venues' },
];

interface PendingEvent {
  _id?: string;
  id?: string;
  title: string;
  organizer?: string;
  date?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'pending' | 'approved' | 'rejected';
  venueType?: string;
  requestedCapacity?: number;
}

interface DashboardStats {
  totalEvents: number;
  totalClubs: number;
  totalVenues: number;
  pendingEventsCount: number;
  eventsByStatus: {
    approved: number;
    pending: number;
    rejected: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventAction, setEventAction] = useState<'approve' | 'reject' | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingEvent[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalClubs: 0,
    totalVenues: 0,
    pendingEventsCount: 0,
    eventsByStatus: { approved: 0, pending: 0, rejected: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch events
        const eventsRes = await fetch('/api/admin/events');
        const eventsData = eventsRes.ok ? await eventsRes.json() : { data: [] };
        const allEvents = eventsData.data || [];
        
        // Fetch clubs
        const clubsRes = await fetch('/api/admin/clubs');
        const clubsData = clubsRes.ok ? await clubsRes.json() : { data: [] };
        const allClubs = clubsData.data || [];
        
        // Fetch venues
        const venuesRes = await fetch('/api/admin/venues');
        const venuesData = venuesRes.ok ? await venuesRes.json() : { data: [] };
        const allVenues = venuesData.data || [];

        if (!eventsRes.ok || !clubsRes.ok || !venuesRes.ok) {
          toast.error('Failed to load some dashboard data');
        } else {
          toast.success('Dashboard loaded successfully');
        }

        // Count events by status
        const eventsByStatus = {
          approved: allEvents.filter((e: any) => e.status === 'APPROVED').length,
          pending: allEvents.filter((e: any) => e.status === 'PENDING').length,
          rejected: allEvents.filter((e: any) => e.status === 'REJECTED').length,
        };

        // Get pending events for approvals table
        const pending = allEvents.filter((e: any) => e.status === 'PENDING').slice(0, 5);
        const formattedPending = pending.map((event: any) => ({
          _id: event._id,
          id: event._id,
          title: event.title,
          organizer: event.club_name || 'Unknown',
          date: event.date ? new Date(event.date).toLocaleDateString('en-GB') : 'TBD',
          status: 'PENDING',
          venueType: event.resource_type || 'Not Specified',
          requestedCapacity: event.max_participants || 0,
        }));

        setPendingApprovals(formattedPending);
        setDashboardStats({
          totalEvents: allEvents.length,
          totalClubs: allClubs.length,
          totalVenues: allVenues.length,
          pendingEventsCount: eventsByStatus.pending,
          eventsByStatus,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error loading dashboard data');
        // Set default values on error
        setPendingApprovals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleEventAction = (event: PendingEvent, action: 'approve' | 'reject') => {
    setSelectedEvent(event);
    setEventAction(action);
    setShowEventModal(true);
  };

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
      <Navbar title="Admin Dashboard" userRole="admin" />
      <Sidebar
        items={sidebarItems}
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
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Welcome, Administrator</h1>
            <p className="text-[#666666]">Manage all events, venues, and oversee campus activities.</p>
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
                title="Total Events"
                value={dashboardStats.totalEvents.toString()}
                icon={<Calendar size={32} />}
                color="primary"
                trend={{ value: Math.max(0, dashboardStats.eventsByStatus.pending), direction: 'up' }}
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="Active Clubs"
                value={dashboardStats.totalClubs.toString()}
                icon={<Users size={32} />}
                color="success"
                trend={{ value: Math.max(0, dashboardStats.totalClubs), direction: 'up' }}
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="Venues"
                value={dashboardStats.totalVenues.toString()}
                icon={<Building2 size={32} />}
                color="warning"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="Pending Approval"
                value={dashboardStats.pendingEventsCount.toString()}
                icon={<AlertCircle size={32} />}
                color="danger"
              />
            </motion.div>
          </motion.div>

          {/* Pending Approvals Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#2D2D2D]">Pending Approvals</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/admin/events')}
                className="text-[#8B1E26] font-bold hover:underline"
              >
                View All →
              </motion.button>
            </div>

            {pendingApprovals.length > 0 ? (
              <div className="bg-white rounded-xl overflow-hidden border border-[#E8E8E8]">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F8F9FA] border-b border-[#E8E8E8]">
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Event</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Organizer</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Venue</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApprovals.map((event) => (
                        <motion.tr
                          key={event.id}
                          whileHover={{ backgroundColor: '#F8F9FA' }}
                          className="border-b border-[#E8E8E8]"
                        >
                          <td className="px-6 py-4 text-[#2D2D2D] font-medium">{event.title}</td>
                          <td className="px-6 py-4 text-[#666666]">{event.organizer}</td>
                          <td className="px-6 py-4 text-[#666666]">{event.date}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {event.venueType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#2D2D2D]">{event.requestedCapacity}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border border-[#E8E8E8]">
                <CheckCircle className="text-[#10B981] mx-auto mb-4" size={48} />
                <p className="text-[#666666] text-lg">No pending approvals</p>
              </div>
            )}
          </motion.section>

          {/* Quick Stats Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Events Overview */}
            <div className="bg-white rounded-xl p-6 border border-[#E8E8E8]">
              <h3 className="text-xl font-bold text-[#2D2D2D] mb-4">Event Status Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Approved Events</span>
                  <span className="font-bold text-green-600">{dashboardStats.eventsByStatus.approved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Pending Review</span>
                  <span className="font-bold text-yellow-600">{dashboardStats.eventsByStatus.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Rejected Events</span>
                  <span className="font-bold text-red-600">{dashboardStats.eventsByStatus.rejected}</span>
                </div>
              </div>
            </div>

            {/* Venue Allocation */}
            <div className="bg-white rounded-xl p-6 border border-[#E8E8E8]">
              <h3 className="text-xl font-bold text-[#2D2D2D] mb-4">Venue Allocation</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Main Auditorium</span>
                  <span className="font-bold text-[#8B1E26]">8 events</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Conference Hall</span>
                  <span className="font-bold text-[#8B1E26]">6 events</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Lab Spaces</span>
                  <span className="font-bold text-[#8B1E26]">12 events</span>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Event Action Modal */}
      <Modal
        open={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEventAction(null);
        }}
        title={selectedEvent?.title}
        size="lg"
        footer={
          eventAction ? (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowEventModal(false);
                  setEventAction(null);
                }}
                className="px-6 py-2 border-2 border-[#E8E8E8] text-[#2D2D2D] rounded-lg font-bold hover:bg-[#F8F9FA] transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowEventModal(false);
                  setEventAction(null);
                }}
                className={`px-6 py-2 text-white rounded-lg font-bold transition-all ${
                  eventAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {eventAction === 'approve' ? 'Approve Event' : 'Reject Event'}
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEventModal(false)}
              className="px-6 py-2 bg-[#8B1E26] text-white rounded-lg font-bold hover:bg-[#6B1520] transition-all"
            >
              Close
            </motion.button>
          )
        }
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#666666]">Organizer</p>
              <p className="font-bold text-[#2D2D2D]">{selectedEvent.organizer}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666]">Date</p>
              <p className="font-bold text-[#2D2D2D]">{selectedEvent.date}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#666666]">Venue Type</p>
                <p className="font-bold text-[#2D2D2D]">{selectedEvent.venueType}</p>
              </div>
              <div>
                <p className="text-sm text-[#666666]">Requested Capacity</p>
                <p className="font-bold text-[#2D2D2D]">{selectedEvent.requestedCapacity}</p>
              </div>
            </div>
            {eventAction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  eventAction === 'approve'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                <p className="text-sm">
                  {eventAction === 'approve'
                    ? 'Are you sure you want to approve this event? The organizer will be notified.'
                    : 'Are you sure you want to reject this event? The organizer will be notified with feedback.'}
                </p>
              </motion.div>
            )}
          </div>
        )}
      </Modal>
    </main>
  );
}
