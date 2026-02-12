'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Mail, Phone, MapPin, Users, BadgeCheck } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/club/dashboard' },
  { label: 'My Events', href: '/club/events' },
  { label: 'Create Event', href: '/club/create-event' },
  { label: 'Team', href: '/club/team', active: true },
  { label: 'Settings', href: '/club/settings' },
];

const teamMembers = [
  {
    id: 'faculty',
    name: 'Dr. Meera Patel',
    role: 'Faculty Coordinator',
    department: 'Computer Science',
    email: 'meera.patel@college.edu',
    phone: '+1 (555) 210-3344',
    office: 'Block B, Room 214',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    highlights: ['Mentorship', 'Event approvals', 'Academic alignment'],
  },
  {
    id: 'president',
    name: 'Rahul Sharma',
    role: 'Club President',
    department: 'Computer Science',
    email: 'rahul.sharma@college.edu',
    phone: '+1 (555) 410-8821',
    office: 'Student Center, Desk 12',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    highlights: ['Event leadership', 'Sponsorships', 'Team coordination'],
  },
];

export default function ClubTeamPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Club Team" userRole="club" />
      <Sidebar
        items={sidebarItems}
        onLogout={() => router.push('/')}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Leadership Team</h1>
            <p className="text-[#666666]">
              Faculty coordinator and club president details for quick coordination.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-32 w-32 rounded-2xl overflow-hidden border border-[#E8E8E8]">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-[#8B1E26] text-sm font-semibold mb-2">
                      <BadgeCheck size={16} />
                      {member.role}
                    </div>
                    <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">{member.name}</h2>
                    <p className="text-sm text-[#666666] mb-4">{member.department}</p>

                    <div className="space-y-2 text-sm text-[#444444]">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-[#8B1E26]" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-[#8B1E26]" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#8B1E26]" />
                        <span>{member.office}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E8E8E8] px-6 py-4 bg-[#F8F9FA]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#2D2D2D] mb-2">
                    <Users size={16} className="text-[#8B1E26]" />
                    Focus Areas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {member.highlights.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 rounded-full bg-white border border-[#E8E8E8] text-sm text-[#555555]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
