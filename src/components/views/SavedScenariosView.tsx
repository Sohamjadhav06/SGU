import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { SimulationScenario } from '../../types/stockwise';
import { formatINR } from '../../lib/formatters';
import { Button, Card, Badge, Modal } from '../common/UIComponents';
import {
  BookmarkCheck,
  Play,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const SavedScenariosView: React.FC = () => {
  const { savedScenarios, setCurrentPage } = useStockWise();

  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172B45] tracking-tight flex items-center gap-2">
            <span>Saved Scenarios</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EAF4FF] text-[#1D4ED8] font-bold tabular-nums">
              {savedScenarios.length} Scenarios
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#627A96] mt-0.5">
            Audit library of preserved stress tests, surge simulations, and contingency models across Maharashtra.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setCurrentPage('simulation')}
          icon={<Play className="w-4 h-4" />}
        >
          Test a Scenario
        </Button>
      </div>

      {/* Scenarios Grid */}
      <div className="space-y-4">
        {savedScenarios.map((scn) => (
          <Card key={scn.id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#172B45]">{scn.name}</h3>
                  <Badge variant="primary" size="sm">
                    {scn.objective.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-[#627A96] mt-1 max-w-2xl leading-relaxed">
                  {scn.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Created: {new Date(scn.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Sim. Cost</div>
                  <div className="text-base font-bold text-[#172B45] tabular-nums">
                    {formatINR(scn.simulatedMetrics.totalCost)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Service Level</div>
                  <div className="text-base font-bold text-emerald-700 tabular-nums">
                    {scn.simulatedMetrics.serviceLevel}%
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedScenario(scn)}
                >
                  Inspect
                </Button>
              </div>
            </div>

            {/* Parameter Badges */}
            <div className="pt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] text-slate-400">Parameters:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[#172B45] font-mono text-[11px]">
                Demand: {scn.demandMultiplier}x
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[#172B45] font-mono text-[11px]">
                Fuel Surcharge: {scn.transportCostMultiplier}x
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[#172B45] font-mono text-[11px]">
                Budget: {formatINR(scn.budgetLimit)}
              </span>
              {scn.disruptedWarehouseId && (
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono text-[11px]">
                  Warehouse Offline: Sim. Disrupted
                </span>
              )}
            </div>
          </Card>
        ))}

        {savedScenarios.length === 0 && (
          <div className="p-8 text-center text-xs text-[#627A96] border border-dashed border-[#D5E5F7] rounded-xl bg-white">
            No saved scenarios yet. Test a scenario in the simulator and click "Save This Scenario".
          </div>
        )}
      </div>

      {/* Scenario Detail Modal */}
      <Modal
        isOpen={Boolean(selectedScenario)}
        onClose={() => setSelectedScenario(null)}
        title={selectedScenario?.name || 'Scenario Detail'}
        subtitle="Simulated outcome metrics and network parameters"
        footer={
          <Button variant="primary" onClick={() => setSelectedScenario(null)}>
            Close
          </Button>
        }
      >
        {selectedScenario && (
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-[#627A96] leading-relaxed">{selectedScenario.description}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F0F7FF] border border-[#D5E5F7] rounded-lg">
                <span className="text-[10px] text-[#627A96] uppercase font-semibold">Simulated Cost</span>
                <div className="text-base font-semibold text-[#172B45] tabular-nums mt-0.5">
                  {formatINR(selectedScenario.simulatedMetrics.totalCost)}
                </div>
              </div>

              <div className="p-3 bg-[#F0F7FF] border border-[#D5E5F7] rounded-lg">
                <span className="text-[10px] text-[#627A96] uppercase font-semibold">Service Level</span>
                <div className="text-base font-semibold text-emerald-700 tabular-nums mt-0.5">
                  {selectedScenario.simulatedMetrics.serviceLevel}%
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#EAF4FF] border border-blue-200 rounded-lg text-blue-900 text-xs">
              <div className="font-semibold mb-1">Baseline Comparison</div>
              <div>
                Baseline cost was {formatINR(selectedScenario.baselineMetrics.totalCost)} with{' '}
                {selectedScenario.baselineMetrics.serviceLevel}% order fulfillment.
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
