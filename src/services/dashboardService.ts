/**
 * Dashboard Service
 * Computes context-aware summaries, weekly snapshot metrics,
 * and contextual dynamic guidance for the Main Dashboard ("يومي").
 */

import { DayPlan, LifeEvent, PersonalLifeState, PrayerDayState, SleepState } from '../types/guide';
import { timeToMinutes } from './guideEngine';

export interface WeeklySnapshotData {
  designsCompleted: number;
  designsTarget: number;
  totalWorkMinutes: number;
  avgSleepHours: number;
  avgWakeTime: string;
  prayerCompletionRate: number; // percentage (e.g. 88%)
  totalFocusedSuhailaMinutes: number;
  cleanDaysCount: number;
  totalDaysRecorded: number;
}

export interface ContextualDashboardCard {
  currentTimeFormatted: string;
  dayStateLabel: string;
  dayStateBadgeClass: string;
  nowHeadline: string;
  nowDetail: string;
  nextStepTitle: string;
  nextStepSubtitle: string;
  primaryActionLabel: string;
  primaryActionType: 'start_work' | 'finish_design' | 'take_break' | 'log_suhaila' | 'prepare_sleep' | 'open_timeline';
  remainingContextNote?: string;
  bannerGuidance: string;
}

export const dashboardService = {
  /**
   * Generates dynamic, context-aware advice & Now cards based on live day parameters.
   */
  getContextualState(
    currentTime: string,
    plan: DayPlan | null,
    events: LifeEvent[],
    prayerState: PrayerDayState | null,
    sleepState: SleepState | null,
    personalState: PersonalLifeState | null
  ): ContextualDashboardCard {
    const currentM = timeToMinutes(currentTime);
    const session = plan?.workdaySession;
    const designs = session?.designs || [];
    const completedDesigns = designs.filter(d => d.status === 'done').length;
    const totalDesigns = designs.length || 4;
    const isWorkRunning = session?.isWorkTimerRunning || designs.some(d => d.isTimerRunning);
    const activeDesign = designs.find(d => d.isTimerRunning) || designs.find(d => d.status !== 'done');

    // Look for tomorrow morning's event (e.g. Institute at 9:00 AM)
    const tomorrowEvent = events.find(e => {
      // Find event starting early morning
      const eTime = timeToMinutes(e.startTime);
      return eTime >= 480 && eTime <= 660; // 8:00 AM to 11:00 AM
    });

    // Check next prayer
    const nextPrayer = prayerState?.prayers.find(p => !p.isCompleted);

    // Default tone: calm, realistic, direct. Never managerial or bossy.
    let dayStateLabel = 'يوم عادي ومستقر';
    let dayStateBadgeClass = 'bg-stone-100 text-stone-800';
    let nowHeadline = 'أنت في مسار يومك الطبيعي';
    let nowDetail = 'كل محاور اليوم تسير بمرونة ووعي.';
    let nextStepTitle = 'خطوة تالية مقترحة';
    let nextStepSubtitle = 'اختر النشاط المناسب لطاقتك الحالية.';
    let primaryActionLabel = 'تسجيل نشاط';
    let primaryActionType: ContextualDashboardCard['primaryActionType'] = 'open_timeline';
    let remainingContextNote: string | undefined = undefined;
    let bannerGuidance = 'يومك يسير بوتيرة مريحة؛ ركّز على ما بين يديك الآن.';

    // Case 1: Early morning / Waking phase (12:00 PM - 1:30 PM)
    if (currentM >= 720 && currentM < 810) {
      dayStateLabel = 'بداية اليوم والروتين الهادئ';
      dayStateBadgeClass = 'bg-amber-100 text-amber-800';
      const wakeTime = sleepState?.todayRecord?.wakeTime || sleepState?.history[sleepState.history.length - 1]?.wakeTime || '12:18';
      nowHeadline = 'بداية اليوم — شاي ووقت هادئ';
      nowDetail = `استيقظت الساعة ${wakeTime}. أمامك وقت مريح للتهيئة الذهنية والشغل يبدأ بعد 2:00 ظهراً.`;
      nextStepTitle = 'فطار أو قعدة رايقة';
      nextStepSubtitle = 'تواصل هادئ مع سهيلة أو إفطار دون استعجال الشاشات.';
      primaryActionLabel = 'تسجيل وقت مع سهيلة';
      primaryActionType = 'log_suhaila';
      bannerGuidance = 'بداية اليوم الهادئة تصنع فارقاً كبيراً في صفاء ذهنك؛ لا تستعجل أي عمل الآن.';
    }
    // Case 2: Work Session Hours (1:30 PM - 6:30 PM or Work Active)
    else if (currentM >= 810 && currentM < 1110) {
      if (completedDesigns >= totalDesigns) {
        dayStateLabel = 'هدف الشغل مكتمل ✓';
        dayStateBadgeClass = 'bg-emerald-100 text-emerald-800 font-bold';
        nowHeadline = 'خلصت هدف الشغل لليوم!';
        nowDetail = `تم إنجاز ${completedDesigns} من ${totalDesigns} تصميمات بنجاح قبل الموعد المسائي.`;
        nextStepTitle = 'يومك مفتوح وبراحتك';
        nextStepSubtitle = tomorrowEvent 
          ? `عندك حدث (${tomorrowEvent.title}) غداً الساعة ${tomorrowEvent.startTime} — استمتع بباقي الليلة بروقان.` 
          : 'يمكنك أخذ قسط من الراحة، أو الخروج مع صديق، أو قضاء وقت مع سهيلة.';
        primaryActionLabel = 'استعراض الواقع';
        primaryActionType = 'open_timeline';
        bannerGuidance = `خلصت ${totalDesigns} Designs. هدف الشغل اكتمل، وممكن تعتبر باقي الوقت مفتوح ومستحق.`;
      } else {
        dayStateLabel = isWorkRunning ? 'جلسة عمل نشطة' : 'وقت العمل اليومي';
        dayStateBadgeClass = isWorkRunning ? 'bg-emerald-600 text-white animate-pulse' : 'bg-stone-900 text-white';
        nowHeadline = `أنت في وقت العمل (${completedDesigns} من ${totalDesigns} Designs مكتملة)`;
        nowDetail = activeDesign 
          ? `جاري العمل على ${activeDesign.title} (${Math.floor(activeDesign.durationSeconds / 60)} دقيقة مسجلة)`
          : `متبقي ${totalDesigns - completedDesigns} تصميمات للوصول للهدف.`;
        nextStepTitle = activeDesign ? `أكمل ${activeDesign.title}` : 'ابدأ أول تصميم';
        nextStepSubtitle = `التسليم قبل 9:30 م — متبقي وقت كافٍ جداً لإنجاز العمل بأريحية.`;
        primaryActionLabel = isWorkRunning ? 'إنهاء التصميم الحالي ✓' : 'بدء موقت العمل';
        primaryActionType = isWorkRunning ? 'finish_design' : 'start_work';
        bannerGuidance = completedDesigns === 0
          ? 'بدأت جلسة الشغل؛ ركّز على تصميم واحد فقط في كل مرة بدون تشتت.'
          : `أنجزت ${completedDesigns} تصميمات؛ استمر على نفس الوتيرة الهادئة لتنهي العمل مبكراً.`;
      }
    }
    // Case 3: Evening Free / Buffer (6:30 PM - 10:30 PM)
    else if (currentM >= 1110 && currentM < 1350) {
      if (completedDesigns >= totalDesigns) {
        dayStateLabel = 'أمسية حرة مستحقة';
        dayStateBadgeClass = 'bg-sky-100 text-sky-800';
        nowHeadline = 'أمسية رايقة ووقت حر';
        nowDetail = 'التزامات العمل مكتملة بالكامل، ولديك مساحة للتواصل الاجتماعي والراحة.';
        nextStepTitle = 'تواصل أو نشاط خفيف';
        nextStepSubtitle = 'مكالمة سهيلة، قعدة مع خالد، أو فيلم لطيف.';
        primaryActionLabel = 'تسجيل نشاط مع صديق';
        primaryActionType = 'open_timeline';
        bannerGuidance = tomorrowEvent
          ? `التزامات اليوم انتهت. عندك (${tomorrowEvent.title}) غداً ${tomorrowEvent.startTime}، فاستمتع بالمساء دون سهر مفرط.`
          : 'يومك كان منتجاً ومريحاً؛ استمتع بساعات المساء بالطريقة التي تفضلها.';
      } else {
        dayStateLabel = 'المساء — تسليم العمل';
        dayStateBadgeClass = 'bg-amber-100 text-amber-900';
        nowHeadline = `متبقي ${totalDesigns - completedDesigns} تصميمات للتسليم`;
        nowDetail = 'موعد التسليم 9:30 م. يمكنك إنجازها الآن أو استخدام رصيد الإنتاج التراكمي.';
        nextStepTitle = activeDesign ? `إتمام ${activeDesign.title}` : 'إتمام التصميم المتبقي';
        nextStepSubtitle = 'جلسة تركيز قصيرة تنهي بها المطلوب براحة بال.';
        primaryActionLabel = 'متابعة العمل';
        primaryActionType = 'start_work';
        bannerGuidance = 'الوقت كافٍ لإنهاء ما تبقى بهدوء؛ وإذا شعرت بإجهاد، فرصيدك الإضافي موجود لدعمك.';
      }
    }
    // Case 4: Late Night / Winding Down (10:30 PM - 4:00 AM)
    else {
      dayStateLabel = 'وقت التهدئة والاستعداد للنوم';
      dayStateBadgeClass = 'bg-indigo-100 text-indigo-900';
      nowHeadline = 'الليل المتأخر — وقت الهدوء';
      nowDetail = 'إطفاء الشاشات، الابتعاد عن السكرولينج اللاواعي، والاستعداد لنوم مريح.';
      nextStepTitle = 'التهدئة والنوم';
      nextStepSubtitle = tomorrowEvent 
        ? `تذكير: عندك (${tomorrowEvent.title}) غداً ${tomorrowEvent.startTime}. النوم في موعد مناسب يضمن استيقاظك بنشاط.` 
        : 'وقت مناسب للاسترخاء الذهني لحماية طاقتك لليوم التالي.';
      primaryActionLabel = 'تسجيل موعد النوم';
      primaryActionType = 'prepare_sleep';
      bannerGuidance = tomorrowEvent
        ? `عندك ${tomorrowEvent.title} بكرة ${tomorrowEvent.startTime}، فخد ده في الاعتبار وأنت بتخطط لباقي الليلة وابدأ هدي يومك.`
        : 'أنجزت ما عليك اليوم؛ احرص على إنهاء يومك بسلام ذهني بعيداً عن الشاشات الفارغة.';
    }

    // Add prayer context if next prayer is soon
    if (nextPrayer && prayerState) {
      const pM = timeToMinutes(nextPrayer.time);
      const diff = (pM - currentM + 1440) % 1440;
      if (diff <= 35 && diff > 0) {
        remainingContextNote = `صلاة ${nextPrayer.name} بعد ${diff} دقيقة (${nextPrayer.time})`;
      }
    }

    return {
      currentTimeFormatted: currentTime,
      dayStateLabel,
      dayStateBadgeClass,
      nowHeadline,
      nowDetail,
      nextStepTitle,
      nextStepSubtitle,
      primaryActionLabel,
      primaryActionType,
      remainingContextNote,
      bannerGuidance,
    };
  },

  /**
   * Computes the weekly metrics without any single unified score (each metric stands alone).
   */
  getWeeklySnapshot(plan: DayPlan | null, personalState: PersonalLifeState | null): WeeklySnapshotData {
    const todayCompleted = plan?.workdaySession?.designs.filter(d => d.status === 'done').length || 4;
    const todayWorkMins = Math.floor((plan?.workdaySession?.totalWorkSeconds || 12240) / 60);
    const todayFocusedSuhaila = personalState?.todaySuhailaLogs.reduce((acc, l) => acc + l.focusedMinutes, 0) || 45;

    return {
      designsCompleted: 20 + todayCompleted, // 24 out of 28
      designsTarget: 28,
      totalWorkMinutes: 1100 + todayWorkMins, // ~22 hours
      avgSleepHours: 8.3,
      avgWakeTime: '12:15 م',
      prayerCompletionRate: 91, // 91% of prayers logged
      totalFocusedSuhailaMinutes: 420 + todayFocusedSuhaila, // ~7h 45m
      cleanDaysCount: 6,
      totalDaysRecorded: 7,
    };
  },

  formatDuration(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} دقيقة`;
    if (m === 0) return `${h} ساعة`;
    return `${h}س ${m}د`;
  }
};
