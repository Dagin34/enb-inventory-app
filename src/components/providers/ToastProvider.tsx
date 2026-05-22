'use client';

import React from 'react';
import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      expand={true}
      theme="light"
      toastOptions={{
        className: 'font-sans',
        style: {
          borderRadius: '1.25rem',
          padding: '1.25rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
          border: '1px solid rgba(0,0,0,0.05)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
        },
      }}
    />
  );
}
