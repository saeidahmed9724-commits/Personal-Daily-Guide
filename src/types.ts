export interface Settings {
  id: string;
  displayName: string;
  timezone: string;
  wakeTarget: string;
  sleepTarget: string;
  dailyWorkTarget: number;
  workDays: number[];
  partnerName: string;
  prayerTimes: { fajr: string; dhuhr: string; asr: string; maghrib: string; isha: string };
  updatedAt: string;
}

export interface PrayerRecord {
  id: string;
  date: string;
  prayerType: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  scheduledTime: string;
  prayedStatus: boolean;
  actualTime: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SleepRecord {
  id: string;
  date: string;
  sleepStart: string;
  wakeTime: string;
  durationMinutes: number;
  quality: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  description: string | null;
  frequency: string;
  targetCountPerPeriod: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  record?: { completed: boolean; count: number } | null;
  streak?: number;
  completed?: boolean;
}

export interface WorkDay {
  id: string;
  date: string;
  targetDesigns: number;
  completedDesigns: number;
  extraDesigns: number;
  workStart: string | null;
  workEnd: string | null;
  focusedMinutes: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number | null;
  location: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipActivity {
  id: string;
  date: string;
  partnerName: string | null;
  startTime: string | null;
  endTime: string | null;
  totalMinutes: number;
  focusedMinutes: number;
  notes: string | null;
  createdAt: string;
}

export interface SocialMediaRecord {
  id: string;
  date: string;
  platform: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;
  mode: string;
  notes: string | null;
  createdAt: string;
}

export interface RecoveryRecord {
  id: string;
  date: string;
  status: "clean" | "relapse";
  time: string | null;
  trigger: string | null;
  notes: string | null;
  createdAt: string;
}

export interface DailyCheckin {
  id: string;
  date: string;
  mood: string | null;
  dailyRating: number | null;
  note: string | null;
  computedSummary: ComputedDaySummary | null;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComputedDaySummary {
  date: string;
  sleep: { durationMinutes: number | null; quality: number | null; wakeTime: string | null };
  work: { targetDesigns: number; completedDesigns: number; extraDesigns: number; focusedMinutes: number; wasTargetMet: boolean };
  prayer: { completedCount: number; totalPrayers: number; allCompleted: boolean; completedPrayers: string[] };
  habits: { completedCount: number; totalCount: number };
  personal: {
    relationshipTotalMinutes: number;
    relationshipFocusedMinutes: number;
    socialMediaTotalMinutes: number;
    socialMediaAutomaticMinutes: number;
    socialMediaIntentionalMinutes: number;
    cleanStatus: "clean" | "relapse";
  };
}

export interface Guidance {
  headline: string;
  detail: string;
  tone: "focus" | "success" | "warning" | "info";
}

export interface DashboardResponse {
  date: string;
  settings: Settings;
  prayers: PrayerRecord[];
  sleep: SleepRecord | null;
  work: WorkDay | null;
  events: EventItem[];
  habits: Habit[];
  recovery: RecoveryRecord[];
  guidance: Guidance;
  summary: ComputedDaySummary;
}

export interface AnalyticsDaily {
  date: string;
  prayerCompletedCount: number;
  prayerTotal: number;
  sleepDurationMinutes: number | null;
  sleepQuality: number | null;
  workTarget: number;
  workCompleted: number;
  habitsCompleted: number;
  habitsTotal: number;
  socialMediaMinutes: number;
  relapse: boolean;
}

export interface AnalyticsResponse {
  daily: AnalyticsDaily[];
  totals: {
    avgSleepMinutes: number;
    avgPrayerRate: number;
    workCompletionRate: number;
    habitCompletionRate: number;
    cleanStreak: number;
    totalSocialMediaMinutes: number;
  };
}
