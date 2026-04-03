'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { AddClubModal } from '@/components/add-club-modal';
import { Search, Filter, Download, Users, Calendar, Award, Plus } from 'lucide-react';

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
  faculty_coordinator_name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminClubsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');

  // Fetch clubs from API
  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/clubs');
      const data = await response.json();

      if (data.success) {
        setClubs(data.data);
        setError('');
      } else {
        setError('Failed to load clubs');
      }
    } catch (err) {
      setError('An error occurred while loading clubs');
      console.error('Error fetching clubs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClubSuccess = () => {
    fetchClubs();
  };

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.club_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.faculty_coordinator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && club.is_active) || (statusFilter === 'inactive' && !club.is_active);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  const stats = [
    {
      label: 'Total Clubs',
      value: clubs.length.toString(),
      icon: <Users className="text-[#8B1E26]" size={20} />,
    },
    {
      label: 'Active Clubs',
      value: clubs.filter((c) => c.is_active).length.toString(),
      icon: <Award className="text-green-600" size={20} />,
    },
    {
      label: 'Inactive Clubs',
      value: clubs.filter((c) => !c.is_active).length.toString(),
      icon: <Calendar className="text-yellow-600" size={20} />,
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Clubs Management" userRole="admin" />
      <Sidebar
        items={sidebarItems}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <AddClubModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={handleAddClubSuccess} />

      <div className="md:ml-64 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Header with Add Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-start justify-between gap-4"
          >
            <div>
              <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">All Clubs</h1>
              <p className="text-[#666666]">Manage clubs, approve new registrations, and monitor club activities.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#8B1E26] text-white rounded-lg font-medium hover:bg-[#6B1620] transition-all whitespace-nowrap mt-2"
            >
              <Plus size={20} />
              Add Club
            </motion.button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white rounded-lg border border-[#E8E8E8] p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  {stat.icon}
                  <p className="text-sm text-[#666666] font-medium">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-[#2D2D2D]">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-[#E8E8E8]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-4 top-3.5 text-[#8B1E26]" size={20} />
                <input
                  type="text"
                  placeholder="Search clubs, presidents, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Filters & Actions */}
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-3.5 text-[#8B1E26]" size={18} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-[#8B1E26] text-[#8B1E26] rounded-lg font-medium hover:bg-[#8B1E26]/5 transition-all"
                >
                  <Download size={18} />
                  Export
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#666666] mb-6"
          >
            {isLoading ? 'Loading...' : `Showing ${filteredClubs.length} of ${clubs.length} clubs`}
          </motion.p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Clubs Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl overflow-hidden border border-[#E8E8E8]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-[#E8E8E8] border-t-[#8B1E26] rounded-full animate-spin" />
                  <p className="text-[#666666]">Loading clubs...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E8E8E8]">
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Club Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Faculty Coordinator</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClubs.map((club, index) => (
                      <motion.tr
                        key={club._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#F8F9FA' }}
                        onClick={() => router.push(`/admin/clubs/${club._id}`)}
                        className="border-b border-[#E8E8E8] hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-[#2D2D2D] font-medium">{club.club_name}</td>
                        <td className="px-6 py-4 text-[#666666]">{club.faculty_coordinator_name}</td>
                        <td className="px-6 py-4 text-[#666666] text-sm">{club.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              club.is_active
                            )}`}
                          >
                            {club.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#666666] text-sm">
                          {new Date(club.created_at).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/clubs/${club._id}`);
                            }}
                            className="text-sm font-bold text-[#8B1E26] hover:underline"
                          >
                            View Details
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isLoading && filteredClubs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-[#666666] text-lg">No clubs found matching your filters.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
