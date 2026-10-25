import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Card, Button, Badge, AlertBanner } from '../common/UIComponents';
import {
  Settings,
  Sliders,
  Database,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    companySettings,
    userProfile,
    updateCompanySettings,
    resetToRealisticDemoData,
    products,
    warehouses,
    stores,
    inventory,
    movements,
    shipments,
  } = useStockWise();

  const [formData, setFormData] = useState({ ...companySettings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportFullJSON = () => {
    const dataDump = {
      exportTimestamp: new Date().toISOString(),
      companySettings,
      products,
      warehouses,
      stores,
      inventory,
      movements,
      shipments,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataDump, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `VyaparMitra_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="pb-0.5">
        <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-[#627A96] mt-0.5">
          Configure financial holding cost rules, solver objectives, AI credentials, and database backups.
        </p>
      </div>

      {saveSuccess && (
        <AlertBanner
          variant="healthy"
          title="Settings Successfully Saved"
          message="Company preferences, holding cost parameters, and operational configurations have been updated."
        />
      )}

      {/* 1. User Profile Card */}
      <Card className="p-4 flex items-center justify-between border border-[#D5E5F7]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#101B30] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {userProfile.avatarInitials}
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-[#172B45]">{userProfile.name}</h3>
            <div className="text-[11px] text-[#627A96]">{userProfile.email}</div>
            <div className="text-[10px] font-semibold text-[#2864E8] mt-0.5">{userProfile.role}</div>
          </div>
        </div>

        <Badge variant="healthy" size="sm">
          Active Session
        </Badge>
      </Card>

      <form onSubmit={handleSave} className="space-y-4">
        {/* 2. General Settings */}
        <Card className="p-4 sm:p-5 space-y-3 border border-[#D5E5F7]">
          <h3 className="text-sm font-bold text-[#172B45] flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#2864E8]" />
            <span>General Platform Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-[#172B45] mb-1">Company Title</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-[#D5E5F7] rounded-lg text-xs sm:text-sm text-[#172B45] focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B45] mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-[#D5E5F7] rounded-lg text-xs sm:text-sm text-[#172B45] focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B45] mb-1">Distance Unit</label>
              <select
                value={formData.distanceUnit}
                onChange={(e) => setFormData({ ...formData, distanceUnit: e.target.value as any })}
                className="w-full h-9 px-3 bg-white border border-[#D5E5F7] rounded-lg text-xs sm:text-sm text-[#172B45] focus:border-blue-600 focus:outline-none"
              >
                <option value="km">Kilometers (km)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 3. Inventory & Financial Modeling Rules */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#172B45] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2864E8]" />
            <span>Inventory Assumptions & Holding Cost Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-[#172B45] mb-1">
                Annual Carrying Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.holdingCostRateAnnual}
                onChange={(e) =>
                  setFormData({ ...formData, holdingCostRateAnnual: Number(e.target.value) })
                }
                className="w-full h-9 px-3 bg-white border border-[#D5E5F7] rounded-lg text-xs sm:text-sm tabular-nums focus:border-blue-600 focus:outline-none"
              />
              <span className="text-[10px] text-[#627A96]">e.g. 0.18 = 18% annual capital tied up</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B45] mb-1">
                Target Days Supply
              </label>
              <input
                type="number"
                value={formData.defaultTargetDaysSupply}
                onChange={(e) =>
                  setFormData({ ...formData, defaultTargetDaysSupply: Number(e.target.value) })
                }
                className="w-full h-9 px-3 bg-white border border-[#D5E5F7] rounded-lg text-xs sm:text-sm tabular-nums focus:border-blue-600 focus:outline-none"
              />
              <span className="text-[10px] text-[#627A96]">Target buffer for warehouses & shops</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B45] mb-1">
                Carrier Base Rate / km (₹)
              </label>
              <input
                type="number"
                value={formData.defaultCarrierRatePerKm}
                onChange={(e) =>
                  setFormData({ ...formData, defaultCarrierRatePerKm: Number(e.target.value) })
                }
                className="w-full h-9 px-3 bg-white border border-[#D5E5F7] rounded-lg text-xs sm:text-sm tabular-nums focus:border-blue-600 focus:outline-none"
              />
              <span className="text-[10px] text-[#627A96]">Standard road freight per kilometer</span>
            </div>
          </div>
        </Card>

        {/* 4. Google Gemini Configuration Guidance */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B45] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2864E8]" />
              <span>Google Gemini AI Integration (Google AI Studio)</span>
            </h3>
            <Badge variant="healthy" size="sm">
              Server-Side Proxy Secured
            </Badge>
          </div>

          <div className="p-4 bg-[#F0F7FF] border border-[#D5E5F7] rounded-lg text-xs space-y-2 text-[#172B45]">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Secure Key Handling:</strong> Your Gemini API key is configured via the root{' '}
                <code className="px-1.5 py-0.5 bg-white border border-[#D5E5F7] rounded font-mono">.env</code>{' '}
                file using <code className="font-mono">GEMINI_API_KEY</code>. It is evaluated exclusively on the server side and never exposed to client-side JavaScript.
              </div>
            </div>
            <div className="pl-6 text-[#627A96]">
              Active model configured: <code className="font-mono text-[#172B45]">gemini-2.5-flash</code> (with automatic fallback to deterministic business calculations if offline).
            </div>
          </div>
        </Card>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md">
            Save Preferences
          </Button>
        </div>
      </form>

      {/* 5. Database & Demo Maintenance */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#172B45] flex items-center gap-2">
          <Database className="w-4 h-4 text-[#2864E8]" />
          <span>Data Maintenance & Backup</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-[#627A96]">
            Export a full JSON database snapshot including all 6 products, 9 facilities, and movements.
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportFullJSON}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Backup (.json)
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="text-xs text-[#627A96]">
            Reset all inventory, locations, and movements back to the verified Maharashtra demonstration dataset.
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              if (window.confirm('Reset all inventory records to realistic Indian demonstration data?')) {
                resetToRealisticDemoData();
              }
            }}
            icon={<RotateCcw className="w-3.5 h-3.5 text-[#2864E8]" />}
          >
            Reset Demo Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
