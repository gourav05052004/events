'use client';

import React from "react"

import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  customColor?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

const colorConfig = {
  primary: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  success: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  danger: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
};

export function StatsCard({
  title,
  value,
  icon,
  color = 'primary',
  customColor,
  trend,
}: StatsCardProps) {
  const config = colorConfig[color];

  // If custom color is provided, use inline styles instead of tailwind classes
  if (customColor) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
        className="border-2 rounded-lg p-6 transition-colors"
        style={{
          backgroundColor: `${customColor}10`,
          borderColor: `${customColor}30`,
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#666666] text-sm font-medium mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-[#2D2D2D]">{value}</p>
              {trend && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-sm font-semibold ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
                </motion.span>
              )}
            </div>
          </div>
          {icon && (
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              style={{ color: customColor }}
              className="text-2xl"
            >
              {icon}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      className={`${config.bg} border-2 ${config.border} rounded-lg p-6`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#666666] text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-[#2D2D2D]">{value}</p>
            {trend && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-sm font-semibold ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
              </motion.span>
            )}
          </div>
        </div>
        {icon && (
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className={`${config.text} text-2xl`}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
