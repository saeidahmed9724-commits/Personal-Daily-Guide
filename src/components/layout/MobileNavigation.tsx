import React, { useState } from 'react';
import { useDailyGuide, ActiveTabType } from '../../context/GuideContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  Heart, 
  Menu, 
  X, 
  BarChart3, 
  CalendarDays, 
  FileText, 
  Settings, 
  Moon, 
  Clock, 
  Plus,
  Compass
} from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    plan, 
    openGlobalQuickAction,
    prayerState
  } = useDailyGuide();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const isWorking = plan?.workdaySession?.isWorkTimerRunning;
  const completedDesigns = plan?.workdaySession?.designs.filter(d => d.status === 'done').length || 0;

  const primaryTabs: { id: ActiveTabType; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'now', label: 'الرئيسية', icon: LayoutDashboard },
    { 
      id: 'work', 
      label: 'الشغل', 
      icon: Briefcase,
      badge: isWorking ? '•' : `${completedDesigns}`
    },
    { id: 'events', label: 'الأحداث', icon: Calendar },
    { id: 'habits', label: 'العادات', icon: Heart },
  ];

  const moreItems: { id: ActiveTabType; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'analytics', label: 'التحليلات (Analytics)', icon: BarChart3, desc: 'فهم الأنماط والسلوكيات الأسبوعية' },
    { id: 'calendar', label: 'التقويم (Calendar)', icon: CalendarDays, desc: 'مواعيد المعهد وأيام العمل' },
    { id: 'notes', label: 'الملاحظات (Notes)', icon: FileText, desc: 'تدوين الأفكار وخواطر اليوم' },
    { id: 'settings', label: 'الإعدادات (Settings)', icon: Settings, desc: 'أيام العمل، أهداف النوم، والتفضيلات' },
    { id: 'sleep', label: 'سجل النوم (Sleep)', icon: Moon, desc: 'توثيق ساعات الراحة ووقت الصحو' },
    { id: 'plan', label: 'الخط الزمني (Timeline)', icon: Clock, desc: 'استعراض المسار اليومي المتكامل' },
  ];

  const handleSelectTab = (tabId: ActiveTabType) => {
    setActiveTab(tabId);
    setIsMoreMenuOpen(false);
  };

  const isMoreActive = ['analytics', 'calendar', 'notes', 'settings', 'sleep', 'plan', 'record', 'understand'].includes(activeTab);

  return (
    <>
      {/* Floating Quick Action Button on Mobile */}
      <div className="md:hidden fixed bottom-20 left-4 z-40">
        <button
          onClick={openGlobalQuickAction}
          className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg hover:bg-black transition active:scale-95"
          title="إجراء سريع"
        >
          <Plus className="w-5 h-5 text-emerald-400" />
        </button>
      </div>

      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 safe-bottom">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {primaryTabs.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'habits' && activeTab === 'personal');

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center h-full relative transition ${
                  isActive ? 'text-stone-900 font-bold' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {item.badge && (
                    <span className={`absolute -top-1 -right-2 text-[9px] font-bold font-mono px-1 rounded-full ${
                      isWorking && item.id === 'work' 
                        ? 'bg-emerald-500 text-white animate-ping' 
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 truncate">{item.label}</span>
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 bg-stone-900 rounded-full" />
                )}
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center h-full relative transition ${
              isMoreActive ? 'text-stone-900 font-bold' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1">المزيد</span>
            {isMoreActive && (
              <span className="absolute top-0 w-8 h-0.5 bg-stone-900 rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* Bottom Sheet Drawer for "More" */}
      {isMoreMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="bg-white rounded-t-3xl border-t border-stone-200 p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">الأقسام الإضافية</span>
                <h3 className="text-base font-black text-stone-900">جميع صفحات التطبيق</h3>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of extra navigation links */}
            <div className="grid grid-cols-1 gap-2.5">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`p-3.5 rounded-2xl border text-right transition flex items-center gap-3.5 ${
                      isActive
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isActive ? 'bg-white/10 text-white' : 'bg-white text-stone-700 border border-stone-200'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className={`text-[11px] truncate ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Action Button inside More menu */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  openGlobalQuickAction();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إجراء سريع (Quick Action)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
