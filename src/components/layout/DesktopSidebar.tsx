import React, { useState } from 'react';
import { useDailyGuide, ActiveTabType } from '../../context/GuideContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  Heart, 
  BarChart3, 
  CalendarDays, 
  FileText, 
  Settings, 
  Moon, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Sparkles,
  Play,
  Pause
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    plan, 
    prayerState, 
    openGlobalQuickAction,
    isSimulatingTime,
    currentTime
  } = useDailyGuide();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const isWorking = plan?.workdaySession?.isWorkTimerRunning;
  const completedDesigns = plan?.workdaySession?.designs.filter(d => d.status === 'done').length || 0;
  const nextPrayer = prayerState?.prayers.find(p => !p.isCompleted);

  const mainNavItems: { id: ActiveTabType; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'now', label: 'الرئيسية (يومي)', icon: LayoutDashboard },
    { 
      id: 'work', 
      label: 'الشغل (Work Hub)', 
      icon: Briefcase,
      badge: isWorking ? 'يعمل' : `${completedDesigns}/4`
    },
    { id: 'events', label: 'الأحداث (Events)', icon: Calendar },
    { id: 'habits', label: 'العادات (Habits)', icon: Heart },
    { id: 'analytics', label: 'التحليلات (Analytics)', icon: BarChart3 },
    { id: 'calendar', label: 'التقويم (Calendar)', icon: CalendarDays },
    { id: 'notes', label: 'الملاحظات (Notes)', icon: FileText },
    { id: 'settings', label: 'الإعدادات (Settings)', icon: Settings },
  ];

  const secondaryNavItems: { id: ActiveTabType; label: string; icon: React.ElementType }[] = [
    { id: 'sleep', label: 'سجل النوم (Sleep)', icon: Moon },
    { id: 'plan', label: 'الخط الزمني (Timeline)', icon: Clock },
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col shrink-0 bg-white border-l border-stone-200/90 transition-all duration-300 select-none z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand & App Title */}
      <div className="h-16 px-4 border-b border-stone-100 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              م
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-sm text-stone-900 truncate">مرشدك اليومي</h1>
              <p className="text-[10px] text-stone-500 truncate font-mono">Personal Daily Guide</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
            م
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Global Quick Action Button */}
      <div className="p-3 border-b border-stone-100">
        <button
          onClick={openGlobalQuickAction}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition shadow-xs ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="إجراء سريع (Quick Action)"
        >
          <Plus className="w-4 h-4 shrink-0 text-emerald-400" />
          {!isCollapsed && <span>إجراء سريع</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* Primary Sections */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              الأقسام الأساسية
            </div>
          )}

          {mainNavItems.map(item => {
            const Icon = item.icon;
            // Match tab (also support aliases 'personal' as 'habits', 'understand' as 'analytics')
            const isActive = 
              activeTab === item.id || 
              (item.id === 'habits' && activeTab === 'personal') ||
              (item.id === 'analytics' && activeTab === 'understand');

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                {!isCollapsed && (
                  <span className="truncate text-right flex-1">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : item.badge === 'يعمل'
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Shortcuts (Sleep & Timeline) */}
        <div className="space-y-1 pt-2 border-t border-stone-100">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              أدوات مساعدة
            </div>
          )}

          {secondaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-stone-100 text-stone-900 font-bold'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

      </div>

      {/* Sidebar Footer Status */}
      {!isCollapsed && (
        <div className="p-3 border-t border-stone-100 bg-stone-50/50 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
            <span>الوقت: {currentTime}</span>
            {nextPrayer && <span>القادمة: {nextPrayer.name}</span>}
          </div>
        </div>
      )}
    </aside>
  );
};
