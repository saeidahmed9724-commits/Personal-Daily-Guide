import React from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { LifeEvent, EventType } from '../../types/guide';
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  Edit2, 
  GraduationCap, 
  Coffee, 
  Briefcase, 
  AlertCircle, 
  Users, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const EventsHub: React.FC = () => {
  const { 
    events, 
    openAddEventModal, 
    openEditEventModal, 
    currentTime, 
    updateEvent 
  } = useDailyGuide();

  const todayStr = new Date().toISOString().split('T')[0];

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'institute':
        return <GraduationCap className="w-4 h-4 text-indigo-600" />;
      case 'outing':
        return <Coffee className="w-4 h-4 text-emerald-600" />;
      case 'meeting':
      case 'work':
        return <Briefcase className="w-4 h-4 text-stone-700" />;
      case 'important_deadline':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'personal':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <Calendar className="w-4 h-4 text-stone-600" />;
    }
  };

  const getEventTypeBadge = (type: EventType) => {
    switch (type) {
      case 'institute':
        return { label: 'معهد', bg: 'bg-indigo-50 border-indigo-200 text-indigo-800' };
      case 'appointment':
        return { label: 'موعد', bg: 'bg-sky-50 border-sky-200 text-sky-800' };
      case 'meeting':
        return { label: 'اجتماع', bg: 'bg-stone-100 border-stone-200 text-stone-800' };
      case 'outing':
        return { label: 'خروجة', bg: 'bg-emerald-50 border-emerald-200 text-emerald-800' };
      case 'important_deadline':
        return { label: 'تسليم نهائي', bg: 'bg-red-50 border-red-200 text-red-800' };
      case 'personal':
        return { label: 'شخصي', bg: 'bg-purple-50 border-purple-200 text-purple-800' };
      case 'work':
        return { label: 'شغل', bg: 'bg-amber-50 border-amber-200 text-amber-800' };
      default:
        return { label: 'حدث', bg: 'bg-stone-100 border-stone-200 text-stone-700' };
    }
  };

  // Group events
  const todayEvents = events.filter(e => e.date === todayStr);
  const futureEvents = events.filter(e => e.date > todayStr);
  const pastEvents = events.filter(e => e.date < todayStr);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-stone-400">
              سياق الأحداث والمواعيد
            </span>
            <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
              Events Hub
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            الأحداث والمواعيد الخارجية
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xl">
            الأحداث ليست قيوداً صارمة تعيد بناء يومك قسراً، بل هي <span className="font-semibold text-stone-800">سياق حيوي</span> يساعد المرشد اليومي على تقديم اقتراحات ذكية ومريحة تناسب طاقتك.
          </p>
        </div>

        <button
          onClick={openAddEventModal}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة حدث جديد</span>
        </button>
      </div>

      {/* Guide Context Awareness Note */}
      <div className="bg-indigo-50/70 border border-indigo-200/70 rounded-2xl p-4 text-xs text-indigo-950 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">تأثير الـ Events على المرشد اليومي (Daily Guide Context)</div>
          <p className="text-indigo-900/80 leading-relaxed">
            إذا كان لديك معهد صباح الغد (مثلاً 9:00 ص) والوقت الحالي متأخر، سيوصيك المرشد بهدوء بإنهاء جلسة العمل والتهيئة للنوم دون لوم. وإذا اقترب موعد عيادة أو خروجة، سينبهك قبلها بوقت كافٍ لتجنب الدخول في جلسات تصميم معقدة تنقطع فجأة.
          </p>
        </div>
      </div>

      {/* Today's Events */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <span>أحداث اليوم ({todayStr})</span>
            <span className="text-xs bg-stone-200/80 text-stone-700 px-2 py-0.5 rounded-full font-mono font-normal">
              {todayEvents.length}
            </span>
          </h3>
        </div>

        {todayEvents.length === 0 ? (
          <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl p-6 text-center text-xs text-stone-600">
            لا توجد أحداث أو مواعيد مسجلة لليوم. يومك صافٍ بالكامل للعمل والروتين الهادئ.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todayEvents.map(event => {
              const badge = getEventTypeBadge(event.type);
              const isPast = event.endTime ? event.endTime < currentTime : event.startTime < currentTime;

              return (
                <div 
                  key={event.id}
                  className={`bg-white border rounded-xl p-4 shadow-2xs space-y-3 transition ${
                    isPast ? 'border-stone-200/60 opacity-80' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                        {getEventIcon(event.type)}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm leading-snug">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badge.bg}`}>
                            {badge.label}
                          </span>
                          {event.location && (
                            <span className="text-[11px] text-stone-500 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span>{event.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openEditEventModal(event)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                      title="تعديل الحدث"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-stone-50/80 rounded-lg p-2.5 text-xs text-stone-600 flex items-center justify-between font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{event.startTime}</span>
                      {event.endTime && <span>→ {event.endTime}</span>}
                    </div>

                    {event.prepMinutes && (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-sans font-medium">
                        تحضير: {event.prepMinutes} د
                      </span>
                    )}
                  </div>

                  {event.notes && (
                    <p className="text-xs text-stone-600 border-t border-stone-100 pt-2 leading-relaxed">
                      {event.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-stone-100/80 text-[11px]">
                    <span className="text-stone-600">
                      {isPast ? 'انقضى وقت الحدث' : 'حدث نشط يؤثر على المرشد'}
                    </span>
                    <button
                      onClick={() => updateEvent(event.id, { isCompleted: !event.isCompleted })}
                      className={`flex items-center gap-1 font-medium transition ${
                        event.isCompleted ? 'text-emerald-700' : 'text-stone-600 hover:text-stone-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{event.isCompleted ? 'تم إنجازه' : 'تعليم كمكتمل'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming / Future Events */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <span>المواعيد القادمة (أيام مقبلة)</span>
          <span className="text-xs bg-stone-200/80 text-stone-700 px-2 py-0.5 rounded-full font-mono font-normal">
            {futureEvents.length}
          </span>
        </h3>

        {futureEvents.length === 0 ? (
          <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl p-5 text-center text-xs text-stone-600">
            لا توجد مواعيد مستقبلية مجدولة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {futureEvents.map(event => {
              const badge = getEventTypeBadge(event.type);
              return (
                <div 
                  key={event.id}
                  className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-3 hover:border-stone-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                        {getEventIcon(event.type)}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm leading-snug">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-stone-600">
                            📅 {event.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openEditEventModal(event)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                      title="تعديل الحدث"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-stone-50/80 rounded-lg p-2.5 text-xs text-stone-600 flex items-center justify-between font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{event.startTime}</span>
                      {event.endTime && <span>→ {event.endTime}</span>}
                    </div>

                    {event.location && (
                      <span className="text-[11px] text-stone-600 font-sans flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{event.location}</span>
                      </span>
                    )}
                  </div>

                  {event.notes && (
                    <p className="text-xs text-stone-600 border-t border-stone-100 pt-2 leading-relaxed">
                      {event.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <details className="bg-stone-50/80 border border-stone-200/80 rounded-xl p-3.5 text-xs text-stone-600">
          <summary className="font-bold text-stone-700 cursor-pointer">
            أرشيف المواعيد السابقة ({pastEvents.length})
          </summary>
          <div className="space-y-2 mt-3 pt-2 border-t border-stone-200">
            {pastEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between py-1 border-b border-stone-100 last:border-0">
                <span className="font-medium text-stone-800">{event.title}</span>
                <span className="font-mono text-stone-600">{event.date} · {event.startTime}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};
