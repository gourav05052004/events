'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Upload, CheckCircle, Clock } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { InputField, TextareaField, SelectField } from '@/components/form-field';

const sidebarItems = [
  { label: 'Dashboard', href: '/club/dashboard' },
  { label: 'My Events', href: '/club/events' },
  { label: 'Create Event', href: '/club/create-event', active: true },
  { label: 'Leadership', href: '/club/team' },
  { label: 'Settings', href: '/club/settings' },
];

const initialFormData = {
  primaryClubId: '',
  title: '',
  description: '',
  eventType: '',
  categories: [] as string[],
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  registrationDeadline: '',
  venueType: '',
  maxParticipants: '',
  minTeamMembers: '',
  maxTeamMembers: '',
  collaboratingClubs: '',
};

export default function CreateEventPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [posterImage, setPosterImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Date helpers (timezone-safe local date)
  const getLocalToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalToday();

  // Time select state
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');

  // helper arrays and dynamic availability for end time
  const hours = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  const isSameDay = Boolean(formData.startDate && formData.endDate && formData.startDate === formData.endDate);

  const availableEndHours = isSameDay
    ? hours.filter((h) => parseInt(h) >= parseInt(startHour))
    : hours;

  const availableEndMinutes = isSameDay && endHour === startHour
    ? minutes.filter((m) => parseInt(m) > parseInt(startMinute))
    : minutes;

  // Handlers that auto-fix end time on conflicts when same-day
  const handleStartHourChange = (hour: string) => {
    setStartHour(hour);

    if (isSameDay) {
      const startTotal = parseInt(hour) * 60 + parseInt(startMinute);
      const endTotal = parseInt(endHour) * 60 + parseInt(endMinute);

      if (endTotal <= startTotal) {
        const nextHour = Math.min(parseInt(hour) + 1, 23);
        setEndHour(String(nextHour).padStart(2, '0'));
        setEndMinute('00');
      }
    }
  };

  const handleStartMinuteChange = (minute: string) => {
    setStartMinute(minute);

    if (isSameDay) {
      const startTotal = parseInt(startHour) * 60 + parseInt(minute);
      const endTotal = parseInt(endHour) * 60 + parseInt(endMinute);

      if (endTotal <= startTotal) {
        const nextHour = Math.min(parseInt(startHour) + 1, 23);
        setEndHour(String(nextHour).padStart(2, '0'));
        setEndMinute('00');
      }
    }
  };

  // Collaborating clubs multi-select
  const [allClubs, setAllClubs] = useState<Array<any>>([]);
  const [collaboratingClubs, setCollaboratingClubs] = useState<string[]>([]);
  const [clubsOpen, setClubsOpen] = useState(false);
  const [clubSearch, setClubSearch] = useState('');
  const clubsRef = useRef<HTMLDivElement | null>(null);

  const isTeamEvent = formData.eventType === 'TEAM';

  const categoryOptions = ['Technical', 'Sports', 'Cultural', 'Entrepreneurship'];

  const toggleCategory = (cat: string) => {
    setFormData((prev) => {
      const curr: string[] = Array.isArray(prev.categories) ? prev.categories : [];
      const exists = curr.includes(cat);
      return { ...prev, categories: exists ? curr.filter((c) => c !== cat) : [...curr, cat] };
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'startDate') {
        if (next.endDate && next.endDate < value) {
          next.endDate = '';
          next.endTime = '';
        }
      }

      if (field === 'endDate') {
        if (next.startDate && value < next.startDate) {
          next.endDate = '';
          next.endTime = '';
        }
      }

      return next;
    });
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

  // Fetch clubs for collaborating clubs multi-select
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const token = window.localStorage.getItem('token') || window.localStorage.getItem('club_token') || '';
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/clubs', { headers });
        if (!res.ok) return;
        const data = await res.json();
        const clubs = Array.isArray(data?.data) ? data.data : [];
        const current = window.localStorage.getItem('clubId') || '';
        const filtered = clubs.filter((c: any) => String(c._id) !== String(current));
        setAllClubs(filtered);
      } catch (err) {
        console.warn('Failed to fetch clubs for collaborating list', err);
      }
    };

    fetchClubs();
  }, []);

  // Reset team member fields when event type is not team
  useEffect(() => {
    if (!isTeamEvent && (formData.minTeamMembers || formData.maxTeamMembers)) {
      setFormData((prev) => ({
        ...prev,
        minTeamMembers: '',
        maxTeamMembers: '',
      }));
    }
  }, [isTeamEvent]);

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

    // Basic content validation
    if (!formData.title || formData.title.trim().length < 3) {
      const errorMsg = 'Title must be at least 3 characters.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
      return;
    }

    if (!formData.description || formData.description.trim().length < 10) {
      const errorMsg = 'Description must be at least 10 characters.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
      return;
    }

      const startTimeStr = `${startHour}:${startMinute}`;
      const endTimeStr = `${endHour}:${endMinute}`;

      const requiredFields = [
        formData.title,
        formData.description,
        formData.eventType,
        formData.startDate,
        formData.endDate,
        startTimeStr,
        endTimeStr,
        formData.registrationDeadline,
        formData.venueType,
        formData.maxParticipants,
      ];

    if (requiredFields.some((value) => !value)) {
      const errorMsg = 'Please fill in all required fields.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
      return;
    }

    // Validate categories (must be at least one)
    if (!Array.isArray(formData.categories) || formData.categories.length === 0) {
      const errorMsg = 'Please select at least one event category.';
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

    const maxCapacity = Number(formData.maxParticipants);
    if (!Number.isFinite(maxCapacity) || maxCapacity < 1) {
      const errorMsg = 'Max capacity must be at least 1.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
      return;
    }

    // Validate team member fields if event type is team
    if (isTeamEvent) {
      if (!formData.minTeamMembers || !formData.maxTeamMembers) {
        const errorMsg = 'Please provide team size limits.';
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      const minTeamSize = Number(formData.minTeamMembers);
      const maxTeamSize = Number(formData.maxTeamMembers);

      if (!Number.isFinite(minTeamSize) || !Number.isFinite(maxTeamSize) || minTeamSize < 1 || maxTeamSize < 1) {
        const errorMsg = 'Team size limits must be at least 1.';
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      if (minTeamSize > maxTeamSize) {
        const errorMsg = 'Minimum team members cannot exceed maximum team members.';
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }
    }

    // Additional date validations
    try {
      const sd = new Date(formData.startDate);
      const ed = new Date(formData.endDate);
      const dl = formData.registrationDeadline ? new Date(formData.registrationDeadline) : null;
      const todayDate = new Date(today + 'T00:00:00');

      if (sd < todayDate) {
        const errorMsg = 'Start date cannot be in the past';
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      if (ed < sd) {
        const errorMsg = 'End date cannot be before start date';
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

        if (dl) {
          if (dl < todayDate) {
            const errorMsg = 'Registration deadline cannot be in the past';
            setSubmitError(errorMsg);
            toast.error(errorMsg);
            setIsSubmitting(false);
            return;
          }
          if (dl > sd) {
            const errorMsg = 'Registration deadline cannot be after the event start date';
            setSubmitError(errorMsg);
            toast.error(errorMsg);
            setIsSubmitting(false);
            return;
          }
        }
    } catch (err) {
      // ignore date parsing errors here; server will validate as well
    }

    // If same-day event, ensure end time is after start time
    if (formData.startDate === formData.endDate) {
      const startTotal = parseInt(startHour) * 60 + parseInt(startMinute);
      const endTotal = parseInt(endHour) * 60 + parseInt(endMinute);

      if (endTotal <= startTotal) {
        const errorMsg = 'End time must be after start time for same-day events';
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }
    }

    const payload = new FormData();
    payload.append('primaryClubId', formData.primaryClubId);
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('eventType', formData.eventType);
    payload.append('date', formData.startDate);
    payload.append('endDate', formData.endDate);
    payload.append('startTime', startTimeStr);
    payload.append('endTime', endTimeStr);
    payload.append('registrationDeadline', formData.registrationDeadline);
    payload.append('venueType', formData.venueType);
    payload.append('maxParticipants', formData.maxParticipants);
    
    // Only append team member fields if event type is team
    if (isTeamEvent) {
      payload.append('minTeamMembers', formData.minTeamMembers);
      payload.append('maxTeamMembers', formData.maxTeamMembers);
    }
    
    payload.append('collaboratingClubs', JSON.stringify(collaboratingClubs || []));
    payload.append('categories', JSON.stringify(formData.categories || []));
    payload.append('poster', posterImage);

    try {
      const response = await fetch('/api/club/events', {
        method: 'POST',
        body: payload,
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data?.error || 'Failed to create event.';
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Create New Event</h1>
            <p className="text-[#666666]">Fill in the details below to create your event.</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="bg-white rounded-xl border border-[#E8E8E8] p-8"
          >
            <form id="create-event-form" onSubmit={handleSubmit} className="space-y-6 pb-24 md:pb-0">
              <motion.div variants={item}>
                <InputField
                  label="Event Title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </motion.div>

              {isSameDay && (
                <motion.div variants={item} className="mb-2">
                  <p className="text-xs text-gray-400">
                    End time must be after {startHour}:{startMinute} for same-day events.
                  </p>
                </motion.div>
              )}

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

              <motion.div variants={item}>
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                    Event Categories <span className="text-[#D32F2F]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => {
                      const selected = Array.isArray(formData.categories) && formData.categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-3 py-1.5 rounded-full border transition-all text-sm ${selected ? 'bg-[#8B1E26] text-white border-[#8B1E26]' : 'bg-white text-[#2D2D2D] border-[#E8E8E8]'}`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={item} className="grid md:grid-cols-2 gap-6">
                <InputField
                  type="date"
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                  min={today}
                />
                <InputField
                  type="date"
                  label="End Date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate || today}
                  required
                />
              </motion.div>

              <motion.div variants={item} className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Start Time <span className="text-[#D32F2F]">*</span></label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                            <select
                              value={startHour}
                              onChange={(e) => handleStartHourChange(e.target.value)}
                              disabled={!formData.startDate}
                              className="w-full pl-9 pr-4 py-2 h-10 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:border-[#9B1C1C] transition-all disabled:cursor-not-allowed disabled:bg-[#F8F9FA] appearance-none"
                            >
                              {hours.map((val) => (
                                <option key={val} value={val}>{val}</option>
                              ))}
                            </select>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Hour</p>
                    
                        </div>
                        <div className="w-28">
                          <select
                            value={startMinute}
                            onChange={(e) => handleStartMinuteChange(e.target.value)}
                            disabled={!formData.startDate}
                            className="w-full px-3 py-2 h-10 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#9B1C1C] transition-all disabled:cursor-not-allowed disabled:bg-[#F8F9FA] appearance-none"
                          >
                            {minutes.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-400 mt-1">Minute</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">End Time <span className="text-[#D32F2F]">*</span></label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                            <select
                              value={endHour}
                              onChange={(e) => setEndHour(e.target.value)}
                              disabled={!formData.endDate}
                              className="w-full pl-9 pr-4 py-2 h-10 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:border-[#9B1C1C] transition-all disabled:cursor-not-allowed disabled:bg-[#F8F9FA] appearance-none"
                            >
                              {availableEndHours.map((val) => (
                                <option key={val} value={val}>{val}</option>
                              ))}
                            </select>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Hour</p>
                        </div>
                        <div className="w-28">
                          <select
                            value={endMinute}
                            onChange={(e) => setEndMinute(e.target.value)}
                            disabled={!formData.endDate}
                            className="w-full px-3 py-2 h-10 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#9B1C1C] transition-all disabled:cursor-not-allowed disabled:bg-[#F8F9FA] appearance-none"
                          >
                            {availableEndMinutes.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-400 mt-1">Minute</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={item}>
                <div>
                  <InputField
                    type="date"
                    label="Registration Deadline"
                    value={formData.registrationDeadline || ''}
                    onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                    min={today}
                    max={formData.startDate || ''}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Deadline can be set up to the event start date</p>
                </div>
              </motion.div>

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
                  label="Max Capacity"
                  placeholder="Maximum number of attendees/teams"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                  min={1}
                  required
                />
              </motion.div>

              {/* Team Member Fields - Conditionally Rendered */}
              {isTeamEvent && (
                <motion.div 
                  variants={item}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid md:grid-cols-2 gap-6 overflow-hidden"
                >
                  <InputField
                    type="number"
                    label="Minimum Team Members"
                    placeholder="Minimum members per team"
                    value={formData.minTeamMembers}
                    onChange={(e) => handleInputChange('minTeamMembers', e.target.value)}
                    min={1}
                    required={isTeamEvent}
                  />
                  <InputField
                    type="number"
                    label="Maximum Team Members"
                    placeholder="Maximum members per team"
                    value={formData.maxTeamMembers}
                    onChange={(e) => handleInputChange('maxTeamMembers', e.target.value)}
                    min={1}
                    required={isTeamEvent}
                  />
                </motion.div>
              )}

              <motion.div variants={item}>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Collaborating Clubs (Optional)</label>
                <div ref={clubsRef} className="relative">
                  <div
                    onClick={() => setClubsOpen(true)}
                    className="w-full border border-[#E8E8E8] rounded-lg p-2 flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="text"
                      placeholder="🔍 Search clubs..."
                      value={clubSearch}
                      onChange={(e) => { setClubSearch(e.target.value); setClubsOpen(true); }}
                      onFocus={() => setClubsOpen(true)}
                      onBlur={() => setTimeout(() => setClubsOpen(false), 150)}
                      className="flex-1 outline-none px-2 bg-transparent"
                    />
                    <div className="text-sm text-gray-500">▼</div>
                  </div>

                  {clubsOpen && (
                    <div className="absolute z-40 mt-2 w-full max-h-48 overflow-y-auto bg-white border border-[#E8E8E8] rounded-lg p-2">
                      {allClubs.filter(c => c.club_name.toLowerCase().includes(clubSearch.toLowerCase())).length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">No other clubs found</div>
                      ) : (
                        allClubs.filter(c => c.club_name.toLowerCase().includes(clubSearch.toLowerCase())).map((club) => {
                          const selected = collaboratingClubs.includes(String(club._id));
                          return (
                            <div key={club._id} className={`p-2 rounded hover:bg-[#F8F9FA] flex items-center justify-between ${selected ? 'bg-[#F8F8F8]' : ''}`}>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-[#2D2D2D]">{club.club_name}</div>
                                <div className="text-xs text-gray-400">{club.email || ''}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (selected) setCollaboratingClubs(prev => prev.filter(id => id !== String(club._id)));
                                  else setCollaboratingClubs(prev => [...prev, String(club._id)]);
                                  setClubsOpen(false);
                                }}
                                className={`px-2 py-1 text-sm rounded ${selected ? 'bg-[#8B1E26] text-white' : 'bg-white text-[#8B1E26] border border-[#E8E8E8]'}`}
                              >
                                {selected ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {collaboratingClubs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {collaboratingClubs.map((id) => {
                        const club = allClubs.find(c => String(c._id) === String(id));
                        return (
                          <div key={id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-[#FCA5A5] text-[#9B1C1C]">
                            <span className="text-sm">{club?.club_name || id}</span>
                            <button type="button" onClick={() => setCollaboratingClubs(prev => prev.filter(x => x !== id))} className="text-gray-500">✕</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>

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

              <motion.div variants={item} className="hidden md:flex flex-col gap-4 pt-6">
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
            <div className="md:hidden sticky bottom-0 mt-6 -mx-8 px-8 py-4 bg-white/95 backdrop-blur border-t border-[#E8E8E8]">
              {submitError && (
                <p className="text-sm text-[#D32F2F] mb-3">{submitError}</p>
              )}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  type="submit"
                  form="create-event-form"
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border-2 border-[#E8E8E8] text-[#2D2D2D] rounded-lg font-bold hover:bg-[#F8F9FA] transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}