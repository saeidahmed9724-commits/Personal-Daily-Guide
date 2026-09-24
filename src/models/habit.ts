/**
 * Habit Definition & Habit Record Entity Models
 * Designed to be fully extensible so habits can be added without modifying the database architecture.
 * Database Tables:
 * - habit_definitions
 * - habit_records
 */

export type HabitCategory = 'health' | 'learning' | 'spiritual' | 'mindset' | 'routine' | 'general';
export type HabitFrequency = 'daily' | 'workdays' | 'weekly' | 'flexible';

export interface HabitDefinitionEntity {
  id: string; // UUID primary key
  userId: string;
  title: string;
  category: HabitCategory;
  description?: string;
  frequency: HabitFrequency;
  targetCountPerPeriod?: number; // e.g. 1 per day, 3 per week
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitRecordEntity {
  id: string; // UUID primary key
  habitId: string; // Foreign key -> habit_definitions.id
  dayId: string; // Foreign key -> days.id (YYYY-MM-DD)
  userId: string;
  completed: boolean;
  count?: number; // e.g. 1
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
