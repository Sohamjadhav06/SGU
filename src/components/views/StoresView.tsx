import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Store, PriorityTier } from '../../types/stockwise';
import { Button, Badge, Card, Modal } from '../common/UIComponents';
import {
  Store as StoreIcon,
  MapPin,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { calculateDaysRemaining, classifyStockoutRisk } from '../../lib/inventoryEngine';

export const StoresView: React.FC = () => {
  const { stores, inventory, products, demandRecords, addStore, setCurrentPage } = useStockWise();

  const [selectedStore, setSelectedStore] = useState<Store | null>(stores[0] || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: 'STR-KOL-107',
    name: 'Kolhapur Digital Store',
    address: 'Plot 12, Mahadwar Road, Laxmipuri',
    city: 'Kolhapur',
    state: 'Maharashtra',
    lat: 16.705,
    lng: 74.2433,
    priorityTier: 'standard' as PriorityTier,
    dailyFootfall: 4200,
    managerName: 'Sachin Patil',
    contactPhone: '+91 98224 88765',
    status: 'active' as const,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStr = addStore({
      ...formData,
      type: 'store',
    });
    setSelectedStore(newStr);
    setIsAddModalOpen(false);
  };

  const getStoreStats = (storeId: string) => {
    const storeInv = inventory.filter((i) => i.locationId === storeId);
    let criticalCount = 0;
    let lowCount = 0;

    storeInv.forEach((item) => {
      const demandKey = `${storeId}_${item.productId}`;
      const avgDaily = demandRecords[demandKey]?.avgDaily || 0;
      const days = calculateDaysRemaining(item.quantityOnHand, avgDaily);
      const risk = classifyStockoutRisk(item.quantityOnHand, item.safetyStock, days);
      if (risk === 'critical') criticalCount++;
      else if (risk === 'high') lowCount++;
    });

    const totalStock = storeInv.reduce((sum, item) => sum + item.quantityOnHand, 0);

    return { totalStock, criticalCount, lowCount };
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
            Stores & Distributors
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Monitor the 6 Maharashtra retail shops, footfall, daily checkout rates, and inventory status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Store
          </Button>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {stores.map((store) => {
          const stats = getStoreStats(store.id);
          const isSelected = selectedStore?.id === store.id;

          return (
            <div
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                isSelected
                  ? 'border-[#2864E8] shadow-xs ring-2 ring-[#2864E8]/15'
                  : 'border-[#D5E5F7] hover:border-[#D5E5F7]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <StoreIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#172B45] leading-tight">
                      {store.name}
                    </h3>
                    <span className="text-[11px] font-mono text-[#627A96]">{store.code}</span>
                  </div>
                </div>

                <Badge
                  variant={
                    store.priorityTier === 'flagship'
                      ? 'primary'
                      : store.priorityTier === 'express'
                      ? 'healthy'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {store.priorityTier.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-[#627A96] mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{store.address}, {store.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Footfall: {store.dailyFootfall.toLocaleString()} visitors/day</span>
                </div>
              </div>

              {/* Status Alert Pill */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="font-semibold text-[#172B45] tabular-nums">
                  {stats.totalStock.toLocaleString()} units on hand
                </div>

                {stats.criticalCount > 0 ? (
                  <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{stats.criticalCount} Low Stock</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-emerald-600">
                    Stock Healthy
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Store Stock Table */}
      {selectedStore && (
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-[#D5E5F7] bg-[#F0F7FF] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#172B45]">
                Store Shelf Stock: {selectedStore.name} ({selectedStore.city})
              </h3>
              <p className="text-xs text-[#627A96]">
                Store inventory levels, average sales rate, and shortage urgency
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrentPage('stockout-alerts')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Check Low Stock Alerts
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F0F7FF]/50 border-b border-[#D5E5F7] text-[#627A96] uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 font-mono">SKU</th>
                  <th className="py-3 px-4 text-right">Available Stock</th>
                  <th className="py-3 px-4 text-right">Daily Sales</th>
                  <th className="py-3 px-4 text-right">Days Remaining</th>
                  <th className="py-3 px-4 text-center">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => {
                  const inv = inventory.find(
                    (i) => i.locationId === selectedStore.id && i.productId === prod.id
                  );
                  const onHand = inv ? inv.quantityOnHand : 0;
                  const demandKey = `${selectedStore.id}_${prod.id}`;
                  const avgDaily = demandRecords[demandKey]?.avgDaily || 0;
                  const days = calculateDaysRemaining(onHand, avgDaily);
                  const risk = classifyStockoutRisk(onHand, prod.minSafetyStock, days);

                  return (
                    <tr key={prod.id} className="hover:bg-[#E4F1FF] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#172B45]">{prod.name}</td>
                      <td className="py-3 px-4 text-[#627A96]">{prod.category}</td>
                      <td className="py-3 px-4 font-mono text-[#627A96] text-xs">{prod.sku}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-[#172B45]">
                        {onHand} units
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#627A96]">
                        {avgDaily}/day
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold">
                        <span
                          className={
                            days !== null && days <= 2
                              ? 'text-rose-600'
                              : days !== null && days <= 5
                              ? 'text-amber-600'
                              : 'text-[#172B45]'
                          }
                        >
                          {days !== null ? `${days} days` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            risk === 'critical'
                              ? 'stockout'
                              : risk === 'high'
                              ? 'low'
                              : 'healthy'
                          }
                          size="sm"
                        >
                          {risk === 'critical' ? 'Urgent' : risk === 'high' ? 'Low Stock' : 'Safe'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Store Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Retail Store"
        subtitle="Register a new retail shop in Maharashtra"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddSubmit}>
              Save Store
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Store Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Store Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">Street Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#172B45] font-medium mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Priority Tier</label>
              <select
                value={formData.priorityTier}
                onChange={(e) => setFormData({ ...formData, priorityTier: e.target.value as PriorityTier })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
              >
                <option value="flagship">Flagship</option>
                <option value="standard">Standard</option>
                <option value="express">Express</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
