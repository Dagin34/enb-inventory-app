'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  Tag,
  Calendar,
  Layers,
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import {
  Button,
  Card,
  Input,
  Select,
  EmptyState,
  Badge,
  Skeleton,
} from './ui';
import { ConfirmDialog } from './ui/Modal';
import InventoryForm from './InventoryForm';
import { CATEGORIES } from '@/lib/validation';
import { formatCurrency, formatDate, debounce } from '@/lib/utils';
import { InventoryItem } from '@/db/schema';

interface InventoryListProps {
  initialItems: InventoryItem[];
}

export default function InventoryList({ initialItems }: InventoryListProps) {
  const router = useRouter();

  const [items, setItems] = useState(initialItems);
  const [filteredItems, setFilteredItems] = useState(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  // Helper function to filter items
  const applyFilters = (
    itemsToFilter: InventoryItem[],
    query: string,
    category: string
  ) => {
    let result = itemsToFilter;

    // Filter by category
    if (category !== 'all') {
      result = result.filter((item) => item.category === category);
    }

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.description?.toLowerCase().includes(lowerQuery) ||
          item.category?.toLowerCase().includes(lowerQuery)
      );
    }

    return result;
  };

  // Debounced search function
  const debouncedSearch = debounce((query: string) => {
    setFilteredItems(applyFilters(items, query, selectedCategory));
  }, 300);

  // Handle search input
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  // Handle category filter change
  useEffect(() => {
    setFilteredItems(applyFilters(items, searchQuery, selectedCategory));
  }, [selectedCategory, items]);

  // Handle delete
  const handleDelete = async (id: number) => {
    setIsDeletingLoading(true);
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }

      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      setFilteredItems((prevItems) =>
        prevItems.filter((item) => item.id !== id)
      );
      setDeletingItemId(null);

      toast.success('Item deleted successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setEditingItem(null);
    setIsLoading(true);
    router.refresh();
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  if (editingItem) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleCancelEdit}
            className="group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Collection
          </Button>
          <div className="h-4 w-px bg-neutral-200" />
          <h2 className="text-xl font-bold font-display">Editing {editingItem.name}</h2>
        </div>
        <InventoryForm
          initialData={editingItem}
          onSuccess={handleEditSuccess}
          onCancel={handleCancelEdit}
        />
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Category Toggle */}
      <div className="flex flex-col md:flex-row gap-4 items-center">

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex items-center gap-3">
            <div className="relative group">
              {/* <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" /> */}
              <input
                type="text"
                placeholder="Search product..."
                className="pl-11 pr-6 py-3 bg-white border border-neutral-200 rounded-2xl w-full md:w-64 focus:w-80 transition-all shadow-sm focus:shadow-md"
              />
            </div>
          </div>
          {categoryOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedCategory(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm border ${selectedCategory === opt.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-neutral-500 border-neutral-100 hover:border-neutral-300'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of items */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse-slow">
              <div className="h-48 bg-neutral-100 rounded-2xl mb-4" />
              <div className="space-y-3">
                <div className="h-6 bg-neutral-100 rounded w-3/4" />
                <div className="h-4 bg-neutral-100 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Layers size={48} />}
          title={
            items.length === 0
              ? 'No items available!'
              : 'No items available!'
          }
          description={
            items.length === 0
              ? 'Please insert items under this category to see them filtered.'
              : 'Please insert items under this category to see them filtered.'
          }
          action={
            items.length !== 0 && (
              <Button variant="secondary" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                Reset Filtering
              </Button>
            )
          }
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                <Card className="p-0 overflow-hidden flex flex-col group h-full">
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden bg-neutral-50">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-200">
                        <Package className="w-16 h-16 opacity-10" />
                      </div>
                    )}

                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4">
                      <Badge variant={item.stock > 10 ? 'success' : item.stock > 0 ? 'warning' : 'danger'}>
                        {item.stock.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Available
                      </Badge>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-xl hover:bg-white text-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingItemId(item.id)}
                        className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold font-display text-white/80 line-clamp-1 group-hover:text-white transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-lg font-black text-white/40 font-display">
                        ${Number(item.price).toLocaleString()}
                      </p>
                    </div>

                    <p className="text-white/50 text-sm line-clamp-2 mb-6 flex-1">
                      {item.description || 'No detailed technical documentation available for this asset.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-widest">
                        <Tag className="w-3 h-3" />
                        {item.category}
                      </div>
                      <div className="text-[10px] text-white/40 font-medium">
                        Added {formatDate(item.createdAt).split(',')[0]}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deletingItemId !== null}
        title="Evict Asset?"
        message="Are you sure you want to permanently remove this asset from the ecosystem? This protocol cannot be reversed."
        confirmText="Confirm Eviction"
        cancelText="Keep Asset"
        isDangerous
        isLoading={isDeletingLoading}
        onConfirm={() => {
          if (deletingItemId) {
            return handleDelete(deletingItemId);
          }
        }}
        onCancel={() => setDeletingItemId(null)}
      />
    </div>
  );
}