import React, { useState, useEffect } from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { LifeEvent, EventType } from '../../types/guide';
import { X, Calendar, Clock, MapPin, Tag, FileText, Trash2 } from 'lucide-react';

export const EventModal: React.FC = () => {
  const { 
    isEventModalOpen, 
    editingEvent, 
    closeEventModal, 
    addEvent, 
    updateEvent, 
    deleteEvent 
  } = useDailyGuide();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [type, setType] = useState<EventType>('appointment');
  const [location, setLocation] = useState('');
  const [prepMinutes, setPrepMinutes] = useState(30);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDate(editingEvent.date);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime || '');
      setType(editingEvent.type);
      setLocation(editingEvent.location || '');
      setPrepMinutes(editingEvent.prepMinutes || 0);
      setNotes(editingEvent.notes || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDate(today);
      setStartTime('15:00');
      setEndTime('16:00');
      setType('appointment');
      setLocation('');
      setPrepMinutes(20);
      setNotes('');
    }
  }, [editingEvent, isEventModalOpen]);

  if (!isEventModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime) return;

    if (editingEvent) {
      await updateEvent(editingEvent.id, {
        title: title.trim(),
        date,
        startTime,
        endTime: endTime || undefined,
        type,
        location: location.trim() || undefined,
        prepMinutes: prepMinutes > 0 ? prepMinutes : undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      await addEvent({
        title: title.trim(),
        date,
        startTime,
        endTime: endTime || undefined,
        type,
        location: location.trim() || undefined,
        prepMinutes: prepMinutes > 0 ? prepMinutes : undefined,
        notes: notes.trim() || undefined,
        isCompleted: false,
      });
    }

    closeEventModal();
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    await deleteEvent(editingEvent.id);
    closeEventModal();
  };

  const eventTypeOptions: { type: EventType; label: string }[] = [
    { type: 'institute', label: 'معهد (مشوار صباحي/دراسي)' },
    { type: 'appointment', label: 'موعد (عيادة، مصلحة، حجز)' },
    { type: 'meeting', label: 'اجتماع عمل أو مكالمة مهمة' },
    { type: 'outing', label: 'خروجة (أصدقاء، ترفيه، ممشى)' },
    { type: 'important_deadline', label: 'موعد تسليم نهائي مهم (Deadline)' },
    { type: 'personal', label: 'حدث شخصي / عائلي' },
    { type: 'work', label: 'حدث متعلق بالشغل' },
    { type: 'custom', label: 'حدث مخصص آخر' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100 bg-stone-50/50">
          <div>
            <h3 className="font-bold text-stone-950 text-base">
              {editingEvent ? 'تعديل الحدث' : 'إضافة حدث جديد (Event)'}
            </h3>
            <p className="text-xs text-stone-600">
              الأحداث توفر سياقاً مهماً للمرشد اليومي للتوجيه اللطيف دون صرامة
            </p>
          </div>
          <button
            onClick={closeEventModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              عنوان الحدث <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: محاضرة المعهد، موعد دكتور، خروجة مع سهيلة..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span>نوع الحدث</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
            >
              {eventTypeOptions.map(opt => (
                <option key={opt.type} value={opt.type}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-400" />
                <span>التاريخ</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>وقت البدء</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm font-mono bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>وقت الانتهاء (اختياري)</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm font-mono bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Location & Prep */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>المكان (اختياري)</span>
              </label>
              <input
                type="text"
                placeholder="مثال: المعهد، العيادة، كافيه..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                مدة التحضير / المشوار (بالدقائق)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={prepMinutes}
                onChange={(e) => setPrepMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-stone-400" />
              <span>ملاحظة إضافية (سياق شخصي)</span>
            </label>
            <textarea
              rows={2}
              placeholder="مثال: مشوار خفيف مع الأصحاب، أو محاضرة تتطلب تجهيز ملفات..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-hidden resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            {editingEvent ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الحدث</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeEventModal}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition shadow-xs"
              >
                {editingEvent ? 'حفظ التعديلات' : 'إضافة الحدث'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
