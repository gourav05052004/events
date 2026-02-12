'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Check } from 'lucide-react';

interface AddClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddClubModal({ isOpen, onClose, onSuccess }: AddClubModalProps) {
  const [formData, setFormData] = useState({
    club_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    faculty_coordinator_name: '',
    description: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.club_name.trim()) {
      setError('Club name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.faculty_coordinator_name.trim()) {
      setError('Faculty coordinator name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          club_name: formData.club_name,
          email: formData.email,
          password: formData.password,
          faculty_coordinator_name: formData.faculty_coordinator_name,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create club');
        return;
      }

      // Reset form and close modal
      setFormData({
        club_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        faculty_coordinator_name: '',
        description: '',
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-[#E8E8E8] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#2D2D2D]">Add New Club</h2>
              <button
                onClick={onClose}
                className="text-[#666666] hover:text-[#2D2D2D] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Club Name */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Club Name *
                </label>
                <input
                  type="text"
                  name="club_name"
                  value={formData.club_name}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science Club"
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="club@example.com"
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Faculty Coordinator */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Faculty Coordinator Name *
                </label>
                <input
                  type="text"
                  name="faculty_coordinator_name"
                  value={formData.faculty_coordinator_name}
                  onChange={handleChange}
                  placeholder="e.g., Dr. John Doe"
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter a strong password"
                    className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Show Password Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4 border border-[#E8E8E8] rounded cursor-pointer"
                />
                <span className="text-sm text-[#666666]">Show password</span>
              </label>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the club"
                  rows={3}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-[#E8E8E8] text-[#2D2D2D] rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-[#8B1E26] text-white rounded-lg font-medium hover:bg-[#6B1620] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Create Club
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
