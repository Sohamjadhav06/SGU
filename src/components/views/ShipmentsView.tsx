import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Shipment, ShipmentStatus } from '../../types/stockwise';
import { formatINR } from '../../lib/formatters';
import { Button, Badge, Card, Modal, SearchInput } from '../common/UIComponents';
import {
  Truck,
  Package,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Edit2,
} from 'lucide-react';

export const ShipmentsView: React.FC = () => {
  const { shipments, warehouses, stores, products, updateShipmentStatus } = useStockWise();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [updateStatusData, setUpdateStatusData] = useState({
    status: 'delivered' as ShipmentStatus,
    location: 'Store Receiving Dock',
    notes: 'Stock received and verified by store manager.',
  });

  const filteredShipments = shipments.filter((s) => {
    const origin = warehouses.find((w) => w.id === s.originId)?.name || '';
    const dest = stores.find((st) => st.id === s.destinationId)?.name || '';
    const matchSearch =
      s.shipmentCode.toLowerCase().includes(search.toLowerCase()) ||
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.carrier.toLowerCase().includes(search.toLowerCase()) ||
      origin.toLowerCase().includes(search.toLowerCase()) ||
      dest.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getLocationName = (id: string) => {
    const wh = warehouses.find((w) => w.id === id);
    if (wh) return `${wh.name} (${wh.city})`;
    const st = stores.find((s) => s.id === id);
    if (st) return `${st.name} (${st.city})`;
    return id;
  };

  const handleOpenUpdate = (s: Shipment) => {
    setSelectedShipment(s);
    setUpdateStatusData({
      status: s.status === 'in_transit' ? 'delivered' : 'in_transit',
      location: 'Regional Sorting Facility',
      notes: 'Checkpoint scan verified.',
    });
    setIsUpdateModalOpen(true);
  };

  const handleMarkDeliveredQuick = (s: Shipment) => {
    const destName = stores.find((st) => st.id === s.destinationId)?.name || 'Store';
    updateShipmentStatus(
      s.id,
      'delivered',
      `${destName} Dock`,
      'Delivered and received into store inventory.'
    );
  };

  const handleExecuteStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    updateShipmentStatus(
      selectedShipment.id,
      updateStatusData.status,
      updateStatusData.location,
      updateStatusData.notes
    );
    setIsUpdateModalOpen(false);
  };

  const getStatusLabel = (status: ShipmentStatus) => {
    switch (status) {
      case 'in_transit':
        return 'On the way';
      case 'delivered':
        return 'Delivered';
      case 'pending':
        return 'Waiting for approval';
      case 'delayed':
        return 'Delayed';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
            Shipments
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Track road deliveries, carriers, checkpoint updates, and confirm deliveries across Maharashtra.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3 border border-[#D5E5F7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search tracking #, carrier, origin, or destination..."
            className="w-full sm:max-w-xs"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All Deliveries' },
              { id: 'in_transit', label: 'On the way' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'pending', label: 'Waiting for approval' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-[#627A96] hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Shipments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredShipments.map((s) => {
          const totalUnits = s.items.reduce((acc, item) => acc + item.quantity, 0);

          return (
            <Card key={s.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#172B45] font-mono">{s.shipmentCode}</h3>
                      <Badge
                        variant={
                          s.status === 'delivered'
                            ? 'healthy'
                            : s.status === 'in_transit'
                            ? 'transit'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {getStatusLabel(s.status)}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-[#627A96] font-mono mt-0.5">
                      Carrier: {s.carrier} · #{s.trackingNumber}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-[#172B45] tabular-nums">
                      {formatINR(s.totalCost)}
                    </div>
                    <div className="text-[10px] text-[#627A96]">Freight Cost</div>
                  </div>
                </div>

                {/* Route */}
                <div className="p-3 bg-[#F0F7FF] rounded-lg border border-[#D5E5F7] my-3 text-xs">
                  <div className="flex items-center justify-between text-[#172B45] font-medium">
                    <span className="truncate max-w-[45%]">{getLocationName(s.originId)}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-2" />
                    <span className="truncate max-w-[45%] text-[#172B45] font-semibold">
                      {getLocationName(s.destinationId)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[11px] font-semibold text-[#627A96] uppercase tracking-wide">
                    Consignment Items ({totalUnits} total units)
                  </div>
                  {s.items.map((it, idx) => {
                    const prod = products.find((p) => p.id === it.productId);
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs text-[#172B45]">
                        <span className="truncate">{prod?.name || it.productId}</span>
                        <span className="font-semibold tabular-nums text-[#172B45]">
                          {it.quantity} units
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-[#627A96]">
                  Est. Arrival: <strong>{new Date(s.estimatedArrival).toLocaleDateString()}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenUpdate(s)}
                    icon={<Edit2 className="w-3 h-3 text-[#627A96]" />}
                  >
                    Update
                  </Button>

                  {s.status === 'in_transit' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleMarkDeliveredQuick(s)}
                      icon={<CheckCircle2 className="w-3 h-3" />}
                    >
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Shipment Status"
        subtitle={`Tracking Number: ${selectedShipment?.trackingNumber || ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExecuteStatusUpdate}>
              Save Status
            </Button>
          </>
        }
      >
        <form onSubmit={handleExecuteStatusUpdate} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-[#172B45] font-medium mb-1">Status</label>
            <select
              value={updateStatusData.status}
              onChange={(e) =>
                setUpdateStatusData({
                  ...updateStatusData,
                  status: e.target.value as ShipmentStatus,
                })
              }
              className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            >
              <option value="in_transit">On the way</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Waiting for approval</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">Current Checkpoint / Location</label>
            <input
              type="text"
              value={updateStatusData.location}
              onChange={(e) =>
                setUpdateStatusData({ ...updateStatusData, location: e.target.value })
              }
              className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">Update Notes</label>
            <textarea
              rows={2}
              value={updateStatusData.notes}
              onChange={(e) =>
                setUpdateStatusData({ ...updateStatusData, notes: e.target.value })
              }
              className="w-full p-2.5 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
