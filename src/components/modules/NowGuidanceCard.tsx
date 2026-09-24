import React from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { CATEGORY_LABELS, MOOD_LABELS } from '../../services/guideEngine';
import { MoodType } from '../../types/guide';
import { PrayerAnchorCard } from './PrayerAnchorCard';
import { personalLifeService } from '../../services/personalLifeService';
import { DecisionEngineScenariosBar } from './DecisionEngineScenariosBar';
import { 
  Sparkles, 
  BatteryCharging, 
  ArrowLeft, 
  Check, 
  SlidersHorizontal, 
  Smile, 
  Clock3,
  Sun,
  Compass,
  Calendar,
  Briefcase,
  Heart,
  ShieldCheck
} from 'lucide-react';

export const NowGuidanceCard: React.FC = () => {
  const { 
    live, 
    plan, 
    personalState,
    setActiveTab,
    currentEnergy, 
    setEnergy, 
    currentMood, 
    setMood, 
    openAdaptModal, 
    toggleBlockComplete,
    openCheckinModal,
    endOngoingActivity,
    currentTime 
  } = useDailyGuide();

  if (!live || !plan) return null;

  const { 
    activeBlock, 
    nextStep, 
    status, 
    eventsContext, 
    prayerContext, 
    sleepContext,
    currentState,
    currentStateLabel,
    currentStateDescription,
    nextAction,
    contextTips,
    adaptedFromReality
  } = live;

  const currentAction = nextAction || nextStep;

  const STATE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    not_started_day: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200', dot: 'bg-stone-400' },
    starting_day: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
    preparing_for_work: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', dot: 'bg-sky-500' },
    work_time: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-600' },
    work_in_progress: { bg: 'bg-emerald-100/90', text: 'text-emerald-900', border: 'border-emerald-300', dot: 'bg-emerald-600 animate-pulse' },
    work_target_completed: { bg: 'bg-teal-50', text: 'text-teal-900', border: 'border-teal-300', dot: 'bg-teal-600' },
    personal_time: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', dot: 'bg-rose-500' },
    event_soon: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300', dot: 'bg-amber-600 animate-ping' },
    prayer_soon: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    preparing_for_tomorrow: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-500' },
    day_ending: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300', dot: 'bg-stone-500' },
    unknown_state: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200', dot: 'bg-stone-400' },
  };

  const stateStyle = STATE_STYLES[currentState || 'unknown_state'] || STATE_STYLES.unknown_state;

  const handleCtaClick = () => {
    if (currentAction.actionCta) {
      if (currentAction.actionCta.actionType === 'log_activity') {
        openCheckinModal();
      } else if (currentAction.actionCta.targetTab) {
        if (currentAction.actionCta.targetTab === 'dashboard') {
          setActiveTab('now');
        } else {
          setActiveTab(currentAction.actionCta.targetTab);
        }
      }
    }
  };

  const energyLevels: { level: 1 | 2 | 3 | 4 | 5; label: string }[] = [
    { level: 1, label: 'مستنزف' },
    { level: 2, label: 'منخفض' },
    { level: 3, label: 'معتدل' },
    { level: 4, label: 'جيد' },
    { level: 5, label: 'عالٍ جداً' },
  ];

  const moods: { id: MoodType; label: string }[] = [
    { id: 'calm', label: 'هادئ' },
    { id: 'focused', label: 'مركز' },
    { id: 'distracted', label: 'مشتت' },
    { id: 'tired', label: 'مرهق' },
    { id: 'energized', label: 'نشيط' },
  ];

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* 1. Header: The Central Question & Status */}
      <div className="border-b border-stone-100 pb-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums text-stone-900 font-bold text-sm bg-stone-100 px-2 py-0.5 rounded">
              {live.simulatedOrRealTime}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-800 font-medium">المرشد اليومي الذكي</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Current State Badge */}
            <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${stateStyle.bg} ${stateStyle.text} ${stateStyle.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stateStyle.dot}`} />
              <span>{currentStateLabel || 'الحالة الحالية'}</span>
            </span>

            {adaptedFromReality && (
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full font-medium">
                تكييف مع الواقع
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-stone-400 flex items-center gap-1">
              <span>السياق الحي</span>
              {currentStateDescription && (
                <span className="font-normal text-stone-500">({currentStateDescription})</span>
              )}
            </span>
            <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
              المرحلة: {live.currentPhase.label}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center justify-between">
            <span>دلوقتي أعمل إيه؟</span>
            {activeBlock && (
              <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${CATEGORY_LABELS[activeBlock.category].bg} ${CATEGORY_LABELS[activeBlock.category].text}`}>
                {CATEGORY_LABELS[activeBlock.category].label}
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* 2. Integrated Context Engine Strip (سياق اليوم المتكامل: نوم + صلاة + أحداث + شغل) */}
      <div className="bg-stone-50/90 border border-stone-200/80 rounded-xl p-3 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
          <span>سياق اتخاذ القرار (Context Engine)</span>
          <span className="text-stone-400 font-normal">توجيه اقتراحي غير إلزامي</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
          {/* Wake Context */}
          <div className="bg-white p-2 rounded-lg border border-stone-200/60">
            <div className="text-[10px] text-stone-500 font-sans flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-500" />
              <span>الاستيقاظ:</span>
            </div>
            <div className="font-bold text-stone-900 mt-0.5">
              {sleepContext?.actualWakeTime || '12:18'}
              <span className="text-[10px] font-sans font-normal text-stone-500 mr-1">(الهدف 12:00)</span>
            </div>
          </div>

          {/* Work Progress */}
          <div className="bg-white p-2 rounded-lg border border-stone-200/60">
            <div className="text-[10px] text-stone-500 font-sans flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-stone-500" />
              <span>الشغل والرصيد:</span>
            </div>
            <div className="font-bold text-stone-900 mt-0.5">
              {plan.productionCredit.todayCompletedDesigns}/{plan.productionCredit.dailyBaseTarget} منجز
              <span className="text-[10px] font-sans font-semibold text-emerald-700 mr-1">
                (+{plan.productionCredit.totalCreditBalance})
              </span>
            </div>
          </div>

          {/* Prayer Anchor */}
          <div className="bg-white p-2 rounded-lg border border-stone-200/60">
            <div className="text-[10px] text-stone-500 font-sans flex items-center gap-1">
              <Compass className="w-3 h-3 text-stone-500" />
              <span>مرساة الصلاة:</span>
            </div>
            <div className="font-bold text-stone-900 mt-0.5 truncate">
              {prayerContext?.nextPrayer ? `${prayerContext.nextPrayer.name} (${prayerContext.nextPrayer.time})` : '—'}
            </div>
          </div>

          {/* Events Awareness */}
          <div className="bg-white p-2 rounded-lg border border-stone-200/60">
            <div className="text-[10px] text-stone-500 font-sans flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-500" />
              <span>الأحداث القريبة:</span>
            </div>
            <div className="font-bold text-stone-900 mt-0.5 truncate font-sans text-[11px]">
              {eventsContext?.upcomingTodayEvent 
                ? `${eventsContext.upcomingTodayEvent.title} (${eventsContext.upcomingTodayEvent.startTime})`
                : eventsContext?.tomorrowMorningEvents && eventsContext.tomorrowMorningEvents.length > 0
                ? `${eventsContext.tomorrowMorningEvents[0].title} غداً 9 ص`
                : 'لا توجد مواعيد عاجلة'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Fixed Event Context Awareness Banner (if an event is coming soon) */}
      {live.upcomingFixedEvent && live.minutesUntilNextEvent !== null && live.minutesUntilNextEvent <= 90 && (
        <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              حدث قادم: {live.upcomingFixedEvent.title}
            </span>
            <span className="font-mono tabular-nums text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              بعد {live.minutesUntilNextEvent} دقيقة
            </span>
          </div>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            {live.upcomingFixedEvent.location ? `المكان: ${live.upcomingFixedEvent.location} · ` : ''}
            توجيه اليوم يأخذ هذا الموعد في الحسبان حتى لا تبدأ عملاً شاقاً وتضطر لقطعه بعجلة.
          </p>
        </div>
      )}

      {/* 4. Active Reality & Current Activity Status */}
      <div className={`p-4 rounded-xl border transition-all ${
        live.currentActivity.isIdentified
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-stone-50 border-stone-200 text-stone-800'
      }`}>
        {live.currentActivity.isIdentified ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">
                  النشاط الفعلي الحالي
                </span>
                <span className="text-xs font-mono text-emerald-800">
                  منذ {live.currentActivity.startedAt}
                </span>
              </div>
              <h4 className="text-sm font-bold text-emerald-950 mt-1">
                {live.currentActivity.title}
              </h4>
              {live.currentActivity.durationMinutesSoFar !== undefined && (
                <p className="text-xs text-emerald-800 mt-0.5">
                  مستمر منذ قرابة {live.currentActivity.durationMinutesSoFar} دقيقة
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {live.currentActivity.activeRecordId && (
                <button
                  onClick={() => endOngoingActivity(live.currentActivity.activeRecordId!, currentTime)}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors shadow-2xs"
                >
                  إنهاء النشاط
                </button>
              )}
              <button
                onClick={openCheckinModal}
                className="px-2.5 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
              >
                تسجيل نشاط جديد
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-stone-500">
                  النشاط الفعلي الآن: <strong className="text-stone-800 font-bold">غير محدد</strong>
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {activeBlock 
                  ? `حسب الخطة: وقت ${activeBlock.title} (${activeBlock.startTime} - ${activeBlock.endTime})` 
                  : 'لا يوجد نشاط مسجل كـ Ongoing حالياً. النظام لا يفترض ما تفعله.'}
              </p>
            </div>
            <button
              onClick={openCheckinModal}
              className="text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 transition-colors shrink-0"
            >
              + تسجيل ما تفعله الآن
            </button>
          </div>
        )}
      </div>

      {/* 5. The Compass: Next Step Guidance (The Heart of the System - Suggestion, Not Command) */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <Sparkles className="w-4 h-4" />
            <span>اقتراح المرشد (Suggestion, Not Command)</span>
            {currentAction.priorityLevel && (
              <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded font-mono font-normal">
                أولوية #{currentAction.priorityLevel}
              </span>
            )}
          </div>
          <span className="text-[11px] text-stone-400 font-mono tabular-nums">
            ~{currentAction.suggestedDurationMinutes} دقيقة
          </span>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-1">
            {currentAction.title}
          </h3>
          
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
            {currentAction.tagline}
          </p>
        </div>

        <div className="pt-2.5 border-t border-stone-800 text-xs text-stone-400 space-y-1">
          <p className="leading-relaxed">
            <span className="text-stone-300 font-medium">السبب: </span>
            {currentAction.rationale}
          </p>
          <p className="text-emerald-300/90 italic pt-0.5 text-[11px]">
            {currentAction.reassuranceNote}
          </p>
        </div>

        {/* Action CTA Button if available */}
        {currentAction.actionCta && (
          <div className="pt-2">
            <button
              onClick={handleCtaClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
            >
              <span>{currentAction.actionCta.label}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 5.5 Context Tips Strip (Secondary Deterministic Insights) */}
      {contextTips && contextTips.length > 0 && (
        <div className="bg-stone-50 border border-stone-200/70 rounded-xl p-3 text-xs space-y-1.5">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            ملاحظات السياق الذكية (Context Insights)
          </div>
          <div className="space-y-1">
            {contextTips.map(tip => (
              <div 
                key={tip.id} 
                className={`text-[11px] flex items-start gap-1.5 py-0.5 leading-relaxed ${
                  tip.severity === 'highlight' ? 'text-amber-900 font-semibold' : 'text-stone-600'
                }`}
              >
                <span className="text-emerald-600 mt-0.5 font-bold">›</span>
                <span>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Quick Prayer Anchor Mini Bar */}
      <PrayerAnchorCard compact={true} />

      {/* 6.5 Personal Life Context Mini Indicator */}
      {personalState && (
        <div className="flex items-center justify-between text-[11px] bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 text-rose-700 font-medium">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              <span>سهيلة: {personalLifeService.calculateSuhailaSummary(personalState.todaySuhailaLogs).totalFormatted}</span>
              {personalState.todaySuhailaLogs.length > 0 && (
                <span className="text-[10px] text-stone-500">
                  (صافي: {personalLifeService.calculateSuhailaSummary(personalState.todaySuhailaLogs).focusedFormatted})
                </span>
              )}
            </span>
            <span className="text-stone-300">·</span>
            <span className="flex items-center gap-1 text-emerald-800 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{personalState.todayRecovery?.status === 'clean' ? 'يوم نظيف ✓' : 'التعافي والوعي'}</span>
            </span>
          </div>
          <button
            onClick={() => setActiveTab('personal')}
            className="text-stone-600 hover:text-stone-900 font-bold transition flex items-center gap-0.5 text-[11px]"
          >
            <span>العادات</span>
            <ArrowLeft className="w-2.5 h-2.5 text-stone-400" />
          </button>
        </div>
      )}

      {/* 7. Real-time Energy & Mood Check (How am I feeling right now?) */}
      <div className="pt-2 border-t border-stone-100 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-800 flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-stone-500" />
            طاقتك الآن: <span className="text-stone-600 font-normal">{energyLevels.find(e => e.level === currentEnergy)?.label}</span>
          </span>
          <span className="text-stone-500 text-[11px]">يساعد النظام على مواءمة وتيرة المقترحات</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {energyLevels.map((lvl) => {
            const isSelected = currentEnergy === lvl.level;
            return (
              <button
                key={lvl.level}
                onClick={() => setEnergy(lvl.level)}
                className={`py-2 px-1 text-center rounded-lg border text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200/80 hover:bg-stone-100'
                }`}
              >
                <div className="font-mono font-bold text-sm">{lvl.level}</div>
                <div className="text-[10px] truncate">{lvl.label}</div>
              </button>
            );
          })}
        </div>

        {/* Mood Selector */}
        <div className="pt-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-stone-500 shrink-0 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-stone-400" />
            الحالة:
          </span>
          <div className="flex items-center gap-1">
            {moods.map(m => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
                  currentMood === m.id
                    ? 'bg-stone-200 text-stone-900 font-medium'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 8. Adapt Trigger */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
        <span className="text-stone-500">
          هل حدث ما غيّر مجرى اليوم؟
        </span>
        <button
          onClick={openAdaptModal}
          className="flex items-center gap-1 text-stone-700 hover:text-stone-950 font-medium py-1 px-2 rounded-md hover:bg-stone-100 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
          <span>تكييف الخطة مع الواقع</span>
          <ArrowLeft className="w-3 h-3 text-stone-400" />
        </button>
      </div>

      {/* 9. Decision Engine Scenarios Playground */}
      <DecisionEngineScenariosBar />
    </div>
  );
};

