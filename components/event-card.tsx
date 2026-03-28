'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Hourglass } from 'lucide-react';
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
  clubLogo?: string;
  clubName?: string;
  brandColor?: string;
  onClick?: () => void;
  className?: string;
  registrationDeadline?: string;
}

// Helper to format registration deadline
function formatDeadline(deadline?: string) {
  if (!deadline) return '';
  const dateObj = new Date(deadline);
  if (isNaN(dateObj.getTime())) return deadline;
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const year = dateObj.getFullYear();
  const hour = dateObj.getHours().toString().padStart(2, '0');
  const minute = dateObj.getMinutes().toString().padStart(2, '0');
  return `Ends on ${day} ${month} ${year}, ${hour}:${minute}`;
}

export function EventCard({
  title,
  date,
  time,
  location,
  image,
  status,
  attendees,
  maxAttendees,
  clubLogo,
  clubName,
  brandColor = '#8B1E26',
  onClick,
  className = '',
  registrationDeadline,
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

        {/* Club Logo Badge */}
        {clubLogo && (
          <div className="absolute bottom-3 left-3 bg-white rounded-lg p-2 shadow-lg">
            <img
              src={clubLogo}
              alt={clubName}
              className="w-10 h-10 object-cover rounded"
            />
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Club Name */}
        {clubName && (
          <p className="text-xs font-semibold mb-2" style={{ color: brandColor }}>
            {clubName}
          </p>
        )}
        
        <h3 className="text-lg font-bold text-[#2D2D2D] mb-3 line-clamp-2">{title}</h3>

        <div className="space-y-2 text-sm text-[#666666]">
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: brandColor }} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: brandColor }} />
            <span>{time}</span>
          </div>
          {registrationDeadline && (
            <div className="flex items-center gap-2">
              <Hourglass size={16} style={{ color: brandColor }} />
              <span>{formatDeadline(registrationDeadline)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin size={16} style={{ color: brandColor }} />
            <span className="truncate">{location}</span>
          </div>
          {attendees !== undefined && maxAttendees !== undefined && (
            <div className="flex items-center gap-2">
              <Users size={16} style={{ color: brandColor }} />
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
