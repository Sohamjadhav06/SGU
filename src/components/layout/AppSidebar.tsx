import React from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { StockWisePage } from '../../types/stockwise';
import {
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
  LogOut,
} from 'lucide-react';

interface NavItem {
  id: StockWisePage;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeVariant?: 'critical' | 'warning' | 'info';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export interface AppSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    currentPage,
    setCurrentPage,
    criticalStockoutsCount,
    unreadNotificationsCount,
    activeShipmentsCount,
    excessInventoryItems,
    userProfile,
    logout,
  } = useStockWise();

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'INVENTORY',
      items: [
        {
          id: 'products',
          label: 'Products',
          icon: <Boxes className="w-4 h-4" />,
        },
        {
          id: 'stock-movements',
          label: 'Stock Movements',
          icon: <ArrowLeftRight className="w-4 h-4" />,
        },
        {
          id: 'import-data',
          label: 'Import Data',
          icon: <UploadCloud className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'LOCATIONS',
      items: [
        {
          id: 'warehouses',
          label: 'Warehouses',
          icon: <Building2 className="w-4 h-4" />,
        },
        {
          id: 'stores',
          label: 'Stores & Distributors',
          icon: <Store className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        {
          id: 'demand-analysis',
          label: 'Demand Analysis',
          icon: <TrendingUp className="w-4 h-4" />,
        },
        {
          id: 'stockout-alerts',
          label: 'Stockout Alerts',
          icon: <AlertTriangle className="w-4 h-4" />,
          badge: criticalStockoutsCount > 0 ? criticalStockoutsCount : undefined,
          badgeVariant: 'critical',
        },
        {
          id: 'excess-inventory',
          label: 'Excess Inventory',
          icon: <PackageOpen className="w-4 h-4" />,
          badge: excessInventoryItems.length > 0 ? excessInventoryItems.length : undefined,
          badgeVariant: 'warning',
        },
        {
          id: 'redistribution-recommendations',
          label: 'Redistribution Recommendations',
          icon: <Layers className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'DISTRIBUTION',
      items: [
        {
          id: 'distribution-planner',
          label: 'Distribution Planner',
          icon: <Sliders className="w-4 h-4" />,
        },
        {
          id: 'optimization-results',
          label: 'Optimization Results',
          icon: <Sparkles className="w-4 h-4" />,
        },
        {
          id: 'plan-comparison',
          label: 'Plan Comparison',
          icon: <GitCompare className="w-4 h-4" />,
        },
        {
          id: 'shipments',
          label: 'Shipments',
          icon: <Truck className="w-4 h-4" />,
          badge: activeShipmentsCount > 0 ? activeShipmentsCount : undefined,
          badgeVariant: 'info',
        },
      ],
    },
    {
      title: 'REPORTS & SYSTEM',
      items: [
        {
          id: 'reports',
          label: 'Reports & Summary',
          icon: <FileBarChart2 className="w-4 h-4" />,
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: <Bell className="w-4 h-4" />,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
          badgeVariant: 'info',
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'HELP & SUPPORT',
      items: [
        {
          id: 'help-support',
          label: 'Help & Guide',
          icon: <HelpCircle className="w-4 h-4" />,
        },
      ],
    },
  ];

  const handleNavClick = (page: StockWisePage) => {
    setCurrentPage(page);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#3987E8] to-[#2563EB] text-white border-r border-blue-400/30 shadow-md select-none">
      {/* Brand Header with Vyapar Sathi Logo */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/15 shrink-0">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => handleNavClick('dashboard')}
          title="VyaparMitra"
        >
          <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm border border-white/40 overflow-hidden">
            <img
              src="/logo.jpg"
              alt="Vyapar Sathi"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-[13px] font-bold text-white tracking-tight leading-none">
              VyaparMitra
            </div>
            <div className="text-[10px] text-blue-100 tracking-tight mt-1 truncate">
              Distribution Intelligence
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-3">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-2 mb-1 text-[9px] font-bold text-blue-100/90 tracking-wider uppercase">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/25 text-white font-semibold shadow-xs border border-white/35 backdrop-blur-xs'
                        : 'text-white/85 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={isActive ? 'text-white' : 'text-blue-100'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                          isActive
                            ? 'bg-white text-[#2563EB] shadow-2xs'
                            : item.badgeVariant === 'critical'
                            ? 'bg-rose-500 text-white shadow-2xs'
                            : item.badgeVariant === 'warning'
                            ? 'bg-amber-400 text-[#172B45] font-bold'
                            : 'bg-white/25 text-white border border-white/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User / Logout Footer */}
      <div className="p-2.5 border-t border-white/15 bg-black/10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6.5 h-6.5 rounded-full bg-white/20 border border-white/40 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              {userProfile.avatarInitials}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{userProfile.name}</div>
              <div className="text-[10px] text-blue-100 truncate">{userProfile.role}</div>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Sign out of VyaparMitra?')) {
                logout();
              }
            }}
            className="p-1 rounded-md text-blue-100 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Rail (215px) */}
      <aside className="hidden lg:block w-[215px] shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 modal-backdrop animate-fade-in" onClick={onCloseMobile} />
          <div className="relative w-[240px] h-full shadow-2xl z-10 animate-slide-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
