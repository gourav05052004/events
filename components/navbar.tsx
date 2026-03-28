'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface NavbarProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  userRole?: 'student' | 'club' | 'admin';
  onMenuClick?: () => void;
  hideLoginButton?: boolean;
}

export function Navbar({ 
  title, 
  showBackButton = false, 
  onBackClick, 
  userRole, 
  onMenuClick,
  hideLoginButton = false
}: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdown(false);
      }
    };

    if (profileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileDropdown]);

  // Notifications removed: keep bell icon but no unread count or listeners

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

  // Mobile menu toggling handled inline where needed; removed unused helper.

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#E8E8E8]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Only show if onMenuClick is provided */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 text-[#2D2D2D] hover:bg-[#F8F9FA] rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
            )}
            
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
            {userRole ? (
              <div className="relative flex items-center gap-4">
                {/* Notifications removed */}

                <div className="relative" ref={profileRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="px-4 py-2 bg-[#8B1E26] text-white rounded-lg font-medium hover:bg-[#6B1520] flex items-center gap-2"
                  >
                    <User size={18} />
                    Profile
                  </motion.button>

                  {profileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E8E8E8] z-50 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-[#8B1E26] to-[#6B1520] text-white px-4 py-3">
                        <p className="text-sm font-semibold">My Account</p>
                      </div>

                      {userRole === 'student' && (
                        <button
                          onClick={() => {
                            router.push('/student/profile');
                            setProfileDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[#2D2D2D] hover:bg-[#F8F9FA] flex items-center gap-2 border-b border-[#E8E8E8] transition-colors"
                        >
                          <User size={16} />
                          View Profile
                        </button>
                      )}

                      {userRole === 'admin' && (
                        <button
                          onClick={() => {
                            router.push('/admin/settings');
                            setProfileDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[#2D2D2D] hover:bg-[#F8F9FA] flex items-center gap-2 border-b border-[#E8E8E8] transition-colors"
                        >
                          <User size={16} />
                          Settings
                        </button>
                      )}

                      {userRole === 'club' && (
                        <>
                          <button
                            onClick={() => {
                              router.push('/club/dashboard');
                              setProfileDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[#2D2D2D] hover:bg-[#F8F9FA] flex items-center gap-2 border-b border-[#E8E8E8] transition-colors"
                          >
                            <User size={16} />
                            Dashboard
                          </button>
                          <button
                            onClick={() => {
                              router.push('/club/settings');
                              setProfileDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[#2D2D2D] hover:bg-[#F8F9FA] flex items-center gap-2 border-b border-[#E8E8E8] transition-colors"
                          >
                            <User size={16} />
                            Settings
                          </button>
                          <button
                            onClick={() => {
                              router.push('/club/team');
                              setProfileDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[#2D2D2D] hover:bg-[#F8F9FA] flex items-center gap-2 border-b border-[#E8E8E8] transition-colors"
                          >
                            <User size={16} />
                            Team Management
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          // Clear all auth tokens and data
                          window.localStorage.removeItem('clubId');
                          window.localStorage.removeItem('studentId');
                          window.localStorage.removeItem('adminId');
                          window.localStorage.removeItem('token');
                          document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                          document.cookie = 'club_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                          document.cookie = 'student_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                          setProfileDropdown(false);
                          router.push('/login');
                        }}
                        className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : !hideLoginButton ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-[#8B1E26] text-white rounded-lg font-medium hover:bg-[#6B1520]"
              >
                Login
              </motion.button>
            ) : null}
          </div>

          {/* Mobile Menu Button - Only show if onMenuClick is NOT provided */}
          {!onMenuClick && (
            <button 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        {/* Mobile Navigation - Only show if onMenuClick is NOT provided */}
        {!onMenuClick && mobileMenuOpen && (
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