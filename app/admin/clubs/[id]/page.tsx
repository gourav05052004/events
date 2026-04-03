'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Clubs', href: '/admin/clubs', active: true },
  { label: 'Venues', href: '/admin/venues' },
];

interface Club {
  _id: string;
  club_name: string;
  email: string;
  description: string;
  logo?: string;
  is_active: boolean;
  created_at: string;
  facultyCoordinator: {
    name: string;
    email: string;
    phone: string;
    department: string;
    office: string;
  };
  president: {
    name: string;
    email: string;
    phone: string;
    department: string;
    office: string;
  };
}

interface ClubEvent {
  _id: string;
  title: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'CANCELLED';
  capacity: number;
  venueName: string;
  venueLocation: string;
  registrationCount: number;
}

interface ClubTeamMember {
  _id: string;
  name: string;
  role: string;
  email: string;
  teamName: string;
}

interface ClubSummary {
  totalEvents: number;
  approvedEvents: number;
  pendingEvents: number;
  totalRegistrations: number;
}

interface ClubDetailsResponse {
  club: Club;
  events: ClubEvent[];
  teamMembers: ClubTeamMember[];
  summary: ClubSummary;
}

export default function AdminClubDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params.id as string;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<ClubTeamMember[]>([]);
  const [summary, setSummary] = useState<ClubSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch club details
  useEffect(() => {
    fetchClubDetails();
  }, [clubId]);

  const fetchClubDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/clubs/${clubId}`);
      const data = await response.json();

      if (data.success) {
        const payload = data.data as ClubDetailsResponse;
        setClub(payload.club);
        setEvents(payload.events || []);
        setTeamMembers(payload.teamMembers || []);
        setSummary(payload.summary || null);
        setError('');
      } else {
        setError(data.error || 'Failed to load club details');
      }
    } catch (err) {
      setError('An error occurred while loading club details');
      console.error('Error fetching club:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: ClubEvent['status']) => {
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

  const sortedEvents = [...events].sort((a, b) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const aUpcoming = dateA >= today;
    const bUpcoming = dateB >= today;

    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;
    if (aUpcoming && bUpcoming) return dateA.getTime() - dateB.getTime();
    return dateB.getTime() - dateA.getTime();
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Club Details" userRole="admin" />
        <Sidebar
          items={sidebarItems}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="md:ml-64 pt-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-[#E8E8E8] border-t-[#8B1E26] rounded-full animate-spin" />
                <p className="text-[#666666]">Loading club details...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!club) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Club Details" userRole="admin" />
        <Sidebar
          items={sidebarItems}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="md:ml-64 pt-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <p className="text-[#666666] text-lg mb-6">Club not found</p>
              <button
                onClick={fetchClubDetails}
                className="px-4 py-2 bg-[#8B1E26] text-white rounded-lg font-medium hover:bg-[#6B1620]"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Club Details" userRole="admin" />
      <Sidebar
        items={sidebarItems}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#8B1E26] hover:text-[#6B1620] mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </motion.button>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div>
                  <p className="text-red-700 font-medium mb-2">Unable to load club details</p>
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                  <button
                    onClick={fetchClubDetails}
                    className="px-4 py-2 bg-[#8B1E26] text-white rounded-lg font-medium hover:bg-[#6B1620]"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white rounded-xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-4">
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={club.club_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#8B1E26]/10 text-[#8B1E26] flex items-center justify-center text-2xl font-bold border-2 border-gray-200">
                  {club.club_name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#2D2D2D]">{club.club_name}</h1>
                <p className="text-[#666666] mt-1">{club.email}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  club.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {club.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </motion.div>

          {/* Stats Row */}
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-blue-600">{summary.totalEvents}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">Approved Events</p>
                <p className="text-2xl font-bold text-green-600">{summary.approvedEvents}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">Pending Events</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.pendingEvents}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">Total Registrations</p>
                <p className="text-2xl font-bold text-red-600">{summary.totalRegistrations}</p>
              </div>
            </motion.div>
          )}

          {/* Club Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">Club Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Faculty Coordinator</p>
                <p className="font-medium text-[#2D2D2D]">{club.facultyCoordinator.name || 'N/A'}</p>
                {club.facultyCoordinator.email && (
                  <p className="text-gray-600">{club.facultyCoordinator.email}</p>
                )}
                {club.facultyCoordinator.phone && (
                  <p className="text-gray-600">{club.facultyCoordinator.phone}</p>
                )}
              </div>

              <div>
                <p className="text-gray-500 mb-1">President / Club Head</p>
                <p className="font-medium text-[#2D2D2D]">{club.president.name || 'N/A'}</p>
                {club.president.email && <p className="text-gray-600">{club.president.email}</p>}
                {club.president.phone && <p className="text-gray-600">{club.president.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-500 mb-1">Description</p>
                <p className="text-[#2D2D2D]">{club.description || 'No description available.'}</p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Created Date</p>
                <p className="text-[#2D2D2D]">
                  {new Date(club.created_at).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Contact Email</p>
                <p className="text-[#2D2D2D]">{club.email}</p>
              </div>
            </div>
          </motion.div>

          {/* Events Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8"
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#2D2D2D]">Club Events</h2>
            </div>

            {sortedEvents.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">This club has no events yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E8E8E8]">
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Event Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Venue</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Registrations</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEvents.map((event) => (
                      <tr
                        key={event._id}
                        onClick={() => router.push(`/admin/events/${event._id}`)}
                        className="border-b border-[#E8E8E8] hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 text-[#2D2D2D] font-medium">{event.title}</td>
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
                        <td className="px-6 py-4 text-[#666666]">{event.venueName}</td>
                        <td className="px-6 py-4 text-[#2D2D2D]">{event.registrationCount}</td>
                        <td className="px-6 py-4 text-[#2D2D2D]">{event.capacity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Team Members */}
          {teamMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">Team Members</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {teamMembers.map((member) => (
                  <div key={member._id} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p className="font-bold text-[#2D2D2D]">{member.name}</p>
                    <p className="text-gray-600">{member.role}</p>
                    {member.email && <p className="text-gray-500 mt-1">{member.email}</p>}
                    <p className="text-gray-400 mt-1">{member.teamName}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
