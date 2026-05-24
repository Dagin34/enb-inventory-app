'use client';

import { useState, useRef, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Image as ImageIcon, Sparkles, ChevronDown, Package } from 'lucide-react';
import { Button, Input, Textarea, Select, Card, Spinner, Badge } from './ui';
import { CATEGORIES, validateImageFile } from '@/lib/validation';
import { fetchApiWithFormData } from '@/lib/utils';
import { InventoryItem } from '@/db/schema';

interface InventoryFormProps {
  initialData?: InventoryItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function InventoryForm({
  initialData,
  onSuccess,
  onCancel,
}: InventoryFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Other',
    price: initialData?.price?.toString() || '',
    stock: initialData?.stock?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle image selection with preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(initialData?.imageUrl || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Identifiable name required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Limit: 255 characters';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price)) {
      newErrors.price = 'Numerical value required';
    } else if (price <= 0) {
      newErrors.price = 'Positive value required';
    }

    const stock = parseInt(formData.stock, 10);
    if (!formData.stock || isNaN(stock)) {
      newErrors.stock = 'Integer required';
    } else if (stock < 0) {
      newErrors.stock = 'Non-negative required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Validation protocol failed');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const apiPath = initialData ? `/api/items/${initialData.id}` : '/api/items';
      const method = (initialData ? 'PUT' : 'POST') as 'POST' | 'PUT';

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + 5;
        });
      }, 100);

      const response = await fetchApiWithFormData(apiPath, formDataToSend, method);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.success) {
        throw new Error(response.error || 'Sync failed');
      }

      toast.success(initialData ? 'Asset synchronized' : 'Asset cataloged');

      setFormData({
        name: '',
        description: '',
        category: 'Other',
        price: '',
        stock: '',
      });
      setImageFile(null);
      setImagePreview(null);


      if (onSuccess) onSuccess();
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      toast.error(error.message || 'System error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const categoryOptions = CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <Card className="p-0! overflow-hidden border border-white/20 shadow-[0_20px_80px_rgba(0,0,0,0.08)] bg-white/90! backdrop-blur-2xl rounded-4xl">
      <form onSubmit={handleSubmit} className="flex flex-col relative">

        {/* Header */}
        <div className="bg-primary px-7 py-6 text-white relative overflow-hidden border-b border-white/10">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Package className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-xl font-black font-display tracking-tight leading-none">
                  {initialData ? 'Modify Asset' : 'Insert Asset'}
                </h3>

                <p className="opacity-70 text-xs mt-2 max-w-sm leading-relaxed">
                  {initialData
                    ? 'Updating the items in the inventory management system.'
                    : 'Registering new items into the inventory management system.'}
                </p>
              </div>
            </div>
          </div>

          {/* Ambient Effects */}
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -mb-10 -ml-10" />
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-2">

          {/* Image Section */}
          <div className="space-y-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-52 w-full rounded-4xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4 group ${imagePreview
                ? 'border-primary shadow-lg shadow-primary/10'
                : 'border-neutral-200 hover:border-primary/40 hover:bg-primary/3'
                }`}
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-5 py-2.5 rounded-2xl bg-white text-primary font-semibold text-sm hover:scale-[1.03] active:scale-100 transition-all shadow-xl"
                    >
                      Replace Image
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <ImageIcon className="w-7 h-7" />
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-bold text-primary tracking-tight">
                      Upload Visual
                    </p>

                    <p className="text-xs text-neutral-400 mt-1">
                      Drag & drop or click to browse
                    </p>
                  </div>
                </>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-2">

            {/* Name and Category */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Product Name"
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-5 text-xs font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />

                {errors.name && (
                  <p className="text-xs text-red-500 ml-1">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="appearance-none h-12 w-full rounded-2xl border border-neutral-200 bg-white px-5 pr-12 text-xs font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Product Price"
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-5 text-xs font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />

                {errors.price && (
                  <p className="text-xs text-red-500 ml-1">{errors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Stock Quantity"
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-5 text-xs font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />

                {errors.stock && (
                  <p className="text-xs text-red-500 ml-1">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Full description..."
                rows={5}
                className="w-full rounded-3xl border border-neutral-200 bg-white px-5 py-4 text-xs font-medium resize-none outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />

              {errors.description && (
                <p className="text-xs text-red-500 ml-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="text-sm flex-1 h-12 rounded-2xl border border-neutral-200 bg-white text-primary font-semibold hover:bg-neutral-50 transition-all"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="text-sm flex-1 h-12 rounded-2xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {isSubmitting
                ? 'Processing...'
                : initialData
                  ? 'Save & Update'
                  : 'Submit'}
            </button>
          </div>
        </div>

        {/* Progress */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 w-full h-1.5 bg-neutral-100 overflow-hidden"
            >
              <motion.div
                className="h-full bg-linear-to-r from-primary via-primary/80 to-green-400 rounded-r-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Card>
  );
}