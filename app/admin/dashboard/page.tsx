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
  AcademicYearSelector,
  getAcademicYearRange,
  getAcademicYears,
} from '@/components/academic-year-selector';
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

interface APIEvent {
  _id: string;
  title?: string;
  club_name?: string;
  date?: string | Date;
  resource_type?: string;
  max_participants?: number;
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
  venueAllocation?: { name?: string; count: number }[];
  registrationOverview?: {
    total: number;
    avgPerEvent: number;
    topEvents?: { _id?: string; id?: string; title?: string; count: number }[];
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEvent] = useState<PendingEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventAction, setEventAction] = useState<'approve' | 'reject' | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingEvent[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalClubs: 0,
    totalVenues: 0,
    pendingEventsCount: 0,
    eventsByStatus: { approved: 0, pending: 0, rejected: 0 },
      registrationOverview: { total: 0, avgPerEvent: 0, topEvents: [] },
  });

  const { activeStartYear } = getAcademicYears();
  const [selectedYear, setSelectedYear] = useState<number>(activeStartYear);

  const [, setIsLoading] = useState(true);

  // Fetch dashboard data from APIs
  useEffect(() => {
    // Polyfill client Performance methods that some environments may not implement.
    if (typeof window !== 'undefined' && typeof performance !== 'undefined') {
      const p = performance as unknown as { clearMarks?: Function; clearMeasures?: Function };
      if (typeof p.clearMarks !== 'function') p.clearMarks = () => {};
      if (typeof p.clearMeasures !== 'function') p.clearMeasures = () => {};
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const { yearStart, yearEnd } = getAcademicYearRange(selectedYear);

        const url = `/api/admin/dashboard?yearStart=${encodeURIComponent(yearStart)}&yearEnd=${encodeURIComponent(yearEnd)}`;
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          console.error('Dashboard fetch failed:', res.status, text);
          toast.error('Failed to load dashboard data');
          setPendingApprovals([]);
          return;
        }

        const json = await res.json();
        const stats = json.statistics || {};

        const formattedPending = (stats.pendingEvents || []).map((event: any) => ({
          _id: event._id?.toString?.() || event._id,
          id: event._id?.toString?.() || event._id,
          title: event.title || 'Untitled Event',
          organizer: event.organizer || 'Unknown',
          date: event.date ? new Date(event.date).toLocaleDateString('en-GB') : 'TBD',
          status: 'PENDING' as const,
          venueType: event.venue || 'Not Specified',
          requestedCapacity: event.capacity || 0,
        }));

        setPendingApprovals(formattedPending);
        setDashboardStats({
          totalEvents: stats.totalEvents || 0,
          totalClubs: stats.totalClubs || 0,
          totalVenues: stats.totalVenues || 0,
          pendingEventsCount: stats.eventsByStatus?.pending || 0,
          eventsByStatus: {
            approved: stats.eventsByStatus?.approved || 0,
            pending: stats.eventsByStatus?.pending || 0,
            rejected: stats.eventsByStatus?.rejected || 0,
          },
          registrationOverview: stats.registrationOverview || { total: 0, avgPerEvent: 0, topEvents: [] },
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
  }, [selectedYear]);

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
            <div className="flex justify-end mt-4">
              <AcademicYearSelector
                selectedYear={selectedYear}
                onChange={setSelectedYear}
              />
            </div>
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
                          key={event._id}
                          whileHover={{ backgroundColor: '#F8F9FA' }}
                          className="border-b border-[#E8E8E8] cursor-pointer"
                          onClick={() => router.push(`/admin/events/${event._id}`)}
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

            {/* Registration Overview */}
            <div className="bg-white rounded-xl p-6 border border-[#E8E8E8]">
              <h3 className="text-xl font-bold text-[#2D2D2D] mb-4">Registration Overview</h3>
              <div className="space-y-3">
                <div className="border-t mt-3 pt-3">
                  <p className="text-[#666666] mb-2">Top Registered Events:</p>
                  <div className="space-y-2">
                    {(dashboardStats.registrationOverview?.topEvents && dashboardStats.registrationOverview.topEvents.length > 0) ? (
                      dashboardStats.registrationOverview.topEvents.map((e) => {
                        const eventId = e._id ?? e.id ?? (e as { eventId?: string }).eventId;

                        const handleNavigate = async () => {
                          console.log('Top registered event clicked:', { id: eventId, title: e.title });
                          let idToNavigate = eventId;
                          if (!idToNavigate) {
                            try {
                              const res = await fetch('/api/admin/events');
                              if (res.ok) {
                                const body = await res.json();
                                const list = Array.isArray(body) ? body : (body.events || body.items || []);
                                const found = list.find((it: any) => it && (it._id === e._id || it.id === e.id || it.title === e.title || it.name === e.title));
                                idToNavigate = found?._id ?? found?.id ?? found?.eventId ?? idToNavigate;
                              } else {
                                console.warn('Fallback events lookup failed:', res.status);
                              }
                            } catch (err) {
                              console.error('Error fetching events for lookup', err);
                            }
                          }

                          if (idToNavigate) {
                            router.push(`/admin/events/${String(idToNavigate)}`);
                          } else {
                            toast.error('Could not find event to open');
                          }
                        };

                        const handleKeyDown = (ev: React.KeyboardEvent) => {
                          if (ev.key === 'Enter' || ev.key === ' ') {
                            ev.preventDefault();
                            void handleNavigate();
                          }
                        };

                        return (
                          <div key={eventId ?? e.title} className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => void handleNavigate()}
                              onKeyDown={handleKeyDown}
                              aria-label={e.title ? `Open event ${e.title}` : `Open event ${eventId}`}
                              className={`text-[#666666] ${eventId ? 'cursor-pointer hover:text-red-700 transition-colors duration-150' : ''}`}
                            >
                              {e.title}
                            </button>
                            <span className="bg-red-100 text-red-700 rounded-full px-2 font-bold">{e.count}</span>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[#666666]">Samosa Eating Challenge</span>
                          <span className="bg-red-100 text-red-700 rounded-full px-2 font-bold">18</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#666666]">Tech Fest 2026</span>
                          <span className="bg-red-100 text-red-700 rounded-full px-2 font-bold">14</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#666666]">Cultural Night</span>
                          <span className="bg-red-100 text-red-700 rounded-full px-2 font-bold">10</span>
                        </div>
                      </>
                    )}
                  </div>
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
