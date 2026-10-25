import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Button, Card, Badge, SearchInput, Modal } from '../common/UIComponents';
import {
  Plus,
  Clock,
} from 'lucide-react';
import { MovementType } from '../../types/stockwise';

export const StockMovementsView: React.FC = () => {
  const { movements, products, warehouses, stores, adjustInventoryStock } = useStockWise();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);

  // New movement form state
  const [formData, setFormData] = useState({
    productId: products[0]?.id || '',
    locationId: warehouses[0]?.id || '',
    quantity: 50,
    type: 'inbound' as MovementType,
    referenceDoc: 'PO-2026-INBOUND',
    notes: 'Warehouse shipment receipt',
  });

  const filteredMovements = movements.filter((m) => {
    const prd = products.find((p) => p.id === m.productId);
    const matchSearch =
      m.movementNumber.toLowerCase().includes(search.toLowerCase()) ||
      m.referenceDoc.toLowerCase().includes(search.toLowerCase()) ||
      (prd && prd.name.toLowerCase().includes(search.toLowerCase())) ||
      (prd && prd.sku.toLowerCase().includes(search.toLowerCase()));

    const matchType = selectedType === 'all' || m.type === selectedType;
    return matchSearch && matchType;
  });

  const getLocationName = (id?: string) => {
    if (!id) return 'External / Supplier';
    const wh = warehouses.find((w) => w.id === id);
    if (wh) return `${wh.name} (${wh.city})`;
    const str = stores.find((s) => s.id === id);
    if (str) return `${str.name} (${str.city})`;
    return id;
  };

  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const delta = formData.type === 'outbound' ? -Math.abs(formData.quantity) : Math.abs(formData.quantity);
    adjustInventoryStock(formData.locationId, formData.productId, delta, formData.notes);
    setIsNewMovementModalOpen(false);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
            Stock Movements
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Immutable log of all inter-facility transfers, inbound receipts, and cycle count adjustments.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsNewMovementModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Record Stock Transaction
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3 border border-[#D5E5F7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search by movement ID, PO reference, or product..."
            className="w-full sm:max-w-xs"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'transfer', 'inbound', 'outbound', 'adjustment'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap cursor-pointer ${
                  selectedType === t
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-[#627A96] hover:bg-slate-200'
                }`}
              >
                {t === 'all' ? 'All Movements' : t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Movements Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F0F7FF] border-b border-[#D5E5F7] text-[#627A96] uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction / Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Origin Facility</th>
                <th className="py-3 px-4">Destination Facility</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.map((m) => {
                const prd = products.find((p) => p.id === m.productId);
                return (
                  <tr key={m.id} className="hover:bg-[#E4F1FF] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#172B45] font-mono">{m.movementNumber}</div>
                      <div className="text-[11px] text-[#627A96] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(m.timestamp).toLocaleDateString()} {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          m.type === 'transfer'
                            ? 'primary'
                            : m.type === 'inbound'
                            ? 'healthy'
                            : m.type === 'outbound'
                            ? 'transit'
                            : 'low'
                        }
                        size="sm"
                      >
                        {m.type.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#172B45]">{prd?.name}</div>
                      <div className="text-[11px] text-[#627A96] font-mono">Ref: {m.referenceDoc}</div>
                    </td>

                    <td className="py-3 px-4 text-[#172B45]">
                      {getLocationName(m.sourceLocationId)}
                    </td>

                    <td className="py-3 px-4 text-[#172B45]">
                      {getLocationName(m.destinationLocationId)}
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums font-bold text-[#172B45]">
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity} units
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Badge
                        variant={
                          m.status === 'completed'
                            ? 'healthy'
                            : m.status === 'in_transit'
                            ? 'transit'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {m.status === 'completed' ? 'Delivered' : m.status === 'in_transit' ? 'On the way' : 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMovements.length === 0 && (
          <div className="p-8 text-center text-xs text-[#627A96]">
            No movements recorded matching your search.
          </div>
        )}
      </Card>

      {/* Record Movement Modal */}
      <Modal
        isOpen={isNewMovementModalOpen}
        onClose={() => setIsNewMovementModalOpen(false)}
        title="Record Stock Movement"
        subtitle="Log manual receipt, cycle adjustment, or outbound shipment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsNewMovementModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRecordMovement}>
              Submit Transaction
            </Button>
          </>
        }
      >
        <form onSubmit={handleRecordMovement} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-[#172B45] font-medium mb-1">Select Product SKU</label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">Facility Location</label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            >
              <optgroup label="Warehouses">
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.city})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Retail Stores">
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Transaction Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MovementType })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
              >
                <option value="inbound">Inbound (Stock Arrival)</option>
                <option value="outbound">Outbound (Direct Store Sale)</option>
                <option value="adjustment">Cycle Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-[#172B45] font-medium mb-1">Quantity (Units)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none tabular-nums font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">PO / Manifest Reference</label>
            <input
              type="text"
              value={formData.referenceDoc}
              onChange={(e) => setFormData({ ...formData, referenceDoc: e.target.value })}
              className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
