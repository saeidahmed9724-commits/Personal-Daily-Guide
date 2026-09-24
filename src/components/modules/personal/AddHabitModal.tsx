import React, { useState } from 'react';
import { useDailyGuide } from '../../../context/GuideContext';
import { X, CheckCircle2 } from 'lucide-react';

export const AddHabitModal: React.FC = () => {
  const { isAddHabitModalOpen, closeAddHabitModal, addHabit } = useDailyGuide();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('صحة ورعاية الجسد');
  const [description, setDescription] = useState('');

  if (!isAddHabitModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addHabit({
      title: title.trim(),
      category,
      description: description.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    closeAddHabitModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-200 text-stone-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">إضافة سلوك / عادة للملاحظة</h2>
              <p className="text-xs text-stone-600">فهم سلوكك الشخصي، بدون ألعاب أو Streaks مصطنعة</p>
            </div>
          </div>
          <button
            onClick={closeAddHabitModal}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">اسم السلوك أو العادة</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: قراءة 15 دقيقة، أو شرب 2 لتر مياه..."
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">التصنيف</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
            >
              <option value="صحة ورعاية الجسد">صحة ورعاية الجسد</option>
              <option value="بيئة العمل والتركيز">بيئة العمل والتركيز</option>
              <option value="راحة وسلام ذهني">راحة وسلام ذهني</option>
              <option value="تعلم وتطوير">تعلم وتطوير</option>
              <option value="حياة شخصية">حياة شخصية</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">توضيح بسيط (اختياري)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: الهدف ليس الضغط اليومي، بل مجرد تذكير لطيف..."
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
            💡 <strong>فلسفة النظام:</strong> لا توجد نقاط، ولا نيران تشتعل أو تنطفئ إذا فوّتت يوماً. تسجيل السلوك هدفه الملاحظة والوعي الذاتي فقط.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={closeAddHabitModal}
              className="px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-stone-900 hover:bg-black rounded-xl shadow-xs transition"
            >
              إضافة للملاحظة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
