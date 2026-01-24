'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { StatsCard } from '@/components/stats-card';
import { EventCard } from '@/components/event-card';
import { Calendar, BookOpen, Trophy, Bell } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/student/dashboard', active: true },
  { label: 'Browse Events', href: '/student/events' },
  { label: 'My Registrations', href: '/student/registrations' },
  { label: 'Favorites', href: '/student/favorites' },
  { label: 'My Profile', href: '/student/profile' },
];

const registeredEvents = [
  {
    id: '1',
    title: 'Annual Tech Summit 2025',
    date: 'Feb 15, 2025',
    time: '10:00 AM',
    location: 'Main Auditorium',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
    status: 'approved' as const,
  },
  {
    id: '3',
    title: 'Sports Day Celebration',
    date: 'Feb 25, 2025',
    time: '8:00 AM',
    location: 'Sports Ground',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=200&fit=crop',
    status: 'approved' as const,
  },
];

const upcomingEvents = [
  {
    id: '2',
    title: 'AI & Machine Learning Workshop',
    date: 'Feb 20, 2025',
    time: '2:00 PM',
    location: 'Lab 101',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=200&fit=crop',
    status: 'approved' as const,
  },
  {
    id: '4',
    title: 'Entrepreneurship Summit',
    date: 'Mar 5, 2025',
    time: '9:00 AM',
    location: 'Conference Hall',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
    status: 'pending' as const,
  },
];

export default function StudentDashboard() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <Navbar title="Student Dashboard" userRole="student" />
      <Sidebar
        items={sidebarItems}
        onLogout={() => router.push('/')}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Welcome back, Alex!</h1>
            <p className="text-[#666666]">Here's an overview of your upcoming events and activities.</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-4 gap-6 mb-12"
          >
            <motion.div variants={item}>
              <StatsCard
                title="Registered Events"
                value="12"
                icon={<Calendar size={32} />}
                color="primary"
                trend={{ value: 8, direction: 'up' }}
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="Completed Events"
                value="8"
                icon={<Trophy size={32} />}
                color="success"
                trend={{ value: 3, direction: 'up' }}
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="Upcoming"
                value="4"
                icon={<BookOpen size={32} />}
                color="warning"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="New Notifications"
                value="3"
                icon={<Bell size={32} />}
                color="danger"
              />
            </motion.div>
          </motion.div>

          {/* My Registered Events */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#2D2D2D]">My Registered Events</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/student/registrations')}
                className="text-[#8B1E26] font-bold hover:underline"
              >
                View All →
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {registeredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <EventCard {...event} onClick={() => router.push(`/event/${event.id}`)} />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Recommended Events */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#2D2D2D]">Recommended for You</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/student/events')}
                className="text-[#8B1E26] font-bold hover:underline"
              >
                Explore More →
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <EventCard {...event} onClick={() => router.push(`/event/${event.id}`)} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
