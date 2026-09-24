/**
 * Daily Check-In Model
 * Aggregates and synthesizes the whole day's data.
 * Crucial Rule:
 * Does NOT require manual re-typing of data the system already recorded!
 * Auto-computes work output, prayer records, sleep stats, Suhaila focused time,
 * social media breakdown, and clean status.
 * User only inputs subjective self-reflection (mood, daily rating, reflection note).
 * Database Table: daily_checkins
 */

import { PrayerType } from './prayer';

export interface ComputedWorkSummary {
  completedDesigns: number;
  targetDesigns: number;
  extraDesigns: number;
  focusedDurationMinutes: number;
  wasTargetMet: boolean;
  creditGenerated: number;
  creditUsed: number;
}

export interface ComputedPrayerSummary {
  completedCount: number;
  totalPrayers: number;
  allCompleted: boolean;
  completedPrayers: PrayerType[];
}

export interface ComputedPersonalSummary {
  suhailaTotalMinutes: number;
  suhailaFocusedMinutes: number;
  socialMediaTotalMinutes: number;
  socialMediaAutomaticMinutes: number;
  socialMediaIntentionalMinutes: number;
  cleanStatus: 'clean' | 'relapse';
  habitsCompletedCount: number;
  habitsTotalCount: number;
}

export interface ComputedDaySummary {
  date: string;
  sleepDurationMinutes?: number;
  sleepQuality?: number;
  wakeTime?: string;
  work: ComputedWorkSummary;
  prayer: ComputedPrayerSummary;
  personal: ComputedPersonalSummary;
}

export interface DailyCheckInEntity {
  id: string; // UUID primary key
  dayId: string; // Foreign key -> days.id (YYYY-MM-DD)
  userId: string;
  
  // Computed summary snapshot (auto-populated by computation service):
  computedSummary: ComputedDaySummary;
  
  // Subjective reflection inputs (provided by user at end of day or check-in):
  mood?: 'calm' | 'focused' | 'tired' | 'energized' | 'distracted';
  dailyRating?: number; // 1 to 5
  note?: string; // e.g. "اليوم كان مريح ومنظم وسلمت الشغل بدري..."
  
  completedAt: string; // Timestamp
  createdAt: string;
  updatedAt: string;
}
