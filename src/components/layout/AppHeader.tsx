import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Button } from '../common/UIComponents';
import {
  Menu,
  Sparkles,
  Bot,
  Bell,
  RefreshCw,
  Search,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  X,
  LogOut,
} from 'lucide-react';

export interface AppHeaderProps {
  onToggleMobileMenu: () => void;
  onOpenSearchPalette: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileMenu,
  onOpenSearchPalette,
}) => {
  const {
    breadcrumbs,
    setCurrentPage,
    runOptimization,
    isOptimizing,
    isPlanStale,
    isCopilotOpen,
    setIsCopilotOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    resetToRealisticDemoData,
    userProfile,
    logout,
  } = useStockWise();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Reset all inventory, locations, and movements to realistic Indian demo data?')) {
      setIsResetting(true);
      resetToRealisticDemoData();
      setTimeout(() => setIsResetting(false), 500);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out of VyaparMitra?')) {
      logout();
    }
  };

  return (
    <header className="h-13 bg-white border-b border-[#D5E5F7] px-3.5 sm:px-5 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-[#627A96] hover:text-[#172B45] hover:bg-[#EAF4FF] transition-colors"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-[#627A96] overflow-x-auto whitespace-nowrap">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-[#627A96]/60 shrink-0" />}
                {crumb.page && !isLast ? (
                  <button
                    onClick={() => crumb.page && setCurrentPage(crumb.page)}
                    className="hover:text-[#2864E8] transition-colors font-medium cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={isLast ? 'text-[#172B45] font-semibold' : 'text-[#627A96]'}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center: Search Trigger */}
      <div className="hidden md:flex items-center max-w-xs lg:max-w-sm w-full mx-3">
        <button
          onClick={onOpenSearchPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[#F0F7FF] border border-[#D5E5F7] rounded-lg text-xs text-[#627A96] hover:border-blue-300 hover:bg-white transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#627A96]" />
            <span className="truncate">Search products, stores, shipments...</span>
          </div>
          <kbd className="px-1.5 py-0.5 bg-white border border-[#D5E5F7] rounded text-[10px] font-mono text-[#627A96] shrink-0">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Run Optimizer */}
        <div className="relative hidden sm:inline-flex">
          <Button
            size="sm"
            variant="outline"
            onClick={() => runOptimization()}
            disabled={isOptimizing}
            icon={<Sparkles className={`w-3.5 h-3.5 text-[#2864E8] ${isOptimizing ? 'animate-spin' : ''}`} />}
          >
            {isOptimizing ? 'Optimizing...' : 'Run Engine'}
          </Button>
          {isPlanStale && (
            <span
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D99A13] ring-2 ring-white"
              title="Inventory updated — click Run Engine to refresh plans"
            />
          )}
        </div>

        {/* AI Copilot Toggle */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            isCopilotOpen
              ? 'bg-[#EAF4FF] border-blue-200 text-[#2864E8]'
              : 'bg-white border-[#D5E5F7] text-[#172B45] hover:bg-[#EAF4FF]'
          }`}
          title="Toggle VyaparMitra Assistant"
        >
          <Bot className="w-3.5 h-3.5 text-[#2864E8]" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-1.5 rounded-lg text-[#627A96] hover:text-[#172B45] hover:bg-[#EAF4FF] transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#E5484D] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Flyout */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-[#D5E5F7] shadow-xl z-50 animate-slide-up overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#D5E5F7] bg-[#F0F7FF]/80">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#172B45]">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 text-[#E5484D] rounded-full">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#2864E8] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="p-1 rounded text-[#627A96] hover:text-[#172B45] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#D5E5F7]/50">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs hover:bg-[#EAF4FF] transition-colors ${
                      !n.read ? 'bg-[#EAF4FF]/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 font-medium text-[#172B45]">
                        {n.severity === 'critical' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-[#E5484D] shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2864E8] shrink-0" />
                        )}
                        <span>{n.title}</span>
                      </div>
                      <span className="text-[10px] text-[#627A96] shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="text-[#627A96] text-[11px] leading-relaxed">{n.message}</p>
                    {n.linkPage && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => {
                            if (n.linkPage) setCurrentPage(n.linkPage);
                            markNotificationRead(n.id);
                            setNotificationsOpen(false);
                          }}
                          className="text-[11px] font-medium text-[#2864E8] hover:underline cursor-pointer"
                        >
                          {n.actionLabel || 'View Details →'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-[#D5E5F7] bg-[#F0F7FF]/80 text-center">
                <button
                  onClick={() => {
                    setCurrentPage('notifications');
                    setNotificationsOpen(false);
                  }}
                  className="text-xs font-medium text-[#2864E8] hover:underline cursor-pointer"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetData}
          disabled={isResetting}
          className="p-1.5 rounded-lg text-[#627A96] hover:text-[#172B45] hover:bg-[#EAF4FF] transition-colors cursor-pointer"
          title="Reset to Realistic Indian Demo Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-[#2864E8]' : ''}`} />
        </button>

        <div className="h-4 w-px bg-[#D5E5F7] hidden sm:block mx-0.5" />

        {/* User Profile Pill */}
        <button
          onClick={() => setCurrentPage('settings')}
          className="flex items-center gap-1.5 p-0.5 pl-1 pr-2 rounded-full border border-[#D5E5F7] bg-white hover:bg-[#EAF4FF] transition-colors cursor-pointer"
          title="Account Settings"
        >
          <div className="w-5.5 h-5.5 rounded-full bg-[#2864E8] text-white flex items-center justify-center text-[9px] font-bold">
            {userProfile.avatarInitials}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-[11px] font-semibold text-[#172B45] leading-none">
              {userProfile.name}
            </div>
            <div className="text-[9px] text-[#627A96] leading-none mt-0.5">
              {userProfile.role}
            </div>
          </div>
        </button>

        {/* Logout Action Button */}
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-[#627A96] hover:text-[#E5484D] hover:bg-rose-50 transition-colors cursor-pointer"
          title="Sign Out (Admin)"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
