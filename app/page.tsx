'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { formatDateRange } from '@/lib/utils';
import { ArrowRight, Bell, Calendar, GraduationCap, ShieldCheck, Trophy, Users } from 'lucide-react';

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  end_date?: string;
  time: string;
  location: string;
  image: string;
  status: 'approved' | 'pending' | 'cancelled';
  attendees: number;
  maxAttendees: number;
  clubName?: string;
  clubLogo?: string;
  brandColor?: string;
}

interface RawUpcomingEvent {
  _id?: string;
  id?: string;
  title: string;
  date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  time?: string;
  location?: string;
  poster_url?: string;
  image?: string;
  status?: UpcomingEvent['status'] | string;
  registrations?: number;
  attendees?: number;
  max_participants?: number;
  maxAttendees?: number;
  club_name?: string;
  clubLogo?: string;
  club_logo?: string;
  club_brand_color?: string;
  brandColor?: string;
}

const heroStats = [
  { key: 'events', value: 50, label: 'Events' },
  { key: 'clubs', value: 20, label: 'Clubs' },
  { key: 'students', value: 500, label: 'Students' },
] as const;

const features = [
  {
    icon: Calendar,
    title: 'Event Management',
    description: 'Create, manage, and track events effortlessly with our comprehensive platform',
  },
  {
    icon: Users,
    title: 'Community Building',
    description: 'Connect with clubs, teams, and like-minded individuals across campus',
  },
  {
    icon: Trophy,
    title: 'Resource Allocation',
    description: 'Efficiently allocate venues and resources for your events',
  },
  {
    icon: Bell,
    title: 'Instant Updates',
    description:
      'Stay informed with real-time event approvals, registration confirmations, and schedule changes',
  },
];

function LandingEventCard({
  title,
  date,
  time,
  location,
  image,
  attendees,
  maxAttendees,
  clubLogo,
  clubName,
  brandColor = '#8B1E26',
  onClick,
}: UpcomingEvent & { onClick?: () => void }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      <div className="relative overflow-hidden h-40">
        <img
          src={image || '/placeholder.svg'}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />

        {clubLogo && (
          <div className="absolute bottom-3 left-3 bg-white rounded-lg p-2 shadow-lg">
            <img src={clubLogo} alt={clubName} className="w-10 h-10 object-cover rounded" />
          </div>
        )}
      </div>

      <div className="p-4">
        {clubName && (
          <p className="text-xs font-semibold mb-2" style={{ color: brandColor }}>
            {clubName}
          </p>
        )}

        <h3 className="text-lg font-bold text-[#2D2D2D] mb-3 line-clamp-2">{title}</h3>

        <div className="space-y-2 text-sm text-[#666666]">
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: brandColor }} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: brandColor }} />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: brandColor }} />
            <span>
              {attendees}/{maxAttendees} attendees
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[16px] leading-none" style={{ color: brandColor }}>
              •
            </span>
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LandingEventCarousel({
  title,
  events,
  onEventClick,
}: {
  title: string;
  events: UpcomingEvent[];
  onEventClick?: (eventId: string) => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-12"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#2D2D2D]">{title}</h2>
      </div>

      <motion.div
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide"
        style={{
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
        whileTap={{ cursor: 'grabbing' }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="shrink-0 w-80 sm:w-88"
          >
            <LandingEventCard {...event} onClick={() => onEventClick?.(event.id)} />
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.section>
  );
}

export default function Home() {
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    events: 0,
    clubs: 0,
    students: 0,
  });

  useEffect(() => {
    let frameId = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setStats({
        events: Math.round(heroStats[0].value * easedProgress),
        clubs: Math.round(heroStats[1].value * easedProgress),
        students: Math.round(heroStats[2].value * easedProgress),
      });

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = (await response.json()) as { success?: boolean; events?: RawUpcomingEvent[] };

        if (data.success && data.events) {
          const formattedEvents = data.events.map((event) => ({
            id: event.id ?? event._id ?? '',
            title: event.title,
            date: formatDateRange(event.date, event.end_date, 'en-US'),
            time: event.time ?? [event.start_time, event.end_time].filter(Boolean).join(' - '),
            location: event.location ?? 'TBD',
            image:
              event.poster_url ??
              event.image ??
              'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
            status: (event.status ?? 'approved') as UpcomingEvent['status'],
            attendees: event.attendees ?? event.registrations ?? 0,
            maxAttendees: event.maxAttendees ?? event.max_participants ?? 0,
            clubName: event.club_name,
            clubLogo: event.clubLogo ?? event.club_logo,
            brandColor: event.brandColor ?? event.club_brand_color ?? '#8B1E26',
          })) as UpcomingEvent[];

          setUpcomingEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Failed to fetch upcoming events:', error);
        setUpcomingEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="V-Sphere" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-red-900 via-red-800 to-red-700 text-white py-24 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-100"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-10 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-10 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl font-bold mb-6 text-balance"
            >
              Manage Your College Events Seamlessly
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto text-balance"
            >
              V-Sphere is your all-in-one platform for event discovery, registration, and resource
              management across campus.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="px-8 py-4 bg-white text-red-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/events')}
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-900 transition-colors duration-200"
              >
                Browse Events
              </motion.button>
            </motion.div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-white">{stats.events}+</span>
                <span>Events</span>
              </span>
              <span className="text-white/40">|</span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-white">{stats.clubs}+</span>
                <span>Clubs</span>
              </span>
              <span className="text-white/40">|</span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-white">{stats.students}+</span>
                <span>Students</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 sm:py-24 bg-[#FFF7F7]">
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1E26] mx-auto mb-4"></div>
            <p className="text-[#666666]">Loading upcoming events...</p>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LandingEventCarousel
              title="Upcoming Events"
              events={upcomingEvents}
              onEventClick={(eventId: string) => router.push(`/event/${eventId}`)}
            />
            <div className="text-center -mt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/events')}
                className="border border-red-800 text-red-800 hover:bg-red-800 hover:text-white px-6 py-2 rounded-lg transition-colors duration-200 mt-6"
              >
                View All Events →
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
            <Calendar className="mx-auto mb-4 text-[#8B1E26]" size={48} />
            <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">No Upcoming Events</h3>
            <p className="text-[#666666]">Check back later for new events!</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm uppercase tracking-[0.2em] text-[#8B1E26] font-semibold mb-3">Why V-Sphere</p>
              <h2
                className="text-4xl font-bold text-[#2D2D2D] mb-4"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Built to run campus life smoothly.
              </h2>
              <p className="text-[#666666] text-lg mb-8">
                A focused system for clubs, students, and admins with fast approvals, clean
                scheduling, and transparent attendance tracking.
              </p>
              <div className="flex items-center gap-4 text-sm text-[#666666]">
                <span className="flex items-center gap-2">
                  <Calendar size={18} className="text-[#8B1E26]" /> Smart scheduling
                </span>
                <span className="flex items-center gap-2">
                  <Users size={18} className="text-[#8B1E26]" /> Better participation
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-6"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={item}
                    className="bg-[#F8F9FA] p-6 rounded-xl border border-[#E8E8E8] hover:border-[#8B1E26] transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-[#8B1E26] text-white rounded-lg flex items-center justify-center mb-4">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">{feature.title}</h3>
                    <p className="text-[#666666] text-sm">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-[#8B1E26] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            Ready to Join V-Sphere?
          </motion.h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Sign up now to discover exciting events, create your own, and connect with the
            college community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login?role=student')}
              className="px-8 py-4 bg-white text-[#8B1E26] rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <GraduationCap size={18} />
              Login as Student
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login?role=club')}
              className="px-8 py-4 bg-white text-[#8B1E26] rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Users size={18} />
              Login as Club
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login?role=admin')}
              className="px-8 py-4 bg-white text-[#8B1E26] rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} />
              Login as Admin
            </motion.button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D2D2D] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">V-Sphere</h3>
              <p className="text-white/70">College Event & Resource Management Platform</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Platform</h4>
              <ul className="space-y-2 text-white/70">
                <li>
                  <a href="/events" className="cursor-pointer hover:text-white transition-colors">
                    Browse Events
                  </a>
                </li>
                <li>
                  <a href="/login?role=club" className="cursor-pointer hover:text-white transition-colors">
                    Create Events
                  </a>
                </li>
                <li>
                  <a href="/login?role=admin" className="cursor-pointer hover:text-white transition-colors">
                    Manage Resources
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Code of Conduct</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-white/70">
            <p>&copy; 2026 V-Sphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
