import React from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { PrayerId, PrayerItem } from '../../types/guide';
import { Compass, Check, Clock3, Moon, Sun, Sunrise, Sunset } from 'lucide-react';

interface PrayerAnchorCardProps {
  compact?: boolean;
}

export const PrayerAnchorCard: React.FC<PrayerAnchorCardProps> = ({ compact = false }) => {
  const { prayerState, togglePrayer } = useDailyGuide();

  if (!prayerState) return null;

  const { prayers, nextPrayer, completedCount } = prayerState;

  const prayerIcons: Record<PrayerId, React.ReactNode> = {
    fajr: <Sunrise className="w-4 h-4" />,
    dhuhr: <Sun className="w-4 h-4" />,
    asr: <Sun className="w-4 h-4 text-amber-500" />,
    maghrib: <Sunset className="w-4 h-4 text-orange-500" />,
    isha: <Moon className="w-4 h-4 text-indigo-500" />,
  };

  const isApproaching = nextPrayer.minutesRemaining <= 45;

  if (compact) {
    return (
      <div className="bg-stone-50/80 border border-stone-200/80 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-stone-700">
            <Compass className="w-3.5 h-3.5 text-stone-500" />
            <span>مرساة الصلاة:</span>
            <span className="text-stone-900 font-semibold">{nextPrayer.name}</span>
            <span className="font-mono text-stone-500">({nextPrayer.time})</span>
          </div>
          <span className="text-[11px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200 font-medium">
            {isApproaching 
              ? `متبقي ${nextPrayer.minutesRemaining} دقيقة` 
              : `${completedCount}/5 صلوات`}
          </span>
        </div>

        {/* Quick toggles row */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {prayers.map((p) => {
            const isNext = p.id === nextPrayer.id;
            return (
              <button
                key={p.id}
                onClick={() => togglePrayer(p.id)}
                className={`py-1.5 px-1 rounded-lg text-center transition flex flex-col items-center justify-center gap-0.5 border ${
                  p.isCompleted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : isNext
                    ? 'bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-300/60'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
                title={`تسجيل / إلغاء ${p.name}`}
              >
                <div className="flex items-center gap-0.5 text-[11px] font-bold">
                  {p.name}
                  {p.isCompleted && <Check className="w-3 h-3 text-emerald-800" />}
                </div>
                <span className="font-mono text-[10px] text-stone-500">{p.time}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-950 text-sm">مرساة الصلاة (Daily Anchor)</h3>
            <p className="text-xs text-stone-600">محطة هدوء وسكينة غير خاضعة لأي تقييم إنتاجي أو لوم</p>
          </div>
        </div>

        <div className="text-left">
          <span className="text-xs font-medium text-stone-600">
            تمت: <span className="font-bold text-stone-900">{completedCount}</span> من 5
          </span>
        </div>
      </div>

      {/* Next Prayer Highlight Banner */}
      <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
        isApproaching
          ? 'bg-amber-50/80 border-amber-200 text-amber-950'
          : 'bg-stone-50 border-stone-200/80 text-stone-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white border border-stone-200/60 shadow-2xs">
            {prayerIcons[nextPrayer.id]}
          </div>
          <div>
            <div className="text-xs text-stone-600 font-medium">الصلاة القادمة</div>
            <div className="text-base font-bold flex items-center gap-2">
              <span>{nextPrayer.name}</span>
              <span className="font-mono text-sm font-semibold text-stone-600">({nextPrayer.time})</span>
            </div>
          </div>
        </div>

        <div className="text-left font-mono">
          <div className="text-xs text-stone-600">الوقت المتبقي</div>
          <div className="text-sm font-bold text-stone-900 flex items-center gap-1 justify-end">
            <Clock3 className="w-3.5 h-3.5 text-stone-500" />
            <span>{nextPrayer.minutesRemaining} دقيقة</span>
          </div>
        </div>
      </div>

      {/* 5 Prayers Interactive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {prayers.map((p) => {
          const isNext = p.id === nextPrayer.id;
          return (
            <button
              key={p.id}
              onClick={() => togglePrayer(p.id)}
              className={`p-3 rounded-xl border text-right transition flex flex-col justify-between h-24 ${
                p.isCompleted
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs'
                  : isNext
                  ? 'bg-amber-50/60 border-amber-300 text-amber-950 ring-2 ring-amber-300/40'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-stone-900">{p.name}</span>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  p.isCompleted 
                    ? 'bg-emerald-600 text-white font-bold' 
                    : 'bg-stone-100 text-stone-400 border border-stone-200'
                }`}>
                  {p.isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : '—'}
                </span>
              </div>

              <div>
                <div className="font-mono text-xs text-stone-600 font-semibold">{p.time}</div>
                <div className="text-[10px] text-stone-600 mt-0.5">
                  {p.isCompleted 
                    ? (p.completedAt ? `صُليت ${p.completedAt}` : 'تمت ✓') 
                    : isNext 
                    ? 'القادمة' 
                    : 'تسجيل سريع'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 flex items-center justify-between">
        <span>📍 سواء صليت في البيت أو في شقة الشغل، الصلاة مجرد نقطة ارتكاز ليومك وليست رقماً للمحاسبة.</span>
        <span className="text-[10px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200 font-mono">
          Mock Timings
        </span>
      </div>
    </div>
  );
};
