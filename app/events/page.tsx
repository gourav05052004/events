'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Filter, Loader, MapPin, Search, Users, Hourglass } from 'lucide-react';
import { AcademicYearSelector, getAcademicYearRange, getAcademicYears } from '@/components/academic-year-selector';
import { formatDateRange } from '@/lib/utils';

type PublicEvent = {
  id: string;
  title: string;
  date: string;
  end_date?: string;
  time: string;
  location: string;
  image: string;
  status: 'approved';
  attendees: number;
  maxAttendees: number;
  clubName: string;
  clubLogo?: string;
  brandColor: string;
  categories: string[];
};

type PublicEventApiResponse = {
  success?: boolean;
  events?: Array<{
    id: string;
    title: string;
    date: string;
    end_date?: string;
    time: string;
    location: string;
    image: string;
    status: 'approved';
    attendees: number;
    maxAttendees: number;
    clubName: string;
    clubLogo?: string;
    brandColor: string;
    categories: string[];
  }>;
};

function PublicEventCard({
  event,
  onLogin,
  onOpen,
}: {
  event: PublicEvent;
  onLogin: () => void;
  onOpen: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className="bg-white rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      <div className="relative overflow-hidden h-40">
        <img
          src={event.image || '/placeholder.svg'}
          alt={event.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {event.clubLogo && (
          <div className="absolute bottom-3 left-3 bg-white rounded-lg p-2 shadow-lg">
            <img src={event.clubLogo} alt={event.clubName} className="w-10 h-10 object-cover rounded" />
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold mb-2" style={{ color: event.brandColor }}>
          {event.clubName}
        </p>
        <h3 className="text-lg font-bold text-[#2D2D2D] mb-3 line-clamp-2">{event.title}</h3>
        <div className="space-y-2 text-sm text-[#666666]">
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: event.brandColor }} />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: event.brandColor }} />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} style={{ color: event.brandColor }} />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: event.brandColor }} />
            <span>
              {event.attendees}/{event.maxAttendees} attendees
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Hourglass size={16} style={{ color: event.brandColor }} />
            <span>{event.status}</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            onLogin();
          }}
          className="mt-4 w-full px-4 py-2 rounded-lg border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors duration-200 font-medium"
        >
          Login to Register
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function PublicEventsPage() {
  const router = useRouter();
  const { activeStartYear } = getAcademicYears();
  const [selectedYear, setSelectedYear] = useState(activeStartYear);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Technical', 'Sports', 'Cultural', 'Entrepreneurship'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { yearStart, yearEnd } = getAcademicYearRange(selectedYear);
        const response = await fetch(
          `/api/events/public?yearStart=${encodeURIComponent(yearStart)}&yearEnd=${encodeURIComponent(yearEnd)}`
        );
        const data = (await response.json()) as PublicEventApiResponse;

        if (response.ok && data.success && data.events) {
          setEvents(
            data.events.map((event) => ({
              ...event,
              date: formatDateRange(event.date, event.end_date, 'en-GB'),
            }))
          );
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error('Failed to fetch public events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedYear]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const category = selectedCategory.toLowerCase();

    return events.filter((event) => {
      const matchesQuery =
        query.length === 0 ||
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);

      const matchesCategory =
        category === 'all' || event.categories.some((item) => item.toLowerCase() === category);

      return matchesQuery && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#E8E8E8]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-[#8B1E26] cursor-pointer hover:opacity-80 transition-opacity">
              V-Sphere
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-[#8B1E26] text-white rounded-lg font-medium hover:bg-[#6B1520]"
            >
              Login
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <div className="pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-red-800 hover:text-red-900 text-sm font-medium cursor-pointer mb-4 w-fit"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Discover Events</h1>
                <p className="text-[#666666]">Find and register for exciting events happening on campus.</p>
              </div>
              <AcademicYearSelector selectedYear={selectedYear} onChange={setSelectedYear} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
          >
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

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-[#8B1E26] animate-spin" />
            </div>
          )}

          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#666666] mb-6"
            >
              Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </motion.p>
          )}

          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredEvents.map((event) => (
                <PublicEventCard
                  key={event.id}
                  event={event}
                  onOpen={() => router.push(`/event/${event.id}`)}
                  onLogin={() => router.push(`/login?role=student&redirect=/event/${event.id}`)}
                />
              ))}
            </motion.div>
          )}

          {!loading && filteredEvents.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-[#666666] text-lg">No events found.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
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