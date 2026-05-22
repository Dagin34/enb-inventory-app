'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Layers,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Package, label: 'Inventory', href: '#inventory' },
  { icon: Layers, label: 'Categories', href: '#categories' },
  { icon: PlusCircle, label: 'Add Item', href: '#add' },
  { icon: Settings, label: 'Settings', href: '#settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 bottom-0 w-20 flex flex-col items-center py-8 z-50 glass-panel border-r border-white/20 bg-primary/95 text-white shadow-2xl"
    >
      {/* Logo Area */}
      <div className="mb-12">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
          <Package className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-6 w-full px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className="relative group flex flex-col items-center"
            >
              <div 
                className={`p-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white text-primary shadow-lg scale-110' 
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute left-20 px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-xl z-100">
                {item.label}
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-neutral-900 rotate-45" />
              </div>

              {isActive && (
                <motion.div 
                  layoutId="activeSide"
                  className="absolute -left-3 top-0 bottom-0 w-1 bg-white rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="flex flex-col gap-6 w-full px-3 mt-auto">
        <button className="p-3 rounded-2xl text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all flex flex-col items-center group relative">
          <LogOut className="w-6 h-6" />
          <div className="absolute left-20 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-xl">
            Logout
          </div>
        </button>
      </div>
    </motion.aside>
  );
}
