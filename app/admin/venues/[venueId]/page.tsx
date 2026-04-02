'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Clubs', href: '/admin/clubs' },
  { label: 'Venues', href: '/admin/venues', active: true },
];

type AvailabilityStatus = 'available' | 'partially_booked' | 'full_booked';

type VenueDetail = {
  _id: string;
  name: string;
  type: 'HALL' | 'ROOM' | 'LAB';
  location: string;
  capacity: number;
  amenities: string[];
  manager: string;
  contact: string;
  booked_events: number;
  manual_status?: AvailabilityStatus | null;
  created_at: string;
  availability: AvailabilityStatus;
};

type VenueEvent = {
  _id: string;
  title: string;
  organizer: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'CANCELLED';
  capacity: number;
  registrationCount: number;
};

type VenueStats = {
  totalBookings: number;
  upcomingBookings: number;
  pastBookings: number;
  utilizationRate: string;
};

type VenueApiResponse = {
  success: boolean;
  data?: {
    venue: VenueDetail;
    events: VenueEvent[];
    stats: VenueStats;
  };
  error?: string;
};

export default function AdminVenueDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const venueId = params.venueId as string;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [events, setEvents] = useState<VenueEvent[]>([]);
  const [stats, setStats] = useState<VenueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  const fetchVenueDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/venues/${venueId}`);
      const data: VenueApiResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        setError(data.error || 'Failed to load venue details');
        setVenue(null);
        setEvents([]);
        setStats(null);
        return;
      }

      setVenue(data.data.venue);
      setEvents(data.data.events);
      setStats(data.data.stats);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load venue details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (venueId) {
      fetchVenueDetails();
    }
  }, [venueId]);

  const handleStatusChange = async (newStatus: AvailabilityStatus) => {
    if (!venue) return;

    try {
      setIsUpdatingStatus(true);
      setStatusError('');

      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manual_status: newStatus }),
      });

      const data: { success?: boolean; error?: string } = await response.json();

      if (!response.ok || !data.success) {
        setStatusError(data.error || 'Failed to update venue status');
        return;
      }

      setVenue((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          manual_status: newStatus,
          availability: newStatus,
        };
      });
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update venue status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const sortedEvents = useMemo(() => {
    const now = Date.now();
    return [...events].sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      const aUpcoming = aTime > now;
      const bUpcoming = bTime > now;

      if (aUpcoming !== bUpcoming) {
        return aUpcoming ? -1 : 1;
      }

      if (aUpcoming) {
        return aTime - bTime;
      }

      return bTime - aTime;
    });
  }, [events]);

  const getAvailabilityLabel = (availability: AvailabilityStatus) => {
    return availability === 'available' ? 'Available' : 'Unavailable';
  };

  const getAvailabilityClasses = (availability: AvailabilityStatus) => {
    return availability === 'available'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  const getTypeLabel = (type: VenueDetail['type']) => {
    switch (type) {
      case 'HALL':
        return 'Hall';
      case 'ROOM':
        return 'Room';
      case 'LAB':
        return 'Laboratory';
      default:
        return type;
    }
  };

  const getEventStatusClasses = (status: VenueEvent['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700';
      case 'RESCHEDULED':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statCards = stats
    ? [
        {
          label: 'Total Bookings',
          value: stats.totalBookings,
          className: 'bg-blue-50 border-blue-200 text-blue-700',
        },
        {
          label: 'Upcoming Bookings',
          value: stats.upcomingBookings,
          className: 'bg-green-50 border-green-200 text-green-700',
        },
        {
          label: 'Past Bookings',
          value: stats.pastBookings,
          className: 'bg-gray-50 border-gray-200 text-gray-700',
        },
        {
          label: 'Capacity',
          value: venue ? venue.capacity : 0,
          className: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Venue Details" userRole="admin" />
      <Sidebar
        items={sidebarItems}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/admin/venues')}
            className="flex items-center gap-2 text-[#8B1E26] font-medium mb-8 hover:gap-3 transition-all"
          >
            <ArrowLeft size={20} />
            Back to Venues
          </motion.button>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-[#E8E8E8] border-t-[#8B1E26] rounded-full animate-spin" />
                <p className="text-[#666666]">Loading venue details...</p>
              </div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-200"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-red-700 font-medium mb-2">{error}</p>
                  <button
                    onClick={fetchVenueDetails}
                    className="text-sm font-semibold text-[#8B1E26] hover:underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </motion.div>
          ) : !venue || !stats ? (
            <div className="text-center py-12">
              <p className="text-[#666666] mb-6">Venue not found</p>
              <button
                onClick={() => router.push('/admin/venues')}
                className="text-[#8B1E26] hover:underline font-medium"
              >
                Back to Venues
              </button>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-[#E8E8E8]"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-bold text-[#2D2D2D] mb-3">{venue.name}</h1>
                    <div className="flex flex-wrap gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityClasses(
                          venue.availability
                        )}`}
                      >
                        {getAvailabilityLabel(venue.availability)}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                        {getTypeLabel(venue.type)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full md:w-auto md:min-w-55">
                    <label className="block text-sm font-medium text-[#666666] mb-2">Status</label>
                    <select
                      value={venue.manual_status || venue.availability}
                      onChange={(e) => handleStatusChange(e.target.value as AvailabilityStatus)}
                      disabled={isUpdatingStatus}
                      className="w-full px-3 py-2 rounded-lg border border-[#E8E8E8] bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] disabled:opacity-60"
                    >
                      <option value="available">Available</option>
                      <option value="partially_booked">Partially Booked</option>
                      <option value="full_booked">Fully Booked</option>
                    </select>
                    {statusError && <p className="text-xs text-red-600 mt-2">{statusError}</p>}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              >
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className={`rounded-xl border p-4 ${card.className}`}
                  >
                    <p className="text-sm font-medium mb-2">{card.label}</p>
                    <p className="text-2xl font-bold text-[#2D2D2D]">{card.value}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8] mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={20} className="text-[#8B1E26]" />
                  <h2 className="text-2xl font-bold text-[#2D2D2D]">Venue Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#666666]">Location</p>
                    <p className="font-medium text-[#2D2D2D]">{venue.location}</p>
                  </div>
                  <div>
                    <p className="text-[#666666]">Incharge</p>
                    <p className="font-medium text-[#2D2D2D]">{venue.manager}</p>
                  </div>
                  <div>
                    <p className="text-[#666666]">Contact Email</p>
                    <p className="font-medium text-[#2D2D2D]">{venue.contact}</p>
                  </div>
                  <div>
                    <p className="text-[#666666]">Type</p>
                    <p className="font-medium text-[#2D2D2D]">{getTypeLabel(venue.type)}</p>
                  </div>
                  <div>
                    <p className="text-[#666666]">Created</p>
                    <p className="font-medium text-[#2D2D2D]">
                      {new Date(venue.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#666666]">Utilization Rate</p>
                    <p className="font-medium text-[#2D2D2D]">{stats.utilizationRate}%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={20} className="text-[#8B1E26]" />
                  <h2 className="text-2xl font-bold text-[#2D2D2D]">Event Bookings at this Venue</h2>
                </div>

                {sortedEvents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#E8E8E8]">
                          <th className="px-4 py-3 text-left font-bold text-[#2D2D2D]">Event Name</th>
                          <th className="px-4 py-3 text-left font-bold text-[#2D2D2D]">Organizer</th>
                          <th className="px-4 py-3 text-left font-bold text-[#2D2D2D]">Date</th>
                          <th className="px-4 py-3 text-left font-bold text-[#2D2D2D]">Status</th>
                          <th className="px-4 py-3 text-left font-bold text-[#2D2D2D]">Registrations</th>
                          <th className="px-4 py-3 text-left font-bold text-[#2D2D2D]">Capacity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedEvents.map((event) => (
                          <motion.tr
                            key={event._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => router.push(`/admin/events/${event._id}`)}
                            className="border-b border-[#E8E8E8] hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 text-[#2D2D2D] font-medium">{event.title}</td>
                            <td className="px-4 py-3 text-[#666666]">{event.organizer}</td>
                            <td className="px-4 py-3 text-[#666666]">
                              {new Date(event.date).toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getEventStatusClasses(
                                  event.status
                                )}`}
                              >
                                {event.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#666666]">{event.registrationCount}</td>
                            <td className="px-4 py-3 text-[#666666]">{event.capacity}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[#666666]">No events have been booked at this venue yet</p>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
