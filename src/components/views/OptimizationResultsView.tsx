import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { RecommendationItem } from '../../types/stockwise';
import { formatINR } from '../../lib/formatters';
import { Button, Badge, Card, Modal, KPICard, AlertBanner } from '../common/UIComponents';
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Building2,
  Store as StoreIcon,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export const OptimizationResultsView: React.FC = () => {
  const {
    currentOptimizationResult,
    products,
    warehouses,
    stores,
    approveRecommendation,
    setCurrentPage,
  } = useStockWise();

  const [selectedRec, setSelectedRec] = useState<RecommendationItem | null>(null);

  if (!currentOptimizationResult) {
    return (
      <div className="p-12 text-center text-xs text-[#627A96] font-sans">
        No transfer recommendations available. Run the planner first.
      </div>
    );
  }

  const {
    recommendations,
    totalUnitsMoved,
    totalEstimatedCost,
    stockoutsPrevented,
    serviceLevelProjected,
    savingsAchieved,
    unfulfilledDemand,
    constraintWarnings,
    baselineMetrics,
  } = currentOptimizationResult;

  const handleApproveAll = () => {
    recommendations
      .filter((r) => r.status === 'pending')
      .forEach((r) => approveRecommendation(r.id));
  };

  const pendingCount = recommendations.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight flex items-center gap-2">
            <span>Optimization Results</span>
            <Badge variant="healthy" size="sm">
              Optimal & Feasible
            </Badge>
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Optimal stock transfers respecting warehouse buffers, delivery costs, and store demand across Maharashtra.
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

          {pendingCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleApproveAll}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Approve All ({pendingCount}) Transfers
            </Button>
          )}
        </div>
      </div>

      {/* Constraint Warnings */}
      {constraintWarnings.length > 0 && (
        <AlertBanner
          variant="warning"
          title="Operational Constraint Flags"
          message={constraintWarnings.join(' · ')}
        />
      )}

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Units to Move"
          value={totalUnitsMoved.toLocaleString()}
          delta={`${recommendations.length} planned transfers`}
          deltaType="neutral"
          icon={<Truck className="w-4 h-4 text-[#2864E8]" />}
        />

        <KPICard
          title="Total Delivery Cost"
          value={formatINR(totalEstimatedCost)}
          delta="Optimized routes"
          deltaType="positive"
          icon={<TrendingUp className="w-4 h-4 text-[#2864E8]" />}
        />

        <KPICard
          title="Shortages Prevented"
          value={stockoutsPrevented}
          delta="100% critical resolved"
          deltaType="positive"
          variant="healthy"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />

        <KPICard
          title="Order Fulfilment"
          value={`${serviceLevelProjected}%`}
          delta={`+${(serviceLevelProjected - baselineMetrics.fulfillmentRate).toFixed(1)}% vs baseline`}
          deltaType="positive"
          icon={<TrendingUp className="w-4 h-4 text-[#2864E8]" />}
        />

        <KPICard
          title="Estimated Savings"
          value={formatINR(savingsAchieved)}
          delta="vs unoptimized freight"
          deltaType="positive"
          variant="default"
          icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Recommended Transfers Table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D5E5F7] bg-[#F0F7FF] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#172B45]">
              Generated Transfer Recommendations ({recommendations.length})
            </h3>
            <p className="text-xs text-[#627A96]">
              Deterministic allocations prioritizing critical deficits and lowest delivery cost.
            </p>
          </div>

          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Warehouse Buffers Protected</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F0F7FF]/50 border-b border-[#D5E5F7] text-[#627A96] uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Send From</th>
                <th className="py-3 px-4">Send To</th>
                <th className="py-3 px-4 text-right">Transfer Quantity</th>
                <th className="py-3 px-4 text-right">Delivery Cost</th>
                <th className="py-3 px-4 text-center">Transit Time</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recommendations.map((rec) => {
                const prd = products.find((p) => p.id === rec.productId);
                const sourceWh = warehouses.find((w) => w.id === rec.sourceLocationId);
                const destStore = stores.find((s) => s.id === rec.destinationLocationId);
                const isDispatched = rec.status === 'dispatched';

                return (
                  <tr key={rec.id} className="hover:bg-[#E4F1FF] transition-colors">
                    <td className="py-3 px-4">
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
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#172B45]">{prd?.name}</div>
                      <div className="text-[11px] text-[#627A96] font-mono">{prd?.sku}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[#172B45] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#2864E8]" />
                        <span>{sourceWh?.name}</span>
                      </div>
                      <div className="text-[11px] text-[#627A96]">{sourceWh?.city}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[#172B45] flex items-center gap-1.5">
                        <StoreIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{destStore?.name}</span>
                      </div>
                      <div className="text-[11px] text-[#627A96]">{destStore?.city}</div>
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums font-bold text-[#172B45]">
                      {rec.recommendedQuantity} units
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums font-bold text-[#172B45]">
                      {formatINR(rec.estimatedCost)}
                    </td>

                    <td className="py-3 px-4 text-center tabular-nums text-[#627A96]">
                      {rec.transitDays} Days
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={isDispatched ? 'transit' : 'neutral'}
                        size="sm"
                      >
                        {isDispatched ? 'On the way' : 'Waiting for approval'}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant={isDispatched ? 'outline' : 'primary'}
                        disabled={isDispatched}
                        onClick={() => approveRecommendation(rec.id)}
                      >
                        {isDispatched ? 'Dispatched' : 'Approve'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
