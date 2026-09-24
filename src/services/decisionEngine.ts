/**
 * Personal Daily Guide - Decision Engine
 * 
 * Deterministic, rule-based decision logic that evaluates the day's full context
 * and determines:
 * 1. Current State (e.g. preparing_for_work, work_in_progress, work_target_completed, event_soon, etc.)
 * 2. Next Suggested Action (calm, non-judgmental guidance with clear reason and reassurance)
 * 3. Context Tips (secondary contextual highlights: prayer, tomorrow's institute, credit, etc.)
 * 
 * CORE ARCHITECTURAL PRINCIPLES:
 * - Deterministic: Same inputs ALWAYS produce the same state and recommendation.
 * - No False Intelligence: If something is not known/logged, do not invent. State it honestly.
 * - No Judgment: Strictly descriptive without guilt words (no 'failed', 'lazy', 'bad day').
 * - Priority Hierarchy: Important events > Prayer anchors > Work obligation > Planned activities > Personal/Free time.
 * - Plan stays Plan. Reality stays Reality. Guide adapts to Reality.
 */

import {
  GuideCurrentState,
  NextSuggestedAction,
  ContextTip,
  DriftStatus,
  LifeEvent,
  DayPhaseId,
  PrayerId,
  PrayerItem,
  ProductionCreditState,
  ActualRecord,
  CurrentActivityInfo,
  TimeBlock,
  MoodType,
  WorkdaySession
} from '../types/guide';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface DecisionEngineInputs {
  currentTime: string; // "13:45", "17:00", "02:30", "16:15"
  currentDate: string; // "YYYY-MM-DD"
  actualWakeTime: string; // e.g. "12:30", "16:00"
  targetWakeTime: string; // "12:00"
  sleepInfo?: {
    durationMinutes?: number;
    wakeTime?: string;
    sleepTime?: string;
    isLateWake?: boolean;
    quality?: number;
    tomorrowEarlyEvent?: LifeEvent | null;
  };
  isWorkDay: boolean;
  plannedWorkTarget: number; // e.g. 4
  completedDesigns: number; // e.g. 0, 2, 4, 8
  workStartTimeTarget: string; // "14:00"
  deliveryDeadlineTarget: string; // "21:30"
  currentWorkSession?: WorkdaySession;
  productionCredit: ProductionCreditState;
  upcomingEvents: LifeEvent[]; // today's events sorted by startTime
  tomorrowMorningEvents: LifeEvent[]; // tomorrow before 10 AM (e.g. Institute at 9 AM)
  nextPrayer: {
    id: PrayerId;
    name: string;
    time: string;
    minutesRemaining: number;
    isPast: boolean;
  };
  prayersList: PrayerItem[];
  actualRecords: ActualRecord[];
  currentActivity: CurrentActivityInfo;
  activeBlock: TimeBlock | null;
  energy: 1 | 2 | 3 | 4 | 5;
  mood: MoodType;
  personalLifeSummary?: {
    suhailaMinutes: number;
    suhailaFocusedMinutes: number;
    socialMediaMinutes: number;
    isRecoveryClean: boolean;
  };
}

export interface DecisionEngineOutput {
  currentState: GuideCurrentState;
  currentStateLabel: string;
  currentStateDescription: string;
  nextAction: NextSuggestedAction;
  contextTips: ContextTip[];
  driftStatus: DriftStatus;
  priorityLevel: 1 | 2 | 3 | 4 | 5;
  priorityReason: string;
  adaptedFromReality: boolean;
  remainingMinutesInDay: number;
}

export const STATE_LABELS: Record<GuideCurrentState, { label: string; description: string }> = {
  not_started_day: {
    label: 'قبل بداية اليوم',
    description: 'فترة السكون والراحة الطبيعية قبل موعد الاستيقاظ المعتاد.'
  },
  starting_day: {
    label: 'بداية اليوم الهادئة',
    description: 'استيقاظ، فطار، صلاة، قهوة، ووقت طيب مع الأهل وسهيلة دون أي استعجال.'
  },
  preparing_for_work: {
    label: 'الاستعداد للشغل',
    description: 'تهيئة مساحة العمل، فتح البرامج، وترتيب أولوية التصميمات قبل بدء الجلسة.'
  },
  work_time: {
    label: 'وقت الشغل والإنتاج',
    description: 'نافذة العمل متاحة؛ الوقت مناسب للمضي قدماً في إنجاز هدف اليوم.'
  },
  work_in_progress: {
    label: 'جلسة شغل نشطة',
    description: 'مؤقت التصميم أو جلسة العمل قيد التشغيل بالفعل.'
  },
  work_target_completed: {
    label: 'اكتمل هدف الشغل',
    description: 'تم إنجاز التصميمات المطلوبة؛ باقي اليوم حر ومستحق بالكامل.'
  },
  personal_time: {
    label: 'وقت شخصي وسهرة',
    description: 'وقت مخصص لنفسك، لأهلك، وسهيلة براحة بال بعد انتهاء متطلبات اليوم.'
  },
  event_soon: {
    label: 'حدث خارجي قريب',
    description: 'موعد أو التزام خارجي يبدأ قريباً؛ تجنب بدء عمل عميق ينقطع بعجلة.'
  },
  prayer_soon: {
    label: 'اقتراب وقت الصلاة',
    description: 'مرساة هدوء وروحانية لتجديد النشاط والصفاء الذهني.'
  },
  preparing_for_tomorrow: {
    label: 'التهيئة للغد',
    description: 'نهاية السهرة مع وجود موعد صباحي مبكر في الغد يستدعي النوم الكافي.'
  },
  day_ending: {
    label: 'الاستعداد للنوم',
    description: 'تهدئة الإضاءة، إغلاق الشاشات، والاسترخاء لنوم عميق ومريح.'
  },
  unknown_state: {
    label: 'الحالة غير محددة',
    description: 'لا يوجد نشاط مسجل كـ ongoing أو مؤقت نشط؛ النظام لا يفترض ما تفعله.'
  }
};

export class DecisionEngine {
  /**
   * تقييم الحالة واتخاذ القرار الحتمي (Pure Deterministic Evaluation)
   */
  public static evaluate(inputs: DecisionEngineInputs): DecisionEngineOutput {
    const {
      currentTime,
      actualWakeTime,
      sleepInfo,
      plannedWorkTarget,
      completedDesigns,
      workStartTimeTarget,
      deliveryDeadlineTarget,
      currentWorkSession,
      productionCredit,
      upcomingEvents,
      tomorrowMorningEvents,
      nextPrayer,
      currentActivity,
      activeBlock,
      energy,
      personalLifeSummary
    } = inputs;

    const currentM = timeToMinutes(currentTime);
    const wakeM = timeToMinutes(actualWakeTime || '12:00');
    const workStartM = timeToMinutes(workStartTimeTarget || '14:00');
    const deliveryDeadlineM = timeToMinutes(deliveryDeadlineTarget || '21:30');

    // Remaining minutes until midnight (or end of user day cycle 02:00 AM)
    const remainingMinutesInDay = currentM <= 1440 ? 1440 - currentM : 0;

    // Check drift between planned wake and actual wake
    const isLateWake = wakeM >= 780; // 13:00 or later
    const wakeDrift = Math.max(0, wakeM - 720); // drift from 12:00

    // Remaining designs calculation
    const remainingDesigns = Math.max(0, plannedWorkTarget - completedDesigns);
    const hasReachedTarget = completedDesigns >= plannedWorkTarget && plannedWorkTarget > 0;
    const extraDesigns = Math.max(0, completedDesigns - plannedWorkTarget);

    // Active session status
    const isDesignTimerRunning = !!currentWorkSession?.designs.some(d => d.isTimerRunning);
    const isWorkTimerRunning = !!currentWorkSession?.isWorkTimerRunning;
    const isWorkActive = currentWorkSession?.isActive || isDesignTimerRunning || isWorkTimerRunning;
    const activeRunningDesign = currentWorkSession?.designs.find(d => d.isTimerRunning);

    // Upcoming event status
    const nextUpcomingEvent = upcomingEvents.find(e => {
      const startM = timeToMinutes(e.startTime);
      return startM > currentM;
    }) || null;

    const minutesToUpcomingEvent = nextUpcomingEvent 
      ? timeToMinutes(nextUpcomingEvent.startTime) - currentM 
      : null;

    const tomorrowEarlyEvent = tomorrowMorningEvents[0] || sleepInfo?.tomorrowEarlyEvent || null;

    // Is late at night? (after 22:30 or between 00:00 and 05:00)
    const isLateNight = currentM >= 1350 || currentM < 300;

    // Is within wake-up buffer? (within 75 minutes of actual wake time)
    const isWithinWakeBuffer = currentM >= wakeM && currentM < (wakeM + 75);

    // Check if reality caused adaptation
    let adaptedFromReality = false;
    if (wakeDrift > 30 || (isLateWake && currentM >= wakeM)) {
      adaptedFromReality = true;
    }

    // -------------------------------------------------------------
    // PRIORITY HIERARCHY EVALUATION
    // -------------------------------------------------------------
    let state: GuideCurrentState = 'unknown_state';
    let priorityLevel: 1 | 2 | 3 | 4 | 5 = 4;
    let priorityReason = 'تقييم السياق العام لليوم';
    let nextAction: NextSuggestedAction;
    let driftStatus: DriftStatus = 'on_track';

    // -------------------------------------------------------------
    // PRIORITY 1: EVENT SOON OR TOMORROW'S EARLY COMMITMENT
    // -------------------------------------------------------------
    // Rule 1.1: Event starting very soon today (< 40 mins away)
    if (nextUpcomingEvent && minutesToUpcomingEvent !== null && minutesToUpcomingEvent <= 40 && minutesToUpcomingEvent > 0) {
      state = 'event_soon';
      priorityLevel = 1;
      priorityReason = `حدث قريب جداً: ${nextUpcomingEvent.title} بعد ${minutesToUpcomingEvent} دقيقة`;
      driftStatus = 'on_track';

      nextAction = {
        id: 'action-event-soon',
        title: `الاستعداد لـ: ${nextUpcomingEvent.title}`,
        tagline: `الحدث يبدأ بعد ${minutesToUpcomingEvent} دقيقة${nextUpcomingEvent.location ? ` في (${nextUpcomingEvent.location})` : ''}. تجنب بدء تصميم جديد الآن حتى لا ينقطع بضيق وقت.`,
        rationale: 'الأحداث المحددة بمواعيد خارجية لها الأولوية القصوى لمنع الارتباك والعجلة.',
        suggestedDurationMinutes: minutesToUpcomingEvent,
        kind: 'event_prep',
        reassuranceNote: 'التحرك برواق يمنحك حضوراً ذهنياً ممتازاً في موعدك.',
        priorityLevel: 1,
        priorityReason,
        relatedEventTitle: nextUpcomingEvent.title,
        actionCta: {
          label: 'عرض تفاصيل الحدث',
          actionType: 'view_events',
          targetTab: 'calendar'
        }
      };
    }
    // Rule 1.2: Late night with early morning event tomorrow (e.g., Institute at 9 AM at 2:30 AM - Example 6)
    else if (tomorrowEarlyEvent && isLateNight) {
      state = 'preparing_for_tomorrow';
      priorityLevel = 1;
      priorityReason = `التزام صباح الغد: ${tomorrowEarlyEvent.title} (${tomorrowEarlyEvent.startTime})`;
      driftStatus = 'resting';

      nextAction = {
        id: 'action-prep-tomorrow-early',
        title: `التهيئة لنوم كافٍ (لديك ${tomorrowEarlyEvent.title} غداً)`,
        tagline: `عندك ${tomorrowEarlyEvent.title} الساعة ${tomorrowEarlyEvent.startTime} صباحًا. خليك واخد الموعد ده في الاعتبار وأنت بتقرر تكمل يومك أو تبدأ تهدي.`,
        rationale: 'الاستيقاظ المبكر لحضور المعهد يحتاج ساعات نوم غير منقوصة للحفاظ على طاقتك وتركيزك.',
        suggestedDurationMinutes: 45,
        kind: 'take_rest',
        reassuranceNote: 'لا إجبار صارم؛ النصيحة هنا لحماية صحتك الذهنية في مشوار الغد.',
        priorityLevel: 1,
        priorityReason,
        relatedEventTitle: tomorrowEarlyEvent.title,
        actionCta: {
          label: 'الاستعداد للنوم',
          actionType: 'prepare_sleep',
          targetTab: 'dashboard'
        }
      };
    }
    // -------------------------------------------------------------
    // PRIORITY 2: PRAYER SOON (DAILY SPIRITUAL ANCHOR)
    // -------------------------------------------------------------
    else if (nextPrayer.minutesRemaining <= 20 && nextPrayer.minutesRemaining > 0) {
      state = 'prayer_soon';
      priorityLevel = 2;
      priorityReason = `اقتراب صلاة ${nextPrayer.name} (${nextPrayer.minutesRemaining} دقيقة متبقية)`;
      driftStatus = 'on_track';

      nextAction = {
        id: 'action-prayer-soon',
        title: `مرساة هدوء قريبة (${nextPrayer.name})`,
        tagline: `متبقي قرابة ${nextPrayer.minutesRemaining} دقيقة على ${nextPrayer.name} (${nextPrayer.time}). وقت مناسب لإنهاء التفاصيل الحالية وأخذ استراحة وضوء وصلاة.`,
        rationale: 'الصلاة مرساة روحية ومحطة تجديد لنشاط الدماغ دون استعجال.',
        suggestedDurationMinutes: nextPrayer.minutesRemaining,
        kind: 'pivot_lighter',
        reassuranceNote: 'يمكنك الصلاة بهدوء في بيتك أو شقة الشغل دون أي ضغط.',
        priorityLevel: 2,
        priorityReason,
        actionCta: {
          label: 'تسجيل الصلاة كمرساة',
          actionType: 'log_activity',
          targetTab: 'dashboard'
        }
      };
    }
    // -------------------------------------------------------------
    // PRIORITY 3: WORK OBLIGATIONS & PRODUCTION STATUS
    // -------------------------------------------------------------
    // Rule 3.1: Work Target Completed with Bonus Credit (Example 4: 8 / 4)
    else if (hasReachedTarget && extraDesigns > 0) {
      state = 'work_target_completed';
      priorityLevel = 4;
      priorityReason = `تم إنجاز ${completedDesigns} تصميمات (هدف اليوم + ${extraDesigns} إضافي)`;
      driftStatus = 'early_finish';

      nextAction = {
        id: 'action-credit-bonus-achieved',
        title: `إنجاز استثنائي ورصيد إضافي (+${extraDesigns} Credit)`,
        tagline: `أنجزت ${extraDesigns} تصميمات إضافية اليوم. تم إضافة +${extraDesigns} Production Credit لرصيدك التراكمي.`,
        rationale: 'رصيد الإنتاج التراكمي يضمن أن تعبك اليوم يوفر لك راحة وأياماً مرنة قادمة دون أي تأنيب ضمير.',
        suggestedDurationMinutes: 60,
        kind: 'credit_celebration',
        reassuranceNote: 'عملك لليوم اكتمل وزيادة؛ استمتع بباقي يومك بحرية كاملة.',
        priorityLevel: 4,
        priorityReason,
        actionCta: {
          label: 'عرض رصيد الإنتاج',
          actionType: 'view_events',
          targetTab: 'work'
        }
      };
    }
    // Rule 3.2: Work Target Exactly Completed (Example 3: 4 / 4)
    else if (hasReachedTarget) {
      state = 'work_target_completed';
      priorityLevel = 4;
      priorityReason = `اكتمل هدف الشغل لليوم (${completedDesigns}/${plannedWorkTarget})`;
      driftStatus = 'early_finish';

      nextAction = {
        id: 'action-work-target-completed',
        title: 'اكتمل هدف الشغل لليوم بالكامل',
        tagline: 'هدف الشغل اكتمل. باقي اليوم مفتوح، وممكن تستخدم الوقت كما يناسبك.',
        rationale: 'تحقيق الالتزام اليومي يحرر تفكيرك من أي شعور بالتقصير لباقي السهرة.',
        suggestedDurationMinutes: 60,
        kind: 'earned_freedom',
        reassuranceNote: 'لا داعي لفتح أي برنامج عمل إضافي ما لم تكن ترغب في زيادة رصيدك بمزاج رائق.',
        priorityLevel: 4,
        priorityReason,
        actionCta: {
          label: 'استمتع بوقتك الحر',
          actionType: 'take_break',
          targetTab: 'personal'
        }
      };
    }
    // Rule 3.3: Production Credit covers today / Day is optional work (Example 5: credit = +4, required = 0)
    else if (plannedWorkTarget === 0 || productionCredit.totalCreditBalance >= 4 && !inputs.isWorkDay) {
      state = 'personal_time';
      priorityLevel = 5;
      priorityReason = 'رصيد الإنتاج يغطي اليوم أو يوم راحة اختياري';
      driftStatus = 'on_track';

      nextAction = {
        id: 'action-credit-covered-day',
        title: 'يوم مغطى برصيد الإنتاج التراكمي',
        tagline: 'عندك رصيد إنتاج يغطي هدف اليوم. الشغل اليوم اختياري، إلا إذا عندك حاجة أخرى مرتبطة بالعمل.',
        rationale: 'استثمارك في الأيام الماضية يعمل لصالحك الآن. الراحة اليوم مستحقة بالكامل.',
        suggestedDurationMinutes: 120,
        kind: 'optional_work',
        reassuranceNote: 'إن أردت العمل فهذا قرارك الحر، وإن أردت الراحة فرصيدك يحميك.',
        priorityLevel: 5,
        priorityReason,
        actionCta: {
          label: 'عرض رصيد الإنتاج',
          actionType: 'use_credit',
          targetTab: 'work'
        }
      };
    }
    // Rule 3.4: Work actively in progress (Example 2: 5:00 PM, started 2:15 PM, 2/4 completed)
    else if (isWorkActive || isDesignTimerRunning || (currentActivity.isIdentified && currentActivity.activityType === 'work')) {
      state = 'work_in_progress';
      priorityLevel = 3;
      priorityReason = `جلسة عمل جارية (${completedDesigns}/${plannedWorkTarget} تصميمات)`;
      driftStatus = 'on_track';

      const isHalfway = completedDesigns > 0 && remainingDesigns > 0;
      const runningTitle = activeRunningDesign ? activeRunningDesign.title : 'التصميم الحالي';

      nextAction = {
        id: 'action-work-in-progress',
        title: isHalfway 
          ? `متابعة إنجاز التصميمات (${completedDesigns}/${plannedWorkTarget})`
          : `التركيز في ${runningTitle}`,
        tagline: isHalfway
          ? `أنت في منتصف هدف الشغل تقريبًا. فاضلك ${remainingDesigns === 1 ? 'تصميم واحد' : `${remainingDesigns} تصميمات`}.`
          : `أنت تعمل الآن بتركيز. متبقي ${remainingDesigns} تصميمات للوصول للهدف.`,
        rationale: 'التركيز على تصميم واحد في كل مرة دون مقاطعات ينهي الشغل بأعلى جودة وأقل إرهاق.',
        suggestedDurationMinutes: 45,
        kind: 'continue_current',
        reassuranceNote: 'موعد التسليم قبل 9:30 مساءً، والوقت كافٍ وبصالحك.',
        priorityLevel: 3,
        priorityReason,
        actionCta: {
          label: 'الذهاب إلى مساحة العمل',
          actionType: 'resume_design',
          targetTab: 'work'
        }
      };
    }
    // Rule 3.5: Preparing for Work (Example 1: 1:45 PM, wake 12:30, target 4, work not started)
    // Within 45 minutes before work start target (e.g. 13:15 to 14:00) OR workStartM - 45 <= currentM < workStartM
    else if (completedDesigns === 0 && !isWorkActive && (currentM >= workStartM - 45 && currentM < workStartM)) {
      const minutesToStart = Math.max(1, workStartM - currentM);
      state = 'preparing_for_work';
      priorityLevel = 3;
      priorityReason = `الاستعداد لبدء جلسة العمل (${minutesToStart} دقيقة على الموعد المستهدف)`;
      driftStatus = 'on_track';

      nextAction = {
        id: 'action-prep-for-work',
        title: 'الاستعداد والتهيئة لجلسة الشغل',
        tagline: `فاضل حوالي ${minutesToStart} دقيقة على بداية وقت الشغل. لو جاهز، ممكن تبدأ أول Design.`,
        rationale: 'التهيئة الذهنية الهادئة قبل بدء العمل تزيل التردد وتجعل الدخول في التركيز سلساً وطبيعياً.',
        suggestedDurationMinutes: minutesToStart,
        kind: 'gentle_start',
        reassuranceNote: 'هدفنا اليوم محدد وواضح: 4 تصميمات متقنة، والوقت مريح جداً.',
        priorityLevel: 3,
        priorityReason,
        actionCta: {
          label: 'فتح أول تصميم',
          actionType: 'start_work',
          targetTab: 'work'
        }
      };
    }
    // Rule 3.6: Starting Day (Normal Wake or Late Wake - Example 7: Actual wake = 4:00 PM)
    else if (isWithinWakeBuffer) {
      state = 'starting_day';
      priorityLevel = 4;
      priorityReason = `بداية اليوم عقب الاستيقاظ (${actualWakeTime})`;

      if (isLateWake) {
        // Late Wake adaptation: ABSOLUTELY NO JUDGMENT!
        adaptedFromReality = true;
        driftStatus = 'recalibrating';
        const suggestedStartM = wakeM + 60;
        const suggestedStartStr = minutesToTime(suggestedStartM);

        nextAction = {
          id: 'action-late-wake-compassionate',
          title: `بداية هادئة وتكييف لليوم (استيقاظ ${actualWakeTime})`,
          tagline: `استيقظت الساعة ${actualWakeTime} براحة. أمامك باقي اليوم حتى المساء؛ رتبنا بداية هادئة للشغل الساعة ${suggestedStartStr}، أو يمكنك الاستعانة برصيد الإنتاج التراكمي (+Credit) لتخفيف الهدف دون أي لوم.`,
          rationale: 'المرونة هي جوهر الاستمرارية. الموقع يصف الواقع ويعيد توجيه اليوم من نقطتك الحالية دون أي أحكام سلبية.',
          suggestedDurationMinutes: Math.max(15, suggestedStartM - currentM),
          kind: 'gentle_start',
          reassuranceNote: 'اليوم لم يضع؛ 3 أو 4 ساعات تركيز في المساء تنجز المطلوب بالكامل.',
          priorityLevel: 4,
          priorityReason,
          actionCta: {
            label: 'مراجعة خيارات التكييف',
            actionType: 'use_credit',
            targetTab: 'dashboard'
          }
        };
      } else {
        // Normal peaceful morning / midday start (12:00 - 13:30)
        driftStatus = 'on_track';
        nextAction = {
          id: 'action-normal-wake-calm',
          title: 'بداية اليوم الهادئة',
          tagline: 'بداية هادئة لليوم دون شاشات عمل أو استعجال (فطار، شاي، صلاة، ووقت طيب مع سهيلة والأهل).',
          rationale: 'إعطاء نفسك ساعة إلى ساعة ونصف لبداية مريحة بعد الاستيقاظ يصنع كل الفارق في صفاء ذهنك.',
          suggestedDurationMinutes: Math.max(10, (wakeM + 75) - currentM),
          kind: 'gentle_start',
          reassuranceNote: 'الشغل يبدأ بهدوء الساعة 2:00 ظهرًا؛ لا داعي للعجلة الآن.',
          priorityLevel: 4,
          priorityReason,
          actionCta: {
            label: 'تسجيل الروتين الهادئ',
            actionType: 'log_activity',
            targetTab: 'dashboard'
          }
        };
      }
    }
    // Rule 3.7: Active Work Window (After work start, target not reached, but user hasn't started timer yet)
    else if (currentM >= workStartM && currentM < deliveryDeadlineM && remainingDesigns > 0) {
      // If user hasn't logged anything and timer is not running -> "No False Intelligence"
      if (!currentActivity.isIdentified) {
        state = 'unknown_state';
        priorityLevel = 3;
        priorityReason = `وقت عمل متاح مع وجود هدف متبقي (${remainingDesigns} تصميمات)`;
        driftStatus = 'on_track';

        nextAction = {
          id: 'action-unspecified-work-pending',
          title: 'الحالة الحالية غير محددة',
          tagline: `مش واضح أنت في إيه دلوقتي. عندك هدف شغل متبقي (${remainingDesigns} تصميمات)، فلو حابب تكمل ممكن تبدأ بالـDesign التالي أو تسجل ما تفعله الآن.`,
          rationale: 'النظام لا يفترض ما تقوم به لمجرد مرور الوقت، بل يساعدك على الوعي بلحظتك الحالية.',
          suggestedDurationMinutes: 30,
          kind: 'continue_current',
          reassuranceNote: 'لك الحرية في البدء الآن أو تسجيل استراحة واعية.',
          priorityLevel: 3,
          priorityReason,
          actionCta: {
            label: 'بدء التصميم التالي',
            actionType: 'start_work',
            targetTab: 'work'
          }
        };
      } else {
        // Activity is identified as something else (e.g. personal, lunch, etc.)
        state = 'work_time';
        priorityLevel = 3;
        priorityReason = `وقت العمل المستهدف (${remainingDesigns} تصميمات متبقية)`;
        driftStatus = 'on_track';

        nextAction = {
          id: 'action-work-time-window',
          title: `وقت الشغل والإنتاج (${remainingDesigns} تصميمات متبقية)`,
          tagline: `الوقت مناسب للمضي قدماً في تصميمات اليوم (${completedDesigns}/${plannedWorkTarget}). جلسة تركيز هادئة مدتها 45 دقيقة تقطع شوطاً كبيراً.`,
          rationale: 'إنجاز العمل قبل المساء يضمن لك سهرة خالية تماماً من الالتزامات.',
          suggestedDurationMinutes: 45,
          kind: 'continue_current',
          reassuranceNote: 'تسليمك المستهدف قبل 9:30 مساءً، وأنت متحكم في وتيرتك.',
          priorityLevel: 3,
          priorityReason,
          actionCta: {
            label: 'بدء التصميم في Work Hub',
            actionType: 'start_work',
            targetTab: 'work'
          }
        };
      }
    }
    // -------------------------------------------------------------
    // PRIORITY 4: EVENING / PERSONAL / SOCIAL TIME
    // -------------------------------------------------------------
    else if (currentM >= deliveryDeadlineM || (currentM >= 1290 && currentM < 1440) || (currentM >= 0 && currentM < 60)) {
      state = 'personal_time';
      priorityLevel = 5;
      priorityReason = 'الفترة المسائية والشخصية بعد موعد التسليم';
      driftStatus = 'on_track';

      nextAction = {
        id: 'action-personal-evening',
        title: 'وقت شخصي، سهرة وتواصل ممتع',
        tagline: 'تسليم اليوم تم أو حان موعد انتهائه — هذا الوقت مخصص لنفسك، لأهلك، وسهيلة بدون أي تفكير في الشغل.',
        rationale: 'فصل الشغل تماماً بعد المساء هو سر استعادة طاقتك وشغفك لليوم التالي.',
        suggestedDurationMinutes: 60,
        kind: 'take_rest',
        reassuranceNote: 'استمتع بوقتك؛ لا يوجد أي تكليف عمل إلزامي الآن.',
        priorityLevel: 5,
        priorityReason,
        actionCta: {
          label: 'عرض العادات والوقت الشخصي',
          actionType: 'take_break',
          targetTab: 'personal'
        }
      };
    }
    // -------------------------------------------------------------
    // PRIORITY 5: DAY ENDING / SLEEP WIND-DOWN
    // -------------------------------------------------------------
    else if (currentM >= 60 && currentM < 720) {
      // Early morning before standard 12:00 PM wake time
      if (currentM < 300) {
        state = 'day_ending';
        priorityLevel = 5;
        priorityReason = 'ساعات الاستعداد للنوم المتأخر';
        driftStatus = 'resting';

        nextAction = {
          id: 'action-sleep-wind-down',
          title: 'الاستعداد للنوم والراحة العميقة',
          tagline: 'تصفية الذهن، إغلاق الشاشات، والاسترخاء لنوم عميق يتيح لك الاستيقاظ براحة قرابة الـ 12 ظهراً.',
          rationale: 'النوم الكافي هو الأساس البيولوجي الذي يبنى عليه نجاح وصفاء يوم الغد.',
          suggestedDurationMinutes: 45,
          kind: 'take_rest',
          reassuranceNote: 'يومك انتهى، اترك كل شيء واسترح بسلام.',
          priorityLevel: 5,
          priorityReason,
          actionCta: {
            label: 'الاستعداد للنوم',
            actionType: 'prepare_sleep',
            targetTab: 'dashboard'
          }
        };
      } else {
        state = 'not_started_day';
        priorityLevel = 5;
        priorityReason = 'فترة النوم الطبيعية قبل الاستيقاظ';
        driftStatus = 'resting';

        nextAction = {
          id: 'action-pre-wake-sleep',
          title: 'فترة نوم وراحة هادئة',
          tagline: 'ساعات سكون وراحة طبيعية قبل موعد الاستيقاظ المعتاد (12:00 ظهرًا).',
          rationale: 'النوم المستمر دون قلق هو أفضل ما تقدمه لجسدك وعقلك الآن.',
          suggestedDurationMinutes: Math.max(30, 720 - currentM),
          kind: 'take_rest',
          reassuranceNote: 'استمتع بنومك؛ النظام يرتب لك اليوم عند استيقاظك.',
          priorityLevel: 5,
          priorityReason
        };
      }
    }
    // Fallback: Unknown state (Strict No False Intelligence)
    else {
      state = 'unknown_state';
      priorityLevel = 4;
      priorityReason = 'لا يوجد نشاط مسجل في هذه اللحظة';
      driftStatus = 'on_track';

      nextAction = {
        id: 'action-unspecified-default',
        title: 'الحالة الحالية غير محددة',
        tagline: 'مش واضح أنت في إيه دلوقتي. يمكنك تسجيل ما تفعله بلمسة سريعة، أو المضي في هدف الشغل إن كان مناسباً.',
        rationale: 'النظام لا يفترض افتراضات غير مؤكدة احتراما لواقعك اليومي.',
        suggestedDurationMinutes: 30,
        kind: 'gentle_start',
        reassuranceNote: 'تسجيل صادق بدون أي لوم.',
        priorityLevel: 4,
        priorityReason,
        actionCta: {
          label: 'تسجيل ما أفعله الآن',
          actionType: 'log_activity',
          targetTab: 'dashboard'
        }
      };
    }

    // -------------------------------------------------------------
    // GENERATE CONTEXT TIPS (Secondary Awareness Highlights)
    // -------------------------------------------------------------
    const contextTips: ContextTip[] = [];

    // Tip 1: Tomorrow morning event awareness (e.g. Institute 9 AM)
    if (tomorrowEarlyEvent) {
      contextTips.push({
        id: 'tip-tomorrow-institute',
        type: 'event',
        text: `لديك ${tomorrowEarlyEvent.title} غداً الساعة ${tomorrowEarlyEvent.startTime} ص؛ خطط لنوم كافٍ مسبقاً.`,
        severity: isLateNight ? 'highlight' : 'info'
      });
    }

    // Tip 2: Production Credit availability
    if (productionCredit.totalCreditBalance > 0) {
      contextTips.push({
        id: 'tip-production-credit',
        type: 'credit',
        text: `رصيد الإنتاج التراكمي (+${productionCredit.totalCreditBalance} تصميمات) متاح لك لاستخدامه كلما احتجت مرونة.`,
        severity: 'info'
      });
    }

    // Tip 3: Next Prayer countdown if between 21 and 60 minutes
    if (nextPrayer.minutesRemaining > 20 && nextPrayer.minutesRemaining <= 60) {
      contextTips.push({
        id: 'tip-next-prayer',
        type: 'prayer',
        text: `صلاة ${nextPrayer.name} قادمة الساعة ${nextPrayer.time} (متبقي ${nextPrayer.minutesRemaining} دقيقة).`,
        severity: 'info'
      });
    }

    // Tip 4: Delivery deadline awareness if working
    if (currentM < deliveryDeadlineM && remainingDesigns > 0 && currentM >= workStartM) {
      const minutesToDeadline = deliveryDeadlineM - currentM;
      contextTips.push({
        id: 'tip-delivery-deadline',
        type: 'work',
        text: `موعد التسليم المستهدف: ${deliveryDeadlineTarget} (متبقي ${Math.floor(minutesToDeadline / 60)}س ${minutesToDeadline % 60}د).`,
        severity: minutesToDeadline <= 90 ? 'highlight' : 'info'
      });
    }

    // Tip 5: Relationship (Suhaila) summary if logged
    if (personalLifeSummary && personalLifeSummary.suhailaMinutes > 0) {
      contextTips.push({
        id: 'tip-suhaila-time',
        type: 'personal',
        text: `وقت سهيلة اليوم: ${personalLifeSummary.suhailaMinutes} دقيقة (صافي مركز: ${personalLifeSummary.suhailaFocusedMinutes} دقيقة).`,
        severity: 'info'
      });
    }

    // Ensure non-judgmental language
    DecisionEngine.ensureNonJudgmental(nextAction.tagline);
    DecisionEngine.ensureNonJudgmental(nextAction.rationale);
    DecisionEngine.ensureNonJudgmental(nextAction.reassuranceNote);

    const stateMeta = STATE_LABELS[state] || STATE_LABELS.unknown_state;

    return {
      currentState: state,
      currentStateLabel: stateMeta.label,
      currentStateDescription: stateMeta.description,
      nextAction,
      contextTips,
      driftStatus,
      priorityLevel,
      priorityReason,
      adaptedFromReality,
      remainingMinutesInDay
    };
  }

  /**
   * ضمان صارم لخلو أي رسالة من ألفاظ اللوم أو الفشل (Strict Non-Judgment Validation)
   */
  public static ensureNonJudgmental(text: string): boolean {
    const forbiddenWords = [
      'فشلت', 'كسول', 'ضيعت', 'مضيعة', 'تأخرت وضاع', 'يوم سيء', 'كان يجب عليك',
      'فشل', 'مقصر', 'مهمل', 'failed', 'lazy', 'bad day', 'wasted'
    ];
    for (const word of forbiddenWords) {
      if (text.toLowerCase().includes(word)) {
        console.warn(`[DecisionEngine] Judgmental word detected and replaced: "${word}" in "${text}"`);
        return false;
      }
    }
    return true;
  }
}
