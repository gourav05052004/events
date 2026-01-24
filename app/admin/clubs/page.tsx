'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Search, Filter, Download, Users, Calendar, Award } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Clubs', href: '/admin/clubs', active: true },
  { label: 'Venues', href: '/admin/venues' },
  { label: 'Activity Logs', href: '/admin/logs' },
  { label: 'Settings', href: '/admin/settings' },
];

interface Club {
  id: string;
  name: string;
  president: string;
  email: string;
  members: number;
  status: 'active' | 'inactive' | 'pending';
  eventsHeld: number;
  established: string;
}

const allClubs: Club[] = [
  {
    id: '1',
    name: 'Computer Science Club',
    president: 'Rajesh Kumar',
    email: 'cs-club@vit.ac.in',
    members: 234,
    status: 'active',
    eventsHeld: 12,
    established: '2020',
  },
  {
    id: '2',
    name: 'Tech Club',
    president: 'Priya Singh',
    email: 'tech-club@vit.ac.in',
    members: 189,
    status: 'active',
    eventsHeld: 8,
    established: '2021',
  },
  {
    id: '3',
    name: 'Photography Club',
    president: 'Aisha Malik',
    email: 'photo-club@vit.ac.in',
    members: 145,
    status: 'active',
    eventsHeld: 15,
    established: '2019',
  },
  {
    id: '4',
    name: 'Entrepreneurship Club',
    president: 'Vikram Patel',
    email: 'enterprise-club@vit.ac.in',
    members: 98,
    status: 'pending',
    eventsHeld: 3,
    established: '2024',
  },
  {
    id: '5',
    name: 'Sports Committee',
    president: 'Arjun Reddy',
    email: 'sports@vit.ac.in',
    members: 567,
    status: 'active',
    eventsHeld: 22,
    established: '2018',
  },
  {
    id: '6',
    name: 'Art & Design Society',
    president: 'Maya Verma',
    email: 'art-society@vit.ac.in',
    members: 76,
    status: 'inactive',
    eventsHeld: 5,
    established: '2022',
  },
  {
    id: '7',
    name: 'Robotics Club',
    president: 'Dev Sharma',
    email: 'robotics-club@vit.ac.in',
    members: 112,
    status: 'active',
    eventsHeld: 9,
    established: '2021',
  },
  {
    id: '8',
    name: 'Music Club',
    president: 'Ananya Das',
    email: 'music-club@vit.ac.in',
    members: 156,
    status: 'active',
    eventsHeld: 18,
    established: '2020',
  },
];

export default function AdminClubsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredClubs = allClubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.president.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || club.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = [
    {
      label: 'Total Clubs',
      value: allClubs.length.toString(),
      icon: <Users className="text-[#8B1E26]" size={20} />,
    },
    {
      label: 'Active Clubs',
      value: allClubs.filter((c) => c.status === 'active').length.toString(),
      icon: <Award className="text-green-600" size={20} />,
    },
    {
      label: 'Total Members',
      value: allClubs.reduce((sum, club) => sum + club.members, 0).toString(),
      icon: <Users className="text-blue-600" size={20} />,
    },
    {
      label: 'Pending Approval',
      value: allClubs.filter((c) => c.status === 'pending').length.toString(),
      icon: <Calendar className="text-yellow-600" size={20} />,
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Clubs Management" userRole="admin" />
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
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">All Clubs</h1>
            <p className="text-[#666666]">Manage clubs, approve new registrations, and monitor club activities.</p>
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
                    <option value="pending">Pending</option>
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
            Showing {filteredClubs.length} of {allClubs.length} clubs
          </motion.p>

          {/* Clubs Table */}
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
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Club Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">President</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Members</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Events</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Established</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2D2D2D]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClubs.map((club, index) => (
                    <motion.tr
                      key={club.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: '#F8F9FA' }}
                      className="border-b border-[#E8E8E8] hover:bg-[#F8F9FA] transition-colors"
                    >
                      <td className="px-6 py-4 text-[#2D2D2D] font-medium">{club.name}</td>
                      <td className="px-6 py-4 text-[#666666]">{club.president}</td>
                      <td className="px-6 py-4 text-[#666666] text-sm">{club.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          {club.members}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#2D2D2D] font-medium">{club.eventsHeld}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            club.status
                          )}`}
                        >
                          {club.status.charAt(0).toUpperCase() + club.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#666666]">{club.established}</td>
                      <td className="px-6 py-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/admin/clubs/${club.id}`)}
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

            {filteredClubs.length === 0 && (
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
