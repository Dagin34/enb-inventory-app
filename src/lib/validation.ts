import { z } from 'zod';

export const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food & Beverage',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Media',
  'Toys & Games',
  'Health & Beauty',
  'Office Supplies',
  'Other'
] as const;

export const createItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .default(''),
  category: z.enum(CATEGORIES).default('Other'),
  price: z
    .number()
    .positive('Price must be greater than 0')
    .min(0.01, 'Price must be at least $0.01')
    .max(999999.99, 'Price cannot exceed $999,999.99'),
  stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(999999, 'Stock cannot exceed 999,999'),
});

export const updateItemSchema = createItemSchema.partial().merge(
  z.object({
    id: z.number().int().positive(),
  })
);

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

// Validation helpers
export function validateImageFile(file: File | null | undefined): { valid: boolean; error?: string } {
  if (!file) return { valid: true }; // Image is optional

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Image must be smaller than 5MB' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Image must be JPEG, PNG, WebP, or GIF' };
  }

  return { valid: true };
}

export function parsePrice(price: string | number): number {
  const parsed = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

export function parseStock(stock: string | number): number {
  const parsed = typeof stock === 'string' ? parseInt(stock, 10) : stock;
  return isNaN(parsed) ? 0 : parsed;
}
