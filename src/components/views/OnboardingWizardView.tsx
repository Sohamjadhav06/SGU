import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Card, Button, Badge } from '../common/UIComponents';
import {
  CheckCircle2,
  Building2,
  Store as StoreIcon,
  Package,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const OnboardingWizardView: React.FC = () => {
  const { companySettings, updateCompanySettings, setCurrentPage, warehouses, stores, products } =
    useStockWise();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    companyName: companySettings.companyName,
    currency: companySettings.currency,
    holdingCostRateAnnual: companySettings.holdingCostRateAnnual,
    defaultTargetDaysSupply: companySettings.defaultTargetDaysSupply,
  });

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else {
      updateCompanySettings(formData);
      setCurrentPage('dashboard');
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in max-w-3xl mx-auto w-full font-sans">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB] mx-auto flex items-center justify-center text-white font-bold text-lg shadow-sm mb-2">
          VM
        </div>
        <h2 className="text-2xl font-bold text-[#172B45] tracking-tight">
          Welcome to VyaparMitra
        </h2>
        <p className="text-xs text-[#627A96]">Distribution Intelligence & Inventory Optimization for Indian Businesses</p>
      </div>

      {/* Stepper Dots */}
      <div className="flex items-center justify-between mb-6 px-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20'
                  : step > s
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-[#E2E8F0] text-[#627A96]'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            <span
              className={`text-[11px] font-medium hidden sm:inline ${
                step === s ? 'text-[#172B45]' : 'text-[#627A96]'
              }`}
            >
              {s === 1 && 'Company'}
              {s === 2 && 'Facilities'}
              {s === 3 && 'Products'}
              {s === 4 && 'Policies'}
              {s === 5 && 'Launch'}
            </span>
          </div>
        ))}
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: COMPANY PROFILE */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#172B45]">1. Business Profile Configuration</h3>
            <p className="text-xs text-[#627A96]">
              Establish your business entity and functional currency in Indian Rupees.
            </p>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#172B45] mb-1">Company / Business Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-md text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B45] mb-1">Functional Currency</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-md text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: WAREHOUSE & STORE SETUP */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#172B45]">2. Warehouses & Retail Stores in Maharashtra</h3>
            <p className="text-xs text-[#627A96]">
              We have pre-configured 3 central warehouses and 6 retail stores for your Maharashtra distribution network.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="font-semibold text-[#172B45] flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Warehouses ({warehouses.length})</span>
                </div>
                <ul className="text-[11px] text-[#627A96] space-y-0.5">
                  {warehouses.map((w) => (
                    <li key={w.id}>• {w.name} ({w.city})</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="font-semibold text-[#172B45] flex items-center gap-1.5 mb-1">
                  <StoreIcon className="w-3.5 h-3.5 text-[#006780]" />
                  <span>Retail Stores ({stores.length})</span>
                </div>
                <ul className="text-[11px] text-[#627A96] space-y-0.5">
                  {stores.map((s) => (
                    <li key={s.id}>• {s.name} ({s.city})</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: INVENTORY SETUP */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#172B45]">3. Demonstration Products & Initial Stock</h3>
            <p className="text-xs text-[#627A96]">
              VyaparMitra is pre-loaded with the 6 fast-moving demonstration products with live sales records and shortage tracking.
            </p>

            <div className="p-4 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-[#1E40AF]">Loaded 6 Core Products</div>
                <div className="text-[#1E40AF]/80 text-[11px]">boAt Earbuds, Portronics Chargers, Logitech Mice, Zebronics Keyboards, Ambrane Power Banks, TP-Link Routers.</div>
              </div>
              <Badge variant="healthy" size="sm">Ready</Badge>
            </div>
          </div>
        )}

        {/* STEP 4: DISTRIBUTION POLICIES */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#172B45]">4. Inventory Carrying & Transfer Policies</h3>
            <p className="text-xs text-[#627A96]">
              Fine-tune the annual holding cost rate and target store stock coverage days.
            </p>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#172B45] mb-1">
                  Annual Holding Cost Rate (e.g. 0.18 for 18%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.holdingCostRateAnnual}
                  onChange={(e) => setFormData({ ...formData, holdingCostRateAnnual: Number(e.target.value) })}
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-md text-xs sm:text-sm tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B45] mb-1">
                  Default Target Days of Supply
                </label>
                <input
                  type="number"
                  value={formData.defaultTargetDaysSupply}
                  onChange={(e) => setFormData({ ...formData, defaultTargetDaysSupply: Number(e.target.value) })}
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-md text-xs sm:text-sm tabular-nums"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: SETUP REVIEW */}
        {step === 5 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#DCFCE7] text-[#16A34A] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-[#172B45]">Setup Complete!</h3>
            <p className="text-xs text-[#627A96] max-w-md mx-auto leading-relaxed">
              Your network is initialized with 3 warehouses, 6 retail stores, and 6 demonstration products. The deterministic distribution engine is standing by to prevent stock shortages and save delivery costs.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
          {step > 1 ? (
            <Button variant="secondary" onClick={handlePrev} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            onClick={handleNext}
            icon={step === 5 ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          >
            {step === 5 ? 'Launch Platform' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
