import React, { useState, useEffect } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { StockWisePage } from '../../types/stockwise';
import {
  Search,
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  UploadCloud,
  Building2,
  Store,
  TrendingUp,
  AlertTriangle,
  PackageOpen,
  Layers,
  Sliders,
  Sparkles,
  GitCompare,
  Truck,
  FileBarChart2,
  Bell,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { setCurrentPage, products, warehouses, stores } = useStockWise();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPages: { id: StockWisePage; label: string; section: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', section: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Products', section: 'Inventory', icon: <Boxes className="w-4 h-4" /> },
    { id: 'stock-movements', label: 'Stock Movements', section: 'Inventory', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'import-data', label: 'Import Data', section: 'Inventory', icon: <UploadCloud className="w-4 h-4" /> },
    { id: 'warehouses', label: 'Warehouses', section: 'Locations', icon: <Building2 className="w-4 h-4" /> },
    { id: 'stores', label: 'Stores & Distributors', section: 'Locations', icon: <Store className="w-4 h-4" /> },
    { id: 'demand-analysis', label: 'Demand Analysis', section: 'Intelligence', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'stockout-alerts', label: 'Stockout Alerts', section: 'Intelligence', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'excess-inventory', label: 'Excess Inventory', section: 'Intelligence', icon: <PackageOpen className="w-4 h-4" /> },
    { id: 'redistribution-recommendations', label: 'Redistribution Recommendations', section: 'Intelligence', icon: <Layers className="w-4 h-4" /> },
    { id: 'distribution-planner', label: 'Distribution Planner', section: 'Distribution', icon: <Sliders className="w-4 h-4" /> },
    { id: 'optimization-results', label: 'Optimization Results', section: 'Distribution', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'plan-comparison', label: 'Plan Comparison', section: 'Distribution', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'shipments', label: 'Shipments', section: 'Distribution', icon: <Truck className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Summary', section: 'Reports & System', icon: <FileBarChart2 className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', section: 'Reports & System', icon: <Bell className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', section: 'Reports & System', icon: <Settings className="w-4 h-4" /> },
    { id: 'help-support', label: 'Help & Guide', section: 'Help & Support', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const filteredPages = quickPages.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase()) || p.section.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4);

  const filteredLocations = [
    ...warehouses.map((w) => ({ type: 'Warehouse', name: w.name, code: w.code, page: 'warehouses' as StockWisePage })),
    ...stores.map((s) => ({ type: 'Store', name: s.name, code: s.code, page: 'stores' as StockWisePage })),
  ]
    .filter((l) => l.name.toLowerCase().includes(query.toLowerCase()) || l.code.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4);

  const handleSelectPage = (page: StockWisePage) => {
    setCurrentPage(page);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 modal-backdrop animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-xl border border-[#D5E5F7] shadow-2xl z-10 animate-slide-up overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-[#D5E5F7] bg-white">
          <Search className="w-4 h-4 text-[#627A96] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a screen, product, store, or command..."
            className="w-full h-12 px-3 text-sm text-[#172B45] placeholder-[#627A96] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-[#627A96] hover:text-[#172B45] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Screens */}
          {filteredPages.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-[#627A96] uppercase tracking-wider">
                Pages & Navigation
              </div>
              <div className="space-y-0.5">
                {filteredPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handleSelectPage(page.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#172B45] hover:bg-[#EAF4FF] hover:text-[#2864E8] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#627A96]">{page.icon}</span>
                      <span>{page.label}</span>
                    </div>
                    <span className="text-[10px] text-[#627A96]">{page.section}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Search */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-[#627A96] uppercase tracking-wider">
                Matching Products
              </div>
              <div className="space-y-0.5">
                {filteredProducts.map((prd) => (
                  <button
                    key={prd.id}
                    onClick={() => handleSelectPage('products')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#172B45] hover:bg-[#EAF4FF] transition-colors cursor-pointer text-left"
                  >
                    <div>
                      <div className="font-semibold text-[#172B45]">{prd.name}</div>
                      <div className="text-[10px] text-[#627A96] font-mono">{prd.sku} · {prd.category}</div>
                    </div>
                    <span className="text-[11px] text-[#2864E8] font-medium">View SKU →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Locations Search */}
          {filteredLocations.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-[#627A96] uppercase tracking-wider">
                Facilities & Locations
              </div>
              <div className="space-y-0.5">
                {filteredLocations.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPage(loc.page)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#172B45] hover:bg-[#EAF4FF] transition-colors cursor-pointer text-left"
                  >
                    <div>
                      <div className="font-semibold text-[#172B45]">{loc.name}</div>
                      <div className="text-[10px] text-[#627A96] font-mono">{loc.code} · {loc.type}</div>
                    </div>
                    <span className="text-[11px] text-[#2864E8] font-medium">Open →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredPages.length === 0 && filteredProducts.length === 0 && (
            <div className="text-center py-8 text-xs text-[#627A96]">
              No results found for "{query}". Try searching for "alerts", "planner", or "Pune".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#F0F7FF] border-t border-[#D5E5F7] flex items-center justify-between text-[11px] text-[#627A96]">
          <span>Tip: Use arrow keys or click to navigate</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
