'use client';

import { motion } from 'framer-motion';

type StatusType = 'pending' | 'approved' | 'cancelled' | 'available' | 'booked';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  pending: {
    bg: 'bg-[#FFC107]',
    text: 'text-[#2D2D2D]',
    label: 'Pending',
  },
  approved: {
    bg: 'bg-[#10B981]',
    text: 'text-white',
    label: 'Approved',
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: 'Cancelled',
  },
  available: {
    bg: 'bg-[#10B981]',
    text: 'text-white',
    label: 'Available',
  },
  booked: {
    bg: 'bg-gray-200',
    text: 'text-gray-700',
    label: 'Booked',
  },
};

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-block rounded-full font-medium ${config.bg} ${config.text} ${sizeConfig[size]}`}
    >
      {config.label}
    </motion.div>
  );
}
