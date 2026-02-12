'use client';

import { Toaster } from 'react-hot-toast';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#2D2D2D',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #E8E8E8',
        },
        success: {
          duration: 3000,
          style: {
            background: '#ECFDF5',
            color: '#065F46',
            borderColor: '#A7F3D0',
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#ECFDF5',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#FEF2F2',
            color: '#7F1D1D',
            borderColor: '#FCA5A5',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FEF2F2',
          },
        },
        loading: {
          style: {
            background: '#F3F4F6',
            color: '#2D2D2D',
            borderColor: '#E5E7EB',
          },
        },
      }}
    />
  );
}
