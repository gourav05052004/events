// d:\events\event\app\admin\events\[id]\page.tsx

'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { ArrowLeft, Calendar, MapPin, Users, Check, X, AlertCircle } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Events', href: '/admin/events', active: true },
  { label: 'Clubs', href: '/admin/clubs' },
  { label: 'Venues', href: '/admin/venues' },
  { label: 'Activity Logs', href: '/admin/logs' },
  { label: 'Settings', href: '/admin/settings' },
];

// Mock event data - replace with API call
const eventData: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Annual Tech Summit 2025',
    organizer: 'Computer Science Club',
    organizerEmail: 'csclub@college.edu',
    date: 'Feb 15, 2025',
    time: '10:00 AM - 5:00 PM',
    status: 'approved',
    registrations: 245,
    maxCapacity: 500,
    venue: 'Main Auditorium',
    description: 'Join us for the Annual Tech Summit 2025, featuring keynote speakers, technical workshops, and networking opportunities. Learn about the latest trends in technology and connect with industry professionals.',
    agenda: [
      { time: '10:00 AM', activity: 'Registration & Welcome' },
      { time: '10:30 AM', activity: 'Keynote Speech' },
      { time: '12:00 PM', activity: 'Lunch Break' },
      { time: '1:00 PM', activity: 'Technical Workshops' },
      { time: '3:30 PM', activity: 'Networking Session' },
      { time: '5:00 PM', activity: 'Closing Ceremony' },
    ],
    registeredStudents: [
      { id: '1', name: 'John Doe', email: 'john@college.edu', registeredOn: 'Jan 20, 2025' },
      { id: '2', name: 'Jane Smith', email: 'jane@college.edu', registeredOn: 'Jan 19, 2025' },
      { id: '3', name: 'Mike Johnson', email: 'mike@college.edu', registeredOn: 'Jan 18, 2025' },
    ],
  },
  '2': {
    id: '2',
    title: 'AI & Machine Learning Workshop',
    organizer: 'Tech Club',
    organizerEmail: 'techclub@college.edu',
    date: 'Feb 20, 2025',
    time: '2:00 PM - 6:00 PM',
    status: 'approved',
    registrations: 120,
    maxCapacity: 200,
    venue: 'Lab 101',
    description: 'An intensive workshop on AI and Machine Learning concepts, practical applications, and hands-on projects.',
    agenda: [
      { time: '2:00 PM', activity: 'Introduction to AI & ML' },
      { time: '3:00 PM', activity: 'Hands-on Coding Session' },
      { time: '4:30 PM', activity: 'Q&A Session' },
      { time: '6:00 PM', activity: 'Wrap Up' },
    ],
    registeredStudents: [
      { id: '4', name: 'Alice Brown', email: 'alice@college.edu', registeredOn: 'Jan 21, 2025' },
      { id: '5', name: 'Bob Wilson', email: 'bob@college.edu', registeredOn: 'Jan 20, 2025' },
    ],
  },
  '3': {
    id: '3',
    title: 'Sports Day Celebration',
    organizer: 'Sports Committee',
    organizerEmail: 'sports@college.edu',
    date: 'Feb 25, 2025',
    time: '8:00 AM - 3:00 PM',
    status: 'approved',
    registrations: 600,
    maxCapacity: 800,
    venue: 'Sports Ground',
    description: 'Annual sports day celebration featuring various sporting events, competitions, and cultural programs.',
    agenda: [
      { time: '8:00 AM', activity: 'Opening Ceremony' },
      { time: '9:00 AM', activity: 'Track & Field Events' },
      { time: '12:00 PM', activity: 'Lunch Break' },
      { time: '1:00 PM', activity: 'Team Sports' },
      { time: '3:00 PM', activity: 'Closing & Prize Distribution' },
    ],
    registeredStudents: [],
  },
  '4': {
    id: '4',
    title: 'Entrepreneurship Summit',
    organizer: 'Entrepreneurship Club',
    organizerEmail: 'entreclub@college.edu',
    date: 'Mar 5, 2025',
    time: '9:00 AM - 4:00 PM',
    status: 'pending',
    registrations: 89,
    maxCapacity: 300,
    venue: 'Conference Hall',
    description: 'Summit for aspiring entrepreneurs featuring success stories, startup pitches, and investor meetings.',
    agenda: [
      { time: '9:00 AM', activity: 'Welcome Address' },
      { time: '10:00 AM', activity: 'Keynote: Success Stories' },
      { time: '12:00 PM', activity: 'Lunch' },
      { time: '1:00 PM', activity: 'Startup Pitch Competition' },
      { time: '3:00 PM', activity: 'Investor Networking' },
      { time: '4:00 PM', activity: 'Awards & Closing' },
    ],
    registeredStudents: [],
  },
  '5': {
    id: '5',
    title: 'Photography Workshop',
    organizer: 'Photography Club',
    organizerEmail: 'photoclub@college.edu',
    date: 'Mar 10, 2025',
    time: '3:00 PM - 6:00 PM',
    status: 'pending',
    registrations: 45,
    maxCapacity: 100,
    venue: 'Art Studio',
    description: 'Learn professional photography techniques with hands-on practice sessions.',
    agenda: [
      { time: '3:00 PM', activity: 'Photography Basics' },
      { time: '4:00 PM', activity: 'Practical Session' },
      { time: '5:30 PM', activity: 'Critique & Feedback' },
      { time: '6:00 PM', activity: 'Closing' },
    ],
    registeredStudents: [],
  },
};

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const event = eventData[eventId];

  if (!event) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Event Details" userRole="admin" />
        <Sidebar
          items={sidebarItems}
          onLogout={() => router.push('/')}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="md:ml-64 pt-6">
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <p className="text-xl text-[#666666]">Event not found</p>
          </div>
        </div>
      </main>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check size={16} />;
      case 'pending':
        return <AlertCircle size={16} />;
      case 'cancelled':
        return <X size={16} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Event Details" userRole="admin" />
      <Sidebar
        items={sidebarItems}
        onLogout={() => router.push('/')}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#8B1E26] font-medium mb-8 hover:gap-3 transition-all"
          >
            <ArrowLeft size={20} />
            Back to Events
          </motion.button>

          {/* Event Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-[#E8E8E8]"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-[#2D2D2D] mb-4">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-[#666666]">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    {event.date}, {event.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    {event.venue}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    {event.registrations} / {event.maxCapacity} attendees
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 w-fit ${getStatusColor(
                    event.status
                  )}`}
                >
                  {getStatusIcon(event.status)}
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
                {event.status === 'pending' && (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                    >
                      <Check size={18} />
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                    >
                      <X size={18} />
                      Reject
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]"
              >
                <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Description</h2>
                <p className="text-[#666666] leading-relaxed">{event.description}</p>
              </motion.div>

              {/* Event Agenda */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]"
              >
                <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Event Agenda</h2>
                <div className="space-y-4">
                  {event.agenda.map((item: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="flex gap-4 pb-4 border-b border-[#E8E8E8] last:border-0"
                    >
                      <div className="flex-shrink-0">
                        <span className="flex items-center justify-center w-12 h-12 bg-[#8B1E26]/10 text-[#8B1E26] rounded-lg font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#2D2D2D]">{item.time}</p>
                        <p className="text-[#666666]">{item.activity}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Registered Students */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]"
              >
                <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">
                  Registered Students ({event.registeredStudents.length})
                </h2>
                {event.registeredStudents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#E8E8E8]">
                          <th className="px-4 py-2 text-left font-bold text-[#2D2D2D]">Name</th>
                          <th className="px-4 py-2 text-left font-bold text-[#2D2D2D]">Email</th>
                          <th className="px-4 py-2 text-left font-bold text-[#2D2D2D]">Registered On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.registeredStudents.map((student: any) => (
                          <motion.tr
                            key={student.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-[#E8E8E8] hover:bg-[#F8F9FA] transition-colors"
                          >
                            <td className="px-4 py-3 text-[#2D2D2D]">{student.name}</td>
                            <td className="px-4 py-3 text-[#666666]">{student.email}</td>
                            <td className="px-4 py-3 text-[#666666]">{student.registeredOn}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[#666666]">No students registered yet.</p>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Organizer Info */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]">
                <h3 className="font-bold text-[#2D2D2D] mb-4">Organizer</h3>
                <p className="text-[#2D2D2D] font-medium mb-2">{event.organizer}</p>
                <a
                  href={`mailto:${event.organizerEmail}`}
                  className="text-[#8B1E26] hover:underline text-sm"
                >
                  {event.organizerEmail}
                </a>
              </div>

              {/* Event Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E8E8]">
                <h3 className="font-bold text-[#2D2D2D] mb-4">Event Stats</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#666666] mb-1">Registrations</p>
                    <div className="w-full bg-[#E8E8E8] rounded-full h-2">
                      <div
                        className="bg-[#8B1E26] h-2 rounded-full"
                        style={{
                          width: `${(event.registrations / event.maxCapacity) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-[#666666] mt-1">
                      {event.registrations} / {event.maxCapacity}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}