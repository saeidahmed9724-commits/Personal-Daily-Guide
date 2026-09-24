/**
 * Personal Daily Guide - Guide Engine
 * The central logic that determines "Where am I right now?" and suggests a compassionate next step.
 * Completely decoupled from React UI components.
 */

import { 
  DayPlan, 
  TimeBlock, 
  LiveContextState, 
  NextStepGuidance, 
  DriftStatus, 
  CategoryType, 
  MoodType,
  DayPhase,
  DayPhaseId,
  ProductionCreditState,
  LifeEvent,
  PrayerDayState,
  SleepState,
  EventContextInfo,
  PrayerContextInfo,
  SleepContextInfo
} from '../types/guide';
import { prayerService } from './prayerService';
import { sleepService } from './sleepService';
import { DecisionEngine } from './decisionEngine';

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const CATEGORY_LABELS: Record<CategoryType, { label: string; bg: string; text: string; dot: string }> = {
  deep_work: { label: 'عمل عميق (تصميمات)', bg: 'bg-emerald-50', text: 'text-emerald-800', dot: 'bg-emerald-600' },
  learning: { label: 'تعلم وقراءة', bg: 'bg-sky-50', text: 'text-sky-800', dot: 'bg-sky-600' },
  routine: { label: 'روتين وإعداد', bg: 'bg-stone-100', text: 'text-stone-700', dot: 'bg-stone-500' },
  health: { label: 'صحة وحركة', bg: 'bg-teal-50', text: 'text-teal-800', dot: 'bg-teal-600' },
  rest: { label: 'راحة وتجديد', bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-600' },
  social: { label: 'أسرة، سهيلة، أصدقاء', bg: 'bg-rose-50', text: 'text-rose-800', dot: 'bg-rose-600' },
  institute: { label: 'مشوار المعهد (عارض)', bg: 'bg-purple-50', text: 'text-purple-800', dot: 'bg-purple-600' },
  unstructured: { label: 'وقت حر', bg: 'bg-indigo-50', text: 'text-indigo-800', dot: 'bg-indigo-600' },
};

export const MOOD_LABELS: Record<MoodType, string> = {
  calm: 'هادئ ومطمئن',
  focused: 'منغمس ومركز',
  tired: 'مجهد يحتاج شحن',
  energized: 'مفعم بالنشاط',
  distracted: 'مشتت الذهن قليلاً',
};

/**
 * حساب مرحلة اليوم الحالية بناءً على الإيقاع الواقعي
 */
export function determineDayPhase(currentMinutes: number): DayPhase {
  // 12:00 PM = 720 mins, 13:30 = 810 mins
  // 14:00 = 840 mins, 18:00 = 1080 mins
  // 21:30 = 1290 mins, 01:00 = 60 mins (next day)
  if (currentMinutes >= 720 && currentMinutes < 810) {
    return {
      id: 'waking_up',
      label: 'بداية اليوم الهادئة',
      idealWindow: '12:00 - 13:30',
      description: 'فطار، شاي، وقت طيب مع الأهل، تواصل مع سهيلة، واحتياجاتك الشخصية دون أي عجلة.',
      isCurrent: true,
    };
  }

  if (currentMinutes >= 810 && currentMinutes < 840) {
    return {
      id: 'work_prep',
      label: 'الاستعداد والتهيئة للشغل',
      idealWindow: '13:30 - 14:00',
      description: 'فتح البرامج، تجهيز مساحة العمل، وتحديد أولويات التصميمات الأربعة.',
      isCurrent: true,
    };
  }

  if (currentMinutes >= 840 && currentMinutes < 1080) {
    return {
      id: 'work_session',
      label: 'جلسة الشغل والإنتاج',
      idealWindow: '14:00 - 18:00',
      description: '3 إلى 4 ساعات من التركيز الهادئ لإنجاز هدف التصميمات اليومي (4 تصميمات).',
      isCurrent: true,
    };
  }

  if (currentMinutes >= 1080 && currentMinutes < 1290) {
    return {
      id: 'work_delivery',
      label: 'المراجعة، التسليم والإنهاء',
      idealWindow: '18:00 - 21:30',
      description: 'اللمسات الأخيرة وتسليم الشغل براحة بال تامة قبل الديدلاين (9:00 - 10:00 مساءً).',
      isCurrent: true,
    };
  }

  if (currentMinutes >= 1290 || currentMinutes < 60) {
    return {
      id: 'personal_social',
      label: 'وقت شخصي، سهرة وتواصل اجتماعي',
      idealWindow: '21:30 - 01:00',
      description: 'سهرة ممتعة، خروجة، وقت مع أهلك وأصدقائك وسهيلة بدون أي أعباء عمل.',
      isCurrent: true,
    };
  }

  return {
    id: 'wind_down',
    label: 'الاستعداد للنوم والراحة',
    idealWindow: '01:00 - 12:00',
    description: 'تفريغ الذهن ونوم عميق كافٍ يتيح الاستيقاظ بهدوء ونشاط قرابة الـ 12 ظهراً.',
    isCurrent: true,
  };
}

/**
 * تقييم الحالة الحية لليوم بناءً على الوقت الحالي، مراحل اليوم، ورصيد الإنتاج
 */
/**
 * معرفة النشاط الحالي الفعلي بشكل منطقي وموثوق، دون أي افتراضات زائفة
 */
export function determineCurrentActivity(
  plan: DayPlan,
  currentMinutes: number,
  currentTimeStr: string
): import('../types/guide').CurrentActivityInfo {
  const session = plan.workdaySession;

  // 1. هل هناك مؤقت تصميم قيد التشغيل حالياً؟
  const activeRunningDesign = session?.designs.find(d => d.isTimerRunning);
  if (activeRunningDesign) {
    const startedM = activeRunningDesign.startTime ? timeToMinutes(activeRunningDesign.startTime) : currentMinutes;
    const diff = Math.max(0, currentMinutes - startedM);
    return {
      isIdentified: true,
      source: 'design_timer',
      title: `${activeRunningDesign.title} (مؤقت التصميم نشط الآن)`,
      activityType: 'design',
      startedAt: activeRunningDesign.startTime || currentTimeStr,
      durationMinutesSoFar: diff,
    };
  }

  // 2. هل هناك نشاط واقعي مسجل وما زال مستمراً (Ongoing)؟
  const ongoingRecord = plan.actualRecords.find(r => r.isOngoing || (!r.actualEndTime && !r.isPointInTime));
  if (ongoingRecord) {
    const startedM = timeToMinutes(ongoingRecord.actualStartTime);
    const diff = Math.max(0, currentMinutes - startedM);
    return {
      isIdentified: true,
      source: 'ongoing_record',
      title: ongoingRecord.title,
      activityType: ongoingRecord.activityType,
      startedAt: ongoingRecord.actualStartTime,
      durationMinutesSoFar: diff,
      activeRecordId: ongoingRecord.id,
      note: ongoingRecord.notes,
    };
  }

  // 3. هل جلسة العمل نفسها نشطة ومؤقت الشغل يعمل؟
  if (session?.isActive && session.isWorkTimerRunning) {
    const startedM = session.workStartTime ? timeToMinutes(session.workStartTime) : currentMinutes;
    const diff = Math.max(0, currentMinutes - startedM);
    return {
      isIdentified: true,
      source: 'work_timer',
      title: 'جلسة عمل وإنتاج نشطة (Work Session)',
      activityType: 'work',
      startedAt: session.workStartTime || currentTimeStr,
      durationMinutesSoFar: diff,
    };
  }

  // 4. إذا لم يكن هناك نشاط محدد مؤكد:
  // القاعدة الصريحة: النظام لا يفترض أن المستخدم يفعل شيئاً لمجرد مرور الوقت.
  const plannedBlock = plan.blocks.find(b => {
    const startM = timeToMinutes(b.startTime);
    const endM = timeToMinutes(b.endTime);
    return currentMinutes >= startM && currentMinutes < endM;
  });

  return {
    isIdentified: false,
    source: 'unspecified',
    title: 'الحالة الحالية غير محددة',
    suggestedFromPlan: plannedBlock ? {
      blockTitle: plannedBlock.title,
      plannedTimeRange: `${plannedBlock.startTime} - ${plannedBlock.endTime}`,
      category: plannedBlock.category,
    } : undefined,
  };
}

export function evaluateLiveContext(
  plan: DayPlan,
  currentTimeStr: string,
  energy: 1 | 2 | 3 | 4 | 5,
  mood: MoodType,
  events: LifeEvent[] = [],
  prayerState?: PrayerDayState,
  sleepState?: SleepState
): LiveContextState {
  const currentMinutes = timeToMinutes(currentTimeStr);
  const currentPhase = determineDayPhase(currentMinutes);
  const currentActivity = determineCurrentActivity(plan, currentMinutes, currentTimeStr);

  const deliveryDeadlineM = timeToMinutes(plan.deliveryDeadlineTarget || '21:30');
  const minutesUntilDeliveryDeadline = deliveryDeadlineM >= currentMinutes 
    ? deliveryDeadlineM - currentMinutes 
    : 0;

  const cred = plan.productionCredit;

  // 1. حساب سياق الأحداث (Events Context)
  const todayDateStr = plan.date;
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDateStr = tomorrowDate.toISOString().split('T')[0];

  const todayEvents = events
    .filter(e => e.date === todayDateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const upcomingTodayEvents = todayEvents.filter(e => timeToMinutes(e.startTime) > currentMinutes);
  const upcomingTodayEvent = upcomingTodayEvents[0] || null;
  const minutesUntilUpcoming = upcomingTodayEvent 
    ? timeToMinutes(upcomingTodayEvent.startTime) - currentMinutes 
    : null;

  // فحص أحداث صباح الغد (مثل المعهد الساعة 9:00 ص)
  const tomorrowMorningEvents = events.filter(e => {
    return (e.date === tomorrowDateStr || e.type === 'institute') && timeToMinutes(e.startTime) <= 600; // قبل 10:00 ص
  });

  const tomorrowEarlyEvent = tomorrowMorningEvents[0] || null;

  const eventsContext: EventContextInfo = {
    todayEvents,
    upcomingTodayEvent,
    minutesUntilUpcoming,
    tomorrowMorningEvents,
  };

  // 2. حساب سياق الصلاة (Prayer Context - Daily Anchor)
  const computedPrayerState = prayerState || prayerService.computeDayState(todayDateStr, currentMinutes, {});
  const prayerContext: PrayerContextInfo = {
    nextPrayer: computedPrayerState.nextPrayer,
    prayers: computedPrayerState.prayers,
    completedCount: computedPrayerState.completedCount,
  };

  // 3. حساب سياق النوم (Sleep Context)
  const actualWakeTime = plan.actualWakeUpTime || sleepState?.todayRecord?.wakeTime || '12:00';
  const actualWakeM = timeToMinutes(actualWakeTime);
  const targetWakeM = timeToMinutes(plan.targetWakeUpTime || '12:00');
  const wakeDriftMinutes = actualWakeM > targetWakeM ? actualWakeM - targetWakeM : 0;
  const isLateWake = actualWakeM >= 780; // 13:00 أو أحدث
  const lastNightDurationFormatted = sleepState?.todayRecord 
    ? sleepService.formatDuration(sleepState.todayRecord.durationMinutes) 
    : undefined;

  // فحص الحاجة للتهيئة المبكرة للنوم إذا كان غداً معهد أو موعد صباحي مبكر
  const isLateAtNight = currentMinutes >= 1320 || currentMinutes < 300; // بعد 10:00 م أو في الساعات الأولى
  const needsWindDownForTomorrow = !!(tomorrowEarlyEvent && isLateAtNight);

  const sleepContext: SleepContextInfo = {
    targetWakeTime: plan.targetWakeUpTime || '12:00',
    actualWakeTime,
    wakeDriftMinutes,
    lastNightDurationFormatted,
    isLateWake,
    needsWindDownForTomorrow,
    tomorrowEarlyEventTitle: tomorrowEarlyEvent ? `${tomorrowEarlyEvent.title} (${tomorrowEarlyEvent.startTime})` : undefined,
  };

  // البحث عن البلوك الزمني الحالي إن وجد
  const activeBlock = plan.blocks.find(b => {
    const startM = timeToMinutes(b.startTime);
    const endM = timeToMinutes(b.endTime);
    return currentMinutes >= startM && currentMinutes < endM;
  }) || null;

  // فحص الحدث الثابت القادم إما من الخطة أو من جدول الأحداث المستقلة
  const upcomingFixedEvents = plan.blocks
    .filter(b => (b.kind === 'fixed_event' || b.kind === 'adhoc_event') && timeToMinutes(b.startTime) > currentMinutes)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  
  const upcomingFixedEvent = upcomingFixedEvents[0] || (upcomingTodayEvent ? {
    id: upcomingTodayEvent.id,
    kind: 'fixed_event' as const,
    title: upcomingTodayEvent.title,
    category: upcomingTodayEvent.type === 'institute' ? 'institute' as const : 'routine' as const,
    startTime: upcomingTodayEvent.startTime,
    endTime: upcomingTodayEvent.endTime || minutesToTime(timeToMinutes(upcomingTodayEvent.startTime) + (upcomingTodayEvent.durationMinutes || 60)),
    isFlexible: false,
    location: upcomingTodayEvent.location,
  } : null);

  const minutesUntilNextEvent = upcomingFixedEvent 
    ? timeToMinutes(upcomingFixedEvent.startTime) - currentMinutes 
    : null;

  // فحص هل تم إنهاء البلوك الحالي مبكراً؟
  const isFinishedEarly = !!(activeBlock && activeBlock.completed);

  // ===================== The Deterministic Decision Engine =====================
  const decision = DecisionEngine.evaluate({
    currentTime: currentTimeStr,
    currentDate: todayDateStr,
    actualWakeTime,
    targetWakeTime: plan.targetWakeUpTime || '12:00',
    sleepInfo: {
      durationMinutes: sleepState?.todayRecord?.durationMinutes,
      wakeTime: actualWakeTime,
      sleepTime: sleepState?.todayRecord?.sleepTime,
      isLateWake,
      tomorrowEarlyEvent,
    },
    isWorkDay: (cred.dailyBaseTarget || 4) > 0,
    plannedWorkTarget: cred.dailyBaseTarget || 4,
    completedDesigns: cred.todayCompletedDesigns || 0,
    workStartTimeTarget: plan.workStartTimeTarget || '14:00',
    deliveryDeadlineTarget: plan.deliveryDeadlineTarget || '21:30',
    currentWorkSession: plan.workdaySession,
    productionCredit: cred,
    upcomingEvents: todayEvents,
    tomorrowMorningEvents,
    nextPrayer: {
      id: computedPrayerState.nextPrayer.id,
      name: computedPrayerState.nextPrayer.name,
      time: computedPrayerState.nextPrayer.time,
      minutesRemaining: computedPrayerState.nextPrayer.minutesRemaining,
      isPast: computedPrayerState.nextPrayer.isPast,
    },
    prayersList: computedPrayerState.prayers,
    actualRecords: plan.actualRecords || [],
    currentActivity,
    activeBlock,
    energy,
    mood,
  });

  return {
    simulatedOrRealTime: currentTimeStr,
    currentEnergy: energy,
    currentMood: mood,
    currentPhase,
    currentActivity,
    activeBlock,
    upcomingFixedEvent,
    minutesUntilNextEvent,
    minutesUntilDeliveryDeadline,
    isFinishedEarly,
    productionCredit: cred,
    eventsContext,
    prayerContext,
    sleepContext,
    nextStep: decision.nextAction,
    status: decision.driftStatus,
    // Decision Engine properties
    currentState: decision.currentState,
    currentStateLabel: decision.currentStateLabel,
    currentStateDescription: decision.currentStateDescription,
    nextAction: decision.nextAction,
    contextTips: decision.contextTips,
    remainingMinutesInDay: decision.remainingMinutesInDay,
    adaptedFromReality: decision.adaptedFromReality,
    isDeterministic: true,
  };
}
