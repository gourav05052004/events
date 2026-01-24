'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import { StatusBadge } from './status-badge';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status: 'pending' | 'approved' | 'cancelled';
  attendees?: number;
  maxAttendees?: number;
  onClick?: () => void;
  className?: string;
}

export function EventCard({
  id,
  title,
  date,
  time,
  location,
  image,
  status,
  attendees,
  maxAttendees,
  onClick,
  className = '',
}: EventCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(139, 30, 38, 0.15)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white rounded-xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 ${className}`}
    >
      <div className="relative overflow-hidden h-40">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} size="sm" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-[#2D2D2D] mb-3 line-clamp-2">{title}</h3>

        <div className="space-y-2 text-sm text-[#666666]">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#8B1E26]" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#8B1E26]" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#8B1E26]" />
            <span className="truncate">{location}</span>
          </div>
          {attendees !== undefined && maxAttendees !== undefined && (
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#8B1E26]" />
              <span>
                {attendees}/{maxAttendees} attendees
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
