/**
 * Sleep Record Entity Model
 * Database Table: sleep_records
 */

export type SleepQualityRating = 1 | 2 | 3 | 4 | 5;

export interface SleepRecordEntity {
  id: string; // UUID primary key
  dayId: string; // Foreign key -> days.id (date of wake-up: YYYY-MM-DD)
  userId: string;
  sleepStart: string; // HH:mm or ISO (e.g. "04:00")
  wakeTime: string;   // HH:mm or ISO (e.g. "12:15")
  durationMinutes: number; // calculated in minutes
  quality?: SleepQualityRating; // 1 to 5
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
