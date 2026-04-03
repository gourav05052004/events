'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { StatsCard } from '@/components/stats-card';
import { EventCard } from '@/components/event-card';
import { formatDateRange } from '@/lib/utils';
import { Calendar, BookOpen, Trophy } from 'lucide-react';
import {
  AcademicYearSelector,
  getAcademicYearRange,
  getAcademicYears,
} from '@/components/academic-year-selector';

const sidebarItems = [
  { label: 'Dashboard', href: '/student/dashboard', active: true },
  { label: 'Browse Events', href: '/student/events' },
  { label: 'My Registrations', href: '/student/registrations' },
  { label: 'My Profile', href: '/student/profile' },
];

interface EventData {
  id: string;
  title: string;
  date: string;
  end_date?: string;
  time: string;
  location: string;
  image: string;
  status: 'approved' | 'pending' | 'cancelled';
  club?: string;
}

interface DashboardData {
  student: {
    name: string;
    email: string;
  };
  statistics: {
    totalRegistered: number;
    totalCompleted: number;
    totalUpcoming: number;
    newNotifications: number;
  };
  myRegisteredEvents: EventData[];
  upcomingEvents: EventData[];
}

export default function StudentDashboard() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('Student');
  const { activeStartYear } = getAcademicYears();
  const [selectedYear, setSelectedYear] = useState(activeStartYear);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const { yearStart, yearEnd } = getAcademicYearRange(selectedYear);
        const response = await fetch(
          `/api/student/dashboard?yearStart=${encodeURIComponent(yearStart)}&yearEnd=${encodeURIComponent(yearEnd)}`,
          {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setDashboardData(result.data);
        
        // Set student name from API response
        if (result.data.student?.name) {
          setStudentName(result.data.student.name);
          // Also store in localStorage for future sessions
          localStorage.setItem('studentName', result.data.student.name);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();

    return () => {};
  }, [router, selectedYear]);

  const formatDate = (startDate: string, endDate?: string) => {
    return formatDateRange(startDate, endDate, 'en-US');
  };

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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Student Dashboard" userRole="student" />
        <Sidebar
          items={sidebarItems}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="md:ml-64 pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1E26] mx-auto"></div>
            <p className="mt-4 text-[#666666]">Loading dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Student Dashboard" userRole="student" />
        <Sidebar
          items={sidebarItems}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="md:ml-64 pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#8B1E26] text-white rounded hover:bg-[#6d1720]"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Student Dashboard" userRole="student" />
      <Sidebar
        items={sidebarItems}
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
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">
                  Welcome back, {studentName}!
                </h1>
                <p className="text-[#666666]">Here's an overview of your upcoming events and activities.</p>
              </div>
              <AcademicYearSelector selectedYear={selectedYear} onChange={setSelectedYear} />
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <motion.div variants={item}>
              <StatsCard
                title="Registered Events"
                value={dashboardData?.statistics.totalRegistered.toString() || '0'}
                icon={<Calendar size={32} />}
                color="primary"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="Completed Events"
                value={dashboardData?.statistics.totalCompleted.toString() || '0'}
                icon={<Trophy size={32} />}
                color="success"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard
                title="Upcoming"
                value={dashboardData?.statistics.totalUpcoming.toString() || '0'}
                icon={<BookOpen size={32} />}
                color="warning"
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
              {dashboardData?.myRegisteredEvents && dashboardData.myRegisteredEvents.length > 0 ? (
                dashboardData.myRegisteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <EventCard
                      {...event}
                      date={formatDate(event.date, event.end_date)}
                      onClick={() => router.push(`/event/${event.id}`)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-[#666666]">
                  <p>No registered events yet. Browse events to get started!</p>
                </div>
              )}
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
              {dashboardData?.upcomingEvents && dashboardData.upcomingEvents.length > 0 ? (
                dashboardData.upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <EventCard
                      {...event}
                      date={formatDate(event.date, event.end_date)}
                      onClick={() => router.push(`/event/${event.id}`)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-[#666666]">
                  <p>No upcoming events available at the moment.</p>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
