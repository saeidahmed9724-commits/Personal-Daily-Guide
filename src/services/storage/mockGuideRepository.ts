/**
 * Mock Guide Repository
 * Used exclusively for prototyping and testing UI & UX in this phase.
 * Ready to be replaced by a database-backed repository later without altering UI components.
 */

import { IGuideRepository } from './guideRepository';
import { 
  DayPlan, 
  TimeBlock, 
  ActualRecord, 
  DayPattern, 
  AdaptationOption,
  WorkDesignItem,
  LifeEvent,
  PrayerDayState,
  PrayerId,
  SleepRecord,
  SleepState,
  PersonalLifeState,
  SuhailaLog,
  SocialMediaLog,
  RecoveryLog,
  RecoveryTrigger,
  FriendActivityLog,
  FlexibleHabit,
  HabitLogEntry,
  PersonalNote,
  AppSettings
} from '../../types/guide';
import { 
  UserProfileEntity,
  DayEntity,
  ActivityEntity,
  WorkDayEntity,
  DesignEntity,
  WorkSessionEntity,
  CreditTransactionEntity,
  ProductionCreditSummary,
  PrayerRecordEntity,
  DailyCheckInEntity,
  ComputedDaySummary
} from '../../models';
import { ProductionCreditLedger } from '../ledger/productionCreditLedger';
import { DailyComputationService } from '../computation/dailyComputationService';
import { prayerService } from '../prayerService';
import { sleepService } from '../sleepService';
import { personalLifeService } from '../personalLifeService';

export class MockGuideRepository implements IGuideRepository {
  private userProfile: UserProfileEntity;
  private creditTransactions: CreditTransactionEntity[] = [];
  private normalizedActivities: ActivityEntity[] = [];
  private workSessions: WorkSessionEntity[] = [];
  private dailyCheckIns: Record<string, DailyCheckInEntity> = {};
  private todayPlan: DayPlan;
  private patterns: DayPattern[];
  private events: LifeEvent[] = [];
  private completedPrayers: Partial<Record<PrayerId, { isCompleted: boolean; completedAt?: string }>> = {
    fajr: { isCompleted: true, completedAt: '05:10' },
    dhuhr: { isCompleted: true, completedAt: '13:00' },
    asr: { isCompleted: true, completedAt: '16:15' },
    maghrib: { isCompleted: false },
    isha: { isCompleted: false },
  };
  private sleepRecords: SleepRecord[] = [];
  private suhailaLogs: SuhailaLog[] = [];
  private socialMediaLogs: SocialMediaLog[] = [];
  private recoveryLogs: RecoveryLog[] = [];
  private friendActivityLogs: FriendActivityLog[] = [];
  private flexibleHabits: FlexibleHabit[] = [];
  private habitLogEntries: HabitLogEntry[] = [];


  constructor() {
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
    const isOfficialWorkDay = dayOfWeek !== 5 && dayOfWeek !== 6;

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    const daysAgo2 = new Date();
    daysAgo2.setDate(daysAgo2.getDate() - 2);
    const daysAgo2Str = daysAgo2.toISOString().split('T')[0];

    const daysAgo3 = new Date();
    daysAgo3.setDate(daysAgo3.getDate() - 3);
    const daysAgo3Str = daysAgo3.toISOString().split('T')[0];

    const daysAgo4 = new Date();
    daysAgo4.setDate(daysAgo4.getDate() - 4);
    const daysAgo4Str = daysAgo4.toISOString().split('T')[0];

    // ==========================================
    // تهيئة سجل معاملات رصيد الإنتاج (Transaction Ledger)
    // لا يتم تخزين الرصيد كرقم عشوائي، بل يُحسب من المعاملات:
    // +2 (من 4 أيام) + +2 (من 3 أيام) + +2 (من يومين) - 2 (أمس لتخفيف مشوار المعهد) = +4
    // ==========================================
    this.creditTransactions = [
      {
        id: 'tx-seed-1',
        userId: 'usr-1',
        amount: 2,
        type: 'earned_extra',
        sourceDay: daysAgo4Str,
        date: new Date(Date.now() - 4 * 86400000).toISOString(),
        note: 'إنجاز تصميمين إضافيين فوق الهدف الأساسي (+2)',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'tx-seed-2',
        userId: 'usr-1',
        amount: 2,
        type: 'earned_extra',
        sourceDay: daysAgo3Str,
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        note: 'تسليم مبكر وتصميمين إضافيين قبل الموعد (+2)',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'tx-seed-3',
        userId: 'usr-1',
        amount: 2,
        type: 'weekend_bonus',
        sourceDay: daysAgo2Str,
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        note: 'تصميمين اختياريين بروقان يوم عطلة نهاية الأسبوع (+2)',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'tx-seed-4',
        userId: 'usr-1',
        amount: -2,
        type: 'spent_off_day',
        sourceDay: yesterdayStr,
        relatedDay: yesterdayStr,
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        note: 'استخدام 2 من رصيد الإنتاج لتخفيف ضغط يوم مشوار المعهد (-2)',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];

    const initialCalculatedBalance = ProductionCreditLedger.calculateBalance(this.creditTransactions);
    const initialCreditSummary = ProductionCreditLedger.getSummary(this.creditTransactions);

    // ==========================================
    // تهيئة الملف الشخصي للـ User / Profile
    // ==========================================
    this.userProfile = {
      id: 'usr-1',
      name: 'سعيد أحمد',
      timezone: 'Africa/Cairo',
      wakeTargetTime: '12:00',
      workDays: [0, 1, 2, 3, 4], // الأحد إلى الخميس
      dailyWorkTarget: 4,
      deliveryDeadline: '21:30',
      preferences: {
        appearanceTheme: 'calm_light',
        quietHoursStart: '23:00',
        quietHoursEnd: '11:30',
        language: 'ar',
      },
      notificationPreferences: {
        prayerReminders: true,
        eventReminders: true,
        quietHoursMuted: true,
        dailyWrapUpReminder: true,
        wrapUpReminderTime: '22:00',
      },
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // ==========================================
    // تهيئة جلسات العمل والأنشطة الواقعية
    // ==========================================
    this.workSessions = [
      {
        id: 'ws-today-1',
        workDayId: `wd-${today}`,
        startTime: '14:00',
        endTime: '17:24',
        durationMinutes: 204, // 3h 24m
        durationSeconds: 204 * 60,
        isTimerRunning: false,
        pauses: [],
        notes: 'جلسة تركيز عميق على تصميمات اليوم الأربعة وتسليمها قبل الموعد',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.normalizedActivities = [
      {
        id: 'act-wake-today',
        dayId: today,
        userId: 'usr-1',
        type: 'wake',
        title: 'الاستيقاظ وبداية اليوم',
        startTime: '12:18',
        durationMinutes: 0,
        isOngoing: false,
        source: 'manual',
        note: 'استيقاظ مريح وقريب جداً من الهدف المرجعي (12:00)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'act-prayer-dhuhr',
        dayId: today,
        userId: 'usr-1',
        type: 'prayer',
        title: 'صلاة الظهر',
        startTime: '13:00',
        durationMinutes: 15,
        isOngoing: false,
        source: 'manual',
        relatedEntityType: 'prayer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'act-work-today',
        dayId: today,
        userId: 'usr-1',
        type: 'work',
        title: 'جلسة عمل التصاميم الأربعة',
        startTime: '14:00',
        endTime: '17:24',
        durationMinutes: 204,
        isOngoing: false,
        source: 'timer',
        relatedEntityType: 'work_session',
        relatedEntityId: 'ws-today-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'act-prayer-asr',
        dayId: today,
        userId: 'usr-1',
        type: 'prayer',
        title: 'صلاة العصر',
        startTime: '16:15',
        durationMinutes: 15,
        isOngoing: false,
        source: 'manual',
        relatedEntityType: 'prayer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.todayPlan = {
      date: today,
      mainFocusIntention: 'إنجاز تصميمات اليوم بتركيز هادئ، وتسليمها قبل الموعد، وحماية رصيد الإنتاج',
      energyExpectation: 4,
      targetWakeUpTime: '12:00',
      actualWakeUpTime: '12:15',
      workStartTimeTarget: '14:00',
      deliveryDeadlineTarget: '21:30',
      productionCredit: {
        totalCreditBalance: initialCalculatedBalance, // محسوب حصرياً من دفتر المعاملات (+4)
        dailyBaseTarget: isOfficialWorkDay ? 4 : 0, // عطلة بالجمعة والسبت والعمل فيهما اختياري
        todayCompletedDesigns: 4,
        creditUsedToday: 0,
        todayRemainingRequired: 0,
        isOfficialWorkDay,
        deliveryDeadline: '21:30',
        transactions: this.creditTransactions,
        summary: initialCreditSummary,
        statusSummary: isOfficialWorkDay 
          ? 'تم إنجاز هدف اليوم الأساسي (4 تصميمات) بالكامل. أي تصميم إضافي يضاف فوراً كمعاملة في رصيدك التراكمي!' 
          : 'اليوم عطلة أسبوعية مستحقة. أي تصميم تقوم به اليوم هو رصيد اختياري بالكامل (+Credit).',
      },
      workdaySession: {
        isActive: true,
        workStartTime: '14:00',
        workEndTime: undefined,
        totalWorkSeconds: 3 * 3600 + 24 * 60, // 3h 24m
        isWorkTimerRunning: false,
        trelloBoardUrl: 'https://trello.com/b/design-hub-pipeline',
        googleDriveFolderUrl: 'https://drive.google.com/drive/folders/clients-delivery-assets',
        activeDesignId: null,
        designs: [
          {
            id: 'des-1',
            orderNumber: 1,
            title: 'تصميم 01 - بوست هوية بصرية (Instagram)',
            status: 'done',
            startTime: '14:05',
            endTime: '14:52',
            durationSeconds: 47 * 60,
            isTimerRunning: false,
            trelloCardUrl: 'https://trello.com/c/design-1-card',
            driveFileUrl: 'https://drive.google.com/file/d/design-1',
            notes: 'تم تصدير الـ PNG بجودة عالية وألوان CMYK للطباعة و RGB للويب',
            isExtra: false,
          },
          {
            id: 'des-2',
            orderNumber: 2,
            title: 'تصميم 02 - بانر موقع إلكتروني رئيسي',
            status: 'done',
            startTime: '15:00',
            endTime: '15:55',
            durationSeconds: 55 * 60,
            isTimerRunning: false,
            trelloCardUrl: 'https://trello.com/c/design-2-card',
            driveFileUrl: 'https://drive.google.com/file/d/design-2',
            notes: 'تعديل التباين والخطوط بناءً على ملاحظات العميل',
            isExtra: false,
          },
          {
            id: 'des-3',
            orderNumber: 3,
            title: 'تصميم 03 - ريلز كوفر وحملة إعلانية',
            status: 'done',
            startTime: '16:15',
            endTime: '17:05',
            durationSeconds: 50 * 60,
            isTimerRunning: false,
            trelloCardUrl: '',
            driveFileUrl: 'https://drive.google.com/file/d/design-3',
            notes: 'ستايل عصري مع أشكال متدرجة',
            isExtra: false,
          },
          {
            id: 'des-4',
            orderNumber: 4,
            title: 'تصميم 04 - قصة يومية ستوري (Story Template)',
            status: 'done',
            startTime: '17:20',
            endTime: '18:12',
            durationSeconds: 52 * 60,
            isTimerRunning: false,
            trelloCardUrl: '',
            driveFileUrl: '',
            notes: 'إنهاء هدف اليوم وتسليم الملفات في مجلد الدرايف',
            isExtra: false,
          },
        ],
        lastSummary: {
          completedCount: 4,
          targetCount: 4,
          totalWorkFormatted: '3h 24m',
          creditEarned: 0,
          creditUsed: 0,
          wasTargetMet: true,
          completedAtTime: '18:15',
        }
      },
      blocks: [
        {
          id: 'b-1',
          kind: 'flexible_block',
          title: 'بداية اليوم: فطار، شاي، وقت مع الأهل وتواصل مع سهيلة',
          category: 'social',
          startTime: '12:00',
          endTime: '13:30',
          isFlexible: true,
          intention: 'بداية هادئة للنفس، تغذية جيدة، وتواصل مع من أحب بدون استعجال',
          completed: true,
          completedAt: '13:25',
        },
        {
          id: 'b-2',
          kind: 'flexible_block',
          title: 'الاستعداد والتهيئة لجلسة الشغل',
          category: 'routine',
          startTime: '13:30',
          endTime: '14:00',
          isFlexible: true,
          intention: 'فتح برامج التصميم، ترتيب الملفات، وتحديد المطلوب بدقة',
          completed: true,
          completedAt: '14:00',
        },
        {
          id: 'b-3',
          kind: 'flexible_block',
          title: 'جلسة الشغل والإنتاج (الهدف: 4 تصميمات)',
          category: 'deep_work',
          startTime: '14:00',
          endTime: '17:30',
          isFlexible: true,
          associatedDesignsCount: 4,
          intention: 'التركيز العميق في إنجاز التصميمات بجودة وراحة دون مقاطعات',
          completed: true,
          completedAt: '17:15',
        },
        {
          id: 'b-4',
          kind: 'flexible_block',
          title: 'استراحة غداء وتجديد طاقة وحركة',
          category: 'rest',
          startTime: '17:30',
          endTime: '18:30',
          isFlexible: true,
          intention: 'فصل ذهني كامل بعد التركيز في التصاميم',
          completed: false,
        },
        {
          id: 'b-5',
          kind: 'flexible_block',
          title: 'مراجعة التصاميم والتسليم (قبل موعد 9-10 مساءً)',
          category: 'routine',
          startTime: '18:30',
          endTime: '20:00',
          isFlexible: true,
          intention: 'التأكد من كل التفاصيل وتسليم الشغل براحة بال تامة قبل الديدلاين',
          completed: false,
        },
        {
          id: 'b-6',
          kind: 'flexible_block',
          title: 'وقت شخصي، خروجة أو تواصل وسهرة مريحة',
          category: 'social',
          startTime: '21:00',
          endTime: '00:30',
          isFlexible: true,
          intention: 'استمتاع بوقت حر بدون أي التزامات عمل',
          completed: false,
        },
        {
          id: 'b-7',
          kind: 'flexible_block',
          title: 'الاستعداد للنوم وتصفية الذهن',
          category: 'rest',
          startTime: '01:00',
          endTime: '02:00',
          isFlexible: true,
          intention: 'نوم هادئ لضمان استيقاظ مريح قرابة الـ 12 ظهراً',
          completed: false,
        },
      ],
      actualRecords: [
        {
          id: 'rec-1',
          blockId: 'b-1',
          activityType: 'wake_up',
          title: 'الاستيقاظ وبداية اليوم',
          category: 'routine',
          actualStartTime: '12:18',
          isPointInTime: true,
          wasPlanned: true,
          plannedStartTime: '12:00',
          driftMinutes: 18,
          energyLevel: 4,
          mood: 'calm',
          notes: 'استيقاظ مريح، 18 دقيقة بعد الهدف لكن بداية هادئة دون أي توتر.',
        },
        {
          id: 'rec-2',
          blockId: 'b-1',
          activityType: 'meal',
          title: 'فطار وشاي وروقان',
          category: 'health',
          actualStartTime: '12:30',
          actualEndTime: '13:15',
          durationMinutes: 45,
          wasPlanned: true,
          energyLevel: 4,
          mood: 'calm',
          notes: 'فطار وتغذية جيدة مع شاي دافئ.',
        },
        {
          id: 'rec-3',
          blockId: 'b-1',
          activityType: 'family',
          title: 'وقت عائلي وتواصل مع الأهل',
          category: 'social',
          actualStartTime: '13:20',
          actualEndTime: '14:05',
          durationMinutes: 45,
          wasPlanned: true,
          energyLevel: 4,
          mood: 'calm',
          notes: 'جلسة طيبة مع الأهل.',
        },
        {
          id: 'rec-4',
          blockId: 'b-3',
          activityType: 'work',
          title: 'بدء جلسة الشغل والإنتاج',
          category: 'deep_work',
          actualStartTime: '14:07',
          isPointInTime: true,
          wasPlanned: true,
          plannedStartTime: '14:00',
          driftMinutes: 7,
          energyLevel: 5,
          mood: 'focused',
          notes: 'البدء بعد 7 دقائق فقط من الموعد المستهدف (2:00 PM). فرق طبيعي وممتاز.',
        },
        {
          id: 'rec-5',
          blockId: 'b-3',
          activityType: 'design',
          title: 'Design 01 — بوست هوية بصرية (Instagram)',
          category: 'deep_work',
          actualStartTime: '14:07',
          actualEndTime: '14:52',
          durationMinutes: 45,
          wasPlanned: true,
          energyLevel: 5,
          mood: 'focused',
          notes: 'إنجاز متقن وسريع، 45 دقيقة كاملة.',
        },
        {
          id: 'rec-6',
          blockId: 'b-3',
          activityType: 'design',
          title: 'Design 02 — بانر موقع رئيسي',
          category: 'deep_work',
          actualStartTime: '15:05',
          actualEndTime: '15:48',
          durationMinutes: 43,
          wasPlanned: true,
          energyLevel: 4,
          mood: 'focused',
          notes: 'تركيز عالٍ وتنسيق الألوان بدقة.',
        },
        {
          id: 'rec-7',
          activityType: 'prayer',
          title: 'صلاة العصر',
          category: 'routine',
          actualStartTime: '16:10',
          isPointInTime: true,
          wasPlanned: false,
          energyLevel: 4,
          mood: 'calm',
          notes: 'صلاة العصر في وقتها واستراحة روحية.',
        },
        {
          id: 'rec-8',
          blockId: 'b-3',
          activityType: 'work',
          title: 'إنهاء يوم العمل وتسليم الملفات في Drive',
          category: 'deep_work',
          actualStartTime: '18:30',
          isPointInTime: true,
          wasPlanned: true,
          plannedStartTime: '17:30',
          driftMinutes: 60,
          energyLevel: 4,
          mood: 'calm',
          notes: 'تم إنهاء الـ 4 تصميمات كاملة وتسليمها قبل موعد الديدلاين بـ 3 ساعات.',
        },
        {
          id: 'rec-9',
          blockId: 'b-6',
          activityType: 'personal',
          title: 'وقت شخصي وروقان وسهرة حرة',
          category: 'rest',
          actualStartTime: '19:00',
          actualEndTime: '23:15',
          durationMinutes: 255,
          wasPlanned: true,
          energyLevel: 4,
          mood: 'calm',
          notes: 'حرية كاملة بدون أي التزامات عمل بعد التسليم.',
        },
        {
          id: 'rec-10',
          blockId: 'b-6',
          activityType: 'suhaila',
          title: 'محادثة وتواصل مع سهيلة',
          category: 'social',
          actualStartTime: '23:30',
          isOngoing: false,
          actualEndTime: '00:15',
          durationMinutes: 45,
          wasPlanned: true,
          energyLevel: 4,
          mood: 'calm',
          notes: 'وقت ممتع ومحادثة دافئة.',
        },
      ],
      dayReflection: {
        howDayFelt: 'يوم متوازن وسلس، والشغل انتهى بوقت مريح قبل موعد التسليم.',
        learnedAboutSelf: 'توفير رصيد إضافي في الأيام الهادئة يزيل تماماً عبء الأيام المزدحمة بالخروجات أو المعهد.',
      }
    };

    this.patterns = [
      {
        id: 'pat-1',
        type: 'credit_insight',
        title: 'قوة رصيد الإنتاج (Production Credit)',
        observation: 'وجود رصيد +4 تصميمات في بنك الإنتاج يقلل توترك اليومي بنسبة 70% عند ظهور أي مشوار معهد أو خروجة مفاجئة.',
        practicalTip: 'عندما تكون في "المود" ولديك طاقة، أنجز تصميماً أو اثنين إضافيين كاستثمار لأيام الراحة.',
        confidence: 'strong',
      },
      {
        id: 'pat-2',
        type: 'deep_work_sweetspot',
        title: 'نافذة الشغل الذهبية (2:00 إلى 6:00 مساءً)',
        observation: 'بدء العمل الساعة 2:00 بعد فطار مريح يمنحك إنتاجية صافية تكفي لإنهاء الـ 4 تصميمات في 3 ساعات فقط.',
        practicalTip: 'التسليم المبكر قبل 9:00 مساءً يضمن لك أمسية وسهرة خالية من أي توتر ذهني.',
        confidence: 'strong',
      },
      {
        id: 'pat-3',
        type: 'event_impact',
        title: 'مشاوير المعهد والخروجات العارضة (Ad-hoc)',
        observation: 'المعهد ليس يوماً إجبارياً ثابتاً. في الأيام التي تذهب فيها مع الأصدقاء أو سهيلة، يفضل تفعيل "استخدام الرصيد" أو ترحيل التصميمات لليوم التالي دون لوم.',
        practicalTip: 'لا تعتبر يوم المعهد عائقاً، بل استخدم رصيدك لتأمين اليوم براحة بال.',
        confidence: 'strong',
      },
    ];

    // تهيئة الأحداث المستقلة (Events)
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    const inTwoDaysDate = new Date();
    inTwoDaysDate.setDate(inTwoDaysDate.getDate() + 2);
    const inTwoDaysStr = inTwoDaysDate.toISOString().split('T')[0];

    this.events = [
      {
        id: 'ev-inst-tomorrow',
        title: 'محاضرة المعهد (نظم وتصميم)',
        date: tomorrowStr,
        startTime: '09:00',
        endTime: '12:30',
        durationMinutes: 210,
        type: 'institute',
        location: 'المعهد العالي',
        prepMinutes: 45,
        notes: 'مشوار معهد صباح الغد — المرشد اليومي يراعي ذلك في سياق المساء لتهيئة نوم مريح',
        isCompleted: false,
      },
      {
        id: 'ev-appt-today',
        title: 'موعد استشارة ومتابعة',
        date: today,
        startTime: '19:30',
        endTime: '20:15',
        durationMinutes: 45,
        type: 'appointment',
        location: 'العيادة التخصصية',
        prepMinutes: 25,
        notes: 'موعد شخصي محدد',
        isCompleted: false,
      },
      {
        id: 'ev-outing-future',
        title: 'خروجة عشاء وسهرة مع الأصدقاء',
        date: inTwoDaysStr,
        startTime: '21:00',
        endTime: '23:30',
        durationMinutes: 150,
        type: 'outing',
        location: 'الممشى السياحي',
        notes: 'وقت ترفيهي هادئ وتجديد نشاط',
        isCompleted: false,
      },
    ];

    // تهيئة سجلات النوم (Sleep History) - بيانات واقعية تكفي للحد الأدنى (5 أيام)
    this.sleepRecords = [
      {
        id: 'slp-today',
        date: today,
        sleepTime: '03:45',
        wakeTime: '12:18',
        durationMinutes: sleepService.calculateDurationMinutes('03:45', '12:18'), // 513m (~8h 33m)
        quality: 4,
        notes: 'نوم عميق ومريح، استيقاظ طبيعي قرابة الظهر وبداية هادئة',
      },
      {
        id: 'slp-1',
        date: yesterdayStr,
        sleepTime: '03:30',
        wakeTime: '12:05',
        durationMinutes: sleepService.calculateDurationMinutes('03:30', '12:05'),
        quality: 4,
        notes: 'بداية يوم ممتازة وتسليم مبكر للشغل',
      },
      {
        id: 'slp-2',
        date: daysAgo2Str,
        sleepTime: '04:15',
        wakeTime: '13:00',
        durationMinutes: sleepService.calculateDurationMinutes('04:15', '13:00'),
        quality: 3,
        notes: 'استيقاظ متأخر ساعة عن الهدف، والنظام كيف اليوم بدون أي لوم وبدأ العمل 2:30',
      },
      {
        id: 'slp-3',
        date: daysAgo3Str,
        sleepTime: '03:50',
        wakeTime: '12:20',
        durationMinutes: sleepService.calculateDurationMinutes('03:50', '12:20'),
        quality: 4,
        notes: 'يوم متوازن ومعدل إنجاز رائع',
      },
      {
        id: 'slp-4',
        date: daysAgo4Str,
        sleepTime: '04:00',
        wakeTime: '12:10',
        durationMinutes: sleepService.calculateDurationMinutes('04:00', '12:10'),
        quality: 4,
        notes: 'نوم منتظم وهدوء ذهني',
      },
    ];

    // ==========================================
    // تهيئة بيانات الحياة الشخصية والعادات (Personal Life)
    // فلسفة: "Understand my behavior, not gamify my life."
    // بدون مهام رتيبة، بدون Streaks، وبفهم عميق للسياق الحقيقي
    // ==========================================

    // 1. تواصل سهيلة (Activity وليست Task؛ مع مفهوم الوقت الصافي Focused Time)
    this.suhailaLogs = [
      {
        id: 'suh-today',
        date: today,
        startTime: '22:15',
        endTime: '00:25',
        totalMinutes: 130, // 2h 10m
        focusedMinutes: 45, // 45m صافي بدون تشتت
        notes: 'مكالمة هادئة بالليل بعد إنهاء التصميمات وحكينا عن تفاصيل اليوم براحة.',
      },
      {
        id: 'suh-1',
        date: yesterdayStr,
        startTime: '21:30',
        endTime: '23:00',
        totalMinutes: 90,
        focusedMinutes: 60,
        notes: 'مكالمة مركزة وجميلة بدون تشتت على الشاشات.',
      },
      {
        id: 'suh-2',
        date: daysAgo2Str,
        startTime: '22:00',
        endTime: '00:10',
        totalMinutes: 130,
        focusedMinutes: 50,
        notes: 'تواصل دافئ ومريح.',
      },
      {
        id: 'suh-3',
        date: daysAgo3Str,
        startTime: '23:00',
        endTime: '00:30',
        totalMinutes: 90,
        focusedMinutes: 40,
      },
    ];

    // 2. استخدام السوشيال ميديا (TikTok / Instagram - فهم الأنماط بدون عداء أو شعور بالفشل)
    this.socialMediaLogs = [
      {
        id: 'soc-today-1',
        date: today,
        platform: 'tiktok',
        startTime: '15:10',
        endTime: '15:45',
        durationMinutes: 35,
        mode: 'automatic', // تصفح تلقائي وقت ركود
        notes: 'تقليب سريع وقت استراحة خفيفة بين التصميمات.',
      },
      {
        id: 'soc-today-2',
        date: today,
        platform: 'instagram',
        startTime: '21:30',
        endTime: '22:10',
        durationMinutes: 40,
        mode: 'intentional', // تصفح مقصود لمصممين ورسائل
        notes: 'متابعة حسابات ملهمة في الديزاين ورد على رسائل.',
      },
      {
        id: 'soc-yest-1',
        date: yesterdayStr,
        platform: 'tiktok',
        startTime: '16:00',
        endTime: '17:15',
        durationMinutes: 75,
        mode: 'automatic',
        notes: 'سحب وقت أطول وقت فراغ.',
      },
      {
        id: 'soc-2-days',
        date: daysAgo2Str,
        platform: 'instagram',
        startTime: '22:30',
        endTime: '23:15',
        durationMinutes: 45,
        mode: 'intentional',
      },
    ];

    // 3. التعافي الشخصي (Recovery: Clean Day ✓ / Relapse)
    // السياق الجوهري: المشكلة ليست في السرير!
    // المحفز الحقيقي = الوجود بمفردك في شقة الشغل مع الكمبيوتر والموبايل ووقت فارغ/ملل.
    // فلسفة: الانتكاسة لا تعني نهاية اليوم؛ يستمر اليوم بسلام وهدوء.
    this.recoveryLogs = [
      {
        id: 'rec-today-status',
        date: today,
        status: 'clean',
        locationContext: 'work_apartment',
        notes: 'يوم مستقر، تم إنجاز العمل مبكراً والتركيز في هدوء.',
      },
      {
        id: 'rec-yest',
        date: yesterdayStr,
        status: 'clean',
        locationContext: 'work_apartment',
      },
      {
        id: 'rec-2days',
        date: daysAgo2Str,
        status: 'clean',
        locationContext: 'work_apartment',
      },
      {
        id: 'rec-3days',
        date: daysAgo3Str,
        status: 'clean',
        locationContext: 'home',
      },
      {
        id: 'rec-4days',
        date: daysAgo4Str,
        status: 'relapse',
        time: '01:45',
        trigger: 'empty_time',
        locationContext: 'work_apartment',
        notes: 'كنت وحدي في شقة الشغل مع الكمبيوتر والموبايل بعد منتصف الليل، وكان هناك وقت فارغ وملل.',
      },
    ];

    // 4. الأصدقاء والأنشطة الاجتماعية غير الثابتة (مثل Khaled)
    this.friendActivityLogs = [
      {
        id: 'fr-today',
        date: today,
        friendName: 'Khaled (خالد)',
        activityType: 'coffee_walk',
        durationMinutes: 60,
        notes: 'قعدة قهوة خفيفة بعد المغرب وكلام عن أفكار جديدة.',
      },
      {
        id: 'fr-3days',
        date: daysAgo3Str,
        friendName: 'Khaled (خالد)',
        activityType: 'call',
        durationMinutes: 35,
        notes: 'مكالمة تليفون سريعة واطمئنان.',
      },
    ];

    // 5. عادات وسلوكيات مرنة للملاحظة (بدون Streaks ولا Badges)
    this.flexibleHabits = [
      {
        id: 'hab-water',
        title: 'شرب مياه كافي على مدار اليوم',
        category: 'صحة ورعاية الجسد',
        description: 'إبقاء زجاجة المياه بجانب الشاشة باستمرار',
      },
      {
        id: 'hab-desk',
        title: 'ترتيب وتهوية مكتب الشغل قبل البدء',
        category: 'بيئة العمل والتركيز',
        description: 'فصل بين النوم والشغل وتصفية الذهن',
      },
      {
        id: 'hab-walk',
        title: 'مشي خفيف أو حركة 15 دقيقة',
        category: 'نشاط وحركة',
        description: 'نزول مشوار بسيط أو تغيير جو بين جلسات التصميم',
      },
      {
        id: 'hab-disconnect',
        title: 'فصل تام عن شاشات الشغل بعد التسليم',
        category: 'سلام ذهني',
        description: 'إغلاق برامج التصميم والتمتع بوقت حر حقيقي',
      },
    ];

    this.habitLogEntries = [
      {
        id: 'he-1',
        habitId: 'hab-water',
        date: today,
        isCompleted: true,
      },
      {
        id: 'he-2',
        habitId: 'hab-desk',
        date: today,
        isCompleted: true,
      },
      {
        id: 'he-3',
        habitId: 'hab-walk',
        date: today,
        isCompleted: true,
      },
      {
        id: 'he-4',
        habitId: 'hab-disconnect',
        date: today,
        isCompleted: false,
      },
    ];
  }

  async getTodayPlan(_dateStr: string): Promise<DayPlan> {
    // Clone to prevent direct accidental mutations
    return JSON.parse(JSON.stringify(this.todayPlan));
  }

  async updateDayIntention(_dateStr: string, intention: string): Promise<void> {
    this.todayPlan.mainFocusIntention = intention;
  }

  async addTimeBlock(_dateStr: string, block: Omit<TimeBlock, 'id'>): Promise<TimeBlock> {
    const newBlock: TimeBlock = {
      ...block,
      id: `b-${Date.now()}`,
    };
    this.todayPlan.blocks.push(newBlock);
    // Sort chronologically
    this.todayPlan.blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return newBlock;
  }

  async updateTimeBlock(_dateStr: string, blockId: string, updates: Partial<TimeBlock>): Promise<TimeBlock> {
    const index = this.todayPlan.blocks.findIndex(b => b.id === blockId);
    if (index === -1) throw new Error(`Block ${blockId} not found`);
    this.todayPlan.blocks[index] = { ...this.todayPlan.blocks[index], ...updates };
    return this.todayPlan.blocks[index];
  }

  async deleteTimeBlock(_dateStr: string, blockId: string): Promise<void> {
    this.todayPlan.blocks = this.todayPlan.blocks.filter(b => b.id !== blockId);
  }

  async recordActualActivity(_dateStr: string, record: Omit<ActualRecord, 'id'>): Promise<ActualRecord> {
    const newRecord: ActualRecord = {
      ...record,
      id: `rec-${Date.now()}`,
    };
    this.todayPlan.actualRecords.push(newRecord);
    return newRecord;
  }

  async updateActualRecord(_dateStr: string, recordId: string, updates: Partial<ActualRecord>): Promise<ActualRecord> {
    const index = this.todayPlan.actualRecords.findIndex(r => r.id === recordId);
    if (index === -1) throw new Error(`Record ${recordId} not found`);
    this.todayPlan.actualRecords[index] = { ...this.todayPlan.actualRecords[index], ...updates };
    return this.todayPlan.actualRecords[index];
  }

  async deleteActualRecord(_dateStr: string, recordId: string): Promise<void> {
    this.todayPlan.actualRecords = this.todayPlan.actualRecords.filter(r => r.id !== recordId);
  }

  async endOngoingActivity(_dateStr: string, recordId: string, endTime?: string): Promise<ActualRecord> {
    const index = this.todayPlan.actualRecords.findIndex(r => r.id === recordId);
    if (index === -1) throw new Error(`Record ${recordId} not found`);
    const record = this.todayPlan.actualRecords[index];
    const now = new Date();
    const formattedEnd = endTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Calculate duration
    const [startH, startM] = record.actualStartTime.split(':').map(Number);
    const [endH, endM] = formattedEnd.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const durationM = Math.max(0, endTotal >= startTotal ? endTotal - startTotal : (1440 - startTotal + endTotal));

    this.todayPlan.actualRecords[index] = {
      ...record,
      actualEndTime: formattedEnd,
      isOngoing: false,
      durationMinutes: durationM,
    };
    return this.todayPlan.actualRecords[index];
  }

  async getPatterns(): Promise<DayPattern[]> {
    return [...this.patterns];
  }

  async getAdaptationOptions(_dateStr: string, _currentTime: string): Promise<AdaptationOption[]> {
    return [
      {
        id: 'adapt-late-start',
        title: 'إعادة ضبط اليوم (بدء متأخر بدون جلد الذات)',
        type: 'late_start',
        summary: 'إذا استيقظت متأخراً أو بدأت يومك بعد موعدك الأصلي، يقوم المرشد بإعادة توزيع الوقت المتبقي واختيار أهم خطوة فقط، دون أي إحساس بفشل اليوم.',
        reason: 'اليوم لم ينتهِ، ما زال أمامك ساعات ممتازة نركز فيها على الأولويات الحقيقية.',
        proposedChanges: [
          {
            blockId: 'b-4',
            action: 'shorten',
            detail: 'تركيز عمل الكود في جلسة صافية مدتها 60 دقيقة فقط',
          },
          {
            blockId: 'b-event-1',
            action: 'create_free_time',
            detail: 'حماية الموعد الثابت في 16:00 وتوفير وقت استعداد كافٍ',
          }
        ]
      },
      {
        id: 'adapt-late-wake',
        title: 'صحيت متأخر؟ إعادة ضبط اليوم بمرونة',
        type: 'late_start',
        summary: 'الاستيقاظ متأخراً ليس فشلاً. نمنحك 45 دقيقة لفطارك وشايك والتواصل، ثم نبدأ جلسة عمل صافية مدتها 3 ساعات مع الحفاظ على موعد التسليم قبل 9:30 مساءً.',
        reason: 'اليوم مرن ويقاس بالنتيجة الصافية والراحة، وليس بالساعة العسكرية.',
        proposedChanges: [
          {
            blockId: 'b-1',
            action: 'shift_time',
            detail: 'بداية هادئة فور الاستيقاظ (شاي وفطار ووقت أهلي وتواصل)',
          },
          {
            blockId: 'b-3',
            action: 'shift_time',
            detail: 'تركيز عمل التصميمات في نافذة 3 ساعات مكثفة قبل موعد التسليم المسائي',
          }
        ]
      },
      {
        id: 'adapt-use-credit-today',
        title: 'استخدام رصيد الإنتاج (Production Credit)',
        type: 'use_production_credit',
        summary: 'لديك رصيد تصميمات إضافية تم إنجازها سابقاً. يمكنك استخدام رصيدك لتقليل المطلوب اليوم إلى تصميمين فقط أو أخذ راحة كاملة!',
        reason: 'رصيد الإنتاج صُمم خصيصاً ليمنحك الحرية والأمان عند انخفاض طاقتك أو رغبتك بالراحة.',
        proposedChanges: [
          {
            blockId: 'b-3',
            action: 'shorten',
            detail: 'تقليل ساعات جلسة الشغل واستخدام وحدتين من رصيد الإنتاج المحفوظ',
          }
        ]
      },
      {
        id: 'adapt-institute-day',
        title: 'مشوار المعهد العارض (Ad-hoc Event)',
        type: 'event_cushion',
        summary: 'المعهد مشوار عارض تذهب إليه مع الصحاب أو سهيلة. نضع وسادة زمنية للمشوار ونعتمد على رصيد التصميمات لتأمين اليوم.',
        reason: 'الأحداث العارضة لا تفسد الأسبوع لأن رصيد الإنتاج يحميك مسبقاً.',
        proposedChanges: [
          {
            blockId: 'b-3',
            action: 'shift_time',
            detail: 'إعادة جدولة جلسة العمل إلى المساء أو الاستفادة من رصيد الإنتاج',
          }
        ]
      }
    ];
  }

  async applyAdaptation(_dateStr: string, adaptationId: string): Promise<DayPlan> {
    if (adaptationId === 'adapt-use-credit-today') {
      if (this.todayPlan.productionCredit.totalCreditBalance >= 2) {
        this.todayPlan.productionCredit.creditUsedToday += 2;
        this.todayPlan.productionCredit.totalCreditBalance -= 2;
        this.todayPlan.productionCredit.todayRemainingRequired = Math.max(0, this.todayPlan.productionCredit.dailyBaseTarget - this.todayPlan.productionCredit.todayCompletedDesigns - this.todayPlan.productionCredit.creditUsedToday);
        this.todayPlan.productionCredit.statusSummary = 'تم استخدام 2 من رصيد الإنتاج! المطلوب لليوم انخفض، وعملك اليوم خفيف ومريح.';
      }
    } else if (adaptationId === 'adapt-late-wake') {
      this.todayPlan.blocks = this.todayPlan.blocks.map(b => {
        if (b.id === 'b-1') return { ...b, startTime: '13:30', endTime: '14:30' };
        if (b.id === 'b-2') return { ...b, startTime: '14:30', endTime: '15:00' };
        if (b.id === 'b-3') return { ...b, startTime: '15:00', endTime: '18:30' };
        return b;
      });
    } else if (adaptationId === 'adapt-gentle-shift') {
      this.todayPlan.blocks = this.todayPlan.blocks.map(b => {
        if (b.id === 'b-4') return { ...b, startTime: '18:00', endTime: '19:00' };
        return b;
      });
    }
    return JSON.parse(JSON.stringify(this.todayPlan));
  }

  async updateTodayDesigns(_dateStr: string, count: number): Promise<DayPlan> {
    const cred = this.todayPlan.productionCredit;
    const previousCompleted = cred.todayCompletedDesigns;
    cred.todayCompletedDesigns = Math.max(0, count);

    // Calculate production credit transaction for extra or voluntary designs
    const delta = cred.todayCompletedDesigns - previousCompleted;
    if (delta > 0) {
      if (cred.isOfficialWorkDay && cred.todayCompletedDesigns > cred.dailyBaseTarget) {
        const extraCount = Math.min(delta, cred.todayCompletedDesigns - cred.dailyBaseTarget);
        const tx = ProductionCreditLedger.recordEarnedExtra(
          'usr-1',
          this.todayPlan.date,
          extraCount,
          `إنجاز ${extraCount} تصميم إضافي فوق الهدف الأساسي لليوم (+${extraCount})`
        );
        this.creditTransactions.push(tx);
      } else if (!cred.isOfficialWorkDay) {
        const tx = ProductionCreditLedger.recordEarnedExtra(
          'usr-1',
          this.todayPlan.date,
          delta,
          `عمل تطوعي اختياري يوم عطلة: إنجاز ${delta} تصميم (+${delta})`
        );
        this.creditTransactions.push(tx);
      }
    }

    // Strictly re-calculate balance and summary from ledger
    cred.totalCreditBalance = ProductionCreditLedger.calculateBalance(this.creditTransactions);
    cred.transactions = [...this.creditTransactions];
    cred.summary = ProductionCreditLedger.getSummary(this.creditTransactions);

    if (cred.isOfficialWorkDay) {
      if (cred.todayCompletedDesigns >= cred.dailyBaseTarget) {
        const extraToday = cred.todayCompletedDesigns - cred.dailyBaseTarget;
        cred.todayRemainingRequired = 0;
        cred.statusSummary = `رائع! أنجزت ${cred.todayCompletedDesigns} تصميمات (الهدف ${cred.dailyBaseTarget}). ${
          extraToday > 0 ? `لديك +${extraToday} تصميمات إضافية اليوم تم توثيقها في دفتر الرصيد!` : 'تم إنجاز هدف اليوم الأساسي بالكامل.'
        }`;
      } else {
        cred.todayRemainingRequired = Math.max(0, cred.dailyBaseTarget - cred.todayCompletedDesigns - cred.creditUsedToday);
        cred.statusSummary = cred.todayRemainingRequired === 0
          ? 'تم إنجاز المطلوب لليوم بمساعدة رصيد الإنتاج!'
          : `أنجزت ${cred.todayCompletedDesigns} من ${cred.dailyBaseTarget} تصميمات. متبقي ${cred.todayRemainingRequired} بهدوء قبل موعد التسليم.`;
      }
    } else {
      cred.statusSummary = `يوم عطلة: قمت بإنتاج ${cred.todayCompletedDesigns} تصميمات اختيارية أضيفت بالكامل كمعاملات في دفتر رصيدك (+Credit).`;
    }

    return JSON.parse(JSON.stringify(this.todayPlan));
  }

  async useProductionCredit(_dateStr: string, amount: number): Promise<DayPlan> {
    const cred = this.todayPlan.productionCredit;
    const currentBalance = ProductionCreditLedger.calculateBalance(this.creditTransactions);
    if (currentBalance >= amount) {
      // Record immutable ledger spending transaction
      const tx = ProductionCreditLedger.recordSpentCredit(
        'usr-1',
        this.todayPlan.date,
        amount,
        `استخدام ${amount} من رصيد الإنتاج لتخفيف متطلبات يوم ${this.todayPlan.date} (-${amount})`,
        this.todayPlan.date
      );
      this.creditTransactions.push(tx);

      // Re-calculate balance strictly from ledger
      cred.totalCreditBalance = ProductionCreditLedger.calculateBalance(this.creditTransactions);
      cred.transactions = [...this.creditTransactions];
      cred.summary = ProductionCreditLedger.getSummary(this.creditTransactions);

      cred.creditUsedToday += amount;
      cred.todayRemainingRequired = Math.max(0, cred.dailyBaseTarget - cred.todayCompletedDesigns - cred.creditUsedToday);
      cred.statusSummary = `تم استخدام ${amount} من رصيد الإنتاج وتوثيق العملية في السجل بنجاح. أصبحت مهمتك اليوم أيسر ومحمية.`;
    }
    return JSON.parse(JSON.stringify(this.todayPlan));
  }

  async startWorkday(_dateStr: string, startTime?: string): Promise<DayPlan> {
    const session = this.todayPlan.workdaySession;
    const now = new Date();
    const timeFormatted = startTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    session.isActive = true;
    session.workStartTime = session.workStartTime || timeFormatted;
    session.isWorkTimerRunning = true;
    session.workEndTime = undefined;

    return JSON.parse(JSON.stringify(this.todayPlan));
  }

  async endWorkday(_dateStr: string, endTime?: string): Promise<DayPlan> {
    const session = this.todayPlan.workdaySession;
    const cred = this.todayPlan.productionCredit;
    const now = new Date();
    const timeFormatted = endTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    session.isActive = false;
    session.isWorkTimerRunning = false;
    session.workEndTime = timeFormatted;

    // Stop any running design timer
    session.designs.forEach(d => {
      d.isTimerRunning = false;
    });

    const hours = Math.floor(session.totalWorkSeconds / 3600);
    const mins = Math.floor((session.totalWorkSeconds % 3600) / 60);
    const formattedDuration = `${hours > 0 ? `${hours}h ` : ''}${mins}m`;

    const completed = session.designs.filter(d => d.status === 'done').length;
    const target = cred.dailyBaseTarget;
    const creditEarned = Math.max(0, completed - target);

    session.lastSummary = {
      completedCount: completed,
      targetCount: target,
      totalWorkFormatted: formattedDuration,
      creditEarned,
      creditUsed: cred.creditUsedToday,
      wasTargetMet: completed >= Math.max(0, target - cred.creditUsedToday),
      completedAtTime: timeFormatted,
    };

    return JSON.parse(JSON.stringify(this.todayPlan));
  }

  async updateWorkdayLinks(_dateStr: string, trelloUrl: string, driveUrl: string): Promise<DayPlan> {
    this.todayPlan.workdaySession.trelloBoardUrl = trelloUrl;
    this.todayPlan.workdaySession.googleDriveFolderUrl = driveUrl;
    return JSON.parse(JSON.stringify(this.todayPlan));
  }

  async toggleDesignTimer(_dateStr: string, designId: string): Promise<DayPlan> {
    const session = this.todayPlan.workdaySession;
    const design = session.designs.find(d => d.id === designId);
    if (!design) return JSON.parse(JSON.stringify(this.todayPlan));

    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (design.isTimerRunning) {
      // Pause
      design.isTimerRunning = false;
      session.activeDesignId = null;
    } else {
      // Pause any other running design timer first (one active design focus at a time)
      session.designs.forEach(d => {
        if (d.id !== designId) d.isTimerRunning = false;
      });

      design.isTimerRunning = true;
      if (design.status === 'not_started') {
        design.status = 'in_progress';
      }
      if (!design.startTime) {
        design.startTime = timeFormatted;
      }
      session.activeDesignId = design.id;

      // Ensure overall workday is active
      if (!session.isActive) {
        session.isActive = true;
        session.workStartTime = session.workStartTime || timeFormatted;
      }
    }

    return JSON.parse(JSON.stringify(this.todayPlan));
  }

  async finishDesign(_dateStr: string, designId: string): Promise<DayPlan> {
    const session = this.todayPlan.workdaySession;
    const design = session.designs.find(d => d.id === designId);
    if (!design) return JSON.parse(JSON.stringify(this.todayPlan));

    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    design.status = 'done';
    design.isTimerRunning = false;
    design.endTime = timeFormatted;
    if (session.activeDesignId === designId) {
      session.activeDesignId = null;
    }

    // Sync with production credit count
    const completedCount = session.designs.filter(d => d.status === 'done').length;
    await this.updateTodayDesigns(_dateStr, completedCount);

    return JSON.parse(JSON.stringify(this.todayPlan));
  }

  async addDesign(_dateStr: string, title?: string): Promise<DayPlan> {
    const session = this.todayPlan.workdaySession;
    const nextOrder = session.designs.length + 1;
    const isExtra = nextOrder > this.todayPlan.productionCredit.dailyBaseTarget;

    const newDesign: WorkDesignItem = {
      id: `des-${Date.now()}`,
      orderNumber: nextOrder,
      title: title || `تصميم ${String(nextOrder).padStart(2, '0')}`,
      status: 'not_started',
      durationSeconds: 0,
      isTimerRunning: false,
      isExtra,
    };

    session.designs.push(newDesign);
    return JSON.parse(JSON.stringify(this.todayPlan));
  }

  async updateDesign(_dateStr: string, designId: string, updates: Partial<WorkDesignItem>): Promise<DayPlan> {
    const session = this.todayPlan.workdaySession;
    const index = session.designs.findIndex(d => d.id === designId);
    if (index !== -1) {
      session.designs[index] = { ...session.designs[index], ...updates };
      const completedCount = session.designs.filter(d => d.status === 'done').length;
      await this.updateTodayDesigns(_dateStr, completedCount);
    }
    return JSON.parse(JSON.stringify(this.todayPlan));
  }

  // ===================== Events Operations =====================

  async getEvents(dateStr?: string): Promise<LifeEvent[]> {
    if (dateStr) {
      return this.events.filter(e => e.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return [...this.events].sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  async addEvent(event: Omit<LifeEvent, 'id'>): Promise<LifeEvent> {
    const newEvent: LifeEvent = {
      ...event,
      id: `ev-${Date.now()}`,
    };
    this.events.push(newEvent);
    return { ...newEvent };
  }

  async updateEvent(eventId: string, updates: Partial<LifeEvent>): Promise<LifeEvent> {
    const index = this.events.findIndex(e => e.id === eventId);
    if (index === -1) throw new Error(`Event ${eventId} not found`);
    this.events[index] = { ...this.events[index], ...updates };
    return { ...this.events[index] };
  }

  async deleteEvent(eventId: string): Promise<void> {
    this.events = this.events.filter(e => e.id !== eventId);
  }

  // ===================== Prayer Operations =====================

  async getPrayerState(dateStr: string, currentMinutes?: number): Promise<PrayerDayState> {
    const now = new Date();
    const currM = currentMinutes !== undefined ? currentMinutes : (now.getHours() * 60 + now.getMinutes());
    return prayerService.computeDayState(dateStr, currM, this.completedPrayers);
  }

  async togglePrayer(dateStr: string, prayerId: PrayerId, currentMinutes?: number): Promise<PrayerDayState> {
    const now = new Date();
    const currM = currentMinutes !== undefined ? currentMinutes : (now.getHours() * 60 + now.getMinutes());
    const currentEntry = this.completedPrayers[prayerId];
    const willBeCompleted = !currentEntry?.isCompleted;

    const timeStr = `${String(Math.floor(currM / 60)).padStart(2, '0')}:${String(currM % 60).padStart(2, '0')}`;

    this.completedPrayers[prayerId] = {
      isCompleted: willBeCompleted,
      completedAt: willBeCompleted ? timeStr : undefined,
    };

    // أيضاً نقوم بتسجيل نشاط صلاة في سجل الواقع إذا تم تعليمه كمكتمل
    if (willBeCompleted) {
      const prayerName = prayerId === 'fajr' ? 'صلاة الفجر' :
        prayerId === 'dhuhr' ? 'صلاة الظهر' :
        prayerId === 'asr' ? 'صلاة العصر' :
        prayerId === 'maghrib' ? 'صلاة المغرب' : 'صلاة العشاء';

      this.todayPlan.actualRecords.push({
        id: `rec-prayer-${Date.now()}`,
        activityType: 'prayer',
        title: prayerName,
        category: 'routine',
        actualStartTime: timeStr,
        isPointInTime: true,
        wasPlanned: false,
        notes: 'تمت الصلاة (مرساة هدوء)',
      });
    }

    return prayerService.computeDayState(dateStr, currM, this.completedPrayers);
  }

  // ===================== Sleep Operations =====================

  async getSleepState(dateStr: string): Promise<SleepState> {
    const todayRecord = this.sleepRecords.find(r => r.date === dateStr);
    const stats = sleepService.analyzeSleepStats(this.sleepRecords);

    return {
      targetWakeUpTime: this.todayPlan.targetWakeUpTime || '12:00',
      todayRecord,
      history: [...this.sleepRecords].sort((a, b) => b.date.localeCompare(a.date)),
      stats,
    };
  }

  async recordSleep(dateStr: string, record: Omit<SleepRecord, 'id'>): Promise<SleepState> {
    const duration = sleepService.calculateDurationMinutes(record.sleepTime, record.wakeTime);
    const newRecord: SleepRecord = {
      ...record,
      id: `slp-${Date.now()}`,
      date: dateStr,
      durationMinutes: duration,
    };

    // استبدال أي تسجيل سابق لنفس التاريخ أو إضافة جديد
    const existingIndex = this.sleepRecords.findIndex(r => r.date === dateStr);
    if (existingIndex !== -1) {
      this.sleepRecords[existingIndex] = newRecord;
    } else {
      this.sleepRecords.unshift(newRecord);
    }

    // تحديث وقت الاستيقاظ الفعلي في الخطة أيضاً
    this.todayPlan.actualWakeUpTime = record.wakeTime;

    return this.getSleepState(dateStr);
  }

  async updateSleepRecord(recordId: string, updates: Partial<SleepRecord>): Promise<SleepState> {
    const index = this.sleepRecords.findIndex(r => r.id === recordId);
    if (index === -1) throw new Error(`Sleep record ${recordId} not found`);

    const updated = { ...this.sleepRecords[index], ...updates };
    if (updates.sleepTime || updates.wakeTime) {
      updated.durationMinutes = sleepService.calculateDurationMinutes(updated.sleepTime, updated.wakeTime);
    }
    this.sleepRecords[index] = updated;

    if (updated.date === this.todayPlan.date && updated.wakeTime) {
      this.todayPlan.actualWakeUpTime = updated.wakeTime;
    }

    return this.getSleepState(this.todayPlan.date);
  }

  async deleteSleepRecord(recordId: string): Promise<SleepState> {
    this.sleepRecords = this.sleepRecords.filter(r => r.id !== recordId);
    return this.getSleepState(this.todayPlan.date);
  }

  /**
   * ==========================================
   * Personal Life & Habits Implementation
   * ==========================================
   */
  async getPersonalLifeState(dateStr: string): Promise<PersonalLifeState> {
    const todaySuhailaLogs = this.suhailaLogs.filter(l => l.date === dateStr);
    const todaySocialMediaLogs = this.socialMediaLogs.filter(l => l.date === dateStr);
    const todayRecovery = this.recoveryLogs.find(l => l.date === dateStr);
    const todayFriendActivities = this.friendActivityLogs.filter(l => l.date === dateStr);
    const todayHabitEntries = this.habitLogEntries.filter(e => e.date === dateStr);

    const suhailaSummary = personalLifeService.calculateSuhailaSummary(todaySuhailaLogs);
    const socialSummary = personalLifeService.calculateSocialMediaSummary(todaySocialMediaLogs);

    return {
      todaySuhailaLogs,
      todaySocialMediaLogs,
      todayRecovery,
      todayFriendActivities,
      habits: [...this.flexibleHabits],
      todayHabitEntries,
      suhailaTotalMinutes: suhailaSummary.totalMinutes,
      suhailaFocusedMinutes: suhailaSummary.focusedMinutes,
      socialMediaTotalMinutes: socialSummary.totalMinutes,
      socialMediaAutomaticMinutes: socialSummary.automaticMinutes,
      socialMediaIntentionalMinutes: socialSummary.intentionalMinutes,
      recoveryHistory: [...this.recoveryLogs].sort((a, b) => b.date.localeCompare(a.date)),
      socialMediaHistory: [...this.socialMediaLogs].sort((a, b) => b.date.localeCompare(a.date)),
      suhailaHistory: [...this.suhailaLogs].sort((a, b) => b.date.localeCompare(a.date)),
      friendActivitiesHistory: [...this.friendActivityLogs].sort((a, b) => b.date.localeCompare(a.date)),
    };
  }

  async logSuhaila(dateStr: string, log: Omit<SuhailaLog, 'id'>): Promise<PersonalLifeState> {
    const newLog: SuhailaLog = {
      ...log,
      id: `suh-${Date.now()}`,
      date: dateStr,
    };
    this.suhailaLogs.unshift(newLog);
    return this.getPersonalLifeState(dateStr);
  }

  async deleteSuhailaLog(dateStr: string, logId: string): Promise<PersonalLifeState> {
    this.suhailaLogs = this.suhailaLogs.filter(l => l.id !== logId);
    return this.getPersonalLifeState(dateStr);
  }

  async logSocialMedia(dateStr: string, log: Omit<SocialMediaLog, 'id'>): Promise<PersonalLifeState> {
    const newLog: SocialMediaLog = {
      ...log,
      id: `soc-${Date.now()}`,
      date: dateStr,
    };
    this.socialMediaLogs.unshift(newLog);
    return this.getPersonalLifeState(dateStr);
  }

  async deleteSocialMediaLog(dateStr: string, logId: string): Promise<PersonalLifeState> {
    this.socialMediaLogs = this.socialMediaLogs.filter(l => l.id !== logId);
    return this.getPersonalLifeState(dateStr);
  }

  async recordRecovery(
    dateStr: string,
    status: 'clean' | 'relapse',
    trigger?: RecoveryTrigger,
    locationContext?: 'work_apartment' | 'home' | 'other',
    time?: string,
    notes?: string
  ): Promise<PersonalLifeState> {
    const existingIndex = this.recoveryLogs.findIndex(r => r.date === dateStr);
    const log: RecoveryLog = {
      id: existingIndex !== -1 ? this.recoveryLogs[existingIndex].id : `rec-rec-${Date.now()}`,
      date: dateStr,
      status,
      trigger,
      locationContext: locationContext || 'work_apartment',
      time,
      notes,
    };

    if (existingIndex !== -1) {
      this.recoveryLogs[existingIndex] = log;
    } else {
      this.recoveryLogs.unshift(log);
    }

    return this.getPersonalLifeState(dateStr);
  }

  async logFriendActivity(dateStr: string, activity: Omit<FriendActivityLog, 'id'>): Promise<PersonalLifeState> {
    const newLog: FriendActivityLog = {
      ...activity,
      id: `fr-${Date.now()}`,
      date: dateStr,
    };
    this.friendActivityLogs.unshift(newLog);
    return this.getPersonalLifeState(dateStr);
  }

  async deleteFriendActivity(dateStr: string, activityId: string): Promise<PersonalLifeState> {
    this.friendActivityLogs = this.friendActivityLogs.filter(a => a.id !== activityId);
    return this.getPersonalLifeState(dateStr);
  }

  async toggleHabit(dateStr: string, habitId: string): Promise<PersonalLifeState> {
    const existingIndex = this.habitLogEntries.findIndex(e => e.date === dateStr && e.habitId === habitId);
    if (existingIndex !== -1) {
      this.habitLogEntries[existingIndex].isCompleted = !this.habitLogEntries[existingIndex].isCompleted;
    } else {
      this.habitLogEntries.push({
        id: `he-${Date.now()}`,
        habitId,
        date: dateStr,
        isCompleted: true,
      });
    }
    return this.getPersonalLifeState(dateStr);
  }

  async addHabit(habit: Omit<FlexibleHabit, 'id'>): Promise<PersonalLifeState> {
    const newHabit: FlexibleHabit = {
      ...habit,
      id: `hab-${Date.now()}`,
    };
    this.flexibleHabits.push(newHabit);
    return this.getPersonalLifeState(this.todayPlan.date);
  }

  async deleteHabit(habitId: string): Promise<PersonalLifeState> {
    this.flexibleHabits = this.flexibleHabits.filter(h => h.id !== habitId);
    this.habitLogEntries = this.habitLogEntries.filter(e => e.habitId !== habitId);
    return this.getPersonalLifeState(this.todayPlan.date);
  }

  // ==========================================
  // Notes & Settings In-Memory Data
  // ==========================================
  private personalNotes: PersonalNote[] = [
    {
      id: 'note-1',
      title: 'ملاحظة حول نظام العمل الجديد',
      content: 'التركيز على 4 تصميمات متقنة يومياً والانتهاء قبل المساء يمنح راحة ذهنية غير مسبوقة. رصيد الإنتاج التراكمي أمان ممتاز.',
      category: 'work',
      isPinned: true,
      createdAt: '2026-09-23T14:30:00Z',
    },
    {
      id: 'note-2',
      title: 'خاطرة حول السوشيال والوعي',
      content: 'التصفح التلقائي على TikTok يحدث غالباً عند الشعور بالملل أو الخمول في الشقة. مجرد إدراك هذه اللحظة يساعد على كسر الحلقة والقيام لصنع شاي.',
      category: 'reflection',
      isPinned: true,
      createdAt: '2026-09-22T21:15:00Z',
    },
    {
      id: 'note-3',
      title: 'أوراق المعهد وموعد التسليم',
      content: 'تجهيز ملف المعهد للخميس القادم في التاسعة صباحاً. الخروج قبل الموعد بـ 35 دقيقة لتجنب الزحام.',
      category: 'institute',
      isPinned: false,
      createdAt: '2026-09-21T18:00:00Z',
    },
  ];

  private appSettings: AppSettings = {
    profileName: 'سعيد أحمد',
    timezone: 'Africa/Cairo',
    wakeTargetTime: '12:00',
    officialWorkDays: [0, 1, 2, 3, 4], // الأحد إلى الخميس
    dailyBaseDesignTarget: 4,
    deliveryDeadline: '21:30',
    appearanceTheme: 'calm_light',
    quietHoursStart: '23:00',
    quietHoursEnd: '11:30',
  };

  async getNotes(): Promise<PersonalNote[]> {
    return [...this.personalNotes];
  }

  async addNote(note: Omit<PersonalNote, 'id' | 'createdAt'>): Promise<PersonalNote[]> {
    const newNote: PersonalNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.personalNotes.unshift(newNote);
    return [...this.personalNotes];
  }

  async updateNote(noteId: string, updates: Partial<PersonalNote>): Promise<PersonalNote[]> {
    const index = this.personalNotes.findIndex(n => n.id === noteId);
    if (index !== -1) {
      this.personalNotes[index] = {
        ...this.personalNotes[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
    return [...this.personalNotes];
  }

  async deleteNote(noteId: string): Promise<PersonalNote[]> {
    this.personalNotes = this.personalNotes.filter(n => n.id !== noteId);
    return [...this.personalNotes];
  }

  async togglePinNote(noteId: string): Promise<PersonalNote[]> {
    const index = this.personalNotes.findIndex(n => n.id === noteId);
    if (index !== -1) {
      this.personalNotes[index].isPinned = !this.personalNotes[index].isPinned;
    }
    return [...this.personalNotes];
  }

  async getSettings(): Promise<AppSettings> {
    return { ...this.appSettings };
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    this.appSettings = {
      ...this.appSettings,
      ...updates,
    };
    return { ...this.appSettings };
  }

  /**
   * ==========================================
   * Normalized Entities & Ledger Implementation
   * Database-Ready Architecture
   * ==========================================
   */

  // 1. User Profile
  async getUserProfile(): Promise<UserProfileEntity> {
    return JSON.parse(JSON.stringify(this.userProfile));
  }

  async updateUserProfile(updates: Partial<UserProfileEntity>): Promise<UserProfileEntity> {
    this.userProfile = {
      ...this.userProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return JSON.parse(JSON.stringify(this.userProfile));
  }

  // 2. Production Credit Ledger
  async getCreditTransactions(): Promise<CreditTransactionEntity[]> {
    return [...this.creditTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async addCreditTransaction(tx: Omit<CreditTransactionEntity, 'id' | 'createdAt'>): Promise<CreditTransactionEntity> {
    const fullTx: CreditTransactionEntity = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.creditTransactions.push(fullTx);
    this.todayPlan.productionCredit.totalCreditBalance = ProductionCreditLedger.calculateBalance(this.creditTransactions);
    this.todayPlan.productionCredit.transactions = [...this.creditTransactions];
    this.todayPlan.productionCredit.summary = ProductionCreditLedger.getSummary(this.creditTransactions);
    return fullTx;
  }

  async getCreditSummary(): Promise<ProductionCreditSummary> {
    return ProductionCreditLedger.getSummary(this.creditTransactions);
  }

  // 3. Normalized Day & Work Day
  async getNormalizedDay(dateStr: string): Promise<DayEntity> {
    const sleep = this.sleepRecords.find(s => s.date === dateStr);
    const dayActivities = this.normalizedActivities.filter(a => a.dayId === dateStr);
    const daySessions = this.workSessions.filter(s => s.workDayId === `wd-${dateStr}`);
    const dayEvents = this.events.filter(e => e.date === dateStr);

    return {
      id: dateStr,
      date: dateStr,
      userId: 'usr-1',
      plannedWakeTime: this.todayPlan.targetWakeUpTime,
      actualWakeTime: this.todayPlan.actualWakeUpTime,
      sleepTime: sleep?.sleepTime,
      sleepDurationMinutes: sleep?.durationMinutes,
      dailyRating: 4,
      mainFocusIntention: this.todayPlan.mainFocusIntention,
      notes: this.todayPlan.dayReflection?.learnedAboutSelf,
      dayStatus: 'in_progress',
      activityIds: dayActivities.map(a => a.id),
      workSessionIds: daySessions.map(s => s.id),
      eventIds: dayEvents.map(e => e.id),
      dailyCheckInId: this.dailyCheckIns[dateStr]?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getWorkDay(dateStr: string): Promise<WorkDayEntity> {
    const isToday = dateStr === this.todayPlan.date;
    const cred = this.todayPlan.productionCredit;
    const session = this.todayPlan.workdaySession;

    return {
      id: `wd-${dateStr}`,
      dayId: dateStr,
      userId: 'usr-1',
      targetDesigns: isToday ? cred.dailyBaseTarget : 4,
      completedDesigns: isToday ? cred.todayCompletedDesigns : 4,
      extraDesigns: isToday ? Math.max(0, cred.todayCompletedDesigns - cred.dailyBaseTarget) : 0,
      workStart: isToday ? session.workStartTime : '14:00',
      workEnd: isToday ? session.workEndTime : '17:24',
      focusedWorkDurationMinutes: Math.round(session.totalWorkSeconds / 60),
      productionCreditGenerated: Math.max(0, cred.todayCompletedDesigns - cred.dailyBaseTarget),
      productionCreditUsed: isToday ? cred.creditUsedToday : 0,
      status: session.isActive ? 'active' : 'completed',
      isOfficialWorkDay: isToday ? cred.isOfficialWorkDay : true,
      deliveryDeadline: cred.deliveryDeadline,
      trelloBoardUrl: session.trelloBoardUrl,
      googleDriveFolderUrl: session.googleDriveFolderUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getDesigns(dateStr: string): Promise<DesignEntity[]> {
    if (dateStr === this.todayPlan.date) {
      return this.todayPlan.workdaySession.designs.map(d => ({
        id: d.id,
        workDayId: `wd-${dateStr}`,
        title: d.title,
        status: d.status,
        plannedOrder: d.orderNumber,
        startTime: d.startTime,
        endTime: d.endTime,
        durationSeconds: d.durationSeconds,
        durationMinutes: Math.round(d.durationSeconds / 60),
        countsTowardTarget: !d.isExtra,
        isExtra: d.isExtra,
        trelloCardUrl: d.trelloCardUrl,
        googleDriveFileUrl: d.driveFileUrl,
        notes: d.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
    return [];
  }

  async getWorkSessions(dateStr: string): Promise<WorkSessionEntity[]> {
    return this.workSessions.filter(s => s.workDayId === `wd-${dateStr}`);
  }

  // 4. Normalized Activities
  async getActivities(dateStr: string): Promise<ActivityEntity[]> {
    return this.normalizedActivities.filter(a => a.dayId === dateStr);
  }

  async logActivity(activity: Omit<ActivityEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActivityEntity> {
    const fullActivity: ActivityEntity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.normalizedActivities.push(fullActivity);
    return fullActivity;
  }

  // 5. Automated Daily Check-In & Computations
  async computeDailySummary(dateStr: string): Promise<ComputedDaySummary> {
    const sleep = this.sleepRecords.find(s => s.date === dateStr);
    const daySuhaila = this.suhailaLogs.filter(s => s.date === dateStr);
    const daySocial = this.socialMediaLogs.filter(s => s.date === dateStr);
    const dayRecovery = this.recoveryLogs.find(r => r.date === dateStr);
    const dayHabits = this.habitLogEntries.filter(h => h.date === dateStr);
    const workDay = await this.getWorkDay(dateStr);
    const designs = await this.getDesigns(dateStr);
    const workSessions = await this.getWorkSessions(dateStr);

    const prayerState = await this.getPrayerState(dateStr);
    const prayerRecords: PrayerRecordEntity[] = prayerState.prayers.map(p => ({
      id: `${dateStr}_${p.id}`,
      dayId: dateStr,
      userId: 'usr-1',
      prayerType: p.id,
      scheduledTime: p.time,
      prayedStatus: p.isCompleted,
      actualTime: p.completedAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return DailyComputationService.computeSummary({
      date: dateStr,
      userId: 'usr-1',
      workDay,
      designs,
      workSessions,
      prayers: prayerRecords,
      sleepRecord: sleep ? {
        id: sleep.id,
        dayId: sleep.date,
        userId: 'usr-1',
        sleepStart: sleep.sleepTime,
        wakeTime: sleep.wakeTime,
        durationMinutes: sleep.durationMinutes,
        quality: sleep.quality,
        notes: sleep.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } : undefined,
      suhailaLogs: daySuhaila.map(s => ({
        id: s.id,
        dayId: s.date,
        userId: 'usr-1',
        partnerName: 'Suhaila',
        startTime: s.startTime,
        endTime: s.endTime,
        totalMinutes: s.totalMinutes,
        focusedMinutes: s.focusedMinutes,
        notes: s.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      socialMediaLogs: daySocial.map(s => ({
        id: s.id,
        dayId: s.date,
        userId: 'usr-1',
        platform: s.platform,
        startTime: s.startTime,
        endTime: s.endTime,
        durationMinutes: s.durationMinutes,
        mode: s.mode,
        notes: s.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      recoveryRecord: dayRecovery ? {
        id: dayRecovery.id,
        dayId: dayRecovery.date,
        userId: 'usr-1',
        status: dayRecovery.status,
        time: dayRecovery.time,
        trigger: dayRecovery.trigger,
        locationContext: dayRecovery.locationContext,
        notes: dayRecovery.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } : undefined,
      habitRecords: dayHabits.map(h => ({
        id: h.id,
        habitId: h.habitId,
        dayId: h.date,
        userId: 'usr-1',
        completed: h.isCompleted,
        notes: h.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    });
  }

  async getDailyCheckIn(dateStr: string): Promise<DailyCheckInEntity | null> {
    if (this.dailyCheckIns[dateStr]) {
      return JSON.parse(JSON.stringify(this.dailyCheckIns[dateStr]));
    }
    return null;
  }

  async saveDailyCheckIn(
    dateStr: string,
    reflection?: { mood?: any; dailyRating?: number; note?: string }
  ): Promise<DailyCheckInEntity> {
    const computedSummary = await this.computeDailySummary(dateStr);
    const checkIn: DailyCheckInEntity = {
      id: `checkin-${dateStr}`,
      dayId: dateStr,
      userId: 'usr-1',
      computedSummary,
      mood: reflection?.mood,
      dailyRating: reflection?.dailyRating,
      note: reflection?.note,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.dailyCheckIns[dateStr] = checkIn;
    return JSON.parse(JSON.stringify(checkIn));
  }

  async getAllDailyCheckIns(): Promise<DailyCheckInEntity[]> {
    const list = Object.values(this.dailyCheckIns);
    if (list.length === 0) {
      // Return synthesized historical check-ins for the 7 recorded days
      const days = [0, 1, 2, 3, 4, 5, 6].map(i => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      });

      for (const dStr of days) {
        if (!this.dailyCheckIns[dStr]) {
          const comp = await this.computeDailySummary(dStr);
          this.dailyCheckIns[dStr] = {
            id: `checkin-${dStr}`,
            dayId: dStr,
            userId: 'usr-1',
            computedSummary: comp,
            mood: i === 0 ? 'focused' : i % 2 === 0 ? 'calm' : 'focused',
            dailyRating: i === 4 ? 3 : 4,
            note: i === 0 ? 'يوم منتظم وتسليم مبكر' : undefined,
            completedAt: new Date(Date.now() - i * 86400000).toISOString(),
            createdAt: new Date(Date.now() - i * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
          };
        }
      }
    }
    return Object.values(this.dailyCheckIns).sort((a, b) => b.dayId.localeCompare(a.dayId));
  }

  async getHistoricalPlans(): Promise<DayPlan[]> {
    const plans: DayPlan[] = [];
    const basePlan = JSON.parse(JSON.stringify(this.todayPlan)) as DayPlan;

    // Generate 7-day historical plans for analytical rigor
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isWeekend = d.getDay() === 5 || d.getDay() === 6;

      plans.push({
        ...basePlan,
        date: dateStr,
        actualWakeUpTime: i === 2 ? '13:00' : i === 0 ? '12:18' : '12:10',
        workStartTimeTarget: '14:00',
        productionCredit: {
          ...basePlan.productionCredit,
          dailyBaseTarget: isWeekend ? 0 : 4,
          todayCompletedDesigns: isWeekend ? 2 : 4,
        },
        workdaySession: {
          ...basePlan.workdaySession,
          isActive: i === 0,
          workStartTime: i === 2 ? '14:30' : '14:05',
          workEndTime: i === 2 ? '18:15' : '17:24',
          totalWorkSeconds: i === 2 ? 3 * 3600 + 45 * 60 : 3 * 3600 + 24 * 60,
          designs: basePlan.workdaySession.designs.map((des, idx) => ({
            ...des,
            status: 'done',
            isCompleted: true,
            isTimerRunning: false,
            durationSeconds: idx === 0 ? 45 * 60 : idx === 1 ? 55 * 60 : idx === 2 ? 50 * 60 : 52 * 60,
          })),
        },
      });
    }

    return plans;
  }

  async saveDayPlan(plan: DayPlan): Promise<DayPlan> {
    this.todayPlan = JSON.parse(JSON.stringify(plan));
    return this.todayPlan;
  }

  async saveEvents(events: LifeEvent[]): Promise<LifeEvent[]> {
    this.events = JSON.parse(JSON.stringify(events));
    return this.events;
  }
}


// Singleton repository instance for app-wide decoupled access
export const guideRepository = new MockGuideRepository();
