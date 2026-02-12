'use client';

import React from "react"

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { InputField, TextareaField, SelectField } from '@/components/form-field';
import { Upload, CheckCircle } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/club/dashboard' },
  { label: 'My Events', href: '/club/events' },
  { label: 'Create Event', href: '/club/create-event', active: true },
  { label: 'Team', href: '/club/team' },
  { label: 'Settings', href: '/club/settings' },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    primaryClubId: '',
    title: '',
    description: '',
    eventType: '',
    date: '',
    startTime: '',
    endTime: '',
    registrationDeadline: '',
    venueType: '',
    minParticipants: '',
    maxParticipants: '',
    collaboratingClubs: '',
  });
  const [posterImage, setPosterImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPosterImage(files[0]);
      toast.success('Poster uploaded successfully');
    }
  };

  useEffect(() => {
    const storedClubId = window.localStorage.getItem('clubId') || '';
    if (storedClubId) {
      setFormData((prev) => ({ ...prev, primaryClubId: storedClubId }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    if (!formData.primaryClubId) {
      const errorMsg = 'Missing club ID. Please log in again.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
      return;
    }

    if (!posterImage) {
      const errorMsg = 'Please upload an event poster.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
      return;
    }

    const payload = new FormData();
    payload.append('primaryClubId', formData.primaryClubId);
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('eventType', formData.eventType);
    payload.append('date', formData.date);
    payload.append('startTime', formData.startTime);
    payload.append('endTime', formData.endTime);
    payload.append('registrationDeadline', formData.registrationDeadline);
    payload.append('venueType', formData.venueType);
    payload.append('minParticipants', formData.minParticipants);
    payload.append('maxParticipants', formData.maxParticipants);
    payload.append('collaboratingClubs', formData.collaboratingClubs);
    payload.append('poster', posterImage);

    console.log('Creating event with clubId:', formData.primaryClubId);

    try {
      const response = await fetch('/api/club/events', {
        method: 'POST',
        body: payload,
      });

      console.log('Create event response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('Create event error:', data);
        const errorMsg = data?.error || 'Failed to create event.';
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      console.log('Event created successfully:', result);

      toast.success('Event created successfully! Redirecting...');
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/club/events');
      }, 2000);
    } catch (error) {
      console.error('Create event failed:', error);
      const errorMsg = 'Something went wrong. Please try again.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
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

              <motion.div variants={item}>
                <SelectField
                  label="Event Type"
                  value={formData.eventType}
                  onChange={(e) => handleInputChange('eventType', e.target.value)}
                  options={[
                    { value: 'INDIVIDUAL', label: 'Individual' },
                    { value: 'TEAM', label: 'Team' },
                  ]}
                  required
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
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
              </motion.div>

              <motion.div variants={item} className="grid md:grid-cols-2 gap-6">
                <InputField
                  type="time"
                  label="End Time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                />
                <InputField
                  type="date"
                  label="Registration Deadline"
                  value={formData.registrationDeadline}
                  onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
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
                    { value: 'HALL', label: 'Hall' },
                    { value: 'ROOM', label: 'Room' },
                    { value: 'LAB', label: 'Lab' },
                  ]}
                  required
                />
                <InputField
                  type="number"
                  label="Min Participants"
                  placeholder="Minimum number of participants"
                  value={formData.minParticipants}
                  onChange={(e) => handleInputChange('minParticipants', e.target.value)}
                  required
                />
              </motion.div>

              <motion.div variants={item}>
                <InputField
                  type="number"
                  label="Max Capacity"
                  placeholder="Maximum number of attendees"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
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
              <motion.div variants={item} className="flex flex-col gap-4 pt-6">
                {submitError && (
                  <p className="text-sm text-[#D32F2F]">{submitError}</p>
                )}
                <div className="flex gap-3">
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
                </div>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
