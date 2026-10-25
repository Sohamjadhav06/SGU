import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Card, Button } from '../common/UIComponents';
import {
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const DemandAnalysisView: React.FC = () => {
  const { products, stores, demandRecords, setCurrentPage } = useStockWise();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id || '');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const selectedStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  const demandKey = `${selectedStore?.id}_${selectedProduct?.id}`;
  const demandData = demandRecords[demandKey] || {
    avgDaily: 6.5,
    history: [6, 7, 5, 8, 6, 9, 7, 6, 8, 7, 6, 9, 8, 7],
    peak: 9,
  };

  const chartHistory = demandData.history.map((val, idx) => ({
    day: `Day ${idx + 1}`,
    actual: val,
    projected: Math.round(demandData.avgDaily * (1 + (idx - 7) * 0.02)),
  }));

  // Velocity comparison across all stores for this product
  const storeVelocityData = stores.map((str) => {
    const key = `${str.id}_${selectedProduct?.id}`;
    const avg = demandRecords[key]?.avgDaily || 5.0;
    return {
      storeName: str.name.replace(' Electronics', '').replace(' Store', '').replace(' Digital', '').replace(' Smart Retail', '').replace(' Tech Mart', ''),
      avgDaily: avg,
      projectedWeek: Math.round(avg * 7),
    };
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
            Demand Analysis
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            14-day sales records, peak customer demand, and daily sales velocity across Maharashtra stores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage('stockout-alerts')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Check Stockout Alerts
          </Button>
        </div>
      </div>

      {/* Selectors Bar */}
      <Card className="p-3 border border-[#D5E5F7]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#172B45] mb-1.5">
              Select Product SKU
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-[#D5E5F7] rounded-lg text-xs sm:text-sm text-[#172B45] focus:border-blue-600 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B45] mb-1.5">
              Select Retail Location
            </label>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-[#D5E5F7] rounded-lg text-xs sm:text-sm text-[#172B45] focus:border-blue-600 focus:outline-none"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city}) — {s.priorityTier.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#D5E5F7] shadow-2xs">
          <div className="text-xs text-[#627A96]">Average Daily Sales</div>
          <div className="text-2xl font-bold text-[#172B45] tabular-nums mt-1">
            {demandData.avgDaily} <span className="text-xs font-normal text-[#627A96]">units/day</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">14-day rolling window</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#D5E5F7] shadow-2xs">
          <div className="text-xs text-[#627A96]">Observed Peak Demand</div>
          <div className="text-2xl font-bold text-[#172B45] tabular-nums mt-1">
            {demandData.peak} <span className="text-xs font-normal text-[#627A96]">units/day</span>
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">Weekend spike observed</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#D5E5F7] shadow-2xs">
          <div className="text-xs text-[#627A96]">7-Day Forecasted Need</div>
          <div className="text-2xl font-bold text-[#2864E8] tabular-nums mt-1">
            {Math.round(demandData.avgDaily * 7)} <span className="text-xs font-normal text-[#627A96]">units</span>
          </div>
          <div className="text-[11px] text-[#627A96] mt-1">Next replenishment cycle</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#D5E5F7] shadow-2xs">
          <div className="text-xs text-[#627A96]">Store Priority Tier</div>
          <div className="text-2xl font-bold text-[#172B45] capitalize mt-1">
            {selectedStore?.priorityTier}
          </div>
          <div className="text-[11px] text-[#627A96] mt-1">
            {selectedStore?.dailyFootfall.toLocaleString()} visitors/day
          </div>
        </div>
      </div>

      {/* Demand History Line Chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#172B45] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#2864E8]" />
              <span>14-Day Sales Velocity: {selectedProduct?.name} at {selectedStore?.name}</span>
            </h3>
            <p className="text-xs text-[#627A96]">
              Daily customer checkouts vs projected trendline
            </p>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#627A96' }} stroke="#E2E8F0" />
              <YAxis tick={{ fontSize: 11, fill: '#627A96' }} stroke="#E2E8F0" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Sales"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2563EB' }}
              />
              <Line
                type="monotone"
                dataKey="projected"
                name="Forecast"
                stroke="#94A3B8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Comparative Velocity Across Maharashtra Stores */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#172B45]">
              Daily Sales Rate by Store ({selectedProduct?.name})
            </h3>
            <p className="text-xs text-[#627A96]">
              Benchmark daily sales velocity across all 6 Maharashtra retail stores
            </p>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={storeVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="storeName" tick={{ fontSize: 11, fill: '#627A96' }} stroke="#E2E8F0" />
              <YAxis tick={{ fontSize: 11, fill: '#627A96' }} stroke="#E2E8F0" unit="/d" />
              <Tooltip
                formatter={(val: any) => [`${val} units/day`, 'Average Daily Sales']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="avgDaily" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
