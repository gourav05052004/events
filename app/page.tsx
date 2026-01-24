'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { EventCarousel } from '@/components/event-carousel';
import { ArrowRight, Calendar, Users, Trophy } from 'lucide-react';

const upcomingEvents = [
  {
    id: '1',
    title: 'Annual Tech Summit 2025',
    date: 'Feb 15, 2025',
    time: '10:00 AM - 5:00 PM',
    location: 'Main Auditorium',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    status: 'approved' as const,
    attendees: 245,
    maxAttendees: 500,
  },
  {
    id: '2',
    title: 'AI & Machine Learning Workshop',
    date: 'Feb 20, 2025',
    time: '2:00 PM - 6:00 PM',
    location: 'Lab 101',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop',
    status: 'approved' as const,
    attendees: 120,
    maxAttendees: 200,
  },
  {
    id: '3',
    title: 'Sports Day Celebration',
    date: 'Feb 25, 2025',
    time: '8:00 AM - 3:00 PM',
    location: 'Sports Ground',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
    status: 'approved' as const,
    attendees: 600,
    maxAttendees: 800,
  },
  {
    id: '4',
    title: 'Entrepreneurship Summit',
    date: 'Mar 5, 2025',
    time: '9:00 AM - 4:00 PM',
    location: 'Conference Hall',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    status: 'pending' as const,
    attendees: 89,
    maxAttendees: 300,
  },
];

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
];

export default function Home() {
  const router = useRouter();

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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8B1E26] via-[#8B1E26] to-[#6B1520] text-white py-24 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
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
                className="px-8 py-4 bg-white text-[#8B1E26] rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/student/events')}
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors"
              >
                Browse Events
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center text-[#2D2D2D] mb-4"
          >
            Why Choose V-Sphere?
          </motion.h2>
          <p className="text-center text-[#666666] mb-12 max-w-2xl mx-auto">
            Everything you need to organize and participate in campus events.
          </p>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={item}
                  className="bg-white p-8 rounded-xl border-2 border-[#E8E8E8] hover:border-[#8B1E26] transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 bg-[#8B1E26] text-white rounded-lg flex items-center justify-center mb-4"
                  >
                    <Icon size={32} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#2D2D2D] mb-3">{feature.title}</h3>
                  <p className="text-[#666666]">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Events Carousel Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EventCarousel
            title="Upcoming Events"
            events={upcomingEvents}
            onEventClick={(eventId) => router.push(`/event/${eventId}`)}
          />
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
              className="px-8 py-4 bg-white text-[#8B1E26] rounded-lg font-bold hover:bg-gray-50 transition-colors"
            >
              Login as Student
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login?role=club')}
              className="px-8 py-4 bg-[#FFC107] text-[#2D2D2D] rounded-lg font-bold hover:bg-[#FFB800] transition-colors"
            >
              Login as Club
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login?role=admin')}
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors"
            >
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
                <li>Browse Events</li>
                <li>Create Events</li>
                <li>Manage Resources</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="space-y-2 text-white/70">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Code of Conduct</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-white/70">
            <p>&copy; 2025 V-Sphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
