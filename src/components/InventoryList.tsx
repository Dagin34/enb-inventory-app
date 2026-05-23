'use client';

import { useState, useEffect, useTransition } from 'react';
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
  LayoutGrid,
  List,
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

  // Sync state with initialItems when server-side data changes (e.g., after router.refresh())
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  const [filteredItems, setFilteredItems] = useState(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

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
  }, [searchQuery, items, selectedCategory]);

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
      startTransition(() => {
        router.refresh();
      });
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
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleCancelEdit}
            className="group text-sm"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Collection
          </Button>
          <div className="h-4 w-px bg-primary/70" />
          <h2 className="ml-4 text-sm font-bold font-display text-primary">Editing {editingItem.name}</h2>
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
    <div className="space-y-4">
      {/* Search and Category Toggle */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm pl-11 pr-6 py-3 bg-white border border-neutral-200 rounded-2xl w-full md:w-96 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm outline-none"
              />
            </div>

            {/* View Toggle */}
            <div className="flex bg-white border border-neutral-200 rounded-2xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-neutral-400 hover:text-primary'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-neutral-400 hover:text-primary'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedCategory(opt.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${selectedCategory === opt.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-neutral-500 border-neutral-100 hover:border-neutral-300'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items Container */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse-slow">
              <div className="flex gap-4">
                <div className="h-24 w-24 bg-neutral-100 rounded-2xl" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 bg-neutral-100 rounded w-3/4" />
                  <div className="h-4 bg-neutral-100 rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Layers size={48} />}
          title="No items available!"
          description="Please insert items under this category to see them filtered."
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
          className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2" : "space-y-1"}
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                {viewMode === 'grid' ? (
                  <Card className="p-0! hover:border-3! overflow-hidden flex flex-col group h-full">
                    {/* Image Container */}
                    <div className="relative h-32 overflow-hidden bg-neutral-50">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-200">
                          <Package className="w-12 h-12 opacity-10" />
                        </div>
                      )}

                      {/* Badge Overlay */}
                      <div className="absolute top-3 left-3">
                        <Badge variant={item.stock > 10 ? 'success' : item.stock > 0 ? 'warning' : 'danger'}>
                          {item.stock} Available
                        </Badge>
                      </div>

                      <div className="absolute top-3 right-3 flex gap-2 -translate-y-2.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-3 bg-white/50 hover:bg-primary text-primary hover:text-secondary border-2 border-primary backdrop-blur shadow-sm rounded-xl transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingItemId(item.id)}
                          className="p-3 bg-white/50 hover:bg-red-600 text-primary hover:text-secondary border-2 border-primary backdrop-blur shadow-sm rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold font-display text-white/80 line-clamp-1 group-hover:text-white transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-base font-black text-white/50 font-display">
                          {Number(item.price).toLocaleString()} ETB
                        </p>
                      </div>
                      <p className="text-white/40 text-xs line-clamp-2 mb-4 flex-1">
                        {item.description || 'No description available.'}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 py-1 px-2 rounded-full text-white/30">{item.category}</span>
                        <span className="text-[10px] text-white/20">{formatDate(item.createdAt).split(',')[0]}</span>
                      </div>
                    </div>
                  </Card>
                ) : (
                  /* List View */
                  <Card className="p-1! bg-white/75! translate-y-0! hover:bg-white/90! group hover:border-primary/30 transition-all overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4"> 
                      <div className="flex flex-1 items-center gap-4 py-1 sm:py-0 px-2 sm:px-0">
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden border border-primary/20 bg-neutral-50 shrink-0">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 sm:w-6 sm:h-6 opacity-10" /></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-5">
                                <h3 className="font-bold text-sm sm:text-base text-primary/70 group-hover:text-primary transition-colors truncate">{item.name}</h3>
                                <div className="hidden sm:block h-4 w-0 border border-primary/30"></div>
                                <p className="text-primary/40 text-xs line-clamp-1 max-w-xs">
                                  {item.description || 'No description available.'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="default" className="bg-primary/5 text-primary/40 border-none px-2 py-0 text-[10px] sm:text-xs">
                                  {item.category}
                                </Badge>
                                <span className="text-xs text-primary/30">{formatCurrency(item.price)} ETB</span>
                              </div>
                            </div>

                            <div className="text-right mr-2 sm:mr-4">
                              <p className="text-[10px] sm:text-xs font-bold text-primary/30 uppercase tracking-widest">Stock</p>
                              <p className={`text-sm sm:text-lg font-black font-display ${item.stock > 10 ? 'text-green-400' : item.stock > 0 ? 'text-orange-400' : 'text-red-400'}`}>
                                {item.stock}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden sm:flex items-stretch transition-all duration-200">
                        <div className="w-px bg-neutral-100 self-stretch my-1" />
                        <div className="flex flex-col h-full w-14 shrink-0">
                          <button 
                            type="button"
                            onClick={() => setEditingItem(item)} 
                            className="rounded-xl flex-1 flex items-center justify-center w-full bg-transparent hover:bg-primary text-neutral-500 hover:text-white transition-colors duration-150 border-b border-neutral-100"
                            title="Edit Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setDeletingItemId(item.id)} 
                            className="rounded-xl flex-1 flex items-center justify-center w-full bg-transparent hover:bg-red-600 text-neutral-500 hover:text-white transition-colors duration-150"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Mobile View */}
                      <div className="flex sm:hidden border-t border-neutral-50 bg-neutral-50/40 w-full distribution">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 active:bg-primary/5 active:text-primary transition-colors border-r border-neutral-100/60"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItemId(item.id)}
                          className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 active:bg-red-50 active:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>

                    </div>
                  </Card>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deletingItemId !== null}
        title="Remove Item?"
        message="Are you sure you want to permanently remove this item from the system? This deletion cannot be reversed."
        confirmText="Confirm Deletion"
        cancelText="Keep Item"
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