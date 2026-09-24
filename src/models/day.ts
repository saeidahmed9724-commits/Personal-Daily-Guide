/**
 * Day Entity Model
 * Represents a single unified day, linking all daily activities, sessions, and records.
 * Database Table: days
 */

export type DayStatus = 'planned' | 'in_progress' | 'completed' | 'recalibrated';

export interface DayEntity {
  id: string; // YYYY-MM-DD (unique natural key or UUID)
  date: string; // "2026-09-24" (ISO date string YYYY-MM-DD)
  userId: string;
  plannedWakeTime: string; // "12:00"
  actualWakeTime?: string; // "12:15"
  sleepTime?: string; // "04:00"
  sleepDurationMinutes?: number; // 480
  dailyRating?: number; // 1 to 5
  mainFocusIntention?: string; // Daily intention
  notes?: string; // General reflection / journal
  dayStatus: DayStatus;
  
  // Normalized Foreign Keys / Relationships:
  // In PostgreSQL: SELECT * FROM activities WHERE day_id = day.id
  activityIds: string[];
  workSessionIds: string[];
  eventIds: string[];
  dailyCheckInId?: string;
  
  createdAt: string;
  updatedAt: string;
}
