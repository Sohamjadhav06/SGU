import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { RecommendationItem } from '../../types/stockwise';
import { formatINR } from '../../lib/formatters';
import { Button, Badge, Card, Modal, SearchInput } from '../common/UIComponents';
import {
  Layers,
  ArrowRight,
  Sparkles,
  Building2,
  Store as StoreIcon,
  Bot,
  Info,
} from 'lucide-react';

export const RedistributionRecommendationsView: React.FC = () => {
  const {
    currentOptimizationResult,
    products,
    warehouses,
    stores,
    approveRecommendation,
    setCurrentPage,
  } = useStockWise();

  const [search, setSearch] = useState('');
  const [selectedRec, setSelectedRec] = useState<RecommendationItem | null>(null);

  const recommendations = currentOptimizationResult?.recommendations || [];

  const filteredRecs = recommendations.filter((r) => {
    const prd = products.find((p) => p.id === r.productId);
    const source = warehouses.find((w) => w.id === r.sourceLocationId);
    const dest = stores.find((s) => s.id === r.destinationLocationId);

    const matchSearch =
      (prd && prd.name.toLowerCase().includes(search.toLowerCase())) ||
      (prd && prd.sku.toLowerCase().includes(search.toLowerCase())) ||
      (source && source.name.toLowerCase().includes(search.toLowerCase())) ||
      (dest && dest.name.toLowerCase().includes(search.toLowerCase()));

    return matchSearch;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight flex items-center gap-2">
            <span>Redistribution Recommendations</span>
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#EAF4FF] text-[#2864E8] font-bold tabular-nums">
              {recommendations.length} Active
            </span>
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Cost-effective transfers evaluated against route costs, transit times, and store shortages across Maharashtra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage('plan-comparison')}
          >
            Compare Plans
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentPage('distribution-planner')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Plan Transfers
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3 border border-[#D5E5F7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search product, warehouse, or store..."
            className="w-full sm:max-w-xs"
          />

          <div className="flex items-center gap-3 text-xs text-[#627A96]">
            <span>
              Total Units to Move:{' '}
              <strong className="text-[#172B45] tabular-nums">
                {currentOptimizationResult?.totalUnitsMoved}
              </strong>
            </span>
            <span>·</span>
            <span>
              Total Delivery Cost:{' '}
              <strong className="text-[#172B45] tabular-nums">
                {formatINR(currentOptimizationResult?.totalEstimatedCost || 0)}
              </strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Recommendations Cards Grid */}
      <div className="space-y-3">
        {filteredRecs.map((rec) => {
          const prd = products.find((p) => p.id === rec.productId);
          const sourceWh = warehouses.find((w) => w.id === rec.sourceLocationId);
          const destStr = stores.find((s) => s.id === rec.destinationLocationId);
          const isDispatched = rec.status === 'dispatched';

          return (
            <Card
              key={rec.id}
              className={`p-5 transition-all ${
                isDispatched ? 'bg-[#F0F7FF] opacity-80' : 'bg-white hover:border-[#D5E5F7]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Origin -> Destination -> Product */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      variant={
                        rec.priority === 'critical'
                          ? 'stockout'
                          : rec.priority === 'high'
                          ? 'low'
                          : 'primary'
                      }
                      size="sm"
                    >
                      {rec.priority.toUpperCase()} PRIORITY
                    </Badge>

                    <span className="text-xs font-semibold text-[#172B45]">{prd?.name}</span>
                    <span className="text-[11px] font-mono text-[#627A96]">({prd?.sku})</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#172B45] font-medium mt-2">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#2864E8]" />
                      <span>{sourceWh?.name}</span>
                      <span className="text-[11px] text-[#627A96]">({sourceWh?.city})</span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

                    <div className="flex items-center gap-1.5">
                      <StoreIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{destStr?.name}</span>
                      <span className="text-[11px] text-[#627A96]">({destStr?.city})</span>
                    </div>
                  </div>

                  {rec.aiExplanation && (
                    <p className="text-xs text-[#627A96] mt-2 italic bg-[#F0F7FF] p-2 rounded-lg border border-[#D5E5F7]">
                      "{rec.aiExplanation.summary}"
                    </p>
                  )}
                </div>

                {/* Right: Quantity, Cost, Action */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-[#627A96]">Transfer Qty</div>
                    <div className="text-base font-bold text-[#172B45] tabular-nums">
                      {rec.recommendedQuantity} units
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[#627A96]">Estimated Cost</div>
                    <div className="text-base font-bold text-[#172B45] tabular-nums">
                      {formatINR(rec.estimatedCost)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRec(rec)}
                      icon={<Info className="w-3.5 h-3.5" />}
                    >
                      Details
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      disabled={isDispatched}
                      onClick={() => approveRecommendation(rec.id)}
                    >
                      {isDispatched ? 'Dispatched' : 'Approve Transfer'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredRecs.length === 0 && (
          <div className="p-8 text-center text-xs text-[#627A96] border border-dashed border-[#D5E5F7] rounded-xl bg-white">
            No stock transfer recommendations match the search criteria.
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={Boolean(selectedRec)}
        onClose={() => setSelectedRec(null)}
        title="Transfer Suggestion Analysis"
        subtitle="Operational economics and road delivery details"
        footer={
          <Button variant="primary" onClick={() => setSelectedRec(null)}>
            Close
          </Button>
        }
      >
        {selectedRec && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-[#EAF4FF] border border-blue-200 rounded-lg text-blue-900">
              {selectedRec.aiExplanation?.mainReason ||
                'Transfer scheduled to prevent impending stockout at retail shop.'}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-[#D5E5F7] rounded-lg">
                <span className="text-[10px] text-[#627A96] uppercase font-semibold">Recommended Qty</span>
                <div className="text-base font-semibold text-[#172B45] tabular-nums mt-0.5">
                  {selectedRec.recommendedQuantity} units
                </div>
              </div>

              <div className="p-3 border border-[#D5E5F7] rounded-lg">
                <span className="text-[10px] text-[#627A96] uppercase font-semibold">Delivery Cost</span>
                <div className="text-base font-semibold text-[#172B45] tabular-nums mt-0.5">
                  {formatINR(selectedRec.estimatedCost)}
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-[#172B45] mb-1">Key Assumptions & Corridor Notes</h5>
              <ul className="list-disc pl-5 text-[#627A96] space-y-1">
                {selectedRec.aiExplanation?.keyAssumptions?.map((k, i) => (
                  <li key={i}>{k}</li>
                )) || <li>Dispatch via Maharashtra highway freight corridor.</li>}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
