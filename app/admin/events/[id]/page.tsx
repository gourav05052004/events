// d:\events\event\app\admin\events\[id]\page.tsx

'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { formatDateRange } from '@/lib/utils';
import { ArrowLeft, Calendar, MapPin, Users, Check, X, AlertCircle, FileText, Edit2, Save, Loader, Clock } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Events', href: '/admin/events', active: true },
  { label: 'Clubs', href: '/admin/clubs' },
  { label: 'Venues', href: '/admin/venues' },
];

interface Registration {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  status: 'CONFIRMED' | 'WAITLISTED';
  registeredOn: string;
}

interface Venue {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  type: 'HALL' | 'ROOM' | 'LAB';
  amenities: string[];
  bookedEvents: number;
  availability: 'available' | 'partially_booked' | 'full_booked';
  manager: string;
  contact: string;
  hasTimeConflict?: boolean;
  conflictingEvent?: {
    _id: string;
    title: string;
    start_time: string;
    end_time: string;
  };
}

interface EventDetail {
  _id: string;
  title: string;
  description: string;
  primary_club_id: {
    club_name: string;
    email: string;
    faculty_coordinator_name: string;
  };
  date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  location: string;
  status: 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'CANCELLED';
  max_participants: number;
  min_participants: number;
  event_type: string;
  requested_resource_type: string;
  allocated_resource_id: {
    _id: string;
    name: string;
    resource_type: string;
    location: string;
  } | string | null;
  created_at: string;
  registrations: Registration[];
  registration_summary: {
    total: number;
    confirmed: number;
    waitlisted: number;
    available_spots: number;
  };
}

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState('PENDING');
  const [editedDescription, setEditedDescription] = useState('');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');

  // Fetch event details
  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  // Fetch venues when event data is available
  useEffect(() => {
    if (event) {
      fetchVenues();
    }
  }, [event?.date, event?.start_time, event?.end_time]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/events/${eventId}`);
      const data = await response.json();

      if (data.success) {
        setEvent(data.data);
        setNewStatus(data.data.status);
        setEditedDescription(data.data.description);
        // Handle allocated_resource_id as object or string
        const resourceId = typeof data.data.allocated_resource_id === 'object' 
          ? data.data.allocated_resource_id?._id 
          : data.data.allocated_resource_id;
        setSelectedVenueId(resourceId || '');
        setError('');
      } else {
        setError('Failed to load event details');
      }
    } catch (err) {
      setError('An error occurred while loading event details');
      console.error('Error fetching event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      if (!event || !event.date || !event.start_time || !event.end_time) {
        return;
      }

      // Convert date to ISO string for API
      const eventDate = new Date(event.date);
      const eventDateISO = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD

      const params = new URLSearchParams({
        eventDate: eventDateISO,
        startTime: event.start_time,
        endTime: event.end_time,
        eventId: eventId, // Exclude current event from conflict check
      });

      const response = await fetch(`/api/admin/venues?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        // Use data.data which contains only available venues (no conflicts)
        setVenues(data.data);
      } else {
        console.error('Failed to load venues');
      }
    } catch (err) {
      console.error('Error fetching venues:', err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!event) return;

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          description: editedDescription,
          allocated_resource_id: selectedVenueId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update event');
        return;
      }

      setSuccess('Event updated successfully');
      fetchEventDetails();
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('An error occurred while updating the event');
      console.error('Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Check size={16} />;
      case 'PENDING':
        return <AlertCircle size={16} />;
      case 'CANCELLED':
        return <X size={16} />;
      case 'RESCHEDULED':
        return <Calendar size={16} />;
      default:
        return null;
    }
  };

  const handleDownloadExcel = () => {
    if (!event) return;
    const rows = event.registrations.map((registration) => ({
      Name: registration.name,
      'Roll Number': registration.rollNumber,
      Email: registration.email,
      Status: registration.status,
      'Registered On': new Date(registration.registeredOn).toLocaleDateString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    XLSX.writeFile(workbook, `registrations-${eventId}.xlsx`);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Event Details" userRole="admin" />
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
            onClick={() => router.push('/admin/events')}
            className="flex items-center gap-2 text-[#8B1E26] font-medium mb-8 hover:gap-3 transition-all"
          >
            <ArrowLeft size={20} />
            Back to Events
          </motion.button>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6"
            >
              <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-green-700 text-sm">{success}</p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6"
            >
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-[#E8E8E8] border-t-[#8B1E26] rounded-full animate-spin" />
                <p className="text-[#666666]">Loading event details...</p>
              </div>
            </div>
          ) : !event ? (
            <div className="text-center">
              <p className="text-[#666666] mb-6">Event not found</p>
              <button
                onClick={() => router.push('/admin/events')}
                className="text-[#8B1E26] hover:underline font-medium"
              >
                Back to Events
              </button>
            </div>
          ) : (
            <>
              {/* Event Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-[#E8E8E8]"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-[#2D2D2D] mb-4">{event.title}</h1>
                    <div className="flex flex-wrap gap-4 text-[#666666] text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        {formatDateRange(event.date, event.end_date, 'en-GB')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={18} />
                        {event.start_time} - {event.end_time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={18} />
                        {event.location || 'TBD'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={18} />
                        {event.registration_summary.total} / {event.max_participants} attendees
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 w-fit ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {getStatusIcon(event.status)}
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                    {!isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-[#8B1E26] text-[#8B1E26] rounded-lg font-medium hover:bg-[#8B1E26]/5 transition-all"
                      >
                        <Edit2 size={18} />
                        Edit Status
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FileText size={20} className="text-[#8B1E26]" />
                      <h2 className="text-2xl font-bold text-[#2D2D2D]">Description</h2>
                    </div>
                    {isEditing ? (
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] resize-none"
                        rows={4}
                      />
                    ) : (
                      <p className="text-[#666666] leading-relaxed">{event.description}</p>
                    )}
                  </motion.div>

                  {/* Location */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={20} className="text-[#8B1E26]" />
                      <h2 className="text-2xl font-bold text-[#2D2D2D]">Venue Allocation</h2>
                    </div>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            📌 The event location will automatically be set to the allocated venue name.
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                            Select Available Venue
                          </label>
                          <select
                            value={selectedVenueId}
                            onChange={(e) => setSelectedVenueId(e.target.value)}
                            className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                          >
                            <option value="">-- Select a venue --</option>
                            {venues
                              .filter((v) => v.type === event?.requested_resource_type)
                              .map((venue) => (
                                <option key={venue._id} value={venue._id}>
                                  {venue.name} ({venue.type}) - {venue.capacity} capacity
                                </option>
                              ))}
                          </select>
                          <p className="text-xs text-[#999999] mt-2">
                            Only venues available on {formatDateRange(event?.date, event?.end_date, 'en-GB')} from {event?.start_time} to {event?.end_time} are shown
                          </p>
                        </div>
                        {selectedVenueId && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            {venues.find((v) => v._id === selectedVenueId) && (
                              <div className="space-y-2 text-sm">
                                <p className="text-[#2D2D2D]">
                                  <strong>Venue:</strong>{' '}
                                  {venues.find((v) => v._id === selectedVenueId)?.name}
                                </p>
                                <p className="text-[#2D2D2D]">
                                  <strong>Location:</strong>{' '}
                                  {venues.find((v) => v._id === selectedVenueId)?.location}
                                </p>
                                <p className="text-[#2D2D2D]">
                                  <strong>Capacity:</strong>{' '}
                                  {venues.find((v) => v._id === selectedVenueId)?.capacity}
                                </p>
                                <p className="text-[#2D2D2D]">
                                  <strong>Status:</strong>{' '}
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      venues.find((v) => v._id === selectedVenueId)
                                        ?.availability === 'available'
                                        ? 'bg-green-100 text-green-700'
                                        : venues.find((v) => v._id === selectedVenueId)
                                            ?.availability === 'partially_booked'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {venues
                                      .find((v) => v._id === selectedVenueId)
                                      ?.availability.replace('_', ' ')
                                      .toUpperCase()}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {event.allocated_resource_id && typeof event.allocated_resource_id === 'object' ? (
                          <div>
                            <p className="text-[#666666] font-medium">
                              {event.allocated_resource_id.name}
                            </p>
                            <p className="text-sm text-[#999999]">
                              {event.allocated_resource_id.location}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[#666666]">No venue allocated</p>
                        )}
                      </div>
                    )}
                  </motion.div>

                  {/* Venue Availability */}
                  {isEditing && venues.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle size={20} className="text-[#8B1E26]" />
                        <h2 className="text-2xl font-bold text-[#2D2D2D]">Venue Availability</h2>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-800 mb-3">
                            ✓ Available Venues ({venues.filter((v) => v.type === event?.requested_resource_type).length})
                          </p>
                          <div className="space-y-2">
                            {venues.filter((v) => v.type === event?.requested_resource_type).length > 0 ? (
                              venues
                                .filter((v) => v.type === event?.requested_resource_type)
                                .map((venue) => (
                                  <div
                                    key={venue._id}
                                    className="text-sm text-green-700 p-2 bg-green-50 rounded border border-green-200"
                                  >
                                    <strong>{venue.name}</strong> - {venue.location} (Capacity: {venue.capacity})
                                  </div>
                                ))
                            ) : (
                              <p className="text-sm text-green-600">No venues available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Registrations */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-[#2D2D2D]">
                        Registrations ({event.registration_summary.total})
                      </h2>
                      <button
                        onClick={handleDownloadExcel}
                        disabled={event.registrations.length === 0}
                        className="bg-red-800 hover:bg-red-900 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Download Excel
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 mb-2">Confirmed</p>
                        <p className="text-2xl font-bold text-blue-700">{event.registration_summary.confirmed}</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-600 mb-2">Waitlisted</p>
                        <p className="text-2xl font-bold text-yellow-700">{event.registration_summary.waitlisted}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600 mb-2">Available</p>
                        <p className="text-2xl font-bold text-green-700">{event.registration_summary.available_spots}</p>
                      </div>
                    </div>

                    {event.registrations.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[#E8E8E8]">
                              <th className="px-4 py-3 text-left font-bold text-[#2D2D2D]">Name</th>
                              <th className="px-4 py-3 text-left font-bold text-[#2D2D2D]">Roll Number</th>
                              <th className="px-4 py-3 text-left font-bold text-[#2D2D2D]">Email</th>
                              <th className="px-4 py-3 text-left font-bold text-[#2D2D2D]">Status</th>
                              <th className="px-4 py-3 text-left font-bold text-[#2D2D2D]">Registered On</th>
                            </tr>
                          </thead>
                          <tbody>
                            {event.registrations.map((registration) => (
                              <motion.tr
                                key={registration._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-[#E8E8E8] hover:bg-[#F8F9FA] transition-colors"
                              >
                                <td className="px-4 py-3 text-[#2D2D2D] font-medium">{registration.name}</td>
                                <td className="px-4 py-3 text-[#666666]">{registration.rollNumber}</td>
                                <td className="px-4 py-3 text-[#666666] text-xs">{registration.email}</td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      registration.status === 'CONFIRMED'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {registration.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[#666666] text-xs">
                                  {new Date(registration.registeredOn).toLocaleDateString('en-GB')}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-[#666666]">No registrations yet.</p>
                    )}
                  </motion.div>
                </div>

                {/* Sidebar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Status Editor */}
                  {isEditing && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-[#8B1E26]">
                      <h3 className="font-bold text-[#2D2D2D] mb-4">Update Status</h3>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] mb-4"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="RESCHEDULED">Rescheduled</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleUpdateStatus}
                          disabled={isSaving}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#8B1E26] text-white rounded-lg font-medium hover:bg-[#6B1620] transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <>
                              <Loader size={16} className="animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Save
                            </>
                          )}
                        </motion.button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setNewStatus(event.status);
                            setEditedDescription(event.description);
                          }}
                          className="flex-1 px-4 py-2 border border-[#E8E8E8] text-[#2D2D2D] rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Organizer Info */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]">
                    <h3 className="font-bold text-[#2D2D2D] mb-4">Organizing Club</h3>
                    <p className="text-[#2D2D2D] font-medium mb-2">{event.primary_club_id.club_name}</p>
                    <p className="text-sm text-[#666666] mb-3">
                      <span className="font-medium">Coordinator:</span> {event.primary_club_id.faculty_coordinator_name}
                    </p>
                    <a
                      href={`mailto:${event.primary_club_id.email}`}
                      className="text-[#8B1E26] hover:underline text-sm"
                    >
                      {event.primary_club_id.email}
                    </a>
                  </div>

                  {/* Event Info */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]">
                    <h3 className="font-bold text-[#2D2D2D] mb-4">Event Info</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-[#666666]">Event Type</p>
                        <p className="font-medium text-[#2D2D2D]">{event.event_type}</p>
                      </div>
                      <div>
                        <p className="text-[#666666]">Resource Type</p>
                        <p className="font-medium text-[#2D2D2D]">{event.requested_resource_type}</p>
                      </div>
                      <div>
                        <p className="text-[#666666]">Created</p>
                        <p className="font-medium text-[#2D2D2D]">
                          {new Date(event.created_at).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#666666]">Capacity</p>
                        <p className="font-medium text-[#2D2D2D]">
                          {event.min_participants} - {event.max_participants}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Stats */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]">
                    <h3 className="font-bold text-[#2D2D2D] mb-4">Capacity</h3>
                    <div className="w-full bg-[#E8E8E8] rounded-full h-3 mb-2">
                      <div
                        className="bg-[#8B1E26] h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (event.registration_summary.confirmed / event.max_participants) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-[#666666] text-center">
                      {event.registration_summary.confirmed} / {event.max_participants} seats filled
                    </p>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}