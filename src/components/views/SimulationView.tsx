import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { SimulationScenario, OptimizationObjective } from '../../types/stockwise';
import { formatINR } from '../../lib/formatters';
import { Button, Card, Badge, Modal, KPICard } from '../common/UIComponents';
import {
  Sliders,
  Play,
  RotateCcw,
  BookmarkPlus,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { runScenarioSimulation } from '../../lib/inventoryEngine';

export const SimulationView: React.FC = () => {
  const {
    inventory,
    products,
    warehouses,
    stores,
    demandRecords,
    routeCosts,
    currentOptimizationResult,
    saveScenario,
    setCurrentPage,
  } = useStockWise();

  // Scenario parameters
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.25); // +25% surge
  const [transportCostMultiplier, setTransportCostMultiplier] = useState<number>(1.15); // +15% fuel surcharge
  const [budgetLimit, setBudgetLimit] = useState<number>(65000);
  const [disruptedWarehouseId, setDisruptedWarehouseId] = useState<string>('');
  const [objective, setObjective] = useState<OptimizationObjective>('prevent_stockout');

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeSimulationResult, setActiveSimulationResult] = useState<SimulationScenario | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('Diwali Festival +25% Surge');
  const [saveDescription, setSaveDescription] = useState('Tests transport capacity and store buffers across Maharashtra during 25% festive demand spike.');

  const handleRunSimulation = () => {
    setIsSimulating(true);

    const initialScenario: SimulationScenario = {
      id: `scn-${Date.now()}`,
      name: saveName,
      description: saveDescription,
      createdAt: new Date().toISOString(),
      demandMultiplier,
      transportCostMultiplier,
      budgetLimit,
      disruptedWarehouseId: disruptedWarehouseId || undefined,
      objective,
      baselineMetrics: {
        stockoutsPrevented: currentOptimizationResult?.stockoutsPrevented || 18,
        totalCost: currentOptimizationResult?.totalEstimatedCost || 22500,
        serviceLevel: currentOptimizationResult?.serviceLevelProjected || 98.4,
        unfulfilledUnits: currentOptimizationResult?.unfulfilledDemand.reduce(
          (sum, u) => sum + u.unfulfilledUnits,
          0
        ) || 0,
      },
      simulatedMetrics: {
        stockoutsPrevented: 0,
        totalCost: 0,
        serviceLevel: 0,
        unfulfilledUnits: 0,
      },
    };

    setTimeout(() => {
      const calculated = runScenarioSimulation({
        inventory,
        products,
        warehouses,
        stores,
        demandRecords,
        routeCosts,
        scenario: initialScenario,
      });

      setActiveSimulationResult(calculated);
      setIsSimulating(false);
    }, 350);
  };

  const handleSaveScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSimulationResult) return;

    saveScenario({
      ...activeSimulationResult,
      name: saveName,
      description: saveDescription,
    });
    setIsSaveModalOpen(false);
    alert('Simulation scenario saved successfully! You can reopen it in Saved Scenarios.');
  };

  const handleResetDefaults = () => {
    setDemandMultiplier(1.0);
    setTransportCostMultiplier(1.0);
    setBudgetLimit(50000);
    setDisruptedWarehouseId('');
    setObjective('balanced');
    setActiveSimulationResult(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172B45] tracking-tight">
            Test a Scenario
          </h1>
          <p className="text-xs sm:text-sm text-[#627A96] mt-0.5">
            Test distribution resilience under demand spikes, fuel inflation, facility disruptions, and delivery budget caps.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setCurrentPage('saved-scenarios')}
          >
            Saved Scenarios
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            icon={<Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />}
          >
            {isSimulating ? 'Recalculating Network...' : 'Recalculate Scenario'}
          </Button>
        </div>
      </div>

      {/* Control Sliders Panel */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-[#172B45] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2864E8]" />
            <span>Scenario Parameters & Operational Shocks</span>
          </h3>

          <button
            onClick={handleResetDefaults}
            className="text-xs text-[#627A96] hover:text-[#172B45] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Demand Shock Multiplier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#172B45]">Demand Multiplier</span>
              <span className="font-bold text-[#2864E8] tabular-nums">
                {demandMultiplier >= 1.0 ? `+${Math.round((demandMultiplier - 1) * 100)}%` : `${Math.round((demandMultiplier - 1) * 100)}%`} ({demandMultiplier}x)
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.6"
              step="0.05"
              value={demandMultiplier}
              onChange={(e) => setDemandMultiplier(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-30% (Slump)</span>
              <span>1.0x (Normal)</span>
              <span>+60% (Festive Spike)</span>
            </div>
          </div>

          {/* Freight Cost Multiplier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#172B45]">Fuel Price Surcharge</span>
              <span className="font-bold text-[#2864E8] tabular-nums">
                +{Math.round((transportCostMultiplier - 1) * 100)}% ({transportCostMultiplier}x)
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="1.6"
              step="0.05"
              value={transportCostMultiplier}
              onChange={(e) => setTransportCostMultiplier(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline Rates</span>
              <span>+25% Fuel Hike</span>
              <span>+60% Crisis Surcharge</span>
            </div>
          </div>

          {/* Budget Limit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#172B45]">Delivery Budget Limit</span>
              <span className="font-bold text-[#2864E8] tabular-nums">
                {formatINR(budgetLimit)}
              </span>
            </div>
            <input
              type="range"
              min="15000"
              max="150000"
              step="5000"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹15,000 (Strict)</span>
              <span>₹75,000</span>
              <span>₹1,50,000 (Flexible)</span>
            </div>
          </div>

          {/* Warehouse Disruption Outage */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#172B45]">
              Simulate Warehouse Temporary Disruption
            </label>
            <select
              value={disruptedWarehouseId}
              onChange={(e) => setDisruptedWarehouseId(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-[#D5E5F7] rounded-lg text-xs text-[#172B45] focus:border-blue-600 focus:outline-none"
            >
              <option value="">No Outage — All Facilities Online (100%)</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.city}) — Sim. Disrupted
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[#627A96]">
              Reroutes all retail demand dynamically to other active Maharashtra hubs.
            </p>
          </div>
        </div>
      </Card>

      {/* Simulation Results Display */}
      {activeSimulationResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172B45]">
              Simulated Outcome Metrics (Deterministic Recalculation)
            </h3>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaveModalOpen(true)}
              icon={<BookmarkPlus className="w-4 h-4 text-[#2864E8]" />}
            >
              Save This Scenario
            </Button>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Delivery Cost"
              value={formatINR(activeSimulationResult.simulatedMetrics.totalCost)}
              delta={
                activeSimulationResult.simulatedMetrics.totalCost >
                activeSimulationResult.baselineMetrics.totalCost
                  ? `+${formatINR(
                      activeSimulationResult.simulatedMetrics.totalCost -
                      activeSimulationResult.baselineMetrics.totalCost
                    )}`
                  : `-${formatINR(
                      activeSimulationResult.baselineMetrics.totalCost -
                      activeSimulationResult.simulatedMetrics.totalCost
                    )}`
              }
              deltaType={
                activeSimulationResult.simulatedMetrics.totalCost >
                activeSimulationResult.baselineMetrics.totalCost
                  ? 'negative'
                  : 'positive'
              }
              subtext={`Baseline was ${formatINR(activeSimulationResult.baselineMetrics.totalCost)}`}
              variant="default"
              icon={<TrendingUp className="w-4 h-4 text-[#2864E8]" />}
            />

            <KPICard
              title="Shortages Prevented"
              value={activeSimulationResult.simulatedMetrics.stockoutsPrevented}
              delta={`${activeSimulationResult.simulatedMetrics.stockoutsPrevented} protected`}
              deltaType="positive"
              subtext={`Baseline was ${activeSimulationResult.baselineMetrics.stockoutsPrevented}`}
              variant="healthy"
              icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
            />

            <KPICard
              title="Order Fulfilment"
              value={`${activeSimulationResult.simulatedMetrics.serviceLevel}%`}
              delta={`${(
                activeSimulationResult.simulatedMetrics.serviceLevel -
                activeSimulationResult.baselineMetrics.serviceLevel
              ).toFixed(1)}%`}
              deltaType={
                activeSimulationResult.simulatedMetrics.serviceLevel >=
                activeSimulationResult.baselineMetrics.serviceLevel
                  ? 'positive'
                  : 'negative'
              }
              subtext={`Baseline was ${activeSimulationResult.baselineMetrics.serviceLevel}%`}
              variant="default"
              icon={<TrendingUp className="w-4 h-4 text-[#2864E8]" />}
            />

            <KPICard
              title="Unmet Demand Units"
              value={activeSimulationResult.simulatedMetrics.unfulfilledUnits}
              delta={
                activeSimulationResult.simulatedMetrics.unfulfilledUnits > 0
                  ? `${activeSimulationResult.simulatedMetrics.unfulfilledUnits} units deficit`
                  : '0 units unmet'
              }
              deltaType={
                activeSimulationResult.simulatedMetrics.unfulfilledUnits > 0
                  ? 'negative'
                  : 'positive'
              }
              variant={
                activeSimulationResult.simulatedMetrics.unfulfilledUnits > 0
                  ? 'critical'
                  : 'healthy'
              }
            />
          </div>
        </div>
      )}

      {/* Save Scenario Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Simulation Scenario"
        subtitle="Save this stress-test scenario for future plan reviews"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveScenario}>
              Save Scenario
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveScenario} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-[#172B45] font-medium mb-1">Scenario Name</label>
            <input
              type="text"
              required
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={saveDescription}
              onChange={(e) => setSaveDescription(e.target.value)}
              className="w-full p-2.5 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
