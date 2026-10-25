import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  X,
  TrendingUp,
  TrendingDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ==========================================
// BUTTON
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2864E8]/30 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'h-7.5 px-2.5 text-xs gap-1.5',
    md: 'h-8.5 px-3.5 text-xs sm:text-sm gap-2',
    lg: 'h-10 px-4.5 text-sm gap-2',
  }[size];

  const variantStyles = {
    primary: 'bg-[#2864E8] text-white hover:bg-[#1D4ED8] active:bg-[#1542A8] shadow-xs',
    secondary:
      'bg-white text-[#172B45] border border-[#D5E5F7] hover:bg-[#EAF4FF] hover:border-blue-300 active:bg-blue-100 shadow-2xs',
    outline:
      'bg-transparent text-[#2864E8] border border-[#2864E8]/40 hover:bg-[#EAF4FF] active:bg-blue-100/50',
    ghost: 'bg-transparent text-[#627A96] hover:bg-[#EAF4FF] hover:text-[#172B45] active:bg-blue-100/40',
    danger: 'bg-[#E5484D] text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs',
  }[variant];

  return (
    <button className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} disabled={disabled} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// ==========================================
// BADGE
// ==========================================
export interface BadgeProps {
  variant?: 'healthy' | 'low' | 'stockout' | 'transit' | 'neutral' | 'primary';
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  showDot = true,
  className = '',
  size = 'md',
}) => {
  const styles = {
    healthy: {
      bg: 'bg-emerald-50 text-[#159B68] border-emerald-200/80',
      dot: 'bg-[#159B68]',
    },
    low: {
      bg: 'bg-amber-50 text-[#D99A13] border-amber-200/80',
      dot: 'bg-[#D99A13]',
    },
    stockout: {
      bg: 'bg-rose-50 text-[#E5484D] border-rose-200/80',
      dot: 'bg-[#E5484D]',
    },
    transit: {
      bg: 'bg-sky-50 text-sky-700 border-sky-200/80',
      dot: 'bg-sky-600',
    },
    neutral: {
      bg: 'bg-[#EAF4FF] text-[#627A96] border-[#D5E5F7]',
      dot: 'bg-[#627A96]',
    },
    primary: {
      bg: 'bg-[#EAF4FF] text-[#2864E8] border-blue-200',
      dot: 'bg-[#2864E8]',
    },
  }[variant];

  const sizeClass = size === 'sm' ? 'h-5 px-2 text-[10px]' : 'h-5.5 px-2.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClass} ${styles.bg} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />}
      {children}
    </span>
  );
};

// ==========================================
// CARD
// ==========================================
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ elevated = false, children, className = '', ...props }) => {
  const shadowStyle = elevated
    ? 'shadow-[0_4px_12px_-2px_rgba(37,99,235,0.08),0_2px_4px_-2px_rgba(37,99,235,0.04)]'
    : 'shadow-[0_1px_3px_0_rgba(37,99,235,0.04)]';

  return (
    <div className={`bg-white border border-[#D5E5F7] rounded-xl ${shadowStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

// ==========================================
// KPI / SUMMARY CARD (Compact, Clean Business Layout)
// ==========================================
export interface KPICardProps {
  title: string;
  value: string | number;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'critical' | 'healthy' | 'warning';
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  delta,
  deltaType = 'positive',
  subtext,
  icon,
  variant = 'default',
  className = '',
}) => {
  const accentBorder = {
    default: 'border-[#D5E5F7]',
    critical: 'border-l-3 border-l-[#E5484D] border-y-[#D5E5F7] border-r-[#D5E5F7]',
    healthy: 'border-l-3 border-l-[#159B68] border-y-[#D5E5F7] border-r-[#D5E5F7]',
    warning: 'border-l-3 border-l-[#D99A13] border-y-[#D5E5F7] border-r-[#D5E5F7]',
  }[variant];

  return (
    <div
      className={`bg-white p-3.5 sm:p-4 rounded-xl border ${accentBorder} shadow-[0_1px_3px_0_rgba(37,99,235,0.04)] transition-all duration-150 hover:shadow-[0_4px_12px_rgba(37,99,235,0.08)] hover:border-blue-300 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[11px] font-semibold text-[#627A96] tracking-wider uppercase truncate">{title}</span>
        {icon && <div className="text-[#2864E8] p-1.5 rounded-lg bg-[#EAF4FF] shrink-0">{icon}</div>}
      </div>

      <div className="text-xl sm:text-2xl font-bold text-[#172B45] tabular-nums tracking-tight leading-none my-1">
        {value}
      </div>

      {(delta || subtext) && (
        <div className="flex items-center gap-1.5 mt-2 text-[11px]">
          {delta && (
            <span
              className={`inline-flex items-center font-medium ${
                deltaType === 'positive'
                  ? 'text-[#159B68]'
                  : deltaType === 'negative'
                  ? 'text-[#E5484D]'
                  : 'text-[#627A96]'
              }`}
            >
              {deltaType === 'positive' && <TrendingUp className="w-3 h-3 mr-0.5" />}
              {deltaType === 'negative' && <TrendingDown className="w-3 h-3 mr-0.5" />}
              {delta}
            </span>
          )}
          {subtext && <span className="text-[#627A96] truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};

// ==========================================
// SEARCH INPUT
// ==========================================
export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-2.5 w-3.5 h-3.5 text-[#627A96] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-8.5 pl-8 pr-7 bg-white border border-[#D5E5F7] rounded-lg text-xs text-[#172B45] placeholder-[#627A96] focus:outline-none focus:border-[#2864E8] focus:ring-2 focus:ring-[#2864E8]/15 transition-all"
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 p-0.5 text-[#627A96] hover:text-[#172B45] rounded transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

// ==========================================
// MODAL
// ==========================================
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
}) => {
  if (!isOpen) return null;

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 modal-backdrop transition-opacity animate-fade-in" onClick={onClose} />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${widthClass} bg-white rounded-xl border border-[#D5E5F7] shadow-xl z-10 animate-slide-up overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D5E5F7] bg-[#F0F7FF]/80">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#172B45]">{title}</h3>
            {subtitle && <p className="text-xs text-[#627A96] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#627A96] hover:text-[#172B45] hover:bg-[#EAF4FF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[calc(85vh-120px)] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#D5E5F7] bg-[#F0F7FF]/80">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// DRAWER
// ==========================================
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'lg',
}) => {
  if (!isOpen) return null;

  const widthClass = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[width];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 modal-backdrop transition-opacity animate-fade-in" onClick={onClose} />

      {/* Drawer Panel */}
      <div
        className={`relative w-full ${widthClass} h-full bg-white border-l border-[#D5E5F7] shadow-2xl z-10 animate-slide-left flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D5E5F7] bg-[#F0F7FF]/80">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#172B45]">{title}</h3>
            {subtitle && <p className="text-xs text-[#627A96] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#627A96] hover:text-[#172B45] hover:bg-[#EAF4FF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// ==========================================
// ALERT BANNER
// ==========================================
export interface AlertBannerProps {
  variant?: 'critical' | 'warning' | 'healthy' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = 'info',
  title,
  message,
  onDismiss,
  action,
  className = '',
}) => {
  const styles = {
    critical: {
      bg: 'bg-rose-50/90 border-rose-200 text-[#E5484D]',
      icon: <XCircle className="w-4 h-4 text-[#E5484D] shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50/90 border-amber-200 text-[#D99A13]',
      icon: <AlertTriangle className="w-4 h-4 text-[#D99A13] shrink-0" />,
    },
    healthy: {
      bg: 'bg-emerald-50/90 border-emerald-200 text-[#159B68]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#159B68] shrink-0" />,
    },
    info: {
      bg: 'bg-[#EAF4FF] border-blue-200 text-[#2864E8]',
      icon: <Info className="w-4 h-4 text-[#2864E8] shrink-0" />,
    },
  }[variant];

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs sm:text-sm leading-relaxed ${styles.bg} ${className}`}
    >
      <div className="mt-0.5">{styles.icon}</div>
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <p>{message}</p>
        {action && <div className="mt-1.5">{action}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded text-current opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// ==========================================
// EMPTY STATE
// ==========================================
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-[#D5E5F7] rounded-xl bg-white">
      {icon ? (
        <div className="p-2.5 bg-[#EAF4FF] text-[#2864E8] rounded-full mb-2.5">{icon}</div>
      ) : (
        <div className="p-2.5 bg-[#EAF4FF] text-[#2864E8] rounded-full mb-2.5">
          <Info className="w-5 h-5" />
        </div>
      )}
      <h4 className="text-sm sm:text-base font-semibold text-[#172B45] mb-0.5">{title}</h4>
      <p className="text-xs text-[#627A96] max-w-sm mb-3">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

// ==========================================
// PAGINATION COMPONENT
// ==========================================
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-[#D5E5F7] bg-white rounded-b-xl text-xs text-[#627A96]">
      <div>
        {totalItems !== undefined ? (
          <span>
            Showing page <strong className="text-[#172B45]">{currentPage}</strong> of{' '}
            <strong className="text-[#172B45]">{totalPages || 1}</strong> ({totalItems} items)
          </span>
        ) : (
          <span>
            Page <strong className="text-[#172B45]">{currentPage}</strong> of{' '}
            <strong className="text-[#172B45]">{totalPages || 1}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-2.5 py-1 rounded-md border border-[#D5E5F7] bg-white text-[#172B45] text-xs font-medium hover:bg-[#EAF4FF] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1 rounded-md border border-[#D5E5F7] bg-white text-[#172B45] text-xs font-medium hover:bg-[#EAF4FF] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// TABS
// ==========================================
export interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex border-b border-[#D5E5F7] gap-4 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pb-2 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'border-[#2864E8] text-[#2864E8] font-semibold'
                : 'border-transparent text-[#627A96] hover:text-[#172B45] hover:border-blue-300'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-semibold ${
                  isActive ? 'bg-[#EAF4FF] text-[#2864E8]' : 'bg-[#EAF4FF]/60 text-[#627A96]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
