'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EventCard } from './event-card';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status: 'pending' | 'approved' | 'cancelled';
  attendees?: number;
  maxAttendees?: number;
  clubLogo?: string;
  clubName?: string;
  brandColor?: string;
}

interface EventCarouselProps {
  title: string;
  events: Event[];
  onEventClick?: (eventId: string) => void;
  fullBleed?: boolean;
}

export function EventCarousel({ title, events, onEventClick, fullBleed = false }: EventCarouselProps) {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const sectionPadding = fullBleed ? 'px-4 sm:px-6 lg:px-10' : '';
  const rowPadding = fullBleed ? '-mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10' : '';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = 400;
      const current = scrollContainer.current.scrollLeft;
      scrollContainer.current.scrollTo({
        left: direction === 'left' ? current - scrollAmount : current + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`py-12 ${sectionPadding}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#2D2D2D]">{title}</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            className="p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors"
          >
            <ChevronLeft className="text-[#8B1E26]" size={24} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            className="p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors"
          >
            <ChevronRight className="text-[#8B1E26]" size={24} />
          </motion.button>
        </div>
      </div>

      <motion.div
        ref={scrollContainer}
        className={`flex gap-6 overflow-x-auto pb-6 scrollbar-hide ${rowPadding}`}
        style={{
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
        whileTap={{ cursor: 'grabbing' }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="flex-shrink-0 w-80 sm:w-[22rem]"
          >
            <EventCard {...event} onClick={() => onEventClick?.(event.id)} />
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.section>
  );
}
