import React, { useState } from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { ACTIVITY_REGISTRY, QUICK_ACTIVITY_CHIPS } from '../../services/activityRegistry';
import { CATEGORY_LABELS } from '../../services/guideEngine';
import { ActivityType, ActualRecord, CategoryType } from '../../types/guide';
import { 
  ClipboardList, 
  Plus, 
  Clock, 
  Edit3, 
  HelpCircle, 
  CheckCircle2, 
  Compass, 
  Sparkles, 
  PieChart, 
  Layers, 
  Info,
  Check,
  StopCircle,
  ArrowLeftRight
} from 'lucide-react';

export const ActualLog: React.FC = () => {
  const { 
    plan, 
    live, 
    openCheckinModal, 
    openEditActivityModal, 
    endOngoingActivity,
    currentTime 
  } = useDailyGuide();

  const [activeView, setActiveView] = useState<'timeline' | 'comparison' | 'breakdown'>('timeline');

  if (!plan || !live) return null;

  const records = [...plan.actualRecords].sort((a, b) => a.actualStartTime.localeCompare(b.actualStartTime));

  // Helper to format time into 12-hour format (e.g., "14:07" -> "2:07 PM")
  const formatTime12h = (timeStr?: string): string => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  // Helper to format duration
  const formatDuration = (mins?: number): string => {
    if (!mins || mins <= 0) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} دقيقة`;
    if (m === 0) return `${h} ساعة`;
    return `${h} س ${m} د`;
  };

  // Aggregate time breakdown by Category
  const timeByCategory = records.reduce((acc, rec) => {
    const mins = rec.durationMinutes || 0;
    const cat = rec.category || 'unstructured';
    acc[cat] = (acc[cat] || 0) + mins;
    return acc;
  }, {} as Record<CategoryType, number>);

  const totalRecordedMinutes = Object.values(timeByCategory).reduce((sum, m) => sum + m, 0);

  // Group by high-level domains
  const domainBreakdown: { key: string; label: string; minutes: number; colorBg: string; colorBar: string }[] = [
    {
      key: 'work',
      label: 'شغل وتصميمات (Focused Work)',
      minutes: (timeByCategory['deep_work'] || 0),
      colorBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      colorBar: 'bg-emerald-600',
    },
    {
      key: 'social',
      label: 'أهل وسهيلة وأصدقاء (Social)',
      minutes: (timeByCategory['social'] || 0),
      colorBg: 'bg-rose-50 text-rose-900 border-rose-200',
      colorBar: 'bg-rose-500',
    },
    {
      key: 'rest_personal',
      label: 'وقت شخصي، روقان وراحة (Personal & Rest)',
      minutes: (timeByCategory['rest'] || 0) + (timeByCategory['unstructured'] || 0),
      colorBg: 'bg-amber-50 text-amber-900 border-amber-200',
      colorBar: 'bg-amber-500',
    },
    {
      key: 'routine_prayer',
      label: 'روتين، صحة، فطار وصلاة (Routine & Health)',
      minutes: (timeByCategory['routine'] || 0) + (timeByCategory['health'] || 0),
      colorBg: 'bg-teal-50 text-teal-900 border-teal-200',
      colorBar: 'bg-teal-600',
    },
    {
      key: 'institute',
      label: 'المعهد ودراسة (Institute)',
      minutes: (timeByCategory['institute'] || 0),
      colorBg: 'bg-violet-50 text-violet-900 border-violet-200',
      colorBar: 'bg-violet-600',
    }
  ].filter(d => d.minutes > 0);

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      {/* 1. Header with View Controls & Quick Log Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-stone-900" />
            <h3 className="font-bold text-stone-900 text-lg">سجل الواقع (Reality of the Day)</h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            أين ذهب وقتي وما الذي حدث بالفعل — لفهم الواقع بدون أي أحكام أو جلد ذات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'timeline'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              الجدول الزمني
            </button>
            <button
              onClick={() => setActiveView('comparison')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'comparison'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              الخطة vs الواقع
            </button>
            <button
              onClick={() => setActiveView('breakdown')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'breakdown'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              أين ذهب وقتي؟
            </button>
          </div>

          <button
            onClick={openCheckinModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>تسجيل نشاط</span>
          </button>
        </div>
      </div>

      {/* 2. Top Banner: Current Activity Indicator (Strictly Honest, No False Assumptions) */}
      <div className={`p-4 rounded-xl border transition-all ${
        live.currentActivity.isIdentified
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-stone-50 border-stone-200/80 text-stone-800'
      }`}>
        {live.currentActivity.isIdentified ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-lg mt-0.5 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-md">
                    النشاط الحالي المؤكد
                  </span>
                  <span className="text-xs text-emerald-800 font-mono">
                    بدأ الساعة {live.currentActivity.startedAt ? formatTime12h(live.currentActivity.startedAt) : currentTime}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-emerald-950 mt-1">
                  {live.currentActivity.title}
                </h4>
                {live.currentActivity.durationMinutesSoFar !== undefined && (
                  <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                    مستمر منذ قرابة {live.currentActivity.durationMinutesSoFar} دقيقة
                  </p>
                )}
              </div>
            </div>

            {live.currentActivity.activeRecordId && (
              <button
                onClick={() => endOngoingActivity(live.currentActivity.activeRecordId!, currentTime)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
              >
                <StopCircle className="w-4 h-4" />
                <span>إنهاء النشاط الآن</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-stone-200 text-stone-700 rounded-lg mt-0.5">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-stone-500">
                    الحالة الحالية: <strong className="text-stone-800 font-bold">غير محددة</strong>
                  </span>
                  <span className="text-[10px] text-stone-400">·</span>
                  <span className="text-[11px] text-stone-500">النظام لا يفترض أنك تفعل شيئاً لمجرد مرور الوقت</span>
                </div>
                {live.currentActivity.suggestedFromPlan ? (
                  <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                    حسب خطتك المحددة لليوم: هذا وقت <span className="font-bold text-stone-900 underline decoration-stone-300 underline-offset-4">{live.currentActivity.suggestedFromPlan.blockTitle}</span> ({live.currentActivity.suggestedFromPlan.plannedTimeRange}).
                  </p>
                ) : (
                  <p className="text-xs text-stone-600 mt-1">
                    لم تسجل نشاطاً جارياً في هذه اللحظة.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={openCheckinModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-stone-600" />
              <span>تسجيل ما تفعله الآن بضغطة زر</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Quick Log Chips Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
          <span>تسجيل فوري بلمسة واحدة:</span>
          <span className="text-[10px] text-stone-400">يفتح التسجيل معبأً مسبقاً</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {QUICK_ACTIVITY_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={openCheckinModal}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-950 border border-stone-200/80 rounded-lg text-xs transition-colors"
            >
              <Plus className="w-3 h-3 text-stone-400" />
              <span>{chip.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. VIEW 1: THE REALITY TIMELINE (Detailed Sequential Stream) */}
      {activeView === 'timeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
            <span>تسلسل ما حدث فعلياً بالترتيب الزمني:</span>
            <span>{records.length} أحداث مسجلة</span>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-3 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
              <ClipboardList className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm font-medium">لم تسجل أي أحداث واقعية اليوم حتى الآن.</p>
              <button
                onClick={openCheckinModal}
                className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-xs"
              >
                تسجيل أول نشاط (مثال: الاستيقاظ)
              </button>
            </div>
          ) : (
            <div className="relative border-r-2 border-stone-200 mr-3 sm:mr-4 pr-4 sm:pr-6 space-y-4">
              {records.map((rec) => {
                const meta = ACTIVITY_REGISTRY[rec.activityType || 'other'] || ACTIVITY_REGISTRY.other;
                const Icon = meta.icon;
                const formattedStart = formatTime12h(rec.actualStartTime);
                const formattedEnd = rec.actualEndTime ? formatTime12h(rec.actualEndTime) : undefined;

                return (
                  <div key={rec.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className="absolute -right-[23px] sm:-right-[31px] top-4 w-3.5 h-3.5 rounded-full bg-white border-2 border-stone-900 group-hover:scale-125 transition-transform" />

                    {/* Event Card */}
                    <div className="p-3.5 sm:p-4 rounded-xl border border-stone-200/90 bg-white hover:border-stone-300 transition-all shadow-2xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Time & Activity Badge */}
                        <div className="flex items-center flex-wrap gap-2 text-xs">
                          {/* Time display in 12h format */}
                          <div className="flex items-center gap-1 font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-stone-500" />
                            <span>
                              {rec.isPointInTime ? (
                                `${formattedStart} (لحظة / حدث)`
                              ) : rec.isOngoing ? (
                                `${formattedStart} → مستمر الآن`
                              ) : (
                                `${formattedStart} → ${formattedEnd}`
                              )}
                            </span>
                          </div>

                          {/* Activity Tag */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${meta.badgeBg} ${meta.badgeText}`}>
                            <Icon className="w-3 h-3" />
                            <span>{meta.label}</span>
                          </span>

                          {/* Duration Tag */}
                          {rec.durationMinutes !== undefined && rec.durationMinutes > 0 && (
                            <span className="text-[11px] font-mono text-stone-600 bg-stone-50 border border-stone-200 px-1.5 py-0.5 rounded">
                              {formatDuration(rec.durationMinutes)}
                            </span>
                          )}

                          {/* Ongoing Badge */}
                          {rec.isOngoing && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                              جارٍ الآن
                            </span>
                          )}
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditActivityModal(rec)}
                          className="opacity-80 group-hover:opacity-100 text-stone-400 hover:text-stone-900 p-1 hover:bg-stone-100 rounded-md transition-all self-end sm:self-auto"
                          title="تعديل التسجيل والوقت"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title & Notes */}
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">
                          {rec.title}
                        </h4>
                        {rec.notes && (
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed bg-stone-50/60 p-2 rounded-lg border border-stone-100">
                            {rec.notes}
                          </p>
                        )}
                      </div>

                      {/* Plan vs Reality Context Pill */}
                      {rec.wasPlanned && rec.plannedStartTime && (
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                          <span className="text-stone-400">الخطة:</span>
                          <span className="font-mono text-stone-700">{formatTime12h(rec.plannedStartTime)}</span>
                          {rec.driftMinutes !== undefined && (
                            <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                              rec.driftMinutes === 0
                                ? 'bg-emerald-50 text-emerald-800'
                                : rec.driftMinutes > 0
                                ? 'bg-stone-100 text-stone-700'
                                : 'bg-blue-50 text-blue-800'
                            }`}>
                              {rec.driftMinutes === 0
                                ? 'في نفس الموعد'
                                : rec.driftMinutes > 0
                                ? `+${rec.driftMinutes} دقيقة`
                                : `${rec.driftMinutes} دقيقة`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. VIEW 2: PLAN VS. REALITY COMPARISON (Clear Difference Without Blame) */}
      {activeView === 'comparison' && (
        <div className="space-y-4">
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-start gap-2.5">
            <ArrowLeftRight className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              المقارنة هنا ليست كشف حساب ولا محاسبة. الهدف هو معرفة الفارق بين ما تصوره عقلك في الخطة، وبين ما حدث على أرض الواقع؛ لتصبح خطط الغد أقرب لطبيعتك.
            </p>
          </div>

          <div className="space-y-3">
            {plan.blocks.map((block) => {
              // Find matching actual records for this block
              const matchedRecords = records.filter(r => r.blockId === block.id);
              const hasActual = matchedRecords.length > 0;
              const firstRecord = matchedRecords[0];

              return (
                <div 
                  key={block.id}
                  className="p-4 rounded-xl border border-stone-200/90 bg-white grid grid-cols-1 md:grid-cols-2 gap-4 items-center"
                >
                  {/* Left: What was Planned */}
                  <div className="space-y-1.5 border-b md:border-b-0 md:border-l md:border-stone-100 pb-3 md:pb-0 md:pl-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      المخطط له (Planned)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                        {formatTime12h(block.startTime)} → {formatTime12h(block.endTime)}
                      </span>
                      <span className="text-xs font-bold text-stone-900">{block.title}</span>
                    </div>
                    {block.intention && (
                      <p className="text-[11px] text-stone-500 italic">
                        "{block.intention}"
                      </p>
                    )}
                  </div>

                  {/* Right: What Actually Happened */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      ما حدث فعلياً (Actual)
                    </span>
                    {hasActual ? (
                      <div>
                        {matchedRecords.map(rec => (
                          <div key={rec.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-stone-900 bg-emerald-50 text-emerald-950 border border-emerald-200 px-2 py-0.5 rounded">
                                {formatTime12h(rec.actualStartTime)}
                                {rec.actualEndTime ? ` → ${formatTime12h(rec.actualEndTime)}` : ''}
                              </span>
                              <span className="font-medium text-stone-800">{rec.title}</span>
                            </div>
                            {rec.driftMinutes !== undefined && (
                              <span className="text-[11px] font-mono text-stone-500">
                                {rec.driftMinutes === 0
                                  ? 'في نفس الموعد'
                                  : rec.driftMinutes > 0
                                  ? `+${rec.driftMinutes} د`
                                  : `${rec.driftMinutes} د`}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-stone-400">
                        <span>لم يتم تسجيل نشاط مطابق لهذا البلوك</span>
                        <button
                          onClick={openCheckinModal}
                          className="text-[11px] font-medium text-stone-700 hover:text-stone-950 underline underline-offset-2"
                        >
                          + تسجيل الآن
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. VIEW 3: WHERE DID MY TIME GO? (Aggregated Breakdown) */}
      {activeView === 'breakdown' && (
        <div className="space-y-5">
          {/* Summary Header */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <span className="text-xs text-stone-500 block">إجمالي الوقت المسجل في الواقع</span>
              <div className="text-xl font-black text-stone-900 font-mono mt-0.5">
                {formatDuration(totalRecordedMinutes) || '0 دقيقة'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-500 block">تغطية اليوم</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                {records.length} أنشطة موثقة
              </span>
            </div>
          </div>

          {/* Domain Breakdown Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-700">توزيع الساعات حسب مجالات الحياة:</h4>
            {domainBreakdown.map((item) => {
              const percentage = totalRecordedMinutes > 0 
                ? Math.round((item.minutes / totalRecordedMinutes) * 100) 
                : 0;

              return (
                <div key={item.key} className="p-3.5 rounded-xl border border-stone-200/80 bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-800">{formatDuration(item.minutes)}</span>
                      <span className="font-mono text-[11px] text-stone-400">({percentage}%)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.colorBar} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Realistic Observation Note */}
          <div className="p-3.5 bg-emerald-50/40 border border-emerald-200/60 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-950">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>ملاحظة لفهم يومك:</span>
            </div>
            <p className="text-emerald-900 leading-relaxed font-medium">
              الهدف ليس أن تكون 100% من الساعات للعمل. التوازن بين ساعات الشغل الصافية (3-4 ساعات)، والوقت العائلي ومع سهيلة، والراحة هو النمط المستدام الحقيقي.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
