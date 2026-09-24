/**
 * Personal Daily Guide - Domain Types
 * Core Philosophy: Plan → Live → Record → Understand → Adapt
 * Designed to be clean, storage-agnostic, and exportable to any backend.
 */

export * from '../models';

export type CategoryType = 
  | 'deep_work'     // عمل عميق وتركيز (تصميمات الشغل)
  | 'learning'      // تعلم وقراءة
  | 'routine'       // مهام روتينية وإدارية
  | 'health'        // صحة، حركة ورياضة
  | 'rest'          // راحة وتجديد طاقة
  | 'social'        // أسرة، سهيلة، أصدقاء
  | 'institute'     // المعهد (حدث غير دوري)
  | 'unstructured'; // وقت مرن غير مقيد

// أنواع الأنشطة الواقعية لتسجيل اليوم الفعلي (Reality of the Day)
export type ActivityType =
  | 'sleep'         // نوم
  | 'wake_up'       // استيقاظ
  | 'work'          // شغل
  | 'design'        // تصميم
  | 'prayer'        // صلاة
  | 'suhaila'       // سهيلة
  | 'family'        // أهل
  | 'friends'       // أصحاب
  | 'gaming'        // ألعاب
  | 'social_media'  // سوشيال ميديا
  | 'institute'     // معهد
  | 'outing'        // مشوار / خروجة
  | 'personal'      // وقت شخصي / روقان
  | 'meal'          // وجبة / فطار / غداء
  | 'other';        // أخرى

export type MoodType = 'calm' | 'focused' | 'tired' | 'energized' | 'distracted';

export type DriftStatus = 
  | 'on_track'       // تسير وفق الخطة بمرونة
  | 'gentle_shift'   // تأخر أو تقديم بسيط، طبيعي جداً
  | 'recalibrating'  // حدث تغيير ملحوظ واليوم يحتاج إعادة توازن هادئة
  | 'resting'        // فترة راحة مستحقة
  | 'early_finish';  // تم الإنجاز مبكراً مع وقت حر

// أنواع الأحداث المستقلة (Events)
export type EventType = 
  | 'institute'            // المعهد
  | 'appointment'          // موعد
  | 'meeting'              // اجتماع
  | 'outing'               // مشوار / خروجة
  | 'important_deadline'   // ديدلاين مهم
  | 'personal'             // حدث شخصي
  | 'work'                 // حدث عمل
  | 'custom';              // حدث مخصص

export interface LifeEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  durationMinutes?: number;
  type: EventType;
  location?: string;
  notes?: string;
  isCompleted?: boolean;
  prepMinutes?: number; // وقت تحضير وتنقل
}

// أركان الصلاة كمرساة يومية (Daily Anchor)
export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerItem {
  id: PrayerId;
  name: string; // الفجر، الظهر، العصر، المغرب، العشاء
  time: string; // HH:mm
  isCompleted: boolean;
  completedAt?: string; // وقت التسجيل
}

export interface PrayerDayState {
  date: string;
  prayers: PrayerItem[];
  nextPrayer: {
    id: PrayerId;
    name: string;
    time: string;
    minutesRemaining: number;
    isPast: boolean;
  };
  completedCount: number;
}

// نظام تتبع النوم (Sleep Tracking)
export type SleepQuality = 1 | 2 | 3 | 4 | 5;

export interface SleepRecord {
  id: string;
  date: string; // تاريخ يوم الاستيقاظ (YYYY-MM-DD)
  sleepTime: string; // وقت النوم مثلاً 03:45 ص
  wakeTime: string; // وقت الاستيقاظ مثلاً 12:18 م
  durationMinutes: number; // محسوبة بالدقائق
  quality?: SleepQuality; // 1-5
  notes?: string;
}

export interface SleepStats {
  hasSufficientData: boolean;
  recordedDaysCount: number;
  minDaysRequired: number;
  averageSleepTime?: string;
  averageWakeTime?: string;
  averageDurationMinutes?: number;
  workStartCorrelationObservation?: string;
}

export interface SleepState {
  targetWakeUpTime: string; // "12:00"
  todayRecord?: SleepRecord;
  history: SleepRecord[];
  stats: SleepStats;
}

// ==========================================
// Personal Life & Habits Domain Types
// Philosophy: "Understand my behavior, not gamify my life."
// Respectful, simple, non-judgmental, fast logging.
// ==========================================

// 1. Suhaila Connection (Activity, NOT a task; Focused Time vs Total Time)
export interface SuhailaLog {
  id: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  totalMinutes: number; // e.g. 130 min (2h 10m)
  focusedMinutes: number; // e.g. 45 min (الوقت الصافي الحقيقي بدون تشتت وسوشيال)
  notes?: string;
}

// 2. Social Media Usage (TikTok, Instagram - understanding, not demonizing)
export type SocialPlatform = 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'other';

export interface SocialMediaLog {
  id: string;
  date: string; // YYYY-MM-DD
  platform: SocialPlatform;
  startTime: string; // "15:20"
  endTime: string; // "16:40"
  durationMinutes: number; // e.g. 80 min
  mode: 'intentional' | 'automatic'; // واعي/مقصود vs تلقائي/سحب وقت لا واعي
  notes?: string;
}

// 3. Recovery Tracking (Porn & Masturbation - Clean Day / Relapse)
// Crucial Context: Bed is NOT the trigger. Trigger = Alone in work apartment with computer & phone + empty time / scrolling / boredom.
// Relapse does NOT ruin the day; day continues calmly.
export type RecoveryTrigger = 
  | 'boredom'          // ملل
  | 'loneliness'       // وحدة وانعزال
  | 'social_media'     // تصفح وسوشيال ميديا لا واعي
  | 'staying_up_late'  // سهر متأخر
  | 'empty_time'       // وقت فارغ بدون اتجاه
  | 'sexual_content'   // محتوى مصادف
  | 'other';           // أخرى

export interface RecoveryLog {
  id: string;
  date: string; // YYYY-MM-DD
  status: 'clean' | 'relapse';
  time?: string; // وقت الانتكاسة إن حدثت
  trigger?: RecoveryTrigger;
  locationContext?: 'work_apartment' | 'home' | 'other'; // غالبًا شقة الشغل مع الكمبيوتر والموبايل
  notes?: string;
}

// 4. Friends & Social Activities (Khaled, outings, casual visits - unscheduled)
export interface FriendActivityLog {
  id: string;
  date: string; // YYYY-MM-DD
  friendName: string; // e.g. 'Khaled'
  activityType: 'outing' | 'call' | 'visit' | 'coffee_walk' | 'gaming' | 'other';
  durationMinutes: number;
  notes?: string;
}

// 5. General Flexible Habits (Observed behaviors without gamification/streaks/badges)
export interface FlexibleHabit {
  id: string;
  title: string;
  category: string;
  description?: string;
  isArchived?: boolean;
}

export interface HabitLogEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  notes?: string;
}

// Overall Personal Life & Habits State for the Day
export interface PersonalLifeState {
  todaySuhailaLogs: SuhailaLog[];
  todaySocialMediaLogs: SocialMediaLog[];
  todayRecovery?: RecoveryLog;
  todayFriendActivities: FriendActivityLog[];
  habits: FlexibleHabit[];
  todayHabitEntries: HabitLogEntry[];
  
  // Computed aggregations for quick overview
  suhailaTotalMinutes: number;
  suhailaFocusedMinutes: number;
  socialMediaTotalMinutes: number;
  socialMediaAutomaticMinutes: number;
  socialMediaIntentionalMinutes: number;

  // History for pattern recognition (clean days, triggers, correlations)
  recoveryHistory: RecoveryLog[];
  socialMediaHistory: SocialMediaLog[];
  suhailaHistory: SuhailaLog[];
  friendActivitiesHistory: FriendActivityLog[];
}

// سياق الأحداث والصلاة والنوم للمرشد اليومي
export interface EventContextInfo {
  todayEvents: LifeEvent[];
  upcomingTodayEvent: LifeEvent | null;
  minutesUntilUpcoming: number | null;
  tomorrowMorningEvents: LifeEvent[];
}

export interface PrayerContextInfo {
  nextPrayer: {
    id: PrayerId;
    name: string;
    time: string;
    minutesRemaining: number;
  };
  prayers: PrayerItem[];
  completedCount: number;
}

export interface SleepContextInfo {
  targetWakeTime: string;
  actualWakeTime?: string;
  wakeDriftMinutes?: number;
  lastNightDurationFormatted?: string;
  isLateWake: boolean;
  needsWindDownForTomorrow: boolean;
  tomorrowEarlyEventTitle?: string;
}

export type BlockKind = 'flexible_block' | 'fixed_event' | 'adhoc_event';

// مراحل اليوم الحقيقي
export type DayPhaseId = 
  | 'waking_up'        // بداية اليوم الهادئة (فطار، شاي، وقت أهلي وتواصل مع سهيلة)
  | 'work_prep'        // الاستعداد للشغل والتهيئة الذهنية
  | 'work_session'     // وقت الشغل الأساسي (3-4 ساعات تصميم)
  | 'work_delivery'    // إنهاء الشغل والتسليم (قبل 9-10 مساءً)
  | 'personal_social'  // وقت شخصي وتواصل اجتماعي
  | 'wind_down';       // الاستعداد للنوم

export interface DayPhase {
  id: DayPhaseId;
  label: string;
  idealWindow: string; // مثل "12:00 - 13:30"
  description: string;
  isCurrent: boolean;
}

// نظام رصيد الإنتاج (Production Credit System - Ledger Based)
export interface ProductionCreditState {
  totalCreditBalance: number; // إجمالي الرصيد التراكمي المحفوظ (محسوب حصرياً من المعاملات)
  dailyBaseTarget: number; // الهدف الأساسي لليوم (عادة 4 تصميمات)
  todayCompletedDesigns: number; // ما تم تصميمه اليوم فعلاً
  creditUsedToday: number; // رصيد تم سحبه لتقليل ضغط اليوم
  todayRemainingRequired: number; // المتبقي المطلوب لليوم بعد احتساب الرصيد
  isOfficialWorkDay: boolean; // الأحد إلى الخميس = true، الجمعة والسبت = false
  deliveryDeadline: string; // "21:30"
  statusSummary: string; // نص يوضح حالة الرصيد دون لوم
  transactions?: import('../models/productionCredit').CreditTransactionEntity[];
  summary?: import('../models/productionCredit').ProductionCreditSummary;
}

// حالات التصميم الفردي داخل Work Hub
export type DesignStatus = 'not_started' | 'in_progress' | 'done';

export interface WorkDesignItem {
  id: string;
  orderNumber: number; // 1, 2, 3, 4, 5...
  title: string; // مثل "تصميم 01" أو اسم العميل / الفكرة
  status: DesignStatus;
  startTime?: string; // HH:mm عند بدء المؤقت أول مرة
  endTime?: string; // HH:mm عند إنهاء التصميم
  durationSeconds: number; // الوقت الفعلي المستغرق بالثواني
  isTimerRunning: boolean; // هل المؤقت نشط حالياً
  trelloCardUrl?: string; // رابط كارت التريلو للتصميم (اختياري)
  driveFileUrl?: string; // رابط ملف الدرايف (اختياري)
  notes?: string;
  isExtra: boolean; // هل هو تصميم إضافي فوق الهدف
}

export interface WorkdaySummary {
  completedCount: number;
  targetCount: number;
  totalWorkFormatted: string; // e.g. "3h 24m"
  creditEarned: number; // e.g. +4
  creditUsed: number;
  wasTargetMet: boolean;
  completedAtTime: string;
}

export interface WorkdaySession {
  isActive: boolean; // هل يوم العمل مبدوء حالياً (Start Workday)
  workStartTime?: string; // HH:mm
  workEndTime?: string; // HH:mm
  totalWorkSeconds: number; // إجمالي وقت الشغل المركز
  isWorkTimerRunning: boolean;
  trelloBoardUrl: string; // رابط بورد تريلو الرئيسي
  googleDriveFolderUrl: string; // رابط فولدر جوجل درايف الرئيسي
  designs: WorkDesignItem[];
  activeDesignId: string | null;
  lastSummary?: WorkdaySummary;
}

export interface TimeBlock {
  id: string;
  kind: BlockKind; // تمييز صريح بين البلوك المرن، والحدث الثابت، والحدث العارض
  title: string;
  category: CategoryType;
  startTime: string; // HH:mm format, e.g. "09:00"
  endTime: string;   // HH:mm format, e.g. "10:30"
  isFlexible: boolean; // هل البلوك قابل للترحيل عند الحاجة؟
  location?: string; // مكان الحدث إن وجد (مثل: المعهد، العيادة)
  prepMinutesBefore?: number; // وقت الاستعداد والتنقل للحدث
  context?: string; // سياق أو مكان
  intention?: string; // ما النية وراء هذا البلوك
  completed?: boolean;
  completedAt?: string; // وقت الإكمال الفعلي لمعرفة الإنجاز المبكر
  associatedDesignsCount?: number; // عدد التصميمات المرتبطة بالجلسة إن وجدت
}

export interface ActualRecord {
  id: string;
  blockId?: string; // إن كان مرتبطاً ببلوك مخطط
  activityType: ActivityType; // نوع النشاط بدقة (مثل: work, design, prayer, family, suhaila, sleep, etc.)
  title: string;
  category: CategoryType;
  actualStartTime: string; // "14:07" or "12:18"
  actualEndTime?: string; // "14:52" (undefined إذا كان مستمراً أو حدث نقطي)
  isOngoing?: boolean; // هل النشاط مستمر حالياً في الواقع
  isPointInTime?: boolean; // هل هو لحظة/حدث نقطي (مثل استيقاظ 12:18 أو أذان/صلاة 4:10)
  durationMinutes?: number; // المدة المحسوبة بالدقائق
  energyLevel?: 1 | 2 | 3 | 4 | 5; // 1: استنزاف تام، 5: طاقة وحيوية عالية
  mood?: MoodType;
  notes?: string;
  wasPlanned: boolean;
  plannedStartTime?: string; // e.g. "14:00"
  plannedEndTime?: string; // e.g. "17:30"
  driftMinutes?: number; // الفارق الزمني عن الخطة بالدقائق (مثل +37 دقيقة)
  driftReason?: string; // سبب التغيير إن وجد، بدون أي إحساس بالذنب
  completedDesigns?: number; // عدد التصميمات المنجزة في هذه الجلسة
  associatedDesignId?: string; // ارتباط مباشر بتصميم في Work Hub إن وجد
}

export interface CurrentActivityInfo {
  isIdentified: boolean; // هل تم تحديد ما يفعله المستخدم حالياً بشكل حقيقي ومؤكد
  source: 'ongoing_record' | 'work_timer' | 'design_timer' | 'unspecified';
  title: string;
  activityType?: ActivityType;
  startedAt?: string;
  durationMinutesSoFar?: number;
  activeRecordId?: string;
  note?: string;
  suggestedFromPlan?: {
    blockTitle: string;
    plannedTimeRange: string;
    category: CategoryType;
  };
}

export type GuideCurrentState =
  | 'not_started_day'        // Not Started Day (early morning or before wake time)
  | 'starting_day'           // Starting Day (recent wake up, morning/midday calm start, breakfast, tea, prayer)
  | 'preparing_for_work'     // Preparing for Work (e.g. 15-45 mins before work start window)
  | 'work_time'              // Work Time (work hours reached, target exists, ready to start or continue)
  | 'work_in_progress'       // Work In Progress (timer running, active design being worked on, or ongoing work session)
  | 'work_target_completed'  // Work Target Completed (e.g. 4/4 or 8/4 reached, credit updated)
  | 'personal_time'          // Personal Time (evening, social, family, Suhaila, leisure, post-delivery window)
  | 'event_soon'             // Event Soon (an important scheduled event is starting soon, within ~30-45 mins)
  | 'prayer_soon'            // Prayer Soon (next prayer is within <= 20 mins or current prayer window)
  | 'preparing_for_tomorrow' // Preparing for Tomorrow (late night, e.g. institute at 9 AM tomorrow, winding down)
  | 'day_ending'             // Day Ending (time to sleep, late night rest)
  | 'unknown_state';         // Unknown / No Clear State (no active work, no timer, no logged ongoing activity)

export interface ContextTip {
  id: string;
  type: 'event' | 'prayer' | 'credit' | 'sleep' | 'personal' | 'work';
  text: string;
  severity?: 'info' | 'highlight' | 'gentle_alert';
}

export interface NextSuggestedAction {
  id: string;
  title: string;
  tagline: string;
  rationale: string;
  suggestedDurationMinutes: number;
  kind: 'continue_current' | 'gentle_start' | 'take_rest' | 'pivot_lighter' | 'wrap_up' | 'event_prep' | 'earned_freedom' | 'credit_celebration' | 'optional_work';
  reassuranceNote: string;
  relatedEventTitle?: string;
  currentPhase?: DayPhaseId;
  priorityLevel: 1 | 2 | 3 | 4 | 5;
  priorityReason: string;
  actionCta?: {
    label: string;
    actionType: 'start_work' | 'resume_design' | 'take_break' | 'log_activity' | 'view_events' | 'prepare_sleep' | 'use_credit';
    targetTab?: 'dashboard' | 'work' | 'calendar' | 'personal' | 'notes';
    targetDesignId?: string;
  };
}

export interface NextStepGuidance extends NextSuggestedAction {}

export interface DayPattern {
  id: string;
  type: 'energy_peak' | 'drift_pattern' | 'rest_need' | 'deep_work_sweetspot' | 'event_impact' | 'credit_insight';
  title: string;
  observation: string;
  practicalTip: string;
  confidence: 'strong' | 'emerging';
}

export interface AdaptationOption {
  id: string;
  title: string;
  summary: string;
  reason: string;
  type: 'late_start' | 'energy_protect' | 'event_cushion' | 'early_bonus' | 'use_production_credit';
  proposedChanges: {
    blockId: string;
    action: 'shift_time' | 'shorten' | 'postpone' | 'convert_to_rest' | 'create_free_time';
    detail: string;
  }[];
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  mainFocusIntention: string; // نية اليوم العامة الهادئة
  energyExpectation: 1 | 2 | 3 | 4 | 5;
  targetWakeUpTime: string; // "12:00"
  actualWakeUpTime?: string; // وقت الاستيقاظ الفعلي
  workStartTimeTarget: string; // "14:00"
  deliveryDeadlineTarget: string; // "21:30"
  productionCredit: ProductionCreditState; // حالة رصيد الإنتاج
  workdaySession: WorkdaySession; // جلسة يوم العمل والتصميمات في الـ Work Hub
  blocks: TimeBlock[];
  actualRecords: ActualRecord[];
  dayReflection?: {
    howDayFelt: string;
    learnedAboutSelf: string;
  };
}

export interface LiveContextState {
  simulatedOrRealTime: string; // HH:mm
  currentEnergy: 1 | 2 | 3 | 4 | 5;
  currentMood: MoodType;
  currentPhase: DayPhase;
  currentActivity: CurrentActivityInfo; // معرفة النشاط الحالي الفعلي بدقة وبدون افتراضات خاطئة
  activeBlock: TimeBlock | null;
  upcomingFixedEvent: TimeBlock | null; // الحدث القادم (سواء معهد أو موعد أو خروجة)
  minutesUntilNextEvent: number | null;
  minutesUntilDeliveryDeadline: number;
  isFinishedEarly: boolean;
  productionCredit: ProductionCreditState;
  eventsContext: EventContextInfo;
  prayerContext: PrayerContextInfo;
  sleepContext: SleepContextInfo;
  nextStep: NextStepGuidance;
  status: DriftStatus;
  // Decision Engine properties
  currentState: GuideCurrentState;
  currentStateLabel: string;
  currentStateDescription: string;
  nextAction: NextSuggestedAction;
  contextTips: ContextTip[];
  remainingMinutesInDay: number;
  adaptedFromReality: boolean;
  isDeterministic: boolean;
}

// ==========================================
// Notes & Settings Domain Models
// ==========================================

export type NoteCategory = 'general' | 'work' | 'reflection' | 'institute' | 'ideas';

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  isPinned: boolean;
  createdAt: string; // ISO string
  updatedAt?: string;
}

export interface AppSettings {
  profileName: string;
  timezone: string; // "Africa/Cairo"
  wakeTargetTime: string; // "12:00"
  officialWorkDays: number[]; // [0, 1, 2, 3, 4] for Sun-Thu
  dailyBaseDesignTarget: number; // 4
  deliveryDeadline: string; // "21:30"
  appearanceTheme: 'calm_light' | 'midnight_slate' | 'system';
  quietHoursStart: string; // "23:00"
  quietHoursEnd: string; // "11:30"
}
