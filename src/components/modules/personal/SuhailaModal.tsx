import React, { useState } from 'react';
import { useDailyGuide } from '../../../context/GuideContext';
import { X, Heart, Clock, Sparkles } from 'lucide-react';

export const SuhailaModal: React.FC = () => {
  const { isSuhailaModalOpen, closeSuhailaModal, logSuhaila } = useDailyGuide();

  const [totalHours, setTotalHours] = useState(1);
  const [totalMins, setTotalMins] = useState(30);
  const [focusedHours, setFocusedHours] = useState(0);
  const [focusedMins, setFocusedMins] = useState(45);
  const [notes, setNotes] = useState('');

  if (!isSuhailaModalOpen) return null;

  const totalCalculated = totalHours * 60 + totalMins;
  const focusedCalculated = focusedHours * 60 + focusedMins;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCalculated <= 0) return;

    // Focused time cannot exceed total time
    const finalFocused = Math.min(focusedCalculated, totalCalculated);

    await logSuhaila({
      date: new Date().toISOString().split('T')[0],
      totalMinutes: totalCalculated,
      focusedMinutes: finalFocused,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    closeSuhailaModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-rose-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">تسجيل وقت التواصل مع سهيلة</h2>
              <p className="text-xs text-stone-600">نشاط إنساني مهم، بدون تقييم أو درجات أو حكم</p>
            </div>
          </div>
          <button
            onClick={closeSuhailaModal}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Total Time */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>إجمالي وقت التواصل (Total Time):</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">ساعات</label>
                <select
                  value={totalHours}
                  onChange={(e) => setTotalHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                >
                  {[0, 1, 2, 3, 4, 5, 6].map(h => (
                    <option key={h} value={h}>{h} س</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">دقائق</label>
                <select
                  value={totalMins}
                  onChange={(e) => setTotalMins(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                    <option key={m} value={m}>{m} دقيقة</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Focused Time */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>الوقت الصافي الحقيقي (Focused Time):</span>
              </label>
              <span className="text-[10px] text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200 font-medium">
                بدون تشتت أو سوشيال
              </span>
            </div>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              الوقت الذي كنت فيه متواصلاً معها فعلياً وبحضور ذهني كامل، بدون التنقل بين TikTok أو Instagram في نفس الوقت.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-stone-600 block mb-1">ساعات صافية</label>
                <select
                  value={focusedHours}
                  onChange={(e) => setFocusedHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                >
                  {[0, 1, 2, 3, 4, 5].map(h => (
                    <option key={h} value={h}>{h} س</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-stone-600 block mb-1">دقائق صافية</label>
                <select
                  value={focusedMins}
                  onChange={(e) => setFocusedMins(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                    <option key={m} value={m}>{m} دقيقة</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-[10px] text-amber-800/80 pt-1">
              * باقي الوقت لا يعني أنه سيئ، بل هو تواصل طبيعي أثناء أمور أخرى.
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">
              ملاحظة لطيفة (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: حكينا عن تفاصيل اليوم والشغل بروقان..."
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={closeSuhailaModal}
              className="px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition"
            >
              تسجيل الوقت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
