'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/navbar';
import { StatusBadge } from '@/components/status-badge';
import { Modal } from '@/components/modal';
import { Calendar, MapPin, Users, Share2, Heart, CheckCircle } from 'lucide-react';

const eventDetails = {
  '1': {
    title: 'Annual Tech Summit 2025',
    date: 'Feb 15, 2025',
    time: '10:00 AM - 5:00 PM',
    location: 'Main Auditorium',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    status: 'approved' as const,
    attendees: 245,
    maxAttendees: 500,
    description: `The Annual Tech Summit 2025 is the biggest technology conference on campus, bringing together industry experts, 
    innovators, and tech enthusiasts. This event features keynote speeches, panel discussions, hands-on workshops, and networking opportunities.
    
    Participants will get to learn about the latest trends in AI, cloud computing, cybersecurity, and web development.`,
    agenda: [
      { time: '10:00 AM', title: 'Registration & Welcome Coffee' },
      { time: '10:30 AM', title: 'Keynote: Future of AI' },
      { time: '11:30 AM', title: 'Panel Discussion: Tech Careers' },
      { time: '12:30 PM', title: 'Lunch Break' },
      { time: '1:30 PM', title: 'Workshop Track' },
      { time: '3:00 PM', title: 'Networking Session' },
      { time: '5:00 PM', title: 'Closing Remarks' },
    ],
    organizer: 'Computer Science Club',
    tags: ['Technology', 'Career', 'Networking'],
  },
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const event = eventDetails[eventId as keyof typeof eventDetails] || {
    title: 'Event Not Found',
    date: '',
    time: '',
    location: '',
    image: 'https://via.placeholder.com/800x400',
    status: 'cancelled' as const,
    attendees: 0,
    maxAttendees: 0,
    description: 'This event could not be found.',
    agenda: [],
    organizer: '',
    tags: [],
  };

  const [isRegistered, setIsRegistered] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);

  const handleRegister = () => {
    if (registrationStep === 1) {
      setRegistrationStep(2);
      toast('Please confirm your registration', { icon: 'ℹ️' });
    } else {
      setIsRegistered(true);
      setShowConfirmation(true);
      toast.success('Registration confirmed! Check your email.');
      setTimeout(() => setShowConfirmation(false), 3000);
      setRegistrationStep(1);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleCancelRegistration = () => {
    if (confirm('Are you sure you want to cancel your registration?')) {
      setIsRegistered(false);
      setRegistrationStep(1);
      toast.success('Registration cancelled');
    }
  };

  const registrationPercentage = Math.round((event.attendees / event.maxAttendees) * 100);

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Event Details" showBackButton={true} onBackClick={() => router.back()} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl overflow-hidden mb-8 h-96"
        >
          <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleFavorite}
              className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                isFavorited
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-[#2D2D2D] hover:bg-white'
              }`}
            >
              <Heart size={24} fill={isFavorited ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/80 text-[#2D2D2D] backdrop-blur-sm hover:bg-white transition-all"
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
                <StatusBadge status={event.status} size="lg" />
              </div>
              <p className="text-[#666666]">Organized by {event.organizer}</p>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-xl p-6 mb-6 border border-[#E8E8E8]">
              <div className="grid gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#8B1E26]" size={24} />
                  <div>
                    <p className="text-sm text-[#666666]">Date</p>
                    <p className="font-bold text-[#2D2D2D]">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#8B1E26]" size={24} />
                  <div>
                    <p className="text-sm text-[#666666]">Time</p>
                    <p className="font-bold text-[#2D2D2D]">{event.time}</p>
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
                      {event.attendees} / {event.maxAttendees} registered
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
              <p className="text-[#666666] leading-relaxed mb-6 whitespace-pre-line">
                {event.description}
              </p>
            </motion.div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-[#8B1E26]/10 text-[#8B1E26] rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Agenda */}
            {event.agenda.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Event Agenda</h2>
                <div className="space-y-3">
                  {event.agenda.map((agendaItem, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 p-4 bg-white border border-[#E8E8E8] rounded-lg"
                    >
                      <div className="font-bold text-[#8B1E26] min-w-fit">{agendaItem.time}</div>
                      <div className="text-[#2D2D2D]">{agendaItem.title}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar - Registration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl p-6 border border-[#E8E8E8] sticky top-24">
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
                      <p className="text-[#666666] text-sm mb-6">
                        {event.maxAttendees - event.attendees} seats available
                      </p>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRegister}
                        className="w-full px-4 py-3 bg-gradient-to-r from-[#8B1E26] to-[#6B1520] text-white rounded-lg font-bold hover:shadow-lg transition-all"
                      >
                        {registrationStep === 1 ? 'Register Now' : 'Confirm Registration'}
                      </motion.button>
                    </>
                  )}
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-3 px-4 py-2 border-2 border-[#E8E8E8] text-[#2D2D2D] rounded-lg font-bold hover:bg-[#F8F9FA] transition-all"
              >
                Learn More
              </motion.button>
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
          <p className="text-[#666666]">
            You have been successfully registered for {event.title}. Check your email for confirmation details.
          </p>
        </motion.div>
      </Modal>
    </main>
  );
}
