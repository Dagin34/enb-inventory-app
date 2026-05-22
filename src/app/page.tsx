import { db } from '@/db';
import { inventoryItems } from '@/db/schema';
import InventoryList from '@/components/InventoryList';
import InventoryForm from '@/components/InventoryForm';
import { Card, Badge } from '@/components/ui';
import { Package, TrendingUp, AlertCircle, Search, Filter, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Fetch all items sorted by creation date
  const items = await db.query.inventoryItems.findMany({
    orderBy: (items, { desc }) => [desc(items.createdAt)],
  });

  // Calculate statistics
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.stock;
  }, 0);
  const lowStockCount = items.filter((item) => item.stock < 10).length;

  return (
    <div className="min-h-screen flex bg-[#F4F9E9]">
      <main className="flex-1 ml-20 p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-full mx-auto space-y-12 px-24">
          
          {/* Hero Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in">
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-primary font-display leading-[1.1]">
                Inventory <br /> 
                <span className="text-primary/40">Management.</span>
              </h1>
              <p className="text-lg text-neutral-500">
                Precision asset management for elite production environments.
              </p>
            </div>
            
          </header>

          {/* High Fidelity Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-1">Total Assets</p>
                  <p className="text-4xl font-black text-white font-display tracking-tight">
                    {totalItems} Pcs
                  </p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-1">Valuation</p>
                  <p className="text-4xl font-black text-white font-display tracking-tight">
                    {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                  </p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Inventory Feed */}
            <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">
              <InventoryList initialItems={items} />
            </div>

            {/* Quick Actions / Form */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6 order-1 lg:order-2">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary font-display tracking-tight flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Register New Asset
                </h3>
                <p className="text-sm text-neutral-500">Enter details to catalog a new product in the ecosystem.</p>
              </div>
              <InventoryForm />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}