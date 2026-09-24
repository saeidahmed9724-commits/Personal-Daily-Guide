import React, { useState, useEffect } from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { sleepService } from '../../services/sleepService';
import { X, Moon, Sun, Clock, Star, FileText, Trash2 } from 'lucide-react';

export const SleepModal: React.FC = () => {
  const { 
    isSleepModalOpen, 
    editingSleepRecord, 
    closeSleepModal, 
    recordSleep, 
    updateSleepRecord, 
    deleteSleepRecord,
    plan 
  } = useDailyGuide();

  const [date, setDate] = useState('');
  const [sleepTime, setSleepTime] = useState('03:30');
  const [wakeTime, setWakeTime] = useState('12:00');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingSleepRecord) {
      setDate(editingSleepRecord.date);
      setSleepTime(editingSleepRecord.sleepTime);
      setWakeTime(editingSleepRecord.wakeTime);
      setQuality(editingSleepRecord.quality || 4);
      setNotes(editingSleepRecord.notes || '');
    } else {
      const today = plan?.date || new Date().toISOString().split('T')[0];
      setDate(today);
      setSleepTime('03:45');
      setWakeTime(plan?.actualWakeUpTime || '12:15');
      setQuality(4);
      setNotes('');
    }
  }, [editingSleepRecord, isSleepModalOpen, plan]);

  if (!isSleepModalOpen) return null;

  const calculatedMinutes = sleepService.calculateDurationMinutes(sleepTime, wakeTime);
  const formattedDuration = sleepService.formatDuration(calculatedMinutes);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !sleepTime || !wakeTime) return;

    if (editingSleepRecord) {
      await updateSleepRecord(editingSleepRecord.id, {
        sleepTime,
        wakeTime,
        durationMinutes: calculatedMinutes,
        quality,
        notes: notes.trim() || undefined,
      });
    } else {
      await recordSleep({
        date,
        sleepTime,
        wakeTime,
        durationMinutes: calculatedMinutes,
        quality,
        notes: notes.trim() || undefined,
      });
    }

    closeSleepModal();
  };

  const handleDelete = async () => {
    if (!editingSleepRecord) return;
    await deleteSleepRecord(editingSleepRecord.id);
    closeSleepModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-950 text-base">
                {editingSleepRecord ? 'تعديل تسجيل النوم' : 'تسجيل النوم والاستيقاظ'}
              </h3>
              <p className="text-xs text-stone-600">جمع بيانات هادئ بدون لوم أو فرض مواعيد مسبقة</p>
            </div>
          </div>
          <button
            onClick={closeSleepModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              تاريخ اليوم
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
            />
          </div>

          {/* Sleep Time & Wake Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>وقت النوم</span>
              </label>
              <input
                type="time"
                required
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>وقت الاستيقاظ الفعلي</span>
              </label>
              <input
                type="time"
                required
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Computed Duration Banner */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-950">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>مدة النوم المحسوبة:</span>
            </span>
            <span className="font-bold text-sm font-mono bg-white px-2 py-0.5 rounded border border-indigo-200">
              {formattedDuration}
            </span>
          </div>

          {/* Wake target reassurance */}
          <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            🎯 <span className="font-semibold text-stone-800">الهدف المرجعي:</span> الاستيقاظ قرابة 12:00 ظهرًا. حتى لو صحيت 1:30 أو 3:00 ظهرًا، الموقع لا يعتبر اليوم فاشلاً أبداً بل يعيد مواءمة اليوم بهدوء.
          </div>

          {/* Sleep Quality Rating */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>جودة النوم والراحة</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { lvl: 1, label: 'مستنزف' },
                { lvl: 2, label: 'متقطع' },
                { lvl: 3, label: 'معتدل' },
                { lvl: 4, label: 'مريح' },
                { lvl: 5, label: 'عميق وممتاز' },
              ].map(item => (
                <button
                  key={item.lvl}
                  type="button"
                  onClick={() => setQuality(item.lvl as 1 | 2 | 3 | 4 | 5)}
                  className={`py-2 px-1 text-center rounded-lg border text-xs transition flex flex-col items-center gap-1 ${
                    quality === item.lvl
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <span className="text-amber-500 font-bold">{item.lvl} ★</span>
                  <span className="text-[10px] text-stone-500 font-normal">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-stone-400" />
              <span>ملاحظة (اختياري)</span>
            </label>
            <textarea
              rows={2}
              placeholder="مثال: نوم هادئ ومريح، أو سهر لمشاهدة شيء ثم استيقاظ رايق..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            {editingSleepRecord ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeSleepModal}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition shadow-xs"
              >
                {editingSleepRecord ? 'حفظ التعديلات' : 'تسجيل النوم'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
