/**
 * Guide Repository Interface
 * Defines the contract for fetching and mutating daily guide data.
 * Can be implemented by:
 * - MockGuideRepository (Current in-memory prototype)
 * - RestApiGuideRepository (Future standalone backend / Express / NestJS)
 * - SupabaseGuideRepository / Postgres (Future cloud database)
 */

import { 
  DayPlan, 
  TimeBlock, 
  ActualRecord, 
  DayPattern, 
  AdaptationOption, 
  LiveContextState,
  WorkDesignItem 
} from '../../types/guide';

export interface IGuideRepository {
  /**
   * جلب بيانات خطة وسجل اليوم الحالي
   */
  getTodayPlan(dateStr: string): Promise<DayPlan>;

  /**
   * تحديث النية العامة لليوم
   */
  updateDayIntention(dateStr: string, intention: string): Promise<void>;

  /**
   * إضافة بلوك زمني إلى الخطة
   */
  addTimeBlock(dateStr: string, block: Omit<TimeBlock, 'id'>): Promise<TimeBlock>;

  /**
   * تعديل بلوك زمني موجود
   */
  updateTimeBlock(dateStr: string, blockId: string, updates: Partial<TimeBlock>): Promise<TimeBlock>;

  /**
   * حذف بلوك زمني
   */
  deleteTimeBlock(dateStr: string, blockId: string): Promise<void>;

  /**
   * تسجيل نشاط واقعي (ما حدث فعلياً)
   */
  recordActualActivity(dateStr: string, record: Omit<ActualRecord, 'id'>): Promise<ActualRecord>;

  /**
   * تعديل تسجيل واقعي سابق
   */
  updateActualRecord(dateStr: string, recordId: string, updates: Partial<ActualRecord>): Promise<ActualRecord>;

  /**
   * حذف تسجيل واقعي
   */
  deleteActualRecord(dateStr: string, recordId: string): Promise<void>;

  /**
   * إنهاء نشاط واقعي مستمر (Ongoing Activity)
   */
  endOngoingActivity(dateStr: string, recordId: string, endTime?: string): Promise<ActualRecord>;

  /**
   * جلب الأنماط والدروس المستفادة من الأيام السابقة
   */
  getPatterns(): Promise<DayPattern[]>;

  /**
   * جلب سيناريوهات التكيف المقترحة عند حدوث اختلاف عن الخطة
   */
  getAdaptationOptions(dateStr: string, currentTime: string): Promise<AdaptationOption[]>;

  /**
   * تطبيق سيناريو تكيف معين لتعديل الخطة تلقائياً بمرونة
   */
  applyAdaptation(dateStr: string, adaptationId: string): Promise<DayPlan>;

  /**
   * تحديث عدد التصميمات المنجزة لليوم وحساب رصيد الإنتاج التراكمي
   */
  updateTodayDesigns(dateStr: string, count: number): Promise<DayPlan>;

  /**
   * استخدام رصيد إنتاج من الرصيد المتراكم لتخفيف أو إعفاء اليوم
   */
  useProductionCredit(dateStr: string, amount: number): Promise<DayPlan>;

  /**
   * إدارة يوم العمل (Work Hub)
   */
  startWorkday(dateStr: string, startTime?: string): Promise<DayPlan>;
  endWorkday(dateStr: string, endTime?: string): Promise<DayPlan>;
  updateWorkdayLinks(dateStr: string, trelloUrl: string, driveUrl: string): Promise<DayPlan>;
  toggleDesignTimer(dateStr: string, designId: string): Promise<DayPlan>;
  finishDesign(dateStr: string, designId: string): Promise<DayPlan>;
  addDesign(dateStr: string, title?: string): Promise<DayPlan>;
  updateDesign(dateStr: string, designId: string, updates: Partial<WorkDesignItem>): Promise<DayPlan>;

  /**
   * إدارة الأحداث والمواعيد المستقلة (Events Hub)
   */
  getEvents(dateStr?: string): Promise<import('../../types/guide').LifeEvent[]>;
  addEvent(event: Omit<import('../../types/guide').LifeEvent, 'id'>): Promise<import('../../types/guide').LifeEvent>;
  updateEvent(eventId: string, updates: Partial<import('../../types/guide').LifeEvent>): Promise<import('../../types/guide').LifeEvent>;
  deleteEvent(eventId: string): Promise<void>;

  /**
   * إدارة أركان الصلاة (Daily Prayer Anchor)
   */
  getPrayerState(dateStr: string, currentMinutes?: number): Promise<import('../../types/guide').PrayerDayState>;
  togglePrayer(dateStr: string, prayerId: import('../../types/guide').PrayerId, currentMinutes?: number): Promise<import('../../types/guide').PrayerDayState>;

  /**
   * إدارة تتبع النوم (Sleep Tracking & Stats)
   */
  getSleepState(dateStr: string): Promise<import('../../types/guide').SleepState>;
  recordSleep(dateStr: string, record: Omit<import('../../types/guide').SleepRecord, 'id'>): Promise<import('../../types/guide').SleepState>;
  updateSleepRecord(recordId: string, updates: Partial<import('../../types/guide').SleepRecord>): Promise<import('../../types/guide').SleepState>;
  deleteSleepRecord(recordId: string): Promise<import('../../types/guide').SleepState>;

  /**
   * إدارة الحياة الشخصية والعادات (Personal Life, Suhaila, Social Media, Recovery, Friends, Habits)
   */
  getPersonalLifeState(dateStr: string): Promise<import('../../types/guide').PersonalLifeState>;
  logSuhaila(dateStr: string, log: Omit<import('../../types/guide').SuhailaLog, 'id'>): Promise<import('../../types/guide').PersonalLifeState>;
  deleteSuhailaLog(dateStr: string, logId: string): Promise<import('../../types/guide').PersonalLifeState>;
  logSocialMedia(dateStr: string, log: Omit<import('../../types/guide').SocialMediaLog, 'id'>): Promise<import('../../types/guide').PersonalLifeState>;
  deleteSocialMediaLog(dateStr: string, logId: string): Promise<import('../../types/guide').PersonalLifeState>;
  recordRecovery(
    dateStr: string, 
    status: 'clean' | 'relapse', 
    trigger?: import('../../types/guide').RecoveryTrigger, 
    locationContext?: 'work_apartment' | 'home' | 'other', 
    time?: string, 
    notes?: string
  ): Promise<import('../../types/guide').PersonalLifeState>;
  logFriendActivity(dateStr: string, activity: Omit<import('../../types/guide').FriendActivityLog, 'id'>): Promise<import('../../types/guide').PersonalLifeState>;
  deleteFriendActivity(dateStr: string, activityId: string): Promise<import('../../types/guide').PersonalLifeState>;
  toggleHabit(dateStr: string, habitId: string): Promise<import('../../types/guide').PersonalLifeState>;
  addHabit(habit: Omit<import('../../types/guide').FlexibleHabit, 'id'>): Promise<import('../../types/guide').PersonalLifeState>;
  deleteHabit(habitId: string): Promise<import('../../types/guide').PersonalLifeState>;

  /**
   * إدارة الملاحظات الشخصية (Notes)
   */
  getNotes(): Promise<import('../../types/guide').PersonalNote[]>;
  addNote(note: Omit<import('../../types/guide').PersonalNote, 'id' | 'createdAt'>): Promise<import('../../types/guide').PersonalNote[]>;
  updateNote(noteId: string, updates: Partial<import('../../types/guide').PersonalNote>): Promise<import('../../types/guide').PersonalNote[]>;
  deleteNote(noteId: string): Promise<import('../../types/guide').PersonalNote[]>;
  togglePinNote(noteId: string): Promise<import('../../types/guide').PersonalNote[]>;

  /**
   * إدارة الإعدادات العامة (Settings)
   */
  getSettings(): Promise<import('../../types/guide').AppSettings>;
  updateSettings(updates: Partial<import('../../types/guide').AppSettings>): Promise<import('../../types/guide').AppSettings>;

  /**
   * ==========================================
   * Normalized Entities & Ledger Data Access
   * Database-Ready API (PostgreSQL / Supabase)
   * ==========================================
   */

  // 1. User Profile
  getUserProfile(): Promise<import('../../models/user').UserProfileEntity>;
  updateUserProfile(updates: Partial<import('../../models/user').UserProfileEntity>): Promise<import('../../models/user').UserProfileEntity>;

  // 2. Production Credit Ledger (Transaction-based)
  getCreditTransactions(): Promise<import('../../models/productionCredit').CreditTransactionEntity[]>;
  addCreditTransaction(tx: Omit<import('../../models/productionCredit').CreditTransactionEntity, 'id' | 'createdAt'>): Promise<import('../../models/productionCredit').CreditTransactionEntity>;
  getCreditSummary(): Promise<import('../../models/productionCredit').ProductionCreditSummary>;

  // 3. Normalized Day & Work Day
  getNormalizedDay(dateStr: string): Promise<import('../../models/day').DayEntity>;
  getWorkDay(dateStr: string): Promise<import('../../models/work').WorkDayEntity>;
  getDesigns(dateStr: string): Promise<import('../../models/work').DesignEntity[]>;
  getWorkSessions(dateStr: string): Promise<import('../../models/work').WorkSessionEntity[]>;

  // 4. Normalized Activities
  getActivities(dateStr: string): Promise<import('../../models/activity').ActivityEntity[]>;
  logActivity(activity: Omit<import('../../models/activity').ActivityEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<import('../../models/activity').ActivityEntity>;

  // 5. Automated Daily Check-In & Computations
  computeDailySummary(dateStr: string): Promise<import('../../models/checkin').ComputedDaySummary>;
  getDailyCheckIn(dateStr: string): Promise<import('../../models/checkin').DailyCheckInEntity | null>;
  getAllDailyCheckIns(): Promise<import('../../models/checkin').DailyCheckInEntity[]>;
  getHistoricalPlans(): Promise<DayPlan[]>;
  saveDailyCheckIn(dateStr: string, reflection?: { mood?: any; dailyRating?: number; note?: string }): Promise<import('../../models/checkin').DailyCheckInEntity>;
}


