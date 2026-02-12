'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { AddVenueModal } from '@/components/add-venue-modal';
import { EditVenueModal } from '@/components/edit-venue-modal';
import { Search, Filter, Download, MapPin, Users, Calendar, Plus, Trash2 } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Clubs', href: '/admin/clubs' },
  { label: 'Venues', href: '/admin/venues', active: true },
  { label: 'Activity Logs', href: '/admin/logs' },
  { label: 'Settings', href: '/admin/settings' },
];

interface Venue {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  type: string;
  amenities: string[];
  bookedEvents: number;
  availability: 'available' | 'partially_booked' | 'full_booked';
  manager: string;
  contact: string;
}

export default function AdminVenuesPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch venues from API on component mount
  const fetchVenues = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/venues');
      
      if (!res.ok) {
        throw new Error('Failed to fetch venues');
      }
      
      const data = await res.json();
      setVenues(data.data || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setVenues([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/venues/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete venue');
      }

      setVenues(venues.filter((v) => v._id !== id));
      setShowDeleteConfirm(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting venue:', err);
      alert('Failed to delete venue');
    }
  };

  const handleEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsEditModalOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Validate status value
    const validStatuses = ['available', 'partially_booked', 'full_booked'];
    if (!validStatuses.includes(newStatus)) return;

    try {
      const res = await fetch(`/api/admin/venues/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manual_status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      // Update the venue in local state
      setVenues(
        venues.map((v) =>
          v._id === id
            ? {
                ...v,
                availability: newStatus as 'available' | 'partially_booked' | 'full_booked',
              }
            : v
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.manager.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability =
      availabilityFilter === 'all' || venue.availability === availabilityFilter;
    return matchesSearch && matchesAvailability;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'partially_booked':
        return 'bg-yellow-100 text-yellow-700';
      case 'full_booked':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'Available';
      case 'partially_booked':
        return 'Partially Booked';
      case 'full_booked':
        return 'Fully Booked';
      default:
        return availability;
    }
  };

  const getTypeLabel = (type: string) => {
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

  const stats = [
    {
      label: 'Total Venues',
      value: venues.length,
      icon: MapPin,
      color: 'text-blue-600',
    },
    {
      label: 'Available Venues',
      value: venues.filter((v) => v.availability === 'available').length,
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      label: 'Total Capacity',
      value: venues.reduce((sum, v) => sum + v.capacity, 0).toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
    },
    {
      label: 'Total Bookings',
      value: venues.reduce((sum, v) => sum + v.bookedEvents, 0),
      icon: Calendar,
      color: 'text-orange-600',
    },
  ];

  const handleExport = () => {
    const csv = [
      ['Name', 'Location', 'Capacity', 'Type', 'Booked Events', 'Availability', 'Manager', 'Contact'].join(','),
      ...filteredVenues.map((v) =>
        [v.name, v.location, v.capacity, v.type, v.bookedEvents, getAvailabilityLabel(v.availability), v.manager, v.contact].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'venues.csv';
    a.click();
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Venue Management" userRole="admin" />
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
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Venue Management</h1>
            <p className="text-[#666666]">Manage all college venues and their bookings</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 border border-[#E8E8E8]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#666666] text-sm font-medium mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-[#2D2D2D]">{stat.value}</p>
                    </div>
                    <Icon className={`w-10 h-10 ${stat.color}`} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-[#E8E8E8]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-4 top-3.5 text-[#8B1E26]" size={20} />
                <input
                  type="text"
                  placeholder="Search venues, location, or manager..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Filters & Actions */}
              <div className="flex gap-3">
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                >
                  <option value="all">All Availability</option>
                  <option value="available">Available</option>
                  <option value="partially_booked">Partially Booked</option>
                  <option value="full_booked">Fully Booked</option>
                </select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#8B1E26] text-white rounded-lg font-medium hover:bg-[#6B1620] transition-all"
                >
                  <Plus size={18} />
                  Add Venue
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-[#8B1E26] text-[#8B1E26] rounded-lg font-medium hover:bg-[#8B1E26]/5 transition-all"
                >
                  <Download size={18} />
                  Export
                </motion.button>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-[#666666] mt-4 text-sm">
              Showing <span className="font-semibold">{filteredVenues.length}</span> of <span className="font-semibold">{venues.length}</span> venues
            </p>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-12 border border-[#E8E8E8] text-center"
            >
              <div className="flex justify-center items-center mb-4">
                <div className="w-8 h-8 border-4 border-[#E8E8E8] border-t-[#8B1E26] rounded-full animate-spin"></div>
              </div>
              <p className="text-[#666666]">Loading venues...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-200"
            >
              <p className="text-red-600 font-medium">Error: {error}</p>
            </motion.div>
          )}

          {/* Venues Table */}
          {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl overflow-hidden border border-[#E8E8E8]"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#E8E8E8]">
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Venue Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Capacity</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Booked Events</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Manager</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVenues.length > 0 ? (
                    filteredVenues.map((venue, index) => (
                      <motion.tr
                        key={venue._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#F8F9FA' }}
                        className="border-b border-[#E8E8E8] hover:bg-[#F8F9FA] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-[#8B1E26]" />
                            <div>
                              <p className="font-medium text-[#2D2D2D]">{venue.name}</p>
                              <p className="text-sm text-[#666666]">{venue.contact}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#2D2D2D]">{venue.location}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">{getTypeLabel(venue.type)}</span>
                        </td>
                        <td className="px-6 py-4 text-[#2D2D2D] font-medium">{venue.capacity.toLocaleString()}</td>
                        <td className="px-6 py-4 text-[#2D2D2D] font-medium">{venue.bookedEvents}</td>
                        <td className="px-6 py-4">
                          <select
                            value={venue.availability}
                            onChange={(e) => handleStatusChange(venue._id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-[#8B1E26] cursor-pointer ${getAvailabilityColor(venue.availability)}`}
                          >
                            <option value="available">Available</option>
                            <option value="partially_booked">Partially Booked</option>
                            <option value="full_booked">Fully Booked</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-[#2D2D2D]">{venue.manager}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(venue)}
                              className="text-sm font-bold text-[#8B1E26] hover:underline"
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setDeletingId(venue._id);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-sm font-bold text-red-600 hover:underline"
                            >
                              Delete
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <p className="text-[#666666]">No venues found matching your filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
          )}
        </div>
      </div>

      {/* Add Venue Modal */}
      <AddVenueModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchVenues();
        }}
      />

      {/* Edit Venue Modal */}
      <EditVenueModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVenue(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedVenue(null);
          fetchVenues();
        }}
        venue={selectedVenue}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && deletingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6"
            >
              <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">Delete Venue</h3>
              <p className="text-[#666666] mb-6">
                Are you sure you want to delete this venue? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-[#E8E8E8] text-[#2D2D2D] rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (deletingId) {
                      handleDelete(deletingId);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
