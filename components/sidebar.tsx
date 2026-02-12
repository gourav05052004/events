'use client';

import React from "react"

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ items, mobileOpen = false, onMobileClose }: SidebarProps) {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
    onMobileClose?.();
  };

  const content = (
    <div className="h-full flex flex-col bg-white border-r border-[#E8E8E8]">
      {/* Logo/Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 border-b border-[#E8E8E8]">
        <h2 className="text-2xl font-bold text-[#8B1E26]">V-Sphere</h2>
        <p className="text-sm text-[#666666] mt-1">Event Management</p>
      </motion.div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence mode="wait">
          {items.map((item, index) => (
            <motion.button
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleNavigate(item.href)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 ${
                item.active
                  ? 'bg-[#8B1E26] text-white'
                  : 'text-[#2D2D2D] hover:bg-[#F8F9FA]'
              }`}
            >
              {item.icon && <span className="text-lg">{item.icon}</span>}
              <span>{item.label}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 20 }}
              className="md:hidden fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] z-50 overflow-y-auto"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
