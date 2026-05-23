import { NextResponse } from 'next/server';
import { db } from '@/db';
import { stockTransactions } from '@/db/schema';
import { desc, eq, and, sql, ilike } from 'drizzle-orm';

/**
 * GET all stock transactions with pagination and optional search/filter
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];
    if (search.trim()) {
      conditions.push(ilike(stockTransactions.itemName, `%${search}%`));
    }
    if (type === 'IN' || type === 'OUT') {
      conditions.push(eq(stockTransactions.type, type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch transactions
    const transactions = await db.query.stockTransactions.findMany({
      where: whereClause,
      orderBy: [desc(stockTransactions.createdAt)],
      limit,
      offset,
    });

    // Get total count using standard drizzle SQL count
    const [totalCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(stockTransactions)
      .where(whereClause);

    const totalCount = Number(totalCountResult?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      transactions,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions. Please try again.' },
      { status: 500 }
    );
  }
}
