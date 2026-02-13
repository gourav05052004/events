'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { EventCard } from '@/components/event-card';
import { Search, Filter, Loader } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/student/dashboard' },
  { label: 'Browse Events', href: '/student/events', active: true },
  { label: 'My Registrations', href: '/student/registrations' },
  { label: 'My Profile', href: '/student/profile' },
];

interface EventData {
  _id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  event_type: string;
  club_name: string;
  club_logo?: string;
  club_brand_color?: string;
  registrations: number;
  max_participants: number;
  poster_url?: string;
}

export default function EventsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['all', 'technical', 'sports', 'cultural', 'entrepreneurship'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/events');
        if (response.ok) {
          const data = await response.json();
          // Format events to match EventCard props
          const formattedEvents = data.data.map((event: EventData) => ({
            id: event._id,
            title: event.title,
            date: new Date(event.date).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            time: `${event.start_time} - ${event.end_time}`,
            location: event.location || 'TBD',
            image: event.poster_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
            status: event.status.toLowerCase() as 'pending' | 'approved' | 'cancelled',
            attendees: event.registrations || 0,
            maxAttendees: event.max_participants,
            clubName: event.club_name,
            clubLogo: event.club_logo,
            brandColor: event.club_brand_color || '#8B1E26',
            category: event.event_type,
          }));
          setAllEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const isApproved = event.status === 'approved';
    return matchesSearch && matchesCategory && isApproved;
  });

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
      <Navbar title="Browse Events" userRole="student" />
      <Sidebar
        items={sidebarItems}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Discover Events</h1>
            <p className="text-[#666666]">Find and register for exciting events happening on campus.</p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
          >
            {/* Search Box */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-3.5 text-[#8B1E26]" size={20} />
              <input
                type="text"
                placeholder="Search events by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26]"
              />
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-sm font-medium text-[#2D2D2D] mb-3 flex items-center gap-2">
                <Filter size={16} />
                Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                      selectedCategory === category
                        ? 'bg-[#8B1E26] text-white'
                        : 'bg-[#F0F0F0] text-[#2D2D2D] hover:bg-[#E0E0E0]'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-[#8B1E26] animate-spin" />
            </div>
          )}

          {/* Results Count */}
          {!isLoading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#666666] mb-6"
            >
              Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </motion.p>
          )}

          {/* Events Grid */}
          {!isLoading && (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredEvents.map((event) => (
                <motion.div key={event.id} variants={item}>
                  <EventCard {...event} onClick={() => router.push(`/event/${event.id}`)} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isLoading && filteredEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-[#666666] text-lg">No events found matching your search.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 text-[#8B1E26] hover:underline font-bold"
              >
                Clear filters
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
