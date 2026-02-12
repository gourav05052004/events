'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Check } from 'lucide-react';

interface AddVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddVenueModal({ isOpen, onClose, onSuccess }: AddVenueModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    type: 'HALL',
    manager: '',
    contact: '',
    amenities: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Venue name is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    if (!formData.capacity || isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      setError('Please enter a valid capacity');
      return false;
    }
    if (!formData.manager.trim()) {
      setError('Manager name is required');
      return false;
    }
    if (!formData.contact.trim()) {
      setError('Contact information is required');
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
      const amenitiesArray = formData.amenities
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);

      const response = await fetch('/api/admin/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          capacity: Number(formData.capacity),
          type: formData.type,
          manager: formData.manager,
          contact: formData.contact,
          amenities: amenitiesArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create venue');
        return;
      }

      // Reset form and close modal
      setFormData({
        name: '',
        location: '',
        capacity: '',
        type: 'HALL',
        manager: '',
        contact: '',
        amenities: '',
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
              <h2 className="text-xl font-bold text-[#2D2D2D]">Add New Venue</h2>
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

              {/* Venue Name */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Main Auditorium"
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Building A, Ground Floor"
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                >
                  <option value="HALL">Hall</option>
                  <option value="ROOM">Room</option>
                  <option value="LAB">Laboratory</option>
                </select>
              </div>

              {/* Manager */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Manager Name *
                </label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  placeholder="e.g., Mr. Sharma"
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Contact *
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="e.g., auditorium@vit.ac.in or phone number"
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Amenities (Optional)
                </label>
                <textarea
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="Comma-separated list (e.g., Projector, Sound System, AC)"
                  rows={2}
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
                      Create Venue
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
