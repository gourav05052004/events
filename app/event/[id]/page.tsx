'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/navbar';
import { Modal } from '@/components/modal';
import { formatDateRange } from '@/lib/utils';
import { Calendar, MapPin, Users, Share2, CheckCircle, Loader, AlertCircle, X, Plus, Hourglass } from 'lucide-react';

interface EventDetail {
  _id: string;
  title: string;
  description: string;
  date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  location: string;
  registration_deadline?: string;
  status: 'approved' | 'pending' | 'cancelled';
  club_name: string;
  registrations: number;
  max_participants: number;
  min_team_members?: number | null;
  max_team_members?: number | null;
  event_type: string;
  poster_url?: string;
}

interface GroupMember {
  id: string;
  name: string;
  email: string;
  rollNumber?: string;
  consentCode?: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', rollNumber: '', consentCode: '' });
  const [studentConsentCode, setStudentConsentCode] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [backRoute, setBackRoute] = useState('/');
  const [backLabel, setBackLabel] = useState('← Back');
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const token = localStorage.getItem('token') || getCookie('student_token') || getCookie('token');
    const loggedIn = Boolean(token);

    setIsLoggedIn(loggedIn);
    setBackRoute(loggedIn ? '/student/events' : '/');
    setBackLabel(loggedIn ? '← Back' : '← Back');

    // Derive role from token if present (localStorage or cookies)
    const rawToken = token || getCookie('club_token') || getCookie('admin_token');
    if (rawToken) {
      try {
        const parts = rawToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const r = (payload.role || payload?.role || payload?.role_name || '').toString().toLowerCase();
          if (r === 'club' || r === 'student' || r === 'admin') setRole(r);
          else setRole(null);
        }
      } catch (err) {
        console.warn('Failed to decode token role', err);
        setRole(null);
      }
    } else {
      setRole(null);
    }

    fetchEventDetails();
    // Only check student registration status when token belongs to a student
    if (token && (localStorage.getItem('token') || role === 'student')) {
      // If role is already decoded and is student, check; otherwise attempt checkRegistrationStatus which will safely handle non-students
      if (role === 'student' || !role) {
        checkRegistrationStatus();
      }
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
        if (data.consentCode) setStudentConsentCode(data.consentCode);
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

  // Render collaborating clubs if present (admin API populates collaboratingClubs)

  const isTeamEvent = event?.event_type?.toUpperCase() === 'TEAM';
  const minMembers = event?.min_team_members ?? 2;
  const maxMembers = event?.max_team_members ?? 10;
  // max additional members the user can add (total = leader + members, so max additional = maxMembers - 1)
  const maxAdditionalMembers = maxMembers - 1;
  // min additional members needed (total >= minMembers, so min additional = minMembers - 1)
  const minAdditionalMembers = Math.max(minMembers - 1, 1);

  const handleRegister = async () => {
    // Check if user is logged in before allowing registration
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to register for this event');
      // Redirect to login with return URL
      router.push(`/login?role=student&redirect=/event/${eventId}`);
      return;
    }

    // Block registration after deadline
    if (event?.registration_deadline) {
      const dl = new Date(event.registration_deadline);
      if (!isNaN(dl.getTime()) && new Date() > dl) {
        toast.error('Registration has closed for this event');
        return;
      }
    }

    if (registrationStep === 1) {
      if (isTeamEvent) {
        setRegistrationStep(2);
        toast(`Build your team (${minMembers}-${maxMembers} members including you)`, { icon: '👥' });
      } else {
        // For individual events, go straight to confirmation
        setRegistrationStep(3);
        toast('Ready to confirm registration', { icon: 'ℹ️' });
      }
    } else if (registrationStep === 2) {
      // Validate team name
      if (!teamName.trim()) {
        toast.error('Please enter a team name');
        return;
      }
      // Validate team size (total = leader + members)
      const totalSize = groupMembers.length + 1;
      if (totalSize < minMembers) {
        toast.error(`You need at least ${minAdditionalMembers} more team member${minAdditionalMembers > 1 ? 's' : ''} (minimum team size: ${minMembers})`);
        return;
      }
      if (totalSize > maxMembers) {
        toast.error(`Team size exceeds maximum of ${maxMembers} members`);
        return;
      }
      setRegistrationStep(3);
      toast('Ready to confirm team registration', { icon: '✅' });
    } else if (registrationStep === 3) {
      // Submit registration
      await submitRegistration();
    }
  };

  const addGroupMember = () => {
    if (!newMember.name || !newMember.email || !newMember.consentCode) {
      toast.error('Please fill in name, email, and consent code');
      return;
    }
    // Check if already at max
    if (groupMembers.length >= maxAdditionalMembers) {
      toast.error(`Maximum team size is ${maxMembers} (including you). Cannot add more members.`);
      return;
    }
    // Check for duplicate email
    if (groupMembers.some((m) => m.email.toLowerCase() === newMember.email.toLowerCase())) {
      toast.error('A member with this email is already added');
      return;
    }
    const member: GroupMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      rollNumber: newMember.rollNumber || undefined,
      consentCode: newMember.consentCode.trim().toUpperCase(),
    };
    setGroupMembers([...groupMembers, member]);
    setNewMember({ name: '', email: '', rollNumber: '', consentCode: '' });
    toast.success('Member added to team');
  };

  const removeGroupMember = (id: string) => {
    setGroupMembers(groupMembers.filter((m) => m.id !== id));
    toast.success('Member removed from team');
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

      const registrationData: any = {
        eventId: event?._id,
        eventTitle: event?.title,
        registrationType: isTeamEvent ? 'team' : 'individual',
        members: isTeamEvent ? groupMembers : [],
      };

      if (isTeamEvent) {
        registrationData.teamName = teamName.trim();
      }

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
      toast.success(isTeamEvent ? `Team "${teamName.trim()}" registered successfully!` : 'Successfully registered for the event!');
      setTimeout(() => {
        setShowConfirmation(false);
        setRegistrationStep(1);
        setGroupMembers([]);
        setTeamName('');
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

  const executeCancellation = async () => {
    // Block cancellation after deadline
    if (event?.registration_deadline) {
      const dl = new Date(event.registration_deadline);
      if (!isNaN(dl.getTime()) && new Date() > dl) {
        toast.error('Cancellation period has ended for this event');
        return;
      }
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

  const handleCancelRegistration = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-[#2D2D2D]">Are you sure you want to cancel your registration?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm font-medium border border-[#E8E8E8] text-[#666666] rounded-md hover:bg-[#F8F9FA]"
          >
            No, keep it
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              executeCancellation();
            }}
            className="px-3 py-1.5 text-sm font-medium bg-[#8B1E26] text-white rounded-md hover:bg-[#6B1520]"
          >
            Yes, cancel
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
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
              {backLabel}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const registrationPercentage = Math.round((event.registrations / event.max_participants) * 100);
  const eventDate = formatDateRange(event.date, event.end_date, 'en-GB');

  function formatDeadline(deadline?: string) {
    if (!deadline) return 'TBD';
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return 'TBD';
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');
    return `Ends on ${day} ${month} ${year}, ${hour}:${minute}`;
  }

  const isPastDeadline = (() => {
    if (!event?.registration_deadline) return false;
    const d = new Date(event.registration_deadline);
    if (isNaN(d.getTime())) return false;
    return new Date() > d;
  })();

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Event Details" hideLoginButton={true} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-red-800 hover:text-red-900 font-medium text-sm cursor-pointer mb-4 w-fit"
        >
          {backLabel}
        </motion.button>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl overflow-hidden mb-8 h-96 bg-linear-to-br from-[#8B1E26] to-[#6B1520]"
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
              {(event as any).collaboratingClubs && (event as any).collaboratingClubs.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mt-1">In collaboration with: {(event as any).collaboratingClubs.map((c: any) => c.name).join(', ')}</p>
                </div>
              )}
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
                {event.registration_deadline && (
                  <div className="flex items-center gap-3">
                    <Hourglass className="text-[#8B1E26]" size={24} />
                    <div>
                      <p className="text-sm text-[#666666]">Registration Deadline</p>
                      <p className="font-bold text-[#2D2D2D]">{formatDeadline(event.registration_deadline)}</p>
                    </div>
                  </div>
                )}
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
                {event.event_type === 'TEAM' && event.min_team_members && event.max_team_members ? (
                  <div className="flex items-center gap-3">
                    <Users className="text-[#8B1E26]" size={24} />
                    <div>
                      <p className="text-sm text-[#666666]">Team Size</p>
                      <p className="font-bold text-[#2D2D2D]">
                        {event.min_team_members} - {event.max_team_members} members
                      </p>
                    </div>
                  </div>
                ) : null}
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
              {role && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (role === 'club') router.push('/club/dashboard');
                    else if (role === 'admin') router.push('/admin/dashboard');
                    else if (role === 'student') router.push('/student/dashboard');
                  }}
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
                    You are registered for this event.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelRegistration}
                    disabled={isPastDeadline}
                    className={`w-full px-4 py-2 rounded-lg font-bold transition-all ${isPastDeadline ? 'bg-gray-200 text-gray-600 border border-gray-200 cursor-not-allowed' : 'border-2 border-[#8B1E26] text-[#8B1E26] hover:bg-[#8B1E26]/5'}`}
                  >
                    {isPastDeadline ? 'Cancellation Closed' : 'Cancel Registration'}
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

                          {role === 'student' && isTeamEvent && studentConsentCode && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                              <h3 className="font-semibold text-blue-800 mb-1">Your Team Consent Code</h3>
                              <p className="text-xs text-blue-600 mb-2">Share this code with your team leader so they can add you to their team.</p>
                              <div className="flex items-center justify-between bg-white border border-blue-200 rounded p-2">
                                <code className="text-lg font-mono font-bold text-blue-700 tracking-wider">{studentConsentCode}</code>
                                <button
                                  onClick={() => { navigator.clipboard.writeText(studentConsentCode); toast.success('Code copied to clipboard'); }}
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Render registration controls based on decoded role */}
                          {(!role || role === null) && (
                            <>
                              <div className="bg-[#FFFBEA] border border-[#F59E0B] rounded-lg p-3 mb-4">
                                <p className="text-sm text-[#92400E] text-center">
                                  Please login to register for this event
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push(`/login?role=student&redirect=/event/${eventId}`)}
                                disabled={isSubmitting || isPastDeadline}
                                className={`w-full px-4 py-3 rounded-lg font-bold transition-all ${isPastDeadline ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-linear-to-r from-[#8B1E26] to-[#6B1520] text-white hover:shadow-lg'}`}
                              >
                                {isPastDeadline ? 'Registration Closed' : 'Login to Register'}
                              </motion.button>
                            </>
                          )}

                          {role === 'student' && (
                            <>
                              <p className="text-[#666666] text-sm mb-6">{event.max_participants - event.registrations} seats available</p>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRegister}
                                disabled={isSubmitting || isPastDeadline}
                                className={`w-full px-4 py-3 rounded-lg font-bold transition-all ${isPastDeadline ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-linear-to-r from-[#8B1E26] to-[#6B1520] text-white hover:shadow-lg'}`}
                              >
                                {isPastDeadline ? 'Registration Closed' : (isSubmitting ? 'Processing...' : 'Register Now')}
                              </motion.button>
                            </>
                          )}

                          {(role === 'club' || role === 'admin') && (
                            <div className="text-center py-6">
                              <div className="bg-white border border-[#E8E8E8] rounded-lg p-4 mb-4 text-left">
                                <p className="text-sm text-[#666666]">👥 Capacity</p>
                                <p className="font-bold text-[#2D2D2D]">{event.registrations} / {event.max_participants} seats filled</p>
                                <p className="text-sm text-[#666666] mt-3">ℹ️ Registration is only available for students</p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {registrationStep === 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="bg-[#F8F9FA] p-4 rounded-lg">
                            <h4 className="font-semibold text-[#2D2D2D] mb-1">Build Your Team</h4>
                            <p className="text-xs text-[#666666] mb-4">
                              Team size: {minMembers}–{maxMembers} members (including you)
                            </p>

                            {/* Team Name */}
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Team Name</label>
                              <input
                                type="text"
                                placeholder="Enter your team name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none"
                              />
                            </div>

                            {/* Member Counter */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-[#2D2D2D]">Team Members</span>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${(groupMembers.length + 1) >= minMembers
                                  ? 'bg-[#10B981]/15 text-[#10B981]'
                                  : 'bg-[#F59E0B]/15 text-[#92400E]'
                                }`}>
                                {groupMembers.length + 1} / {maxMembers}
                              </span>
                            </div>

                            {/* You (Leader) */}
                            <div className="flex items-center gap-2 bg-[#8B1E26]/5 p-2.5 rounded-lg border border-[#8B1E26]/20 mb-2">
                              <div className="w-7 h-7 bg-[#8B1E26] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                👑
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#2D2D2D]">You (Team Leader)</p>
                              </div>
                            </div>

                            {/* Added Members */}
                            <div className="space-y-2 mb-4 max-h-36 overflow-y-auto">
                              {groupMembers.map((member, index) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-[#E8E8E8]"
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <div className="w-7 h-7 bg-[#F0F0F0] text-[#666666] rounded-full flex items-center justify-center text-xs font-bold">
                                      {index + 2}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-[#2D2D2D] text-sm truncate">{member.name}</p>
                                      <p className="text-xs text-[#666666] truncate">{member.email}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeGroupMember(member.id)}
                                    className="text-red-500 hover:text-red-700 ml-1 p-1"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add Member Form */}
                            {groupMembers.length < maxAdditionalMembers && (
                              <div className="bg-white border border-[#E8E8E8] rounded-lg p-3 space-y-2">
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
                                  placeholder="Member consent code"
                                  value={newMember.consentCode}
                                  onChange={(e) =>
                                    setNewMember({ ...newMember, consentCode: e.target.value.toUpperCase() })
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
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={addGroupMember}
                                  className="w-full px-3 py-2 bg-[#8B1E26]/10 text-[#8B1E26] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#8B1E26]/20 transition-all"
                                >
                                  <Plus size={16} />
                                  Add Member ({groupMembers.length + 1}/{maxMembers})
                                </motion.button>
                              </div>
                            )}

                            {groupMembers.length >= maxAdditionalMembers && (
                              <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-3 text-center">
                                <p className="text-sm text-[#10B981] font-medium">✅ Maximum team size reached</p>
                              </div>
                            )}

                            {/* Min requirement hint */}
                            {(groupMembers.length + 1) < minMembers && (
                              <div className="bg-[#FFFBEA] border border-[#F59E0B]/30 rounded-lg p-2.5">
                                <p className="text-xs text-[#92400E]">
                                  ⚠️ Add at least {minMembers - 1 - groupMembers.length} more member{(minMembers - 1 - groupMembers.length) > 1 ? 's' : ''} to meet the minimum team size of {minMembers}.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setRegistrationStep(1);
                                setGroupMembers([]);
                                setTeamName('');
                                setNewMember({ name: '', email: '', rollNumber: '', consentCode: '' });
                              }}
                              className="flex-1 px-4 py-2 border-2 border-[#8B1E26] text-[#8B1E26] rounded-lg font-bold hover:bg-[#8B1E26]/5 transition-all"
                            >
                              Back
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleRegister}
                              disabled={isSubmitting || !teamName.trim() || (groupMembers.length + 1) < minMembers}
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
                            {isTeamEvent ? (
                              <>
                                <div className="bg-white border border-[#E8E8E8] rounded-lg p-3 mb-3">
                                  <p className="text-xs text-[#666666] mb-0.5">Team Name</p>
                                  <p className="font-bold text-[#2D2D2D]">{teamName}</p>
                                </div>
                                <p className="text-sm text-[#666666] mb-2">
                                  {groupMembers.length + 1} team member{groupMembers.length + 1 !== 1 ? 's' : ''} (including you)
                                </p>
                                <div className="space-y-1.5">
                                  <div className="text-xs bg-[#8B1E26]/5 p-2 rounded border border-[#8B1E26]/20 flex items-center gap-2">
                                    <span>👑</span>
                                    <p className="font-medium text-[#2D2D2D]">You (Team Leader)</p>
                                  </div>
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
                              </>
                            ) : (
                              <p className="text-sm text-[#666666] mb-3">Individual registration</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setRegistrationStep(isTeamEvent ? 2 : 1);
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

          {isTeamEvent && teamName && (
            <div className="bg-[#F8F9FA] p-4 rounded-lg mb-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Users className="text-[#8B1E26]" size={18} />
                <h3 className="font-semibold text-[#2D2D2D]">Team: {teamName}</h3>
              </div>
              <ul className="space-y-2">
                <li className="text-sm text-[#666666] bg-[#8B1E26]/5 p-2 rounded border border-[#8B1E26]/20">
                  <p className="font-medium text-[#2D2D2D]">👑 You (Team Leader)</p>
                </li>
                {groupMembers.map((member) => (
                  <li key={member.id} className="text-sm text-[#666666] bg-white p-2 rounded border border-[#E8E8E8]">
                    <p className="font-medium text-[#2D2D2D]">{member.name}</p>
                    <p className="text-xs">{member.email}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}


        </motion.div>
      </Modal>
    </main>
  );
}

