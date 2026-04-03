'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { StatsCard } from '@/components/stats-card';
import { EventCard } from '@/components/event-card';
import { Modal } from '@/components/modal';
import {
  AcademicYearSelector,
  getAcademicYearRange,
  getAcademicYears,
} from '@/components/academic-year-selector';
import {
  Calendar,
  Users,
  CheckCircle,
  Plus,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Upload,
  Info,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/club/dashboard', active: true },
  { label: 'My Events', href: '/club/events' },
  { label: 'Create Event', href: '/club/create-event' },
  { label: 'Leadership', href: '/club/team' },
  { label: 'Settings', href: '/club/settings' },
];

interface EventTableRow {
  id: string;
  title: string;
  date: string;
  startDate?: string;
  endDate?: string;
  time: string;
  location: string;
  image: string;
  status: 'pending' | 'approved' | 'cancelled' | 'rejected';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventTableRow | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [clubName, setClubName] = useState('Tech Club');
  const [clubDescription, setClubDescription] = useState('');
  const [clubLogo, setClubLogo] = useState('');
  const [brandColor, setBrandColor] = useState('#8B1E26');
  const [facultyCoordinator, setFacultyCoordinator] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    activeEvents: 0,
    totalRegistrations: 0,
    completedEvents: 0,
    avgAttendance: 0,
  });
  const [events, setEvents] = useState<EventTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const { activeStartYear } = getAcademicYears();
  const [selectedYear, setSelectedYear] = useState(activeStartYear);

  const resolveClubId = async () => {
    const storedClubId = window.localStorage.getItem('clubId');
    if (storedClubId) {
      return storedClubId;
    }

    try {
      const response = await fetch('/api/club/me');
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const clubId = data?.club?.id;
      if (clubId) {
        window.localStorage.setItem('clubId', clubId);
        return clubId as string;
      }
    } catch (error) {
      console.error('Failed to resolve club ID:', error);
    }

    return null;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const clubId = await resolveClubId();
      if (!clubId) {
        setIsLoading(false);
        toast.error('Session expired. Please login again.');
        router.push('/login?role=club');
        return;
      }

      try {
        console.log('[fetchDashboardData] Starting fetch for clubId:', clubId);
        const { yearStart, yearEnd } = getAcademicYearRange(selectedYear);
        
        // Fetch dashboard stats
        const statsResponse = await fetch(
          `/api/club/dashboard?clubId=${clubId}&yearStart=${encodeURIComponent(yearStart)}&yearEnd=${encodeURIComponent(yearEnd)}`
        );
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('[fetchDashboardData] 📥 Dashboard data - Logo:', statsData.clubLogo || '❌ NO LOGO IN DATABASE');
          
          setClubName(statsData.clubName || 'Tech Club');
          setClubDescription(statsData.clubDescription || '');
          setClubLogo(statsData.clubLogo || '');
          setBrandColor(statsData.brandColor || '#8B1E26');
          setFacultyCoordinator(statsData.facultyCoordinator || '');
          setStats(statsData.stats);
        }

        // Fetch events
        const eventsResponse = await fetch(
          `/api/club/events/list?clubId=${clubId}&yearStart=${encodeURIComponent(yearStart)}&yearEnd=${encodeURIComponent(yearEnd)}`
        );
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
  }, [router, selectedYear]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const clubId = window.localStorage.getItem('clubId');
    if (!clubId) {
      toast.error('Club ID not found');
      return;
    }

    try {
      setIsUploadingLogo(true);
      console.log('[handleLogoUpload] Starting upload:', { clubId, fileName: file.name, fileSize: file.size });
      
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('clubId', clubId);

      console.log('[handleLogoUpload] Sending request to /api/admin/clubs');
      
      const response = await fetch('/api/admin/clubs', {
        method: 'PUT',
        body: formData,
      });

      console.log('[handleLogoUpload] Response received:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const error = await response.json();
        console.error('[handleLogoUpload] Error response:', error);
        throw new Error(error.error || error.details || 'Failed to upload logo');
      }

      const data = await response.json();
      console.log('[handleLogoUpload] ✅ Upload successful - Logo URL:', data.club.logo);

      // Update state with the newly uploaded logo
      setClubLogo(data.club.logo);
      toast.success('Club logo updated successfully');

      // Refresh dashboard data to ensure logo persists
      console.log('[handleLogoUpload] 🔄 Refreshing dashboard data...');
      const { yearStart, yearEnd } = getAcademicYearRange(selectedYear);
      const dashboardResponse = await fetch(
        `/api/club/dashboard?clubId=${clubId}&yearStart=${encodeURIComponent(yearStart)}&yearEnd=${encodeURIComponent(yearEnd)}`
      );
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        console.log('[handleLogoUpload] ✅ Dashboard refreshed - Logo URL:', dashboardData.clubLogo || '❌ NO LOGO IN RESPONSE');
        setClubLogo(dashboardData.clubLogo || '');
      }
    } catch (error) {
      console.error('[handleLogoUpload] Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Get recent events (latest 2)
  const recentEvents = events.slice(0, 2);

  // Helper to format plain date string to readable date (e.g., 31 Mar 2026)
  const formatSimpleDate = (isoDate?: string) => {
    try {
      if (!isoDate) return '';
      const d = new Date(isoDate);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoDate || '';
    }
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
      <Navbar title="Club Dashboard" userRole="club" />
      <Sidebar
        items={sidebarItems}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Club Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 rounded-2xl overflow-hidden border border-[#E8E8E8]"
            style={{
              background: `linear-gradient(135deg, ${brandColor}15, ${brandColor}05)`,
              borderColor: `${brandColor}30`,
            }}
          >
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Logo Section */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="shrink-0"
                >
                  <div className="relative group">
                    <div
                      className="w-40 h-40 rounded-2xl flex items-center justify-center border-4 shadow-lg"
                      style={{
                        borderColor: brandColor,
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      {clubLogo ? (
                        <img
                          src={clubLogo}
                          alt={clubName}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="text-center">
                          <div
                            className="text-5xl font-bold"
                            style={{ color: brandColor }}
                          >
                            {clubName.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs text-[#666666] mt-2">No logo</p>
                        </div>
                      )}
                    </div>

                    {/* Logo Upload Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="absolute bottom-0 right-0 p-3 rounded-full shadow-lg transition-all bg-white border-2 hover:shadow-xl"
                      style={{
                        borderColor: brandColor,
                      }}
                    >
                      <Upload
                        size={20}
                        style={{ color: brandColor }}
                      />
                    </motion.button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={isUploadingLogo}
                    />
                  </div>
                </motion.div>

                {/* Club Info Section */}
                <div className="flex-1">
                  <h1
                    className="text-5xl font-bold mb-2"
                    style={{ color: brandColor }}
                  >
                    {clubName}
                  </h1>

                  {clubDescription && (
                    <p className="text-lg text-[#555555] mb-6 leading-relaxed">
                      {clubDescription}
                    </p>
                  )}

                  {facultyCoordinator && (
                    <div className="flex items-center gap-2 text-[#666666]">
                      <Info size={18} style={{ color: brandColor }} />
                      <span className="font-medium">
                        Faculty Coordinator: <span className="font-bold text-[#2D2D2D]">{facultyCoordinator}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <p className="text-[#666666] text-lg">
                Welcome back! Manage your club events and collaborations below.
              </p>
              <AcademicYearSelector selectedYear={selectedYear} onChange={setSelectedYear} />
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
                title="Active Events"
                value={isLoading ? '-' : String(stats.activeEvents)}
                icon={<Calendar size={32} />}
                color="primary"
                customColor={brandColor}
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
                customColor={brandColor}
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
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                style={{
                  background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
                }}
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
                    <EventCard {...{ ...event, status: event.status === 'rejected' ? 'cancelled' : event.status }} onClick={() => setSelectedEvent(event)} />
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
                            <td className="px-6 py-4 text-[#666666]">{formatSimpleDate(event.startDate)}</td>
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
                              {event.status === 'rejected' && (
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                  Rejected
                                </span>
                              )}
                          </td>
                            <td className="px-6 py-4 text-[#2D2D2D]">
                              {event.attendees}/{event.maxAttendees}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                {/* View */}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => router.push(`/club/events/${event.id}`)}
                                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                  title="View event"
                                >
                                  <Eye size={18} />
                                </motion.button>

                                {/* Edit - only allowed when Pending */}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    if (!(event as any).isOwner || event.status !== 'pending') return;
                                    router.push(`/club/events/${event.id}/edit`);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    !(event as any).isOwner || event.status !== 'pending'
                                      ? 'opacity-40 cursor-not-allowed text-gray-400'
                                      : 'hover:bg-purple-50 text-purple-600'
                                  }`}
                                  title={!((event as any).isOwner) ? 'Only the event creator can edit this event' : (event.status !== 'pending' ? 'Only pending events can be edited' : 'Edit event')}
                                >
                                  <Edit size={18} />
                                </motion.button>

                                {/* Delete - restricted by status */}
                                {(!(event as any).isOwner) ? (
                                  <button
                                    className="p-2 opacity-40 cursor-not-allowed text-gray-400 rounded-lg"
                                    title="Only the event creator can delete this event"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                ) : event.status === 'approved' ? (
                                  <button
                                    className="p-2 opacity-40 cursor-not-allowed text-gray-400 rounded-lg"
                                    title="Approved events cannot be deleted"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      const confirmed = window.confirm(
                                        `Are you sure you want to delete ${event.title}? This action cannot be undone.`
                                      );
                                      if (!confirmed) return;

                                      try {
                                        const res = await fetch(`/api/club/events/${event.id}`, {
                                          method: 'DELETE',
                                        });
                                        const json = await res.json();
                                        if (!res.ok) {
                                          toast.error(json?.error || 'Failed to delete event');
                                          return;
                                        }
                                        setEvents((prev) => prev.filter((e) => e.id !== event.id));
                                        toast.success('Event deleted successfully');
                                      } catch (err) {
                                        console.error('Delete error', err);
                                        toast.error('Failed to delete event');
                                      }
                                    }}
                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                    title="Delete event"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
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
