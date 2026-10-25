import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Button, Badge, Card, SearchInput, AlertBanner } from '../common/UIComponents';
import {
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const StockoutAlertsView: React.FC = () => {
  const { stockoutAlerts, criticalStockoutsCount, setCurrentPage, runOptimization, isOptimizing } =
    useStockWise();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredAlerts = stockoutAlerts.filter((alert) => {
    const matchSearch =
      alert.product.name.toLowerCase().includes(search.toLowerCase()) ||
      alert.product.sku.toLowerCase().includes(search.toLowerCase()) ||
      alert.store.name.toLowerCase().includes(search.toLowerCase());

    const matchSeverity = severityFilter === 'all' || alert.riskLevel === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight flex items-center gap-2">
            <span>Stockout Alerts</span>
            {criticalStockoutsCount > 0 && (
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-100 text-[#E5484D] font-bold tabular-nums">
                {criticalStockoutsCount} Critical
              </span>
            )}
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Shortage formula: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">Days Remaining = Available Stock / Average Daily Sales</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentPage('distribution-planner')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Plan Transfers
          </Button>
        </div>
      </div>

      {/* Critical Summary Banner */}
      {criticalStockoutsCount > 0 && (
        <AlertBanner
          variant="critical"
          title={`${criticalStockoutsCount} Retail Stores at Imminent Shortage Risk`}
          message="These stores will run out of stock within 48 hours based on daily sales. The planner has calculated transfer suggestions from the nearest Maharashtra warehouses."
          action={
            <Button
              size="sm"
              variant="danger"
              onClick={() => runOptimization({ objective: 'prevent_stockout' })}
              disabled={isOptimizing}
              icon={<Sparkles className="w-3 h-3" />}
            >
              Plan Transfers to Solve Shortages
            </Button>
          }
        />
      )}

      {/* Severity Filter Tabs */}
      <Card className="p-3 border border-[#D5E5F7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search product, SKU, or store..."
            className="w-full sm:max-w-xs"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'critical', 'high', 'moderate'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-[#627A96] hover:bg-slate-200'
                }`}
              >
                {sev === 'all'
                  ? `All Alerts (${stockoutAlerts.length})`
                  : `${sev} (${stockoutAlerts.filter((a) => a.riskLevel === sev).length})`}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Alerts Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F0F7FF] border-b border-[#D5E5F7] text-[#627A96] uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Store / Shop</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-right">Available Stock</th>
                <th className="py-3 px-4 text-right">Safety Buffer</th>
                <th className="py-3 px-4 text-right">Daily Sales</th>
                <th className="py-3 px-4 text-right">Days Left</th>
                <th className="py-3 px-4 text-right">Suggested Need</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-[#E4F1FF] transition-colors">
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        alert.riskLevel === 'critical'
                          ? 'stockout'
                          : alert.riskLevel === 'high'
                          ? 'low'
                          : 'transit'
                      }
                      size="sm"
                    >
                      {alert.riskLevel.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#172B45]">{alert.store.name}</div>
                    <div className="text-[11px] text-[#627A96]">
                      {alert.store.city} · {alert.store.priorityTier.toUpperCase()}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#172B45]">{alert.product.name}</div>
                    <div className="text-[11px] text-[#627A96] font-mono">{alert.product.sku}</div>
                  </td>

                  <td className="py-3 px-4 text-right tabular-nums font-bold text-rose-600">
                    {alert.availableStock}
                  </td>

                  <td className="py-3 px-4 text-right tabular-nums text-[#627A96]">
                    {alert.safetyStock}
                  </td>

                  <td className="py-3 px-4 text-right tabular-nums text-[#627A96]">
                    {alert.avgDailyDemand}/day
                  </td>

                  <td className="py-3 px-4 text-right tabular-nums font-bold">
                    <span
                      className={
                        alert.daysRemaining !== null && alert.daysRemaining <= 1.0
                          ? 'text-rose-600'
                          : alert.daysRemaining !== null && alert.daysRemaining <= 2.5
                          ? 'text-amber-600'
                          : 'text-[#172B45]'
                      }
                    >
                      {alert.daysRemaining !== null ? `${alert.daysRemaining} days` : 'N/A'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right tabular-nums font-bold text-[#2864E8]">
                    +{alert.suggestedReplenishment} units
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setCurrentPage('distribution-planner')}
                    >
                      Plan Transfer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAlerts.length === 0 && (
          <div className="p-8 text-center text-xs text-[#627A96]">
            No stockout alerts match your filter. All monitored facilities maintain adequate stock levels.
          </div>
        )}
      </Card>
    </div>
  );
};
