'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { ArrowLeft, Mail, User, Calendar, FileText, ToggleRight, Save, Trash2, AlertCircle, Check } from 'lucide-react';

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

export default function AdminClubDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params.id as string;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState<Partial<Club>>({
    club_name: '',
    email: '',
    faculty_coordinator_name: '',
    description: '',
    is_active: true,
  });

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
        setClub(data.data);
        setFormData(data.data);
        setError('');
      } else {
        setError('Failed to load club details');
      }
    } catch (err) {
      setError('An error occurred while loading club details');
      console.error('Error fetching club:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      is_active: !prev.is_active,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/admin/clubs/${clubId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          club_name: formData.club_name,
          email: formData.email,
          faculty_coordinator_name: formData.faculty_coordinator_name,
          description: formData.description,
          is_active: formData.is_active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update club');
        return;
      }

      setSuccess('Club updated successfully');
      setClub(data.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('An error occurred while updating the club');
      console.error('Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');

      const response = await fetch(`/api/admin/clubs/${clubId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete club');
        return;
      }

      router.push('/admin/clubs');
    } catch (err) {
      setError('An error occurred while deleting the club');
      console.error('Error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

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
                onClick={() => router.push('/admin/clubs')}
                className="text-[#8B1E26] hover:underline font-medium"
              >
                Back to Clubs
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/admin/clubs')}
            className="flex items-center gap-2 text-[#8B1E26] hover:text-[#6B1620] mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Clubs
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">{club.club_name}</h1>
            <p className="text-[#666666]">
              Created on {new Date(club.created_at).toLocaleDateString('en-GB')}
            </p>
          </motion.div>

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

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#E8E8E8] p-8"
          >
            {/* Club Information */}
            <div className="space-y-8">
              {/* Club Name */}
              <div>
                <label className="block text-sm font-bold text-[#2D2D2D] mb-2">Club Name</label>
                <input
                  type="text"
                  name="club_name"
                  value={formData.club_name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Faculty Coordinator */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-[#2D2D2D] mb-2">
                  <User size={18} />
                  Faculty Coordinator
                </label>
                <input
                  type="text"
                  name="faculty_coordinator_name"
                  value={formData.faculty_coordinator_name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-[#2D2D2D] mb-2">
                  <Mail size={18} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-[#2D2D2D] mb-2">
                  <FileText size={18} />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] resize-none"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-lg border border-[#E8E8E8]">
                <div className="flex items-center gap-3">
                  <ToggleRight size={20} className="text-[#8B1E26]" />
                  <div>
                    <p className="font-bold text-[#2D2D2D]">Club Status</p>
                    <p className="text-sm text-[#666666]">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggle}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    formData.is_active ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      formData.is_active ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-3 p-4 bg-[#F8F9FA] rounded-lg border border-[#E8E8E8]">
                <Calendar size={20} className="text-[#8B1E26]" />
                <div>
                  <p className="text-sm text-[#666666]">Created Date</p>
                  <p className="font-semibold text-[#2D2D2D]">
                    {new Date(club.created_at).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-12 pt-8 border-t border-[#E8E8E8]">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/admin/clubs')}
                className="flex-1 px-6 py-3 border border-[#E8E8E8] text-[#2D2D2D] rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-[#8B1E26] text-white rounded-lg font-medium hover:bg-[#6B1620] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 border-2 border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </motion.button>
            </div>
          </motion.div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="text-red-600" size={24} />
                  <h3 className="text-xl font-bold text-[#2D2D2D]">Delete Club</h3>
                </div>
                <p className="text-[#666666] mb-6">
                  Are you sure you want to delete this club? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-[#E8E8E8] text-[#2D2D2D] rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
