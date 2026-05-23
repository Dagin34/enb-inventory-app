import { db } from '@/db';
import { inventoryItems } from '@/db/schema';
import InventoryList from '@/components/InventoryList';
import { Card } from '@/components/ui';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Package, TrendingUp } from 'lucide-react';
import { retryAsync } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Fetch all items with retry logic for local development resilience
  const items = await retryAsync(
    () => db.query.inventoryItems.findMany({
      orderBy: (items, { desc }) => [desc(items.createdAt)],
    }),
    3,
    500
  );

  // Calculate statistics
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.stock;
  }, 0);

  return (
    <div className="min-h-screen flex bg-[#F4F9E9]">
      <main className="flex-1 px-2 py-4 lg:p-8 overflow-x-hidden">
        <div className="max-w-full mx-auto space-y-4 px-2 lg:px-24">
          
          {/* Client Header with Modals */}
          <DashboardHeader items={items} />

          {/* High Fidelity Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 bg-primary!">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-[0.7rem] font-bold uppercase tracking-widest mb-1">Total Assets</p>
                  <p className="text-2xl font-black text-white font-display tracking-tight">
                    {totalItems} Pcs
                  </p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl">
                  <Package className="w-4 h-4 text-white" />
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 bg-primary!">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-[0.7rem] font-bold uppercase tracking-widest mb-1">Valuation</p>
                  <p className="text-2xl font-black text-white font-display tracking-tight">
                    {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                  </p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Listings Area */}
          <div className="space-y-4">
            <InventoryList initialItems={items} />
          </div>

        </div>
      </main>
    </div>
  );
}