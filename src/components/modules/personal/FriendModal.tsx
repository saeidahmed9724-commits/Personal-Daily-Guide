import React, { useState } from 'react';
import { useDailyGuide } from '../../../context/GuideContext';
import { X, Users, Coffee, Phone, Footprints, Gamepad2, Compass } from 'lucide-react';

export const FriendModal: React.FC = () => {
  const { isFriendModalOpen, closeFriendModal, logFriendActivity } = useDailyGuide();

  const [friendName, setFriendName] = useState('Khaled (خالد)');
  const [activityType, setActivityType] = useState<'outing' | 'call' | 'visit' | 'coffee_walk' | 'gaming' | 'other'>('coffee_walk');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');

  if (!isFriendModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim() || durationMinutes <= 0) return;

    await logFriendActivity({
      date: new Date().toISOString().split('T')[0],
      friendName: friendName.trim(),
      activityType,
      durationMinutes,
      notes: notes.trim() || undefined,
    });

    closeFriendModal();
  };

  const typesList = [
    { id: 'coffee_walk', label: 'قهوة أو مشية', icon: Coffee },
    { id: 'call', label: 'مكالمة تليفون', icon: Phone },
    { id: 'outing', label: 'خروجة / مشوار', icon: Footprints },
    { id: 'visit', label: 'قعدة / زيارة', icon: Users },
    { id: 'gaming', label: 'لعب / جيمنج', icon: Gamepad2 },
    { id: 'other', label: 'نشاط آخر', icon: Compass },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-sky-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">نشاط مع الأصدقاء</h2>
              <p className="text-xs text-stone-600">نشاط غير دوري يسجل عند حدوثه بمرونة</p>
            </div>
          </div>
          <button
            onClick={closeFriendModal}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Friend Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">الصديق / المجموعة</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="مثال: Khaled (خالد)"
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                required
              />
              <button
                type="button"
                onClick={() => setFriendName('Khaled (خالد)')}
                className="px-3 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium shrink-0"
              >
                خالد
              </button>
            </div>
          </div>

          {/* Activity Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">نوع النشاط</label>
            <div className="grid grid-cols-3 gap-2">
              {typesList.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActivityType(t.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                      activityType === t.id
                        ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">المدة التقريبية</label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90, 120, 180].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                    durationMinutes === mins
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {mins >= 60 ? `${mins / 60} س` : `${mins} دقيقة`}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">ملاحظة (اختياري)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: حكينا عن أفكار مشاريع جديدة وقضينا وقت رايق..."
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={closeFriendModal}
              className="px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-xl shadow-xs transition"
            >
              تسجيل النشاط
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
