import React, { useState } from 'react';
import { useDailyGuide } from '../../../context/GuideContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  ShieldCheck,
  CalendarDays,
  Info
} from 'lucide-react';
import { LifeEvent } from '../../../types/guide';

export const CalendarHub: React.FC = () => {
  const { events, openAddEventModal, openEditEventModal } = useDailyGuide();
  
  // Current view month & selected day
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNamesArabic = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Selected date events
  const selectedEvents = events.filter(e => e.date === selectedDateStr);

  // Helper to format ISO date string
  const formatDateKey = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Determine if a day is an official work day (Sunday to Thursday: 0, 1, 2, 3, 4)
  const isWorkDay = (dayOfWeek: number) => dayOfWeek >= 0 && dayOfWeek <= 4;

  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <CalendarDays className="w-4 h-4 text-emerald-600" />
            <span>التقويم الشامل (Calendar)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            مواعيد المعهد، أيام العمل، والأحداث
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            رؤية موحدة لالتزاماتك الثابتة والمرنة دون مفاجآت أو تعارضات.
          </p>
        </div>

        <button
          onClick={openAddEventModal}
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة حدث جديد</span>
        </button>
      </div>

      {/* Main Grid: Calendar Grid (2 cols) & Day Details (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Month Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="font-bold text-base text-stone-900">
              {monthNamesArabic[month]} {year}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 transition"
                title="الشهر السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-bold border border-stone-200 rounded-lg hover:bg-stone-100 text-stone-700 transition"
              >
                اليوم
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 transition"
                title="الشهر القادم"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-500 py-1 border-b border-stone-100">
            {dayNames.map((d, i) => (
              <div key={d} className={i === 5 || i === 6 ? 'text-stone-400' : 'text-stone-700'}>
                {d}
              </div>
            ))}
          </div>

          {/* Days cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty slots for start offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[85px] rounded-xl bg-stone-50/40 opacity-40" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = formatDateKey(dayNum);
              const dayOfWeek = (firstDayIndex + i) % 7;
              const isSelected = dateKey === selectedDateStr;
              const isToday = dateKey === new Date().toISOString().split('T')[0];
              const dayEvents = events.filter(e => e.date === dateKey);
              const isOfficialWork = isWorkDay(dayOfWeek);
              const hasInstitute = dayEvents.some(e => e.type === 'institute' || e.title.includes('معهد'));

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDateStr(dateKey)}
                  className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-xl border text-right flex flex-col justify-between transition relative ${
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : isToday
                      ? 'border-emerald-500 bg-emerald-50/30 text-stone-900'
                      : 'border-stone-200 hover:border-stone-300 bg-white text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold font-mono ${
                      isSelected ? 'text-white' : isToday ? 'text-emerald-700' : 'text-stone-800'
                    }`}>
                      {dayNum}
                    </span>
                    {isOfficialWork && (
                      <span className={`text-[9px] px-1 rounded font-medium ${
                        isSelected ? 'bg-white/20 text-white' : 'text-stone-400 bg-stone-100'
                      }`}>
                        عمل
                      </span>
                    )}
                  </div>

                  {/* Indicators */}
                  <div className="space-y-1 w-full mt-1">
                    {hasInstitute && (
                      <div className={`text-[10px] truncate px-1 rounded flex items-center gap-1 font-bold ${
                        isSelected ? 'bg-purple-800 text-purple-100' : 'bg-purple-50 text-purple-700'
                      }`}>
                        <GraduationCap className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">المعهد</span>
                      </div>
                    )}

                    {dayEvents.filter(e => e.type !== 'institute' && !e.title.includes('معهد')).slice(0, 1).map(ev => (
                      <div
                        key={ev.id}
                        className={`text-[9px] truncate px-1 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>مواعيد المعهد</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>اليوم الحالي / أهداف منجزة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <span>أيام العمل الرسمية (الأحد - الخميس)</span>
            </div>
          </div>

        </div>

        {/* Selected Day Details Panel */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="space-y-0.5">
              <span className="text-[11px] text-stone-500 font-bold">تفاصيل اليوم المختار</span>
              <h3 className="font-bold text-stone-900 text-base font-mono">
                {selectedDateStr}
              </h3>
            </div>
            <button
              onClick={openAddEventModal}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 transition"
              title="إضافة حدث لهذا اليوم"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Events list for selected date */}
          <div className="space-y-2.5">
            {selectedEvents.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs space-y-2">
                <Info className="w-6 h-6 mx-auto opacity-50" />
                <p>لا توجد أحداث أو التزامات ثابتة مسجلة في هذا اليوم.</p>
                <p className="text-[11px] text-stone-500">يمكنك جدولة موعد أو تركه مفتوحاً.</p>
              </div>
            ) : (
              selectedEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => openEditEventModal(event)}
                  className="p-3.5 rounded-xl border border-stone-200/90 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50 transition cursor-pointer space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{event.title}</span>
                    <span className="font-mono text-stone-500 text-[11px]">
                      {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.prepMinutes && (
                    <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
                      يحتاج تحضير وانتقال: {event.prepMinutes} دقيقة قبل الموعد
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Context Card */}
          <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-600">
            <span className="font-bold text-stone-800">حالة اليوم في النظام:</span>
            <ul className="space-y-1 text-[11px] text-stone-500 list-disc list-inside">
              <li>نظام العمل الأساسي: 4 تصميمات يومية.</li>
              <li>المرونة محفوظة في حال وجود مشاوير المعهد أو ارتباطات عائلية.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
