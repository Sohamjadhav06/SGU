import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { KPICard, Button, Badge, Card, AlertBanner } from '../common/UIComponents';
import { formatINR } from '../../lib/formatters';
import {
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ArrowLeftRight,
  Boxes,
  Truck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    products,
    warehouses,
    stores,
    stockoutAlerts,
    excessInventoryItems,
    currentOptimizationResult,
    movements,
    criticalStockoutsCount,
    setCurrentPage,
    runOptimization,
    isOptimizing,
    approveRecommendation,
  } = useStockWise();

  const [dismissBanner, setDismissBanner] = useState(false);

  // Facility stock aggregation for chart
  const locationStockData = [
    { name: 'Pune Wh.', stock: 710, capacity: 1000 },
    { name: 'Mumbai DC', stock: 520, capacity: 800 },
    { name: 'Nagpur Hub', stock: 430, capacity: 600 },
    { name: 'Kothrud', stock: 85, capacity: 150 },
    { name: 'Andheri', stock: 72, capacity: 150 },
    { name: 'Nashik', stock: 120, capacity: 200 },
    { name: 'Thane', stock: 110, capacity: 200 },
    { name: 'Shivaji N.', stock: 95, capacity: 200 },
  ];

  return (
    <div className="space-y-4 font-sans max-w-7xl mx-auto">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
            Business Dashboard
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Real-time stock tracking, shortage prevention, and transfer planning across Maharashtra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage('shipments')}
            icon={<Truck className="w-3.5 h-3.5 text-[#2864E8]" />}
          >
            Track Shipments
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => runOptimization()}
            disabled={isOptimizing}
            icon={<Sparkles className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />}
          >
            {isOptimizing ? 'Calculating Transfers...' : 'Plan Stock Transfers'}
          </Button>
        </div>
      </div>

      {/* Critical Alert Banner if stockouts exist */}
      {!dismissBanner && criticalStockoutsCount > 0 && (
        <AlertBanner
          variant="critical"
          title={`Low Stock Notice: ${criticalStockoutsCount} retail stores have items under 2 days of supply`}
          message="Portronics USB-C Charger (Kothrud Digital Store) and boAt Airdopes Earbuds (Andheri Electronics) are at immediate risk of selling out."
          action={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="danger"
                onClick={() => setCurrentPage('stockout-alerts')}
                icon={<ArrowRight className="w-3 h-3" />}
              >
                View Low Stock Alerts
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCurrentPage('distribution-planner')}
              >
                Plan Transfers
              </Button>
            </div>
          }
          onDismiss={() => setDismissBanner(true)}
        />
      )}

      {/* Four Core Summary Cards (Compact 4-Card Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Products"
          value={`${products.length} Products`}
          subtext="Active in 9 Maharashtra locations"
          variant="default"
          icon={<Boxes className="w-4 h-4 text-[#2864E8]" />}
        />

        <KPICard
          title="Low Stock Items"
          value={`${criticalStockoutsCount} Urgent`}
          delta={criticalStockoutsCount > 0 ? `${criticalStockoutsCount} needing restocking` : 'All shops healthy'}
          deltaType={criticalStockoutsCount > 0 ? 'negative' : 'positive'}
          subtext={`${stockoutAlerts.length} total monitored`}
          variant={criticalStockoutsCount > 0 ? 'critical' : 'healthy'}
          icon={<AlertTriangle className="w-4 h-4 text-[#E5484D]" />}
        />

        <KPICard
          title="Extra Stock Items"
          value={`${excessInventoryItems.length} Surpluses`}
          delta="+165 Chargers in Pune"
          deltaType="positive"
          subtext="Available for transfer"
          variant="healthy"
          icon={<CheckCircle2 className="w-4 h-4 text-[#159B68]" />}
        />

        <KPICard
          title="Estimated Delivery Savings"
          value={formatINR(currentOptimizationResult?.savingsAchieved || 42850)}
          delta="+₹18,400 saved"
          deltaType="positive"
          subtext="vs road spot dispatches"
          variant="default"
          icon={<Truck className="w-4 h-4 text-[#2864E8]" />}
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT COLUMN: Operational Attention & Movements */}
        <div className="space-y-4">
          {/* 1. Products Needing Restocking */}
          <Card className="p-4 border border-[#D5E5F7]">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#172B45] flex items-center gap-1.5">
                  <span>Products Needing Restocking</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-[#E5484D] font-bold tabular-nums">
                    {stockoutAlerts.length} alerts
                  </span>
                </h3>
                <p className="text-[11px] text-[#627A96] mt-0.5">
                  Stores with the lowest days of stock remaining based on daily sales
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage('stockout-alerts')}
              >
                View All
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#D5E5F7]/80">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F0F7FF] border-b border-[#D5E5F7] text-[#627A96] font-semibold uppercase text-[10px]">
                    <th className="py-2 px-2.5">Product</th>
                    <th className="py-2 px-2.5">Store / Shop</th>
                    <th className="py-2 px-2.5 text-right">Available Stock</th>
                    <th className="py-2 px-2.5 text-right">Daily Sales</th>
                    <th className="py-2 px-2.5 text-right">Days Left</th>
                    <th className="py-2 px-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5E5F7]/50 bg-white">
                  {stockoutAlerts.slice(0, 4).map((alert) => (
                    <tr key={alert.id} className="hover:bg-[#E4F1FF] transition-colors">
                      <td className="py-2 px-2.5 font-medium text-[#172B45]">
                        {alert.product.name}
                      </td>
                      <td className="py-2 px-2.5 text-[#627A96]">{alert.store.name}</td>
                      <td className="py-2 px-2.5 text-right font-medium tabular-nums text-[#172B45]">
                        {alert.availableStock} units
                      </td>
                      <td className="py-2 px-2.5 text-right tabular-nums text-[#627A96]">
                        {alert.avgDailyDemand.toFixed(1)}/day
                      </td>
                      <td className="py-2 px-2.5 text-right">
                        <span
                          className={`font-semibold tabular-nums px-1.5 py-0.5 rounded text-[10px] ${
                            alert.daysRemaining !== null && alert.daysRemaining <= 2
                              ? 'bg-rose-100 text-[#E5484D]'
                              : 'bg-amber-100 text-[#D99A13]'
                          }`}
                        >
                          {alert.daysRemaining !== null
                            ? `${alert.daysRemaining.toFixed(1)}d`
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-right">
                        <button
                          onClick={() => setCurrentPage('redistribution-recommendations')}
                          className="text-[11px] font-medium text-[#2864E8] hover:text-[#1D4ED8] hover:underline cursor-pointer"
                        >
                          Transfer →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 2. Recent Stock Movements */}
          <Card className="p-4 border border-[#D5E5F7]">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#172B45]">Recent Stock Transfers</h3>
                <p className="text-[11px] text-[#627A96] mt-0.5">
                  Latest inventory transfers, receipts, and deliveries across Maharashtra
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage('stock-movements')}
              >
                Full History
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#D5E5F7]/80">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F0F7FF] border-b border-[#D5E5F7] text-[#627A96] font-semibold uppercase text-[10px]">
                    <th className="py-2 px-2.5">Movement</th>
                    <th className="py-2 px-2.5">Product</th>
                    <th className="py-2 px-2.5">Route</th>
                    <th className="py-2 px-2.5 text-right">Quantity</th>
                    <th className="py-2 px-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5E5F7]/50 bg-white">
                  {movements.slice(0, 4).map((mov) => {
                    const prod = products.find((p) => p.id === mov.productId);
                    const sourceWh = warehouses.find((w) => w.id === mov.sourceLocationId);
                    const destStore = stores.find((s) => s.id === mov.destinationLocationId);

                    return (
                      <tr key={mov.id} className="hover:bg-[#E4F1FF] transition-colors">
                        <td className="py-2 px-2.5 font-mono text-[10px] text-[#627A96]">
                          {mov.movementNumber}
                        </td>
                        <td className="py-2 px-2.5 font-medium text-[#172B45]">
                          {prod?.name || 'Item'}
                        </td>
                        <td className="py-2 px-2.5 text-[#627A96] truncate max-w-[130px]">
                          {sourceWh ? sourceWh.city : 'Inbound'} → {destStore ? destStore.city : 'Store'}
                        </td>
                        <td className="py-2 px-2.5 text-right font-medium tabular-nums text-[#172B45]">
                          {mov.quantity} units
                        </td>
                        <td className="py-2 px-2.5 text-right">
                          <Badge
                            size="sm"
                            variant={
                              mov.status === 'completed'
                                ? 'healthy'
                                : mov.status === 'in_transit'
                                ? 'transit'
                                : 'neutral'
                            }
                          >
                            {mov.status === 'completed'
                              ? 'Delivered'
                              : mov.status === 'in_transit'
                              ? 'On the way'
                              : 'Pending'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Distribution Chart & Transfer Recommendations */}
        <div className="space-y-4">
          {/* 3. Stock Distribution Chart with Blue Gradient Bars */}
          <Card className="p-4 border border-[#D5E5F7]">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#172B45]">
                  Stock by Facility (Maharashtra)
                </h3>
                <p className="text-[11px] text-[#627A96] mt-0.5">
                  Available units on hand across central hubs and retail stores
                </p>
              </div>
              <Badge variant="primary" size="sm">
                Live Data
              </Badge>
            </div>

            <div className="h-44 sm:h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationStockData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barBlueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3987E8" />
                      <stop offset="100%" stopColor="#2864E8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAF4FF" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#627A96' }} stroke="#D5E5F7" />
                  <YAxis tick={{ fontSize: 10, fill: '#627A96' }} stroke="#D5E5F7" />
                  <Tooltip
                    formatter={(val: any) => [`${val} units`, 'Available Stock']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #D5E5F7',
                      borderRadius: '8px',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
                    }}
                  />
                  <Bar dataKey="stock" fill="url(#barBlueGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-[#D5E5F7]/80 text-[11px] text-[#627A96]">
              <span>Pune, Mumbai & Nagpur central storage</span>
              <span className="font-semibold text-[#172B45]">3 Warehouses · 6 Retail Shops</span>
            </div>
          </Card>

          {/* 4. Simple List of Recent Stock Transfer Recommendations */}
          <Card className="p-4 border border-[#D5E5F7]">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#172B45]">
                  Stock Transfer Recommendations
                </h3>
                <p className="text-[11px] text-[#627A96] mt-0.5">
                  Cost-optimized redistribution suggestions from surplus warehouses
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage('redistribution-recommendations')}
              >
                View All
              </Button>
            </div>

            <div className="space-y-2">
              {currentOptimizationResult?.recommendations?.slice(0, 3).map((rec) => {
                const prod = products.find((p) => p.id === rec.productId);
                const source = warehouses.find((w) => w.id === rec.sourceLocationId);
                const dest = stores.find((s) => s.id === rec.destinationLocationId);

                return (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-lg border border-[#D5E5F7] bg-[#F0F7FF] hover:bg-[#E4F1FF]/70 transition-colors flex items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="font-semibold text-[#172B45] truncate text-[11px] sm:text-xs">
                        {prod?.name || 'Product'}
                      </div>
                      <div className="text-[#627A96] flex items-center gap-1 text-[10px] truncate">
                        <span>{source?.name || 'Warehouse'}</span>
                        <ArrowLeftRight className="w-2.5 h-2.5 text-[#627A96]/60 shrink-0" />
                        <span className="font-medium text-[#172B45]">{dest?.name || 'Store'}</span>
                      </div>
                      <div className="text-[10px] text-[#627A96]">
                        Transfer: <strong className="text-[#172B45]">{rec.recommendedQuantity} units</strong> · Cost:{' '}
                        <strong className="text-[#172B45]">{formatINR(rec.estimatedCost)}</strong>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <Badge
                        size="sm"
                        variant={rec.priority === 'critical' ? 'stockout' : 'primary'}
                      >
                        {rec.priority === 'critical' ? 'Urgent' : 'Suggested'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => approveRecommendation(rec.id)}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-[#D5E5F7]/80 flex items-center justify-between text-xs">
              <span className="text-[#627A96] text-[11px]">Need full multi-echelon schedules?</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCurrentPage('distribution-planner')}
              >
                Open Distribution Planner →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
