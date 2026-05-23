import { pgTable, serial, text, decimal, integer, timestamp, varchar, index } from 'drizzle-orm/pg-core';

export const inventoryItems = pgTable(
  'inventory_items',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 100 }).default('Uncategorized'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    stock: integer('stock').notNull().default(0),
    imageUrl: text('image_url'),
    imageCloudinaryId: text('image_cloudinary_id'), // For reliable deletion
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_category').on(table.category),
    index('idx_created_at').on(table.createdAt),
  ]
);

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;

export const stockTransactions = pgTable(
  'stock_transactions',
  {
    id: serial('id').primaryKey(),
    itemId: integer('item_id').references(() => inventoryItems.id, { onDelete: 'set null' }),
    itemName: varchar('item_name', { length: 255 }).notNull(),
    quantity: integer('quantity').notNull(),
    type: varchar('type', { length: 10 }).notNull(), // 'IN' or 'OUT'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_transaction_item_id').on(table.itemId),
    index('idx_transaction_created_at').on(table.createdAt),
  ]
);

export type StockTransaction = typeof stockTransactions.$inferSelect;
export type NewStockTransaction = typeof stockTransactions.$inferInsert;