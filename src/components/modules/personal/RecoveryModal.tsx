import React, { useState } from 'react';
import { useDailyGuide } from '../../../context/GuideContext';
import { RecoveryTrigger } from '../../../types/guide';
import { X, ShieldCheck, AlertCircle, Sparkles, Building2, Home } from 'lucide-react';

export const RecoveryModal: React.FC = () => {
  const { isRecoveryModalOpen, closeRecoveryModal, recordRecovery, currentTime, personalState } = useDailyGuide();

  const currentStatus = personalState?.todayRecovery?.status || 'clean';
  const [status, setStatus] = useState<'clean' | 'relapse'>(currentStatus);
  const [trigger, setTrigger] = useState<RecoveryTrigger>('empty_time');
  const [locationContext, setLocationContext] = useState<'work_apartment' | 'home' | 'other'>('work_apartment');
  const [time, setTime] = useState(currentTime);
  const [notes, setNotes] = useState('');

  if (!isRecoveryModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'clean') {
      await recordRecovery('clean');
    } else {
      await recordRecovery(
        'relapse',
        trigger,
        locationContext,
        time,
        notes.trim() || undefined
      );
    }

    closeRecoveryModal();
  };

  const triggersList: { id: RecoveryTrigger; label: string; desc: string }[] = [
    { id: 'empty_time', label: 'وقت فارغ بدون اتجاه', desc: 'انتهاء الشغل مبكراً مع بقاء ساعات بدون خطة واضحة' },
    { id: 'boredom', label: 'ملل وركود ذهني', desc: 'حالة خمول ورغبة في محفز سريع' },
    { id: 'social_media', label: 'تصفح سوشيال لا واعي', desc: 'استمرار الـ Scrolling على TikTok أو Instagram' },
    { id: 'loneliness', label: 'وحدة وانعزال', desc: 'التواجد بمفردك لفترة طويلة بدون تواصل' },
    { id: 'staying_up_late', label: 'سهر متأخر بمفردك', desc: 'تجاوز منتصف الليل أمام الشاشات' },
    { id: 'sexual_content', label: 'محتوى مصادف على الميديا', desc: 'صورة أو فيديو ظهر فجأة وحرك الرغبة' },
    { id: 'other', label: 'سبب آخر', desc: 'سياق وظرف مختلف' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${status === 'clean' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-800'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">تسجيل مسار التعافي والوعي</h2>
              <p className="text-xs text-stone-600">تسجيل بسيط بدون تفاصيل حساسة، بهدف فهم الأنماط وليس لوم النفس</p>
            </div>
          </div>
          <button
            onClick={closeRecoveryModal}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Main Status Choice */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus('clean')}
              className={`p-4 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                status === 'clean'
                  ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/30 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                ✓
              </div>
              <div className="font-bold text-sm text-stone-900">Clean Day (يوم نظيف)</div>
              <div className="text-[11px] text-stone-500">
                يوم مستقر، متحكم في وقتك وطاقتك
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatus('relapse')}
              className={`p-4 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                status === 'relapse'
                  ? 'bg-stone-100 border-stone-400 text-stone-950 ring-2 ring-stone-400/30 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-stone-900">Relapse (انتكاسة)</div>
              <div className="text-[11px] text-stone-500">
                تسجيل هادئ للحدث لفهم السياق والمحفز
              </div>
            </button>
          </div>

          {/* If Relapse: Context & Trigger */}
          {status === 'relapse' ? (
            <div className="space-y-4 pt-1 animate-fadeIn">
              {/* Compassionate Reassurance Banner */}
              <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 flex items-start gap-3 text-xs text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">اليوم لم ينتهِ ولم يفشل!</div>
                  <p className="leading-relaxed opacity-90">
                    النظام لا يتعامل مع الانتكاسة كفشل لليوم. يومك مستمر بشكل طبيعي تماماً، والتسجيل هنا هدفه حمايتك في المستقبل بفهم ما حدث دون لوم.
                  </p>
                </div>
              </div>

              {/* Real Context Confirmation: Work apartment, computer & phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800">السياق والمكان (Location Context)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationContext('work_apartment')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      locationContext === 'work_apartment'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>شقة الشغل (بمفردي)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationContext('home')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      locationContext === 'home'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>البيت / الأهل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationContext('other')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      locationContext === 'other'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <span>مكان آخر</span>
                  </button>
                </div>
                <div className="text-[10px] text-stone-500 pt-0.5">
                  * تأكيد: السرير ليس هو المحفز، بل التواجد وحدك في شقة الشغل مع الشاشات ووقت فارغ.
                </div>
              </div>

              {/* Trigger */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800">المحفز التقريبي (Trigger):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {triggersList.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTrigger(t.id)}
                      className={`p-2.5 rounded-xl border text-right transition ${
                        trigger === t.id
                          ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                          : 'bg-white border-stone-200 text-stone-800 hover:border-stone-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className={`text-[10px] mt-0.5 ${trigger === t.id ? 'text-stone-300' : 'text-stone-500'}`}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time & Notes */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">الوقت التقريبي</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-mono focus:ring-1 focus:ring-stone-900 focus:outline-hidden"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">ملاحظة سريعة (اختياري)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="فهم الظرف بدون إحساس بالذنب..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
              <div className="text-xs font-bold text-emerald-950">يوم نظيف ومستقر ✓</div>
              <p className="text-xs text-emerald-800/90">
                تسجيل استقرارك اليوم هو توثيق لهدوء حياتك دون الحاجة لعد أيام أو عدادات ضاغطة.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={closeRecoveryModal}
              className="px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-xs transition ${
                status === 'clean' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-stone-900 hover:bg-black'
              }`}
            >
              تأكيد التسجيل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
