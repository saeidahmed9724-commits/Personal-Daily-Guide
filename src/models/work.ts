/**
 * Work Day, Design Item, and Work Session Entity Models
 * Database Tables:
 * - work_days
 * - designs
 * - work_sessions
 */

export type WorkDayStatus = 'not_started' | 'active' | 'completed' | 'recalibrated';
export type DesignStatus = 'not_started' | 'in_progress' | 'done';

export interface WorkDayEntity {
  id: string; // UUID or date string (e.g. "wd-2026-09-24")
  dayId: string; // Foreign key -> days.id
  userId: string;
  targetDesigns: number; // e.g. 4
  completedDesigns: number; // e.g. 4
  extraDesigns: number; // e.g. +1
  workStart?: string; // HH:mm
  workEnd?: string; // HH:mm
  focusedWorkDurationMinutes: number; // Total active focused work
  productionCreditGenerated: number; // Credits earned from extra designs
  productionCreditUsed: number; // Credits spent to lighten the day
  status: WorkDayStatus;
  isOfficialWorkDay: boolean; // Sun-Thu = true, Fri-Sat = false
  deliveryDeadline: string; // "21:30"
  trelloBoardUrl?: string;
  googleDriveFolderUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DesignEntity {
  id: string; // UUID (e.g. "des-1")
  workDayId: string; // Foreign key -> work_days.id
  title: string;
  status: DesignStatus;
  plannedOrder: number; // 1, 2, 3, 4, 5...
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  durationSeconds: number; // Precise seconds tracked
  durationMinutes: number; // Computed in minutes
  countsTowardTarget: boolean; // true for standard target designs
  isExtra: boolean; // true if above daily target
  trelloCardUrl?: string;
  googleDriveFileUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkSessionPause {
  pausedAt: string; // ISO / HH:mm
  resumedAt?: string; // ISO / HH:mm
  durationSeconds: number;
}

export interface WorkSessionEntity {
  id: string; // UUID
  workDayId: string; // Foreign key -> work_days.id
  designId?: string; // Optional foreign key -> designs.id
  startTime: string; // HH:mm or ISO
  endTime?: string; // HH:mm or ISO
  durationMinutes: number;
  durationSeconds: number;
  isTimerRunning: boolean;
  pauses: WorkSessionPause[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
