/**
 * Recovery Tracking Entity Model
 * Respectful, realistic tracking of clean days vs relapses.
 * Context-aware: Alone in work apartment with computer & boredom is the real trigger.
 * Database Table: recovery_records
 */

export type RecoveryStatus = 'clean' | 'relapse';
export type RecoveryTrigger = 
  | 'boredom'
  | 'loneliness'
  | 'social_media'
  | 'staying_up_late'
  | 'empty_time'
  | 'sexual_content'
  | 'other';

export interface RecoveryRecordEntity {
  id: string; // UUID primary key
  dayId: string; // Foreign key -> days.id (YYYY-MM-DD)
  userId: string;
  status: RecoveryStatus;
  time?: string; // Time of relapse if occurred
  trigger?: RecoveryTrigger;
  locationContext?: 'work_apartment' | 'home' | 'other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
