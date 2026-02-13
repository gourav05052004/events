'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Modal } from '@/components/modal';
import { Calendar, MapPin, Users, Share2, CheckCircle, Loader, AlertCircle, X, Plus } from 'lucide-react';

interface EventDetail {
  _id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  status: 'approved' | 'pending' | 'cancelled';
  club_name: string;
  registrations: number;
  max_participants: number;
  event_type: string;
  poster_url?: string;
}

interface GroupMember {
  id: string;
  name: string;
  email: string;
  rollNumber?: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', rollNumber: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    fetchEventDetails();
    if (token) {
      checkRegistrationStatus();
    }
  }, [eventId]);

  const checkRegistrationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsRegistered(false);
        return;
      }

      const response = await fetch(`/api/student/events/${eventId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsRegistered(data.isRegistered || false);
      } else {
        setIsRegistered(false);
      }
    } catch (err) {
      console.error('Error checking registration status:', err);
      setIsRegistered(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/events`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      const foundEvent = data.data.find((e: EventDetail) => e._id === eventId);
      
      if (!foundEvent) {
        throw new Error('Event not found');
      }

      setEvent(foundEvent);
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to load event details';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    // Check if user is logged in before allowing registration
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to register for this event');
      // Redirect to login with return URL
      router.push(`/login?role=student&redirect=/event/${eventId}`);
      return;
    }

    const isGroupEvent = event?.event_type?.toLowerCase().includes('group');
    
    if (registrationStep === 1) {
      if (isGroupEvent) {
        setRegistrationStep(2);
        toast('Add your group members', { icon: 'ℹ️' });
      } else {
        // For individual events, go straight to confirmation
        setRegistrationStep(3);
        toast('Ready to confirm registration', { icon: 'ℹ️' });
      }
    } else if (registrationStep === 2) {
      // Confirm group members and move to final step
      if (groupMembers.length === 0) {
        toast.error('Please add at least one group member');
        return;
      }
      setRegistrationStep(3);
      toast('Ready to confirm registration', { icon: 'ℹ️' });
    } else if (registrationStep === 3) {
      // Submit registration
      await submitRegistration();
    }
  };

  const addGroupMember = () => {
    if (!newMember.name || !newMember.email) {
      toast.error('Please fill in name and email');
      return;
    }
    const member: GroupMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      rollNumber: newMember.rollNumber || undefined,
    };
    setGroupMembers([...groupMembers, member]);
    setNewMember({ name: '', email: '', rollNumber: '' });
    toast.success('Member added to group');
  };

  const removeGroupMember = (id: string) => {
    setGroupMembers(groupMembers.filter((m) => m.id !== id));
    toast.success('Member removed from group');
  };

  const submitRegistration = async () => {
    try {
      setIsSubmitting(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first to register for events');
        router.push('/login');
        return;
      }

      const isGroupEvent = event?.event_type?.toLowerCase().includes('group');
      
      const registrationData = {
        eventId: event?._id,
        eventTitle: event?.title,
        registrationType: isGroupEvent ? 'group' : 'individual',
        members: isGroupEvent ? groupMembers : [],
      };

      const response = await fetch('/api/student/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          toast.error('Your session expired. Please login again');
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to register for event');
      }

      setIsRegistered(true);
      setShowConfirmation(true);
      toast.success('Successfully registered for the event!');
      setTimeout(() => {
        setShowConfirmation(false);
        setRegistrationStep(1);
        setGroupMembers([]);
      }, 3000);
    } catch (err) {
      const errorMsg = (err as Error).message;
      toast.error(errorMsg);
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;
    
    const eventUrl = window.location.href;
    const shareData = {
      title: event.title,
      text: `Check out this event: ${event.title}`,
      url: eventUrl,
    };

    try {
      // Check if Web Share API is available (works better on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Event shared successfully!');
      } else if (navigator.share) {
        // Fallback for browsers that support share but not canShare
        await navigator.share(shareData);
        toast.success('Event shared successfully!');
      } else {
        // Fallback to clipboard for desktop
        await navigator.clipboard.writeText(eventUrl);
        toast.success('Event link copied to clipboard!');
      }
    } catch (err) {
      const error = err as Error;
      // User cancelled the share, don't show error
      if (error.name === 'AbortError') {
        return;
      }
      // For other errors, try clipboard as fallback
      try {
        await navigator.clipboard.writeText(eventUrl);
        toast.success('Event link copied to clipboard!');
      } catch {
        toast.error('Unable to share. Please copy the URL manually.');
      }
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm('Are you sure you want to cancel your registration?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/student/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          toast.error('Your session expired. Please login again');
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to cancel registration');
      }

      setIsRegistered(false);
      setRegistrationStep(1);
      toast.success('Registration cancelled successfully');
    } catch (err) {
      const errorMsg = (err as Error).message;
      toast.error(errorMsg);
      console.error('Cancel registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Event Details" hideLoginButton={true} />
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 text-[#8B1E26] animate-spin" />
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Event Details" hideLoginButton={true} />
        <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 border border-red-200 w-full max-w-md">
            <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold text-[#2D2D2D] text-center mb-2">Event Not Found</h2>
            <p className="text-[#666666] text-center mb-6">{error || 'Could not load event details'}</p>
            <button
              onClick={() => router.back()}
              className="w-full px-4 py-2 bg-[#8B1E26] text-white rounded-lg font-bold hover:bg-[#6B1520]"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  const registrationPercentage = Math.round((event.registrations / event.max_participants) * 100);
  const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Event Details" hideLoginButton={true} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl overflow-hidden mb-8 h-96 bg-gradient-to-br from-[#8B1E26] to-[#6B1520]"
        >
          {event.poster_url ? (
            <img
              src={event.poster_url}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative w-full h-full flex items-center justify-center">
            
          </div>
          <div className="absolute top-4 right-4 z-10">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-3 sm:p-3 rounded-full bg-white text-[#2D2D2D] hover:bg-white/90 transition-all shadow-lg active:shadow-xl touch-manipulation"
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <Share2 size={24} />
            </motion.button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {/* Title & Status */}
            <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl font-bold text-[#2D2D2D] flex-1">{event.title}</h1>
                </div>
              <p className="text-[#666666]">Organized by {event.club_name}</p>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-xl p-6 mb-6 border border-[#E8E8E8]">
              <div className="grid gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#8B1E26]" size={24} />
                  <div>
                    <p className="text-sm text-[#666666]">Date</p>
                    <p className="font-bold text-[#2D2D2D]">{eventDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#8B1E26]" size={24} />
                  <div>
                    <p className="text-sm text-[#666666]">Time</p>
                    <p className="font-bold text-[#2D2D2D]">{event.start_time} - {event.end_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-[#8B1E26]" size={24} />
                  <div>
                    <p className="text-sm text-[#666666]">Location</p>
                    <p className="font-bold text-[#2D2D2D]">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="text-[#8B1E26]" size={24} />
                  <div>
                    <p className="text-sm text-[#666666]">Capacity</p>
                    <p className="font-bold text-[#2D2D2D]">
                      {event.registrations} / {event.max_participants} registered
                    </p>
                  </div>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="bg-[#F0F0F0] rounded-full h-3 overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${registrationPercentage}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-[#10B981]"
                />
              </div>
              <p className="text-sm text-[#666666]">{registrationPercentage}% capacity filled</p>
            </div>

            {/* Description */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">About This Event</h2>
              <p className="text-[#666666] leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </motion.div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 my-8">
              <span className="px-4 py-2 bg-[#8B1E26]/10 text-[#8B1E26] rounded-full text-sm font-medium">
                {event.event_type}
              </span>
              <span className="px-4 py-2 bg-[#10B981]/20 text-[#10B981] rounded-full text-sm font-medium">
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>
          </motion.div>

          {/* Sidebar - Registration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl p-6 border border-[#E8E8E8] sticky top-24">
              {isLoggedIn && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/student/dashboard')}
                  className="w-full mb-4 px-4 py-2 bg-[#F8F9FA] text-[#2D2D2D] rounded-lg font-medium hover:bg-[#E8E8E8] transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Go to Dashboard
                </motion.button>
              )}
              
              {isRegistered ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block mb-4"
                  >
                    <CheckCircle className="text-[#10B981]" size={48} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">Registered!</h3>
                  <p className="text-[#666666] text-sm mb-6">
                    You are registered for this event. Check your email for confirmation.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelRegistration}
                    className="w-full px-4 py-2 border-2 border-[#8B1E26] text-[#8B1E26] rounded-lg font-bold hover:bg-[#8B1E26]/5 transition-all"
                  >
                    Cancel Registration
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-[#2D2D2D] mb-4">Registration</h3>

                  {registrationPercentage >= 100 ? (
                    <div className="text-center py-6">
                      <p className="text-[#D32F2F] font-bold mb-4">Event is Full</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full px-4 py-2 border-2 border-[#8B1E26] text-[#8B1E26] rounded-lg font-bold opacity-50 cursor-not-allowed"
                        disabled
                      >
                        Join Waitlist
                      </motion.button>
                    </div>
                  ) : (
                    <>
                      {registrationStep === 1 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <p className="text-[#666666] text-sm mb-6">
                            {event.max_participants - event.registrations} seats available
                          </p>
                          
                          {!isLoggedIn && (
                            <div className="bg-[#FFFBEA] border border-[#F59E0B] rounded-lg p-3 mb-4">
                              <p className="text-sm text-[#92400E] text-center">
                                Please login to register for this event
                              </p>
                            </div>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRegister}
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 bg-gradient-to-r from-[#8B1E26] to-[#6B1520] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {isSubmitting ? 'Processing...' : (isLoggedIn ? 'Register Now' : 'Login to Register')}
                          </motion.button>
                        </motion.div>
                      )}

                      {registrationStep === 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="bg-[#F8F9FA] p-4 rounded-lg">
                            <h4 className="font-semibold text-[#2D2D2D] mb-3">Add Group Members</h4>
                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                              {groupMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#E8E8E8]"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-[#2D2D2D]">{member.name}</p>
                                    <p className="text-xs text-[#666666]">{member.email}</p>
                                  </div>
                                  <button
                                    onClick={() => removeGroupMember(member.id)}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="bg-white border border-[#E8E8E8] rounded-lg p-3 space-y-2 mb-3">
                              <input
                                type="text"
                                placeholder="Member name"
                                value={newMember.name}
                                onChange={(e) =>
                                  setNewMember({ ...newMember, name: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none"
                              />
                              <input
                                type="email"
                                placeholder="Member email"
                                value={newMember.email}
                                onChange={(e) =>
                                  setNewMember({ ...newMember, email: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Roll number (optional)"
                                value={newMember.rollNumber}
                                onChange={(e) =>
                                  setNewMember({ ...newMember, rollNumber: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none"
                              />
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addGroupMember}
                                className="w-full px-3 py-2 bg-[#8B1E26]/10 text-[#8B1E26] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#8B1E26]/20 transition-all"
                              >
                                <Plus size={16} />
                                Add Member
                              </motion.button>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setRegistrationStep(1);
                                setGroupMembers([]);
                                setNewMember({ name: '', email: '', rollNumber: '' });
                              }}
                              className="flex-1 px-4 py-2 border-2 border-[#8B1E26] text-[#8B1E26] rounded-lg font-bold hover:bg-[#8B1E26]/5 transition-all"
                            >
                              Back
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleRegister}
                              disabled={isSubmitting || groupMembers.length === 0}
                              className="flex-1 px-4 py-2 bg-[#8B1E26] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                              {isSubmitting ? 'Processing...' : 'Continue'}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      {registrationStep === 3 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="bg-[#F8F9FA] p-4 rounded-lg">
                            <h4 className="font-semibold text-[#2D2D2D] mb-3">Confirm Registration</h4>
                            <p className="text-sm text-[#666666] mb-3">
                              {event?.event_type?.toLowerCase().includes('group')
                                ? `You are registering with ${groupMembers.length} ${
                                    groupMembers.length === 1 ? 'member' : 'members'
                                  }`
                                : 'Individual registration'}
                            </p>
                            {event?.event_type?.toLowerCase().includes('group') && (
                              <div className="space-y-2">
                                {groupMembers.map((member) => (
                                  <div
                                    key={member.id}
                                    className="text-xs bg-white p-2 rounded border border-[#E8E8E8]"
                                  >
                                    <p className="font-medium text-[#2D2D2D]">{member.name}</p>
                                    <p className="text-[#666666]">{member.email}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setRegistrationStep(
                                  event?.event_type?.toLowerCase().includes('group') ? 2 : 1
                                );
                              }}
                              className="flex-1 px-4 py-2 border-2 border-[#8B1E26] text-[#8B1E26] rounded-lg font-bold hover:bg-[#8B1E26]/5 transition-all"
                            >
                              Back
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleRegister}
                              disabled={isSubmitting}
                              className="flex-1 px-4 py-2 bg-[#10B981] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                              {isSubmitting ? 'Confirming...' : 'Confirm Registration'}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-6">
          <motion.div className="inline-block mb-4">
            <CheckCircle className="text-[#10B981]" size={64} />
          </motion.div>
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">Registration Successful!</h2>
          <p className="text-[#666666] mb-4">
            You have been successfully registered for <span className="font-semibold">{event.title}</span>. 
          </p>
          
          {event?.event_type?.toLowerCase().includes('group') && groupMembers.length > 0 && (
            <div className="bg-[#F8F9FA] p-4 rounded-lg mb-4 text-left">
              <h3 className="font-semibold text-[#2D2D2D] mb-2">Group Members</h3>
              <ul className="space-y-2">
                {groupMembers.map((member) => (
                  <li key={member.id} className="text-sm text-[#666666] bg-white p-2 rounded">
                    <p className="font-medium text-[#2D2D2D]">{member.name}</p>
                    <p className="text-xs">{member.email}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="text-sm text-[#666666]">
            Check your email for confirmation details and event information.
          </p>
        </motion.div>
      </Modal>
    </main>
  );
}

