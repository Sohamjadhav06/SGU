import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Card, Button, Badge } from '../common/UIComponents';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { StockWisePage } from '../../types/stockwise';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    setCurrentPage,
  } = useStockWise();

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredNotifications = notifications.filter((n) => {
    const matchSev = filterSeverity === 'all' || n.severity === filterSeverity;
    const matchCat = filterCategory === 'all' || n.category === filterCategory;
    return matchSev && matchCat;
  });

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight flex items-center gap-2">
            <span>Notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-100 text-[#E5484D] font-bold tabular-nums">
                {unreadNotificationsCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Operational exceptions, stockout warnings, shipment departures, and optimization solver completion events.
          </p>
        </div>

        {unreadNotificationsCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllNotificationsRead}
            icon={<CheckCheck className="w-3.5 h-3.5 text-[#2864E8]" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Card className="p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'critical', 'warning', 'info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-[#627A96] hover:bg-slate-200'
              }`}
            >
              {sev === 'all' ? 'All Alerts' : sev}
            </button>
          ))}
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((n) => (
          <Card
            key={n.id}
            className={`p-4 transition-all ${
              !n.read ? 'bg-[#E4F1FF] border-blue-200' : 'bg-white hover:border-[#D5E5F7]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {n.severity === 'critical' ? (
                    <div className="p-1.5 rounded-full bg-rose-100 text-rose-600">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-full bg-blue-100 text-[#2864E8]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-[#172B45] truncate">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#627A96] leading-relaxed">{n.message}</p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{n.timestamp}</span>
                    </span>
                    <span>·</span>
                    <span className="uppercase font-semibold tracking-wider text-[10px] text-[#627A96]">
                      {n.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {n.linkPage && (
                  <button
                    onClick={() => {
                      if (n.linkPage) setCurrentPage(n.linkPage as StockWisePage);
                      markNotificationRead(n.id);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2864E8] hover:underline cursor-pointer"
                  >
                    <span>{n.actionLabel || 'View'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {!n.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markNotificationRead(n.id)}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="p-8 text-center text-xs text-[#627A96] border border-dashed border-[#D5E5F7] rounded-xl bg-white">
            No notifications found under the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
