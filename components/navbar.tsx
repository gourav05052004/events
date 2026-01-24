'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  userRole?: 'student' | 'club' | 'admin';
}

export function Navbar({ title, showBackButton = false, onBackClick, userRole }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = {
    student: [
      { label: 'Browse Events', href: '/student/events' },
      { label: 'My Registrations', href: '/student/registrations' },
    ],
    club: [
      { label: 'My Events', href: '/club/events' },
      { label: 'Create Event', href: '/club/create-event' },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Events', href: '/admin/events' },
      { label: 'Clubs', href: '/admin/clubs' },
    ],
  };

  const items = userRole ? navigationItems[userRole] : [];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#E8E8E8]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={onBackClick || (() => router.back())}
                className="text-[#8B1E26] hover:text-[#6B1520] transition-colors"
              >
                ←
              </button>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-[#8B1E26]"
            >
              {title || 'V-Sphere'}
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {items.map((item) => (
              <motion.button
                key={item.href}
                whileHover={{ color: '#8B1E26' }}
                onClick={() => router.push(item.href)}
                className="text-[#2D2D2D] font-medium hover:text-[#8B1E26] transition-colors"
              >
                {item.label}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-[#8B1E26] text-white rounded-lg font-medium hover:bg-[#6B1520]"
            >
              Login
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 border-t border-[#E8E8E8]"
          >
            {items.map((item) => (
              <motion.button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-[#2D2D2D] hover:bg-[#F8F9FA]"
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
