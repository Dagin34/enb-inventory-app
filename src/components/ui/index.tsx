'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30',
    secondary: 'bg-secondary text-secondary-foreground border border-neutral-200 hover:bg-neutral-100',
    danger: 'bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700',
    ghost: 'bg-transparent text-foreground hover:bg-neutral-100',
    outline: 'bg-transparent border border-neutral-200 text-foreground hover:bg-neutral-50 hover:border-neutral-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  // Convert to motion props to avoid type mismatch on simple button props
  const motionProps: HTMLMotionProps<"button"> = {
    whileHover: { y: -1 },
    whileTap: { scale: 0.98 },
  };

  return (
    <motion.button
      {...motionProps}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as any)}
    >
      {isLoading ? <Spinner size="sm" /> : children}
    </motion.button>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ children, hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`premium-card p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-neutral-700 ml-1">{label}</label>}
      <input
        className={`w-full transition-all duration-200 outline-none ${
          error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-neutral-200'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-600 ml-1">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-neutral-700 ml-1">{label}</label>}
      <select
        className={`w-full transition-all duration-200 outline-none ${
          error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-neutral-200'
        } ${className}`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs font-medium text-red-600 ml-1">{error}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-neutral-700 ml-1">{label}</label>}
      <textarea
        className={`w-full min-h-[100px] transition-all duration-200 outline-none resize-none ${
          error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-neutral-200'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-600 ml-1">{error}</span>}
    </div>
  );
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className={`${sizes[size]} border-primary/20 border-t-primary rounded-full animate-spin`} />
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl"
    >
      <div className="text-6xl mb-6 text-primary/20">{icon}</div>
      <h3 className="text-2xl font-bold text-neutral-900 mb-2 font-display">{title}</h3>
      {description && <p className="text-neutral-500 mb-8 max-w-sm text-balance">{description}</p>}
      {action}
    </motion.div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    success: 'bg-green-50 text-green-700 border-green-100',
    warning: 'bg-orange-50 text-orange-700 border-orange-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export function Skeleton({ count = 1, className = '', ...props }: SkeletonProps) {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-neutral-200 rounded-lg animate-pulse-slow ${className}`}
          {...props}
        />
      ))}
    </div>
  );
}

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  onClose?: () => void;
}

export function Alert({ type, title, message, onClose }: AlertProps) {
  const styles = {
    success: 'bg-green-50 border-green-100 text-green-900',
    error: 'bg-red-50 border-red-100 text-red-900',
    info: 'bg-blue-50 border-blue-100 text-blue-900',
    warning: 'bg-orange-50 border-orange-100 text-orange-900',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border rounded-2xl p-5 shadow-sm ${styles[type]}`}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-bold font-display">{title}</h3>
          {message && <p className="text-sm mt-1 opacity-80 leading-relaxed">{message}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 transition-colors">
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
}
