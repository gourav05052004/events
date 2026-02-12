'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { EventCard } from '@/components/event-card';
import { Modal } from '@/components/modal';
import { StatusBadge } from '@/components/status-badge';
import {
  Calendar,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  Eye,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/club/dashboard' },
  { label: 'My Events', href: '/club/events', active: true },
  { label: 'Create Event', href: '/club/create-event' },
  { label: 'Team', href: '/club/team' },
  { label: 'Settings', href: '/club/settings' },
];

interface ClubEvent {
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

type ViewMode = 'grid' | 'table';

export default function ClubEventsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClubEvent['status']>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const clubId = window.localStorage.getItem('clubId');
      console.log('Fetching events for clubId:', clubId);
      
      if (!clubId) {
        console.warn('No clubId found in localStorage');
        setIsLoading(false);
        return;
      }

      try {
        const url = `/api/club/events/list?clubId=${clubId}`;
        console.log('Fetching from:', url);
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Events received:', data.events?.length || 0, data.events);
          setClubEvents(data.events || []);
          toast.success(`Loaded ${data.events?.length || 0} events`);
        } else {
          const error = await response.json();
          console.error('Failed to fetch events:', error);
          toast.error('Failed to load events');
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.error('Error loading events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return clubEvents.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clubEvents, searchQuery, statusFilter]);

  const totalRegistrations = clubEvents.reduce((sum, event) => sum + event.attendees, 0);
  const totalCapacity = clubEvents.reduce((sum, event) => sum + event.maxAttendees, 0);
  const avgFillRate = totalCapacity === 0 ? 0 : Math.round((totalRegistrations / totalCapacity) * 100);

  const openDetails = (event: ClubEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/club/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setClubEvents(clubEvents.filter((e) => e.id !== eventId));
        toast.success('Event deleted successfully');
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error deleting event');
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="My Events" userRole="club" />
      <Sidebar
        items={sidebarItems}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Your Events</h1>
                <p className="text-[#666666]">
                  Track approvals, manage registrations, and keep your events on schedule.
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/club/create-event')}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#8B1E26] to-[#6B1520] text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  <Plus size={18} />
                  Create Event
                </motion.button>

              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 md:grid-cols-3 mb-8"
          >
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-5">
              <p className="text-sm text-[#666666]">Active Events</p>
              <p className="text-2xl font-bold text-[#2D2D2D]">
                {clubEvents.filter((event) => event.status === 'approved').length}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-[#666666]">
                <Calendar size={16} className="text-[#8B1E26]" />
                Live and upcoming
              </div>
            </div>
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-5">
              <p className="text-sm text-[#666666]">Pending Approvals</p>
              <p className="text-2xl font-bold text-[#2D2D2D]">
                {clubEvents.filter((event) => event.status === 'pending').length}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-[#666666]">
                <Filter size={16} className="text-[#8B1E26]" />
                Awaiting review
              </div>
            </div>
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-5">
              <p className="text-sm text-[#666666]">Avg Fill Rate</p>
              <p className="text-2xl font-bold text-[#2D2D2D]">{avgFillRate}%</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-[#666666]">
                <Users size={16} className="text-[#8B1E26]" />
                {totalRegistrations} total registrations
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#E8E8E8] p-5 mb-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-[#8B1E26]" size={18} />
                <input
                  type="text"
                  placeholder="Search by event, category, or venue"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-3.5 text-[#8B1E26]" size={16} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="pl-9 pr-4 py-2.5 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 border border-[#E8E8E8] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'grid'
                        ? 'bg-[#8B1E26] text-white'
                        : 'text-[#666666] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'table'
                        ? 'bg-[#8B1E26] text-white'
                        : 'text-[#666666] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#666666] mb-4"
          >
            Showing {filteredEvents.length} of {clubEvents.length} events
          </motion.p>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-[#E8E8E8] rounded-xl py-16 text-center"
            >
              <div className="w-12 h-12 border-4 border-[#8B1E26] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#666666]">Loading events...</p>
            </motion.div>
          )}

          {!isLoading && filteredEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-[#E8E8E8] rounded-xl py-16 text-center"
            >
              <p className="text-lg font-medium text-[#2D2D2D] mb-2">No events found</p>
              <p className="text-[#666666] mb-6">Try adjusting your filters or create a new event.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/club/create-event')}
                className="px-6 py-3 bg-gradient-to-r from-[#8B1E26] to-[#6B1520] text-white rounded-lg font-bold"
              >
                Create Event
              </motion.button>
            </motion.div>
          )}

          {filteredEvents.length > 0 && viewMode === 'grid' && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <EventCard
                    id={event.id}
                    title={event.title}
                    date={event.date}
                    time={event.time}
                    location={event.location}
                    image={event.image}
                    status={event.status}
                    attendees={event.attendees}
                    maxAttendees={event.maxAttendees}
                    onClick={() => openDetails(event)}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-[#666666]">{event.category}</span>
                    <button
                      onClick={() => openDetails(event)}
                      className="text-sm font-bold text-[#8B1E26] hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.section>
          )}

          {filteredEvents.length > 0 && viewMode === 'table' && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E8E8E8]">
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Event</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">
                        Registrations
                      </th>
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
                        className="border-b border-[#E8E8E8]"
                      >
                        <td className="px-6 py-4 text-[#2D2D2D] font-medium">{event.title}</td>
                        <td className="px-6 py-4 text-[#666666]">
                          {event.date} - {event.time}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={event.status} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-[#2D2D2D]">
                          {event.attendees}/{event.maxAttendees}
                        </td>
                        <td className="px-6 py-4 text-[#666666]">{event.location}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openDetails(event)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                            >
                              <Pencil size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          )}
        </div>
      </div>

      <Modal open={showEventModal} onClose={() => setShowEventModal(false)} title={selectedEvent?.title} size="lg">
        {selectedEvent && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Calendar className="text-[#8B1E26]" size={20} />
                <div>
                  <p className="text-sm text-[#666666]">Date</p>
                  <p className="font-bold text-[#2D2D2D]">{selectedEvent.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-[#8B1E26]" size={20} />
                <div>
                  <p className="text-sm text-[#666666]">Registrations</p>
                  <p className="font-bold text-[#2D2D2D]">
                    {selectedEvent.attendees}/{selectedEvent.maxAttendees}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-[#8B1E26]" size={20} />
                <div>
                  <p className="text-sm text-[#666666]">Venue</p>
                  <p className="font-bold text-[#2D2D2D]">{selectedEvent.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Filter className="text-[#8B1E26]" size={20} />
                <div>
                  <p className="text-sm text-[#666666]">Status</p>
                  <StatusBadge status={selectedEvent.status} size="sm" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/event/${selectedEvent.id}`)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#8B1E26] to-[#6B1520] text-white rounded-lg font-bold"
              >
                <Eye size={18} />
                Open Public Page
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/club/create-event')}
                className="flex items-center gap-2 px-5 py-3 border-2 border-[#8B1E26] text-[#8B1E26] rounded-lg font-bold"
              >
                <Pencil size={18} />
                Edit Event
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
