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
          <h1 className="text-5xl font-black text-primary font-display leading-[1.1]">
            Inventory <br /> 
            <span className="text-primary/40">Management.</span>
          </h1>
          <p className="text-lg text-neutral-500">
            The best inventory management app for production environments.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsStockInOpen(true)}
            className="h-14 px-4 lg:px-8 bg-primary rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all text-lg font-bold"
          >
            <ArrowDownLeft className="w-6 h-6 mr-2" /> Stock In
          </Button>
          <Button 
            variant="danger"
            onClick={() => setIsStockOutOpen(true)}
            className="h-14 px-4 lg:px-8 rounded-2xl shadow-xl shadow-red-600/20 hover:scale-105 transition-all text-lg font-bold"
          >
            <ArrowUpRight className="w-6 h-6 mr-2" /> Stock Out
          </Button>
          <Button 
            variant="secondary"
            onClick={() => setIsTransactionOpen(true)}
            className="h-14 w-14 p-0 rounded-2xl shadow-xl hover:scale-105 transition-all bg-white hover:bg-neutral-50 text-primary border border-neutral-200 flex items-center justify-center"
            title="Transaction Audit Log"
          >
            <History className="w-6 h-6" />
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
