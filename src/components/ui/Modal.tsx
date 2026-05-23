'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './index';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* High-fidelity dark backdrop with softer blur */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-99"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-100 p-4 pointer-events-none">
            <motion.div
              className={`bg-white rounded-xl shadow-xl w-full ${sizes[size]} pointer-events-auto overflow-hidden border border-neutral-100`}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }} // Professional cinematic timing curve
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header: Reduced text scale and padding */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-100 bg-white">
                <h2 className="text-sm font-black text-neutral-900 font-display uppercase tracking-wider">{title}</h2>
                <button 
                  onClick={onClose} 
                  className="p-1.5 rounded-md hover:bg-neutral-50 transition-colors text-neutral-400 hover:text-neutral-700 outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="px-6 py-5 text-sm text-neutral-600 max-h-[75vh] overflow-y-auto">
                {children}
              </div>

              {/* Footer Layout */}
              {footer && (
                <div className="px-6 py-3.5 bg-neutral-50/50 border-t border-neutral-100 flex gap-2 justify-end items-center">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isDangerous?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs uppercase tracking-wider font-black border border-neutral-200 hover:bg-neutral-50 rounded-lg h-9 w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-black rounded-lg h-9 w-auto shadow-sm ${
              isDangerous ? 'shadow-red-100' : 'shadow-primary/10'
            }`}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-xs font-medium text-neutral-500 leading-relaxed">{message}</p>
    </Modal>
  );
}