import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryItems, NewInventoryItem, stockTransactions } from '@/db/schema';
import { uploadImage } from '@/lib/cloudinary';
import { createItemSchema, validateImageFile } from '@/lib/validation';
import { retryAsync } from '@/lib/utils';

/**
 * GET all inventory items with pagination
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = db.query.inventoryItems.findMany({
      orderBy: (items, { desc }) => [desc(items.createdAt)],
    });

    // Filter by category if provided
    if (category && category !== 'all') {
      // Note: Drizzle filtering would need to be applied at runtime
      const allItems = await query;
      const filtered = allItems.filter((item) => item.category === category);
      const searched = search
        ? filtered.filter(
            (item) =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.description?.toLowerCase().includes(search.toLowerCase())
          )
        : filtered;
      return NextResponse.json(searched);
    }

    const items = await query;

    // Filter by search if provided
    const result = search
      ? items.filter(
          (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description?.toLowerCase().includes(search.toLowerCase())
        )
      : items;

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * POST a new inventory item
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const category = formData.get('category')?.toString() || 'Other';
    const price = formData.get('price')?.toString() || '0';
    const stock = formData.get('stock')?.toString() || '0';
    const imageFile = formData.get('image') as File | null;

    // Validate input with Zod
    const validation = createItemSchema.safeParse({
      name,
      description,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    });

    if (!validation.success) {
      const flatErrors = validation.error.flatten();
      const firstError = Object.values(flatErrors.fieldErrors)[0]?.[0] || 'Validation failed';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // Validate image if provided
    const imageValidation = validateImageFile(imageFile);
    if (!imageValidation.valid) {
      return NextResponse.json({ error: imageValidation.error }, { status: 400 });
    }

    let imageUrl: string | undefined;
    let imageCloudinaryId: string | undefined;

    if (imageFile) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload with retry
        const uploadResult = await retryAsync(
          () => uploadImage(buffer, 'inventory-app'),
          3,
          1000
        );

        imageUrl = uploadResult.url;
        imageCloudinaryId = uploadResult.publicId;
      } catch (uploadError: any) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError.message}` },
          { status: 400 }
        );
      }
    }

    // Create item with retry for database operations
    const newItem: NewInventoryItem = {
      name: validation.data.name,
      description: validation.data.description,
      category: validation.data.category,
      price: validation.data.price.toString() as any,
      stock: validation.data.stock,
      imageUrl,
      imageCloudinaryId,
    };

    const [createdItem] = await retryAsync(
      async () => {
        const [created] = await db.insert(inventoryItems).values(newItem).returning();

        if (created && created.stock > 0) {
          await db.insert(stockTransactions).values({
            itemId: created.id,
            itemName: created.name,
            quantity: created.stock,
            type: 'IN',
          });
        }

        return [created];
      },
      3,
      1000
    );

    return NextResponse.json(createdItem, { status: 201 });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item. Please try again.' },
      { status: 500 }
    );
  }
}