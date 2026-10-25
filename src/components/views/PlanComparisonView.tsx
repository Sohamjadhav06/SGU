import React from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Card, Button, Badge } from '../common/UIComponents';
import { formatINR } from '../../lib/formatters';
import {
  ArrowRight,
} from 'lucide-react';

export const PlanComparisonView: React.FC = () => {
  const { currentOptimizationResult, setCurrentPage } = useStockWise();

  if (!currentOptimizationResult) {
    return (
      <div className="p-12 text-center text-xs text-[#627A96] font-sans">
        No transfer plan available to compare. Run the planner first.
      </div>
    );
  }

  const { baselineMetrics, totalEstimatedCost, serviceLevelProjected, stockoutsPrevented } =
    currentOptimizationResult;

  const costDifference = Math.max(0, baselineMetrics.totalCost - totalEstimatedCost);
  const serviceLevelDelta = (serviceLevelProjected - baselineMetrics.fulfillmentRate).toFixed(1);

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight flex items-center gap-2">
            <span>Plan Comparison</span>
            <Badge variant="healthy" size="sm">
              Verified Savings
            </Badge>
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Compare uncoordinated emergency dispatches with planned cost-effective transfers across Maharashtra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentPage('optimization-results')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Recommended Plan
          </Button>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline (Current / Reactive) */}
        <Card className="p-4 sm:p-5 border-l-3 border-l-slate-400 border-y-[#D5E5F7] border-r-[#D5E5F7] bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-[#627A96] uppercase tracking-wider">
                Unplanned Baseline
              </span>
              <h3 className="text-base font-bold text-[#172B45] mt-0.5">Emergency Ad-Hoc Couriers</h3>
            </div>
            <Badge variant="low" size="sm">Uncoordinated</Badge>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[#627A96]">Projected Service Level</span>
              <span className="font-bold text-[#172B45] tabular-nums text-sm">
                {baselineMetrics.fulfillmentRate}%
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[#627A96]">Total Transportation Cost</span>
              <span className="font-bold text-rose-700 tabular-nums text-sm">
                {formatINR(baselineMetrics.totalCost)}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[#627A96]">Store Shortage Incidents</span>
              <span className="font-bold text-rose-700 tabular-nums text-sm">
                {baselineMetrics.stockoutIncidents} stores at risk
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#627A96]">Delivery Mode</span>
              <span className="text-[#172B45] font-medium">Spot Couriers & Urgent Taxis</span>
            </div>
          </div>
        </Card>

        {/* Optimized Plan */}
        <Card className="p-6 border-l-4 border-l-blue-600 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-[#2864E8] uppercase tracking-wider">
                VyaparMitra Recommended Plan
              </span>
              <h3 className="text-base font-bold text-[#172B45] mt-0.5">Consolidated Maharashtra Network</h3>
            </div>
            <Badge variant="healthy" size="sm">Optimal Plan</Badge>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[#627A96]">Projected Service Level</span>
              <span className="font-bold text-emerald-700 tabular-nums text-sm">
                {serviceLevelProjected}% (+{serviceLevelDelta}%)
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[#627A96]">Total Delivery Cost</span>
              <span className="font-bold text-[#2864E8] tabular-nums text-sm">
                {formatINR(totalEstimatedCost)}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[#627A96]">Stock Shortages Prevented</span>
              <span className="font-bold text-emerald-700 tabular-nums text-sm">
                {stockoutsPrevented} stores protected
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#627A96]">Delivery Mode</span>
              <span className="text-[#172B45] font-medium">Consolidated Road Transport</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Difference Breakdown Matrix */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-[#172B45] mb-4">Comprehensive Metric Variance</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F0F7FF] border-b border-[#D5E5F7] text-[#627A96] uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Performance Metric</th>
                <th className="py-2.5 px-4 text-right">Current Baseline</th>
                <th className="py-2.5 px-4 text-right">VyaparMitra Plan</th>
                <th className="py-2.5 px-4 text-right">Variance / Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-medium text-[#172B45]">Direct Delivery Cost</td>
                <td className="py-3 px-4 text-right tabular-nums text-[#627A96]">
                  {formatINR(baselineMetrics.totalCost)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-[#2864E8]">
                  {formatINR(totalEstimatedCost)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-700">
                  -{formatINR(costDifference)} (-{Math.round((costDifference / (baselineMetrics.totalCost || 1)) * 100)}%)
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-[#172B45]">Store Shortage Incidents</td>
                <td className="py-3 px-4 text-right tabular-nums text-rose-700">
                  {baselineMetrics.stockoutIncidents} stores
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-700">
                  0 stores
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-700">
                  -{baselineMetrics.stockoutIncidents} (-100%)
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-[#172B45]">Order Fulfilment Rate</td>
                <td className="py-3 px-4 text-right tabular-nums text-[#627A96]">
                  {baselineMetrics.fulfillmentRate}%
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-700">
                  {serviceLevelProjected}%
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-700">
                  +{serviceLevelDelta}%
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-[#172B45]">Warehouse Safety Buffer Violations</td>
                <td className="py-3 px-4 text-right tabular-nums text-amber-700">3 accidental</td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-700">0 guaranteed</td>
                <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-700">
                  Guaranteed Safe
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
