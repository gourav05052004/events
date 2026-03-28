'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Mail, Calendar, Edit2, Save, X, Loader, AlertCircle, BookOpen, Code, Lock, Upload, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const sidebarItems = [
  { label: 'Dashboard', href: '/student/dashboard' },
  { label: 'Browse Events', href: '/student/events' },
  { label: 'My Registrations', href: '/student/registrations' },
  { label: 'My Profile', href: '/student/profile', active: true },
];

interface IStudentProfile {
  _id: string;
  name: string;
  email: string;
  roll_number: string;
  department: string;
  batch: string;
  created_at: string;
  avatar?: string;
}

export default function StudentProfile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<IStudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roll_number: '',
    department: '',
    batch: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const studentId = window.localStorage.getItem('studentId');

      if (!studentId) {
        router.push('/login?role=student');
        return;
      }

      const response = await fetch(`/api/student/profile?id=${studentId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.student);
      setFormData({
        name: data.student.name,
        email: data.student.email,
        roll_number: data.student.roll_number,
        department: data.student.department,
        batch: data.student.batch,
      });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to load profile';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const studentId = window.localStorage.getItem('studentId');

      const response = await fetch('/api/student/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: studentId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.student);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to update profile';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setUploadingAvatar(true);
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      formDataObj.append('id', window.localStorage.getItem('studentId') || '');

      const response = await fetch('/api/student/profile/avatar', {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload avatar');
      }

      const data = await response.json();
      setProfile(data.student);
      toast.success('Avatar updated successfully!');
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to upload avatar';
      toast.error(errorMsg);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.currentPassword || !passwordData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      const studentId = window.localStorage.getItem('studentId');

      const response = await fetch('/api/student/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: studentId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to change password';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="My Profile" userRole="student" />
        <Sidebar items={sidebarItems} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
        <div className="md:ml-64 pt-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-96">
              <Loader className="w-8 h-8 text-[#8B1E26] animate-spin" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="My Profile" userRole="student" />
      <Sidebar items={sidebarItems} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      <div className="md:ml-64 pt-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">My Profile</h1>
              <p className="text-[#666666]">Manage your student profile information</p>
            </div>
            {!isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2 bg-[#8B1E26] text-white rounded-lg hover:bg-[#6B1520] font-medium transition-colors"
              >
                <Edit2 size={18} />
                Edit Profile
              </motion.button>
            )}
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-3"
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden"
          >
            {/* Header Background */}
            <div className="h-32 bg-gradient-to-r from-[#8B1E26] to-[#6B1520]" />

            <div className="px-6 sm:px-8">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 -mt-16 pb-8">
                <div className="relative group">
                  <div className="w-28 h-28 bg-gradient-to-br from-[#8B1E26] to-[#6B1520] rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white overflow-hidden">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      profile?.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {!isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 p-2 bg-[#8B1E26] text-white rounded-full shadow-lg hover:bg-[#6B1520] transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                    </motion.button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Name and ID Card */}
              <div className="bg-gradient-to-r from-[#8B1E26]/5 to-[#6B1520]/5 border border-[#E8E8E8] rounded-xl p-6 mb-8">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#8B1E26] uppercase tracking-wider">Student Name</p>
                  <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4">{profile?.name}</h2>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#E8E8E8]">
                    <span className="text-sm font-medium text-[#999999]">Student ID:</span>
                    <span className="text-sm font-semibold text-[#2D2D2D] bg-white px-3 py-1 rounded-lg border border-[#E8E8E8]">{profile?.roll_number}</span>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="py-8">
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Roll Number */}
                    <div>
                      <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={formData.roll_number}
                        disabled
                        className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg bg-[#F8F9FA] text-[#999999] cursor-not-allowed outline-none"
                      />
                      <p className="text-xs text-[#999999] mt-1">Roll number cannot be changed</p>
                    </div>

                    {/* Department and Batch */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                          Department
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none transition-all"
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Mechanical">Mechanical</option>
                          <option value="Civil">Civil</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                          Batch/Year
                        </label>
                        <select
                          value={formData.batch}
                          onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                          className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none transition-all"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#8B1E26] text-white rounded-lg hover:bg-[#6B1520] font-medium transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <Loader size={18} className="animate-spin" />
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: profile?.name || '',
                            email: profile?.email || '',
                            roll_number: profile?.roll_number || '',
                            department: profile?.department || '',
                            batch: profile?.batch || '',
                          });
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#E8E8E8] text-[#2D2D2D] rounded-lg hover:bg-[#D8D8D8] font-medium transition-colors"
                      >
                        <X size={18} />
                        Cancel
                      </motion.button>
                    </div>

                    {/* Change Password Button */}
                    <div className="mt-6 pt-6 border-t border-[#E8E8E8]">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#8B1E26] text-white rounded-lg hover:bg-[#6B1520] font-medium transition-colors"
                      >
                        <Lock size={18} />
                        Change Password
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-6">
                    {/* Email */}
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#F8F9FA]">
                        <Mail size={24} className="text-[#8B1E26]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#999999] mb-1">Email Address</p>
                        <p className="text-lg font-semibold text-[#2D2D2D]">{profile?.email}</p>
                      </div>
                    </div>

                    {/* Roll Number */}
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#F8F9FA]">
                        <Code size={24} className="text-[#8B1E26]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#999999] mb-1">Roll Number</p>
                        <p className="text-lg font-semibold text-[#2D2D2D]">{profile?.roll_number}</p>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#F8F9FA]">
                        <BookOpen size={24} className="text-[#8B1E26]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#999999] mb-1">Department</p>
                        <p className="text-lg font-semibold text-[#2D2D2D]">{profile?.department}</p>
                      </div>
                    </div>

                    {/* Batch */}
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#F8F9FA]">
                        <Calendar size={24} className="text-[#8B1E26]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#999999] mb-1">Batch/Year</p>
                        <p className="text-lg font-semibold text-[#2D2D2D]">{profile?.batch}</p>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="flex items-start gap-4 pt-4 border-t border-[#E8E8E8]">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#F8F9FA]">
                        <Calendar size={24} className="text-[#8B1E26]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#999999] mb-1">Member Since</p>
                        <p className="text-lg font-semibold text-[#2D2D2D]">
                          {new Date(profile?.created_at || '').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Change Password Modal */}
          <AnimatePresence>
            {showPasswordModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowPasswordModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-2xl font-bold text-[#2D2D2D] mb-6">Change Password</h3>

                  {/* Current Password */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none transition-all pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#8B1E26]"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none transition-all pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#8B1E26]"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none transition-all pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#8B1E26]"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8B1E26] text-white rounded-lg hover:bg-[#6F171F] font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Update Password
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E8E8E8] text-[#2D2D2D] rounded-lg hover:bg-[#D8D8D8] font-medium transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
