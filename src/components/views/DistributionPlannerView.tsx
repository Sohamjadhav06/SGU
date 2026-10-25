import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { OptimizationSettings, OptimizationObjective } from '../../types/stockwise';
import { formatINR } from '../../lib/formatters';
import { Button, Card, Badge } from '../common/UIComponents';
import {
  Sliders,
  Sparkles,
  Building2,
  Store as StoreIcon,
} from 'lucide-react';

export const DistributionPlannerView: React.FC = () => {
  const {
    warehouses,
    stores,
    products,
    runOptimization,
    isOptimizing,
    setCurrentPage,
  } = useStockWise();

  const [objective, setObjective] = useState<OptimizationObjective>('balanced');
  const [budgetLimit, setBudgetLimit] = useState<number>(50000);
  const [bufferMultiplier, setBufferMultiplier] = useState<number>(1.2);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);

  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<string[]>(
    warehouses.map((w) => w.id)
  );
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>(stores.map((s) => s.id));
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Electronics',
    'Audio',
    'Accessories',
    'Peripherals',
    'Networking',
    'Power',
  ]);

  const [solverStep, setSolverStep] = useState<number>(0);

  const handleToggleWarehouse = (id: string) => {
    setSelectedWarehouseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleStore = (id: string) => {
    setSelectedStoreIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleExecute = async () => {
    setSolverStep(1);
    await new Promise((r) => setTimeout(r, 200));
    setSolverStep(2);
    await new Promise((r) => setTimeout(r, 200));
    setSolverStep(3);

    await runOptimization({
      objective,
      budgetLimit,
      bufferStockMultiplier: bufferMultiplier,
      maxTransferLeadTimeDays: leadTimeDays,
      selectedWarehouseIds,
      selectedStoreIds,
      selectedProductCategories: selectedCategories,
    });

    setSolverStep(4);
    setTimeout(() => {
      setCurrentPage('optimization-results');
    }, 400);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
            Distribution Planner
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Configure delivery limits, warehouse buffers, and objectives to calculate cost-effective stock transfers.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleExecute}
          disabled={isOptimizing || selectedWarehouseIds.length === 0 || selectedStoreIds.length === 0}
          icon={<Sparkles className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />}
        >
          {isOptimizing ? 'Solving Network Matrix...' : 'Calculate Stock Transfers'}
        </Button>
      </div>

      {/* Solver Progress Card */}
      {isOptimizing && (
        <Card className="p-4 bg-[#EAF4FF] border-blue-200">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#2864E8] animate-spin" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-blue-900">
                Deterministic Distribution Engine Executing
              </h4>
              <p className="text-xs text-[#1D4ED8] mt-0.5">
                {solverStep === 1 && 'Reading current inventory on hand and sales velocity...'}
                {solverStep === 2 && 'Computing eligible uncommitted warehouse stocks above safety buffers...'}
                {solverStep === 3 && 'Evaluating route distance matrices, transit hours, and freight rates...'}
                {solverStep === 4 && 'Optimization plan compiled with zero constraint violations!'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Section 1: Optimization Objective */}
      <Card className="p-4 sm:p-5 border border-[#D5E5F7]">
        <h3 className="text-sm font-bold text-[#172B45] mb-1">
          1. Select Strategic Optimization Objective
        </h3>
        <p className="text-xs text-[#627A96] mb-4">
          Defines the priority trade-off between carrier transportation cost and store stockout mitigation speed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Balanced */}
          <div
            onClick={() => setObjective('balanced')}
            className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
              objective === 'balanced'
                ? 'bg-white border-blue-600 shadow-xs ring-2 ring-blue-600/15'
                : 'bg-[#F0F7FF] border-[#D5E5F7] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-[#172B45]">Balanced Strategy</span>
              <Badge variant="primary" size="sm">Recommended</Badge>
            </div>
            <p className="text-xs text-[#627A96] leading-relaxed">
              Balances stockout prevention with cost efficiency. Prioritizes critical deficits while consolidating shipments.
            </p>
          </div>

          {/* Prevent Stockouts */}
          <div
            onClick={() => setObjective('prevent_stockout')}
            className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
              objective === 'prevent_stockout'
                ? 'bg-white border-blue-600 shadow-xs ring-2 ring-blue-600/15'
                : 'bg-[#F0F7FF] border-[#D5E5F7] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-[#172B45]">Prevent Stockouts</span>
              <Badge variant="stockout" size="sm">Maximum SLA</Badge>
            </div>
            <p className="text-xs text-[#627A96] leading-relaxed">
              Aggressively eliminates stockout risks (under 2 days remaining). Prefers fastest transit routes to protect retail sales.
            </p>
          </div>

          {/* Minimize Cost */}
          <div
            onClick={() => setObjective('minimize_cost')}
            className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
              objective === 'minimize_cost'
                ? 'bg-white border-blue-600 shadow-xs ring-2 ring-blue-600/15'
                : 'bg-[#F0F7FF] border-[#D5E5F7] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-[#172B45]">Minimize Delivery Cost</span>
              <Badge variant="healthy" size="sm">Max Savings</Badge>
            </div>
            <p className="text-xs text-[#627A96] leading-relaxed">
              Minimizes total transportation expenditure across Maharashtra routes. Favors regional ground consolidation.
            </p>
          </div>
        </div>
      </Card>

      {/* Section 2: Budget & Buffer Constraints */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-[#172B45] mb-1">
          2. Budget Limits & Inventory Buffer Constraints
        </h3>
        <p className="text-xs text-[#627A96] mb-5">
          Establish operational boundaries. The engine guarantees transfers never breach source safety reserves.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Budget Limit Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#172B45]">Delivery Budget Limit</span>
              <span className="font-bold text-[#2864E8] tabular-nums">
                {formatINR(budgetLimit)}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹10,000</span>
              <span>₹1,00,000</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          {/* Buffer Multiplier */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#172B45]">Safety Stock Multiplier</span>
              <span className="font-bold text-[#2864E8] tabular-nums">{bufferMultiplier}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="1.5"
              step="0.05"
              value={bufferMultiplier}
              onChange={(e) => setBufferMultiplier(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1.0x (Lean)</span>
              <span>1.2x (Standard)</span>
              <span>1.5x (Safe)</span>
            </div>
          </div>

          {/* Max Transit Time */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#172B45]">Max Transit Time</span>
              <span className="font-bold text-[#2864E8] tabular-nums">{leadTimeDays} Days</span>
            </div>
            <input
              type="range"
              min="2"
              max="14"
              step="1"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>2 Days</span>
              <span>7 Days</span>
              <span>14 Days</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3: Facility Scope */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-[#172B45] mb-1">
          3. Facility & Corridor Scope (Maharashtra)
        </h3>
        <p className="text-xs text-[#627A96] mb-4">
          Select source warehouses and destination retail stores included in this optimization run.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Warehouses Checklist */}
          <div>
            <div className="text-xs font-semibold text-[#172B45] mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2864E8]" />
              <span>Source Warehouses ({selectedWarehouseIds.length} of {warehouses.length} active)</span>
            </div>
            <div className="space-y-2">
              {warehouses.map((wh) => (
                <label
                  key={wh.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg border border-[#D5E5F7] bg-[#F0F7FF]/50 hover:bg-white cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedWarehouseIds.includes(wh.id)}
                    onChange={() => handleToggleWarehouse(wh.id)}
                    className="rounded border-[#D5E5F7] text-[#2864E8] focus:ring-[#2864E8]"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-[#172B45]">{wh.name}</span>
                    <span className="text-[#627A96] ml-1">({wh.city})</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Stores Checklist */}
          <div>
            <div className="text-xs font-semibold text-[#172B45] mb-2 flex items-center gap-1.5">
              <StoreIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Destination Retail Stores ({selectedStoreIds.length} of {stores.length} active)</span>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {stores.map((st) => (
                <label
                  key={st.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg border border-[#D5E5F7] bg-[#F0F7FF]/50 hover:bg-white cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedStoreIds.includes(st.id)}
                    onChange={() => handleToggleStore(st.id)}
                    className="rounded border-[#D5E5F7] text-[#2864E8] focus:ring-[#2864E8]"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-[#172B45]">{st.name}</span>
                    <span className="text-[#627A96] ml-1">({st.city})</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
