'use client';

import React, { useState } from 'react';
import { Plus, Minus, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { Button } from './ui';
import { StockModals } from './StockModals';
import { TransactionHistoryModal } from './TransactionHistoryModal';
import { InventoryItem } from '@/db/schema';

interface DashboardHeaderProps {
  items: InventoryItem[];
}

export function DashboardHeader({ items }: DashboardHeaderProps) {
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-primary font-display leading-[1.1]">
            Inventory <br /> 
            <span className="text-primary/40">Management.</span>
          </h1>
          <p className="text-sm text-neutral-500">
            The best inventory management app for production environments.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsStockInOpen(true)}
            className="py-4 px-2 lg:px-6 bg-primary rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all text-xs lg:text-sm font-bold"
          >
            <ArrowDownLeft className="w-4 h-4 mr-2" /> Stock In
          </Button>
          <Button 
            variant="danger"
            onClick={() => setIsStockOutOpen(true)}
            className="py-4 px-2 lg:px-6 rounded-2xl shadow-xl shadow-red-600/20 hover:scale-105 transition-all text-xs lg:text-sm font-bold"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" /> Stock Out
          </Button>
          <Button 
            variant="secondary"
            onClick={() => setIsTransactionOpen(true)}
            className="py-4 px-2 lg:px-6 rounded-2xl shadow-xl hover:scale-105 transition-all bg-white hover:bg-neutral-50 text-primary border border-neutral-200 flex items-center justify-center"
            title="Transaction Audit Log"
          >
            <History className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <StockModals 
        items={items}
        isOpenIn={isStockInOpen}
        isOpenOut={isStockOutOpen}
        onCloseIn={() => setIsStockInOpen(false)}
        onCloseOut={() => setIsStockOutOpen(false)}
      />

      <TransactionHistoryModal 
        isOpen={isTransactionOpen}
        onClose={() => setIsTransactionOpen(false)}
      />
    </>
  );
}
