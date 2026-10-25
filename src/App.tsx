import React, { useState } from 'react';
import { StockWiseProvider, useStockWise } from './context/StockWiseContext';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { AICopilotDrawer } from './components/common/AICopilotDrawer';
import { CommandPalette } from './components/common/CommandPalette';

// All Application Views
import { DashboardView } from './components/views/DashboardView';
import { ProductsView } from './components/views/ProductsView';
import { StockMovementsView } from './components/views/StockMovementsView';
import { ImportDataView } from './components/views/ImportDataView';
import { WarehousesView } from './components/views/WarehousesView';
import { StoresView } from './components/views/StoresView';
import { DemandAnalysisView } from './components/views/DemandAnalysisView';
import { StockoutAlertsView } from './components/views/StockoutAlertsView';
import { ExcessInventoryView } from './components/views/ExcessInventoryView';
import { RedistributionRecommendationsView } from './components/views/RedistributionRecommendationsView';
import { DistributionPlannerView } from './components/views/DistributionPlannerView';
import { OptimizationResultsView } from './components/views/OptimizationResultsView';
import { PlanComparisonView } from './components/views/PlanComparisonView';
import { ShipmentsView } from './components/views/ShipmentsView';
import { ReportsView } from './components/views/ReportsView';
import { NotificationsView } from './components/views/NotificationsView';
import { SettingsView } from './components/views/SettingsView';
import { HelpSupportView } from './components/views/HelpSupportView';
import { AuthView } from './components/views/AuthView';
import { OnboardingWizardView } from './components/views/OnboardingWizardView';

const MainAppLayout: React.FC = () => {
  const { currentPage, isAuthenticated } = useStockWise();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // If unauthenticated or on login, render standalone AuthView
  if (!isAuthenticated || currentPage === 'login') {
    return <AuthView />;
  }

  // Render active screen
  const renderCurrentView = () => {
    switch (currentPage) {
      // OVERVIEW
      case 'dashboard':
        return <DashboardView />;

      // INVENTORY
      case 'products':
        return <ProductsView />;
      case 'stock-movements':
        return <StockMovementsView />;
      case 'import-data':
        return <ImportDataView />;

      // LOCATIONS
      case 'warehouses':
        return <WarehousesView />;
      case 'stores':
        return <StoresView />;

      // INTELLIGENCE
      case 'demand-analysis':
        return <DemandAnalysisView />;
      case 'stockout-alerts':
        return <StockoutAlertsView />;
      case 'excess-inventory':
        return <ExcessInventoryView />;
      case 'redistribution-recommendations':
        return <RedistributionRecommendationsView />;

      // DISTRIBUTION
      case 'distribution-planner':
        return <DistributionPlannerView />;
      case 'optimization-results':
        return <OptimizationResultsView />;
      case 'plan-comparison':
        return <PlanComparisonView />;
      case 'shipments':
        return <ShipmentsView />;

      // Obsolete simulation routes redirected cleanly to Dashboard
      case 'simulation':
      case 'saved-scenarios':
        return <DashboardView />;

      // REPORTS
      case 'reports':
        return <ReportsView />;

      // SYSTEM
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      case 'help-support':
        return <HelpSupportView />;

      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F0F7FF]">
      {/* Persistent Desktop Rail / Mobile Drawer */}
      <AppSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Persistent Header */}
        <AppHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSearchPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Scrollable Content Workspace */}
        <main className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-3.5 bg-[#F0F7FF]">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global AI Copilot Slide-Over */}
      <AICopilotDrawer />

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StockWiseProvider>
      <MainAppLayout />
    </StockWiseProvider>
  );
}
