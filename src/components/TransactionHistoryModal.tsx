'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Trash2,
  SlidersHorizontal,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button, Badge, Skeleton, EmptyState } from './ui';
import { formatDate } from '@/lib/utils';
import { StockTransaction } from '@/db/schema';
import { toast } from 'sonner';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionHistoryModal({ isOpen, onClose }: TransactionHistoryModalProps) {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'IN' | 'OUT'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch transactions with pagination, filters, and query
  const fetchTransactions = useCallback(
    async (page: number, search: string, type: string, showToast = false) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '6', // Fetch 6 items for beautiful proportion in the popup
          search: search,
          type: type,
        });

        const response = await fetch(`/api/transactions?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch transactions');

        const data = await response.json();
        setTransactions(data.transactions || []);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || 0);

        if (showToast) {
          toast.success('Stock Transactions Refreshed!');
        }
      } catch (error) {
        console.error('Fetch transactions error:', error);
        toast.error('Failed to retrieve stock transactions');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Re-fetch transactions on modal open, page, search, or type tab changes
  useEffect(() => {
    if (isOpen) {
      // Debounce logic for search query to prevent rapid database hits
      const delayDebounce = setTimeout(() => {
        fetchTransactions(currentPage, searchQuery, activeTab);
      }, 300);

      return () => clearTimeout(delayDebounce);
    }
  }, [isOpen, currentPage, searchQuery, activeTab, fetchTransactions]);

  // Reset page to 1 when changing search query or tab filters
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions(currentPage, searchQuery, activeTab, true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Transactions"
      size="lg"
    >
      <div className="space-y-6">
        {/* Controls Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search transactions by product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-11 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm"
              />
            </div>

            {/* Sync Refresh Button */}
            <Button
              variant="outline"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              className="h-[46px] w-[46px] p-0 rounded-2xl border-neutral-200 hover:border-neutral-300 flex items-center justify-center bg-white hover:bg-neutral-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 text-neutral-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Type Filtering Tabs */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-white shadow-sm text-primary' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              All Logs ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('IN')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'IN' ? 'bg-green-500 text-white shadow-sm' : 'text-neutral-500 hover:text-green-600'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" /> Procurements (IN)
            </button>
            <button
              onClick={() => setActiveTab('OUT')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'OUT' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-500 hover:text-red-600'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Depletions (OUT)
            </button>
          </div>
        </div>

        {/* Audit Log list */}
        <div className="min-h-[380px] flex flex-col justify-between">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-neutral-200 rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-28" />
                      <div className="h-3 bg-neutral-200 rounded w-16" />
                    </div>
                  </div>
                  <div className="h-6 bg-neutral-200 rounded w-12" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={<SlidersHorizontal size={40} className="text-neutral-300" />}
              title="No Logs Recorded"
              description={
                searchQuery
                  ? "We couldn't find any transaction matches. Try modifying your search."
                  : "All inventory logs are up-to-date. Make an inventory action to generate a new log."
              }
            />
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {transactions.map((tx) => {
                  const isIn = tx.type === 'IN';
                  const isDeleted = tx.itemId === null;

                  return (
                    <motion.div
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all group ${
                        isIn
                          ? 'border-green-100 bg-green-50/20 hover:bg-green-50/40'
                          : 'border-red-100 bg-red-50/20 hover:bg-red-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Status Icon */}
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 ${
                            isIn
                              ? 'bg-green-100 border-green-200 text-green-700'
                              : 'bg-red-100 border-red-200 text-red-700'
                          }`}
                        >
                          {isIn ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-neutral-800 line-clamp-1 text-sm md:text-base">
                              {tx.itemName}
                            </p>
                            {isDeleted && (
                              <Badge variant="danger" className="text-[10px] scale-90 select-none flex gap-1 items-center px-1.5 py-0">
                                <Trash2 className="w-2.5 h-2.5" /> Deleted Item
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-center gap-2.5 text-xs text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 opacity-60" /> {formatDate(tx.createdAt)}
                            </span>
                            <span>•</span>
                            <span>
                              Txn. {tx.id < 1000 ? String(tx.id).padStart(4, '0') : tx.id.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Count Badge */}
                      <Badge
                        variant={isIn ? 'success' : 'danger'}
                        className={`text-sm py-1.5 px-3 rounded-xl border font-black ${
                          isIn ? 'border-green-200!' : 'border-red-200!'
                        }`}
                      >
                        {isIn ? '+' : '-'} {tx.quantity} Pcs
                      </Badge>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-neutral-100 flex items-center justify-between mt-6">
              <span className="text-xs text-neutral-500 font-bold">
                Page {currentPage} of {totalPages} <span className="opacity-40">•</span> {totalCount} records
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="rounded-xl px-3 border-neutral-200 hover:border-neutral-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-1.5" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className="rounded-xl px-3 border-neutral-200 hover:border-neutral-300"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
