import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Warehouse } from '../../types/stockwise';
import { formatINR } from '../../lib/formatters';
import { Button, Badge, Card, Modal, KPICard } from '../common/UIComponents';
import {
  Building2,
  MapPin,
  Phone,
  User,
  Boxes,
  Plus,
} from 'lucide-react';

export const WarehousesView: React.FC = () => {
  const { warehouses, inventory, products, addWarehouse } = useStockWise();

  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(warehouses[0] || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: 'WH-AUR-01',
    name: 'Chhatrapati Sambhajinagar Hub',
    address: 'Plot 18, Shendra MIDC Industrial Area',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    lat: 19.8762,
    lng: 75.3433,
    totalCapacityUnits: 120000,
    usedCapacityUnits: 45000,
    operatingCostPerDay: 8500,
    managerName: 'Vikram Patil',
    contactPhone: '+91 98230 45678',
    status: 'active' as const,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newWh = addWarehouse({
      ...formData,
      type: 'warehouse',
    });
    setSelectedWarehouse(newWh);
    setIsAddModalOpen(false);
  };

  const getWarehouseInventory = (whId: string) => {
    return inventory.filter((i) => i.locationId === whId);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
            Warehouses
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Manage central storage hubs, facility capacities, and stock reserves across Maharashtra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* Facilities Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {warehouses.map((wh) => {
          const utilPct = Math.round((wh.usedCapacityUnits / wh.totalCapacityUnits) * 100);
          const isSelected = selectedWarehouse?.id === wh.id;

          return (
            <div
              key={wh.id}
              onClick={() => setSelectedWarehouse(wh)}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                isSelected
                  ? 'border-[#2864E8] shadow-xs ring-2 ring-[#2864E8]/15'
                  : 'border-[#D5E5F7] hover:border-[#D5E5F7]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF4FF] flex items-center justify-center text-[#2864E8]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-[#172B45] leading-tight">
                      {wh.name}
                    </h3>
                    <span className="text-[11px] font-mono text-[#627A96]">{wh.code}</span>
                  </div>
                </div>

                <Badge variant={wh.status === 'active' ? 'healthy' : 'low'} size="sm">
                  {wh.status === 'active' ? 'Active' : 'Maintenance'}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-[#627A96] mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{wh.address}, {wh.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Manager: {wh.managerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{wh.contactPhone}</span>
                </div>
              </div>

              {/* Capacity Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#627A96]">Capacity Utilization</span>
                  <span className="font-semibold text-[#172B45] tabular-nums">{utilPct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      utilPct > 85 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${utilPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 tabular-nums">
                  <span>{wh.usedCapacityUnits.toLocaleString()} units</span>
                  <span>{wh.totalCapacityUnits.toLocaleString()} capacity</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Warehouse Stock on Hand Table */}
      {selectedWarehouse && (
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-[#D5E5F7] bg-[#F0F7FF] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#172B45]">
                Inventory on Hand: {selectedWarehouse.name} ({selectedWarehouse.city})
              </h3>
              <p className="text-xs text-[#627A96]">
                Stock counts, safety thresholds, and uncommitted stock available for redistribution
              </p>
            </div>
            <div className="text-xs font-semibold text-[#172B45]">
              Daily Ops Cost: <strong className="text-[#172B45]">{formatINR(selectedWarehouse.operatingCostPerDay)}</strong>/day
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F0F7FF]/50 border-b border-[#D5E5F7] text-[#627A96] uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 font-mono">SKU</th>
                  <th className="py-3 px-4 text-right">Available Stock</th>
                  <th className="py-3 px-4 text-right">Safety Buffer</th>
                  <th className="py-3 px-4 text-right">Target Level</th>
                  <th className="py-3 px-4 text-right">Inventory Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getWarehouseInventory(selectedWarehouse.id).map((item) => {
                  const prod = products.find((p) => p.id === item.productId);
                  if (!prod) return null;
                  const itemValue = item.quantityOnHand * prod.unitCost;

                  return (
                    <tr key={item.id} className="hover:bg-[#E4F1FF] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#172B45]">
                        {prod.name}
                      </td>
                      <td className="py-3 px-4 text-[#627A96]">{prod.category}</td>
                      <td className="py-3 px-4 font-mono text-[#627A96] text-xs">{prod.sku}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-[#172B45]">
                        {item.quantityOnHand.toLocaleString()} units
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#627A96]">
                        {item.safetyStock} units
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#627A96]">
                        {item.targetStockLevel} units
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#172B45]">
                        {formatINR(itemValue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Warehouse Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Distribution Warehouse"
        subtitle="Register a new central hub in Maharashtra"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddSubmit}>
              Save Warehouse
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Facility Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Code</label>
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
              <label className="block text-[#172B45] font-medium mb-1">Total Capacity (Units)</label>
              <input
                type="number"
                required
                value={formData.totalCapacityUnits}
                onChange={(e) => setFormData({ ...formData, totalCapacityUnits: Number(e.target.value) })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Facility Manager</label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
