import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryItems, NewInventoryItem, stockTransactions } from '@/db/schema';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import { createItemSchema, validateImageFile } from '@/lib/validation';
import { retryAsync } from '@/lib/utils';
import { eq } from 'drizzle-orm';

/**
 * GET a single inventory item by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
  }

  try {
    const item = await db.query.inventoryItems.findFirst({
      where: eq(inventoryItems.id, id),
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

/**
 * PUT (Update) an inventory item by ID
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
  }

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

    // Fetch existing item
    const existingItem = await db.query.inventoryItems.findFirst({
      where: eq(inventoryItems.id, id),
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    let imageUrl: string | undefined = existingItem.imageUrl ?? undefined;
    let imageCloudinaryId: string | undefined = existingItem.imageCloudinaryId ?? undefined;

    // Handle new image upload
    if (imageFile) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await retryAsync(
          () => uploadImage(buffer, 'inventory-app'),
          3,
          1000
        );

        imageUrl = uploadResult.url;
        imageCloudinaryId = uploadResult.publicId;

        // Delete old image from Cloudinary if it exists
        if (existingItem.imageCloudinaryId) {
          deleteImage(existingItem.imageCloudinaryId).catch((err) => {
            console.error('Failed to delete old image:', err);
            // Continue anyway - old image won't cause issues
          });
        }
      } catch (uploadError: any) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError.message}` },
          { status: 400 }
        );
      }
    }

    // Update item
    const updatedData: Partial<NewInventoryItem> = {
      name: validation.data.name,
      description: validation.data.description,
      category: validation.data.category,
      price: validation.data.price.toString() as any,
      stock: validation.data.stock,
      imageUrl,
      imageCloudinaryId,
    };

    const [updatedItem] = await retryAsync(
      async () => {
        const [updated] = await db
          .update(inventoryItems)
          .set(updatedData)
          .where(eq(inventoryItems.id, id))
          .returning();

        if (updated && updated.stock !== existingItem.stock) {
          const stockDiff = updated.stock - existingItem.stock;
          await db.insert(stockTransactions).values({
            itemId: id,
            itemName: updated.name,
            quantity: Math.abs(stockDiff),
            type: stockDiff > 0 ? 'IN' : 'OUT',
          });
        }

        return [updated];
      },
      3,
      1000
    );

    if (!updatedItem) {
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE an inventory item by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
  }

  try {
    const [deletedItem] = await db
      .delete(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .returning();

    if (!deletedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Delete image from Cloudinary if it exists
    if (deletedItem.imageCloudinaryId) {
      deleteImage(deletedItem.imageCloudinaryId).catch((err) => {
        console.error('Failed to delete image:', err);
        // Continue anyway - deletion succeeded
      });
    }

    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}