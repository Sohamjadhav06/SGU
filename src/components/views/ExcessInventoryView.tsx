import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { formatINR } from '../../lib/formatters';
import { Button, Badge, Card, SearchInput } from '../common/UIComponents';
import {
  PackageOpen,
  ArrowRight,
  Building2,
  Store as StoreIcon,
  Sparkles,
  Layers,
} from 'lucide-react';

export const ExcessInventoryView: React.FC = () => {
  const { excessInventoryItems, companySettings, setCurrentPage, runOptimization, isOptimizing } =
    useStockWise();

  const [search, setSearch] = useState('');
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>('all');

  const totalHoldingCost = excessInventoryItems.reduce(
    (sum, item) => sum + item.holdingCostImpactAnnual,
    0
  );

  const totalExcessUnits = excessInventoryItems.reduce(
    (sum, item) => sum + item.excessUnits,
    0
  );

  const filteredItems = excessInventoryItems.filter((item) => {
    const matchSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.locationName.toLowerCase().includes(search.toLowerCase());

    const matchType = selectedFacilityType === 'all' || item.locationType === selectedFacilityType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
            Excess Inventory
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Identify surplus stock and rebalance units to deficit retail stores across Maharashtra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentPage('redistribution-recommendations')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Transfer Suggestions
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#D5E5F7] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#627A96] uppercase tracking-wider">Total Extra Stock</div>
          <div className="text-xl sm:text-2xl font-bold text-[#172B45] tabular-nums mt-0.5">
            {totalExcessUnits.toLocaleString()} <span className="text-xs font-normal text-[#627A96]">units</span>
          </div>
          <div className="text-[11px] text-[#D99A13] mt-0.5 font-medium">
            Across {excessInventoryItems.length} locations
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#D5E5F7] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#627A96] uppercase tracking-wider">Annual Holding Cost Impact</div>
          <div className="text-xl sm:text-2xl font-bold text-[#E5484D] tabular-nums mt-0.5">
            {formatINR(totalHoldingCost)}
          </div>
          <div className="text-[11px] text-[#627A96] mt-0.5">
            Based on {(companySettings.holdingCostRateAnnual * 100).toFixed(0)}% annual carrying rate
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#D5E5F7] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#627A96] uppercase tracking-wider">Target Holding Threshold</div>
          <div className="text-xl sm:text-2xl font-bold text-[#2864E8] tabular-nums mt-0.5">
            {companySettings.defaultTargetDaysSupply} <span className="text-xs font-normal text-[#627A96]">days supply</span>
          </div>
          <div className="text-[11px] text-[#159B68] mt-0.5 font-medium">
            Redistribute surpluses to avoid idle capital
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3 border border-[#D5E5F7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search surplus products or facilities..."
            className="w-full sm:max-w-xs"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'warehouse', 'store'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFacilityType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap cursor-pointer ${
                  selectedFacilityType === type
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-[#627A96] hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? 'All Facilities' : `${type}s`}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Excess Inventory List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#172B45]">{item.productName}</h3>
                  <span className="font-mono text-xs text-[#627A96]">({item.sku})</span>
                  {item.isPerishable && (
                    <Badge variant="low" size="sm">
                      Exp: {item.expiryDate}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-[#627A96] flex items-center gap-2 mt-1">
                  <span>Location:</span>
                  <span className="font-semibold text-[#172B45] flex items-center gap-1">
                    {item.locationType === 'warehouse' ? (
                      <Building2 className="w-3.5 h-3.5 text-[#2864E8]" />
                    ) : (
                      <StoreIcon className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    {item.locationName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="text-xs text-[#627A96]">Surplus Quantity</div>
                  <div className="text-lg font-bold text-amber-700 tabular-nums">
                    +{item.excessUnits} units
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#627A96]">Current / Target</div>
                  <div className="text-xs font-semibold text-[#172B45] tabular-nums">
                    {item.currentStock} / {item.targetStockLevel}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#627A96]">Annual Carrying Cost</div>
                  <div className="text-sm font-bold text-rose-700 tabular-nums">
                    {formatINR(item.holdingCostImpactAnnual)}
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Destinations */}
            <div className="pt-3">
              <div className="text-[11px] font-semibold text-[#627A96] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#2864E8]" />
                <span>Eligible Candidate Receiving Stores in Maharashtra</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {item.eligibleDestinations.map((dest) => (
                  <div
                    key={dest.destinationId}
                    className="p-2.5 rounded-lg border border-[#D5E5F7] bg-[#F0F7FF]/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#172B45]">{dest.destinationName}</div>
                      <div className="text-[10px] text-[#627A96]">
                        Need: <strong>{dest.replenishmentNeed} units</strong> · Est. Freight: {formatINR(dest.estimatedRouteCost)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage('distribution-planner')}
                    >
                      Plan
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-xs text-[#627A96] border border-dashed border-[#D5E5F7] rounded-xl bg-white">
            No surplus inventory found under the selected filters. All facilities are operating within target inventory supply ranges.
          </div>
        )}
      </div>
    </div>
  );
};
