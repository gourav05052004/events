'use client';

import React from "react"

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { InputField, TextareaField, SelectField } from '@/components/form-field';
import { Upload, CheckCircle } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/club/dashboard' },
  { label: 'My Events', href: '/club/events' },
  { label: 'Create Event', href: '/club/create-event', active: true },
  { label: 'Venues', href: '/club/venues' },
  { label: 'Team', href: '/club/team' },
  { label: 'Settings', href: '/club/settings' },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    venueType: '',
    maxCapacity: '',
    collaboratingClubs: '',
  });
  const [posterImage, setPosterImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPosterImage(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setShowSuccess(true);
    setTimeout(() => {
      router.push('/club/events');
    }, 2000);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  if (showSuccess) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4"
          >
            <CheckCircle className="text-[#10B981]" size={64} />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#2D2D2D] mb-2">Event Created Successfully!</h1>
          <p className="text-[#666666] mb-8">
            Your event has been submitted for approval. You'll be notified once it's reviewed.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/club/dashboard')}
            className="px-8 py-3 bg-[#8B1E26] text-white rounded-lg font-bold hover:shadow-lg"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Create Event" userRole="club" showBackButton={true} onBackClick={() => router.back()} />
      <Sidebar
        items={sidebarItems}
        onLogout={() => router.push('/')}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Create New Event</h1>
            <p className="text-[#666666]">Fill in the details below to create your event.</p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="bg-white rounded-xl border border-[#E8E8E8] p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Title */}
              <motion.div variants={item}>
                <InputField
                  label="Event Title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </motion.div>

              {/* Description */}
              <motion.div variants={item}>
                <TextareaField
                  label="Event Description"
                  placeholder="Describe your event in detail"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  rows={5}
                />
              </motion.div>

              {/* Date & Time */}
              <motion.div variants={item} className="grid md:grid-cols-2 gap-6">
                <InputField
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
                <InputField
                  type="time"
                  label="Time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  required
                />
              </motion.div>

              {/* Location */}
              <motion.div variants={item}>
                <InputField
                  label="Location / Building"
                  placeholder="e.g., Main Auditorium, Lab 101"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                />
              </motion.div>

              {/* Venue Type & Capacity */}
              <motion.div variants={item} className="grid md:grid-cols-2 gap-6">
                <SelectField
                  label="Venue Type"
                  value={formData.venueType}
                  onChange={(e) => handleInputChange('venueType', e.target.value)}
                  options={[
                    { value: 'hall', label: 'Hall' },
                    { value: 'room', label: 'Room' },
                    { value: 'lab', label: 'Lab' },
                    { value: 'outdoor', label: 'Outdoor Space' },
                  ]}
                  required
                />
                <InputField
                  type="number"
                  label="Max Capacity"
                  placeholder="Maximum number of attendees"
                  value={formData.maxCapacity}
                  onChange={(e) => handleInputChange('maxCapacity', e.target.value)}
                  required
                />
              </motion.div>

              {/* Collaborating Clubs */}
              <motion.div variants={item}>
                <InputField
                  label="Collaborating Clubs (Optional)"
                  placeholder="Separate multiple clubs with commas"
                  value={formData.collaboratingClubs}
                  onChange={(e) => handleInputChange('collaboratingClubs', e.target.value)}
                />
              </motion.div>

              {/* Poster Image Upload */}
              <motion.div variants={item}>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-3">
                  Event Poster <span className="text-[#D32F2F]">*</span>
                </label>
                <div className="relative border-2 border-dashed border-[#E8E8E8] rounded-lg p-8 text-center hover:border-[#8B1E26] transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex flex-col items-center gap-2 group-hover:text-[#8B1E26] transition-colors"
                  >
                    <Upload size={32} className="text-[#8B1E26]" />
                    <p className="font-medium text-[#2D2D2D]">
                      {posterImage ? posterImage.name : 'Click to upload event poster'}
                    </p>
                    <p className="text-sm text-[#666666]">PNG, JPG up to 5MB</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={item} className="flex gap-3 pt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8B1E26] to-[#6B1520] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Creating Event...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border-2 border-[#E8E8E8] text-[#2D2D2D] rounded-lg font-bold hover:bg-[#F8F9FA] transition-all"
                >
                  Cancel
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
