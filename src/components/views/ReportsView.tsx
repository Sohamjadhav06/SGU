import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Card, Button, Badge, Tabs } from '../common/UIComponents';
import { formatINR } from '../../lib/formatters';
import {
  Download,
  Printer,
  Calendar,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    products,
    warehouses,
    stores,
    stockoutAlerts,
    currentOptimizationResult,
    totalInventoryValue,
    excessInventoryItems,
  } = useStockWise();

  const [activeTab, setActiveTab] = useState<string>('health');

  const reportTabs = [
    { id: 'health', label: 'Inventory Health Report' },
    { id: 'cost', label: 'Distribution Cost & Carrier Report' },
    { id: 'risk', label: 'Stock Shortage Risk Assessment' },
    { id: 'warehouse', label: 'Warehouse Capacity Report' },
  ];

  // Export to CSV functionality
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'health') {
      csvContent += 'SKU,Product Name,Category,Unit Cost (INR),Selling Price (INR),Min Safety Stock\n';
      products.forEach((p) => {
        csvContent += `"${p.sku}","${p.name}","${p.category}",${p.unitCost},${p.sellingPrice},${p.minSafetyStock}\n`;
      });
    } else if (activeTab === 'cost') {
      csvContent += 'Transfer ID,Product ID,Source Warehouse,Destination Store,Quantity,Delivery Cost (INR),Transit Days\n';
      currentOptimizationResult?.recommendations.forEach((r) => {
        csvContent += `"${r.id}","${r.productId}","${r.sourceLocationId}","${r.destinationLocationId}",${r.recommendedQuantity},${r.estimatedCost},${r.transitDays}\n`;
      });
    } else if (activeTab === 'risk') {
      csvContent += 'Store,Product Name,Stock Remaining,Min Safety,Avg Daily Sales,Days Remaining,Risk Level\n';
      stockoutAlerts.forEach((a) => {
        csvContent += `"${a.store.name}","${a.product.name}",${a.availableStock},${a.safetyStock},${a.avgDailyDemand},${a.daysRemaining ?? 'N/A'},"${a.riskLevel}"\n`;
      });
    } else {
      csvContent += 'Warehouse Code,Warehouse Name,City,State,Total Capacity,Used Capacity,Daily Operating Cost (INR)\n';
      warehouses.forEach((w) => {
        csvContent += `"${w.code}","${w.name}","${w.city}","${w.state}",${w.totalCapacityUnits},${w.usedCapacityUnits},${w.operatingCostPerDay}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vyaparmitra_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
            Reports & Summary
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Operational summaries and distribution audit reports across Maharashtra facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5 text-[#627A96]" />}
          >
            Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={reportTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Health Report */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-[#D5E5F7]">
              <span className="text-xs text-[#627A96]">Total Network Stock Value</span>
              <div className="text-2xl font-bold text-[#172B45] tabular-nums mt-1">
                {formatINR(totalInventoryValue)}
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#D5E5F7]">
              <span className="text-xs text-[#627A96]">Monitored SKUs</span>
              <div className="text-2xl font-bold text-[#172B45] tabular-nums mt-1">
                {products.length} Products
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#D5E5F7]">
              <span className="text-xs text-[#627A96]">Surplus Facilities</span>
              <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                {excessInventoryItems.length} Locations
              </div>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F0F7FF] border-b border-[#D5E5F7] text-[#627A96] font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">SKU</th>
                    <th className="py-2.5 px-4">Product Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4 text-right">Unit Cost</th>
                    <th className="py-2.5 px-4 text-right">Selling Price</th>
                    <th className="py-2.5 px-4 text-right">Min Safety Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#E4F1FF]">
                      <td className="py-3 px-4 font-mono text-[#172B45]">{p.sku}</td>
                      <td className="py-3 px-4 font-semibold text-[#172B45]">{p.name}</td>
                      <td className="py-3 px-4 text-[#627A96]">{p.category}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#172B45]">
                        {formatINR(p.unitCost)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#172B45]">
                        {formatINR(p.sellingPrice)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#627A96]">
                        {p.minSafetyStock} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Cost & Carrier Report */}
      {activeTab === 'cost' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-[#D5E5F7]">
              <span className="text-xs text-[#627A96]">Total Planned Freight</span>
              <div className="text-2xl font-bold text-[#172B45] tabular-nums mt-1">
                {formatINR(currentOptimizationResult?.totalEstimatedCost || 0)}
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#D5E5F7]">
              <span className="text-xs text-[#627A96]">Total Units Scheduled</span>
              <div className="text-2xl font-bold text-[#172B45] tabular-nums mt-1">
                {currentOptimizationResult?.totalUnitsMoved || 0} units
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#D5E5F7]">
              <span className="text-xs text-[#627A96]">Estimated Delivery Savings</span>
              <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                {formatINR(currentOptimizationResult?.savingsAchieved || 0)}
              </div>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F0F7FF] border-b border-[#D5E5F7] text-[#627A96] font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Transfer ID</th>
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-4">Origin Hub</th>
                    <th className="py-2.5 px-4">Destination Store</th>
                    <th className="py-2.5 px-4 text-right">Units</th>
                    <th className="py-2.5 px-4 text-right">Freight Cost</th>
                    <th className="py-2.5 px-4 text-center">Transit Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentOptimizationResult?.recommendations.map((r) => {
                    const prod = products.find((p) => p.id === r.productId);
                    const wh = warehouses.find((w) => w.id === r.sourceLocationId);
                    const st = stores.find((s) => s.id === r.destinationLocationId);
                    return (
                      <tr key={r.id} className="hover:bg-[#E4F1FF]">
                        <td className="py-3 px-4 font-mono text-[#627A96] text-xs">{r.id}</td>
                        <td className="py-3 px-4 font-semibold text-[#172B45]">{prod?.name}</td>
                        <td className="py-3 px-4 text-[#172B45]">{wh?.name}</td>
                        <td className="py-3 px-4 text-[#172B45]">{st?.name}</td>
                        <td className="py-3 px-4 text-right tabular-nums font-bold text-[#172B45]">
                          {r.recommendedQuantity}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-bold text-[#172B45]">
                          {formatINR(r.estimatedCost)}
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums text-[#627A96]">
                          {r.transitDays}d
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Risk Assessment */}
      {activeTab === 'risk' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F0F7FF] border-b border-[#D5E5F7] text-[#627A96] font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Retail Store</th>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4 text-right">Available Stock</th>
                  <th className="py-2.5 px-4 text-right">Daily Sales</th>
                  <th className="py-2.5 px-4 text-right">Days Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockoutAlerts.map((a) => (
                  <tr key={a.id} className="hover:bg-[#E4F1FF]">
                    <td className="py-3 px-4">
                      <Badge variant={a.riskLevel === 'critical' ? 'stockout' : 'low'} size="sm">
                        {a.riskLevel.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#172B45]">{a.store.name}</td>
                    <td className="py-3 px-4 font-semibold text-[#172B45]">{a.product.name}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-rose-600">
                      {a.availableStock}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-[#627A96]">
                      {a.avgDailyDemand}/d
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-[#172B45]">
                      {a.daysRemaining !== null ? `${a.daysRemaining} days` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Warehouse Capacity */}
      {activeTab === 'warehouse' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F0F7FF] border-b border-[#D5E5F7] text-[#627A96] font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Warehouse Code</th>
                  <th className="py-2.5 px-4">Facility Name</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4 text-right">Capacity (Units)</th>
                  <th className="py-2.5 px-4 text-right">Utilization (%)</th>
                  <th className="py-2.5 px-4 text-right">Operating Cost/Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warehouses.map((w) => {
                  const util = Math.round((w.usedCapacityUnits / w.totalCapacityUnits) * 100);
                  return (
                    <tr key={w.id} className="hover:bg-[#E4F1FF]">
                      <td className="py-3 px-4 font-mono font-medium text-[#172B45]">{w.code}</td>
                      <td className="py-3 px-4 font-semibold text-[#172B45]">{w.name}</td>
                      <td className="py-3 px-4 text-[#627A96]">{w.city}, {w.state}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#172B45]">
                        {w.totalCapacityUnits.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-[#2864E8]">
                        {util}%
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#172B45]">
                        {formatINR(w.operatingCostPerDay)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
