import React from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { 
  X, 
  Briefcase, 
  Clock, 
  Compass, 
  Calendar, 
  FileText, 
  Heart, 
  ShieldCheck, 
  Play, 
  Pause,
  Plus
} from 'lucide-react';

export const GlobalQuickActionModal: React.FC = () => {
  const { 
    isGlobalQuickActionOpen, 
    closeGlobalQuickAction,
    plan,
    startWorkday,
    endWorkday,
    openAddEventModal,
    openCheckinModal,
    openSuhailaModal,
    openRecoveryModal,
    openAddNoteModal,
    prayerState,
    togglePrayer,
    setActiveTab
  } = useDailyGuide();

  if (!isGlobalQuickActionOpen) return null;

  const isWorking = plan?.workdaySession?.isWorkTimerRunning;
  const nextUnprayed = prayerState?.prayers.find(p => !p.isCompleted);

  const handleWorkToggle = async () => {
    if (isWorking) {
      await endWorkday();
    } else {
      await startWorkday();
    }
    closeGlobalQuickAction();
  };

  const handleAction = (cb: () => void) => {
    closeGlobalQuickAction();
    cb();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-stone-500">وصول سريع فوري</span>
            <h2 className="text-lg font-black text-stone-900">إجراءات سريعة (Quick Actions)</h2>
          </div>
          <button
            onClick={closeGlobalQuickAction}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* 1. Work Session Toggle */}
          <button
            onClick={handleWorkToggle}
            className={`p-3.5 rounded-2xl border text-right transition flex flex-col justify-between h-24 ${
              isWorking
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Briefcase className={`w-4 h-4 ${isWorking ? 'text-emerald-400' : 'text-stone-600'}`} />
              {isWorking ? (
                <Pause className="w-3.5 h-3.5 text-white animate-pulse" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="font-bold text-xs">{isWorking ? 'إيقاف موقت الشغل' : 'بدء جلسة عمل'}</div>
              <div className="text-[10px] opacity-75 font-mono">
                {plan?.workdaySession?.designs.filter(d => d.status === 'done').length || 0} / 4 مكتملة
              </div>
            </div>
          </button>

          {/* 2. Log Activity (Reality) */}
          <button
            onClick={() => handleAction(openCheckinModal)}
            className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-right transition flex flex-col justify-between h-24"
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <div>
              <div className="font-bold text-xs">تسجيل نشاط فوري</div>
              <div className="text-[10px] text-stone-500">توثيق ما حدث الآن</div>
            </div>
          </button>

          {/* 3. Log Next Prayer */}
          {nextUnprayed ? (
            <button
              onClick={() => handleAction(() => togglePrayer(nextUnprayed.id))}
              className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-right transition flex flex-col justify-between h-24"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="font-bold text-xs">صليت {nextUnprayed.name}</div>
                <div className="text-[10px] text-stone-500 font-mono">{nextUnprayed.time} ✓ تسجيل</div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => handleAction(() => setActiveTab('now'))}
              className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-right transition flex flex-col justify-between h-24"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="font-bold text-xs">الصلوات مكتملة</div>
                <div className="text-[10px] text-emerald-700">5 / 5 صلوات ✓</div>
              </div>
            </button>
          )}

          {/* 4. Add Event */}
          <button
            onClick={() => handleAction(openAddEventModal)}
            className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-right transition flex flex-col justify-between h-24"
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <div>
              <div className="font-bold text-xs">إضافة حدث / موعد</div>
              <div className="text-[10px] text-stone-500">معهد، موعد، خروجة</div>
            </div>
          </button>

          {/* 5. Add Note */}
          <button
            onClick={() => handleAction(() => setActiveTab('notes'))}
            className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-right transition flex flex-col justify-between h-24"
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <div>
              <div className="font-bold text-xs">تدوين ملاحظة</div>
              <div className="text-[10px] text-stone-500">خاطرة أو فكرة سريعة</div>
            </div>
          </button>

          {/* 6. Suhaila Focused Time */}
          <button
            onClick={() => handleAction(openSuhailaModal)}
            className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-right transition flex flex-col justify-between h-24"
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <div>
              <div className="font-bold text-xs">وقت مع سهيلة</div>
              <div className="text-[10px] text-stone-500">تسجيل الوقت الصافي</div>
            </div>
          </button>

        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-stone-400">
          كل الإجراءات تتصل بنفس قاعدة البيانات وتحدث شاشة «يومي» والتحليلات فوراً.
        </div>
      </div>
    </div>
  );
};
