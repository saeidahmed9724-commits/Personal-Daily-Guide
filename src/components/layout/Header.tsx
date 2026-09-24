import React from 'react';
import { useDailyGuide, ActiveTabType } from '../../context/GuideContext';
import { Compass, Clock, PlusCircle, Layers } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentTime, 
    setSimulatedTime, 
    isSimulatingTime, 
    resetToRealTime,
    openArchitectureModal,
    openGlobalQuickAction
  } = useDailyGuide();

  const sectionTitles: Record<string, string> = {
    now: 'الرئيسية (يومي)',
    work: 'الشغل (Work Hub)',
    habits: 'العادات والحياة (Habits)',
    personal: 'العادات والحياة (Habits)',
    events: 'الأحداث (Events)',
    analytics: 'التحليلات (Analytics)',
    understand: 'التحليلات (Analytics)',
    calendar: 'التقويم (Calendar)',
    notes: 'الملاحظات (Notes)',
    settings: 'الإعدادات (Settings)',
    sleep: 'سجل النوم (Sleep)',
    plan: 'الخط الزمني (Timeline)',
    record: 'التوثيق الواقعي (Reality)',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand / Active Section */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <button 
              onClick={() => setActiveTab('now')}
              className="text-base font-black tracking-tight text-stone-900 hover:text-stone-700 transition-colors text-right"
            >
              مرشدك اليومي
            </button>
            <div className="text-[11px] text-stone-500 font-medium hidden sm:block">
              {sectionTitles[activeTab] || 'الرئيسية'}
            </div>
          </div>
        </div>

        {/* Zone 2: Time Simulation & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Simulation / Real-time selector */}
          <div className="flex items-center gap-1.5 text-xs text-stone-700 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200/80">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <input
              type="time"
              value={currentTime}
              onChange={(e) => setSimulatedTime(e.target.value)}
              className="bg-transparent font-mono text-stone-900 text-xs font-bold focus:outline-hidden cursor-pointer"
              title="تعديل الوقت لتجربة استجابة المرشد في أوقات مختلفة"
            />
            {isSimulatingTime ? (
              <button
                onClick={resetToRealTime}
                className="text-[10px] font-bold text-stone-500 hover:text-stone-900 border-r border-stone-300 pr-1.5 mr-0.5"
                title="العودة للوقت الحقيقي للجهاز"
              >
                الآن
              </button>
            ) : (
              <span className="text-[10px] text-emerald-600 font-bold border-r border-stone-300 pr-1.5 mr-0.5">
                حي
              </span>
            )}
          </div>

          {/* Global Quick Action Button */}
          <button
            onClick={openGlobalQuickAction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-stone-900 hover:bg-black rounded-xl transition shadow-xs whitespace-nowrap min-h-[36px]"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>إجراء سريع</span>
          </button>

          {/* Architecture & Roadmap Modal */}
          <button
            onClick={openArchitectureModal}
            title="هندسة النظام ومخطط البيانات"
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition border border-stone-200/80"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
