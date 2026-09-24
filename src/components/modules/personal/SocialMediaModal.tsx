import React, { useState } from 'react';
import { useDailyGuide } from '../../../context/GuideContext';
import { SocialPlatform } from '../../../types/guide';
import { X, Smartphone, Clock, Compass, Sparkles } from 'lucide-react';
import { personalLifeService } from '../../../services/personalLifeService';

export const SocialMediaModal: React.FC = () => {
  const { isSocialMediaModalOpen, closeSocialMediaModal, logSocialMedia, currentTime } = useDailyGuide();

  const [platform, setPlatform] = useState<SocialPlatform>('tiktok');
  const [startTime, setStartTime] = useState(() => {
    // Default 30 min before current time
    const [h, m] = currentTime.split(':').map(Number);
    const total = h * 60 + m - 30;
    const norm = (total + 1440) % 1440;
    return `${String(Math.floor(norm / 60)).padStart(2, '0')}:${String(norm % 60).padStart(2, '0')}`;
  });
  const [endTime, setEndTime] = useState(currentTime);
  const [mode, setMode] = useState<'automatic' | 'intentional'>('automatic');
  const [notes, setNotes] = useState('');

  if (!isSocialMediaModalOpen) return null;

  const durationMinutes = personalLifeService.calculateMinutes(startTime, endTime) || 30;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (durationMinutes <= 0) return;

    await logSocialMedia({
      date: new Date().toISOString().split('T')[0],
      platform,
      startTime,
      endTime,
      durationMinutes,
      mode,
      notes: notes.trim() || undefined,
    });

    closeSocialMediaModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-200 text-stone-800">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">تسجيل جلسة سوشيال ميديا</h2>
              <p className="text-xs text-stone-600">فهم نمط الوقت بوعي، بدون لوم أو مسميات "فشل"</p>
            </div>
          </div>
          <button
            onClick={closeSocialMediaModal}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Platform Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">المنصة (Platform)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlatform('tiktok')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  platform === 'tiktok'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                <span>TikTok</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform('instagram')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  platform === 'instagram'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                <span>Instagram</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform('other')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  platform === 'other'
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                <span>منصة أخرى</span>
              </button>
            </div>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">وقت البدء</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">وقت الانتهاء</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <span className="text-stone-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              المدة المحسوبة:
            </span>
            <span className="font-bold font-mono text-stone-900 text-sm">
              {personalLifeService.formatDuration(durationMinutes)}
            </span>
          </div>

          {/* Mode: Intentional vs Automatic */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-stone-800">طبيعة التصفح (Scrolling Mode)</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('automatic')}
                className={`p-3 rounded-xl border text-right transition ${
                  mode === 'automatic'
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Compass className="w-3.5 h-3.5 text-amber-700" />
                  <span>تلقائي / غير واعي</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Scrolling تلقائي بدون هدف محدد أو وقت ملل
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('intentional')}
                className={`p-3 rounded-xl border text-right transition ${
                  mode === 'intentional'
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>مقصود وواعي</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  متابعة مصممين، رد على رسائل، بحث محدد
                </div>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">ملاحظة (اختياري)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: استراحة خفيفة بين التصميمات..."
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={closeSocialMediaModal}
              className="px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-stone-900 hover:bg-black rounded-xl shadow-xs transition"
            >
              تسجيل السوشيال
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
