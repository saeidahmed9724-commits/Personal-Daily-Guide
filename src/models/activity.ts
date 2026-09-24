/**
 * Activity Entity Model
 * Represents any actual activity that occurred during the day.
 * Database Table: activities
 */

export type ActivityType =
  | 'sleep'
  | 'wake'
  | 'work'
  | 'design'
  | 'prayer'
  | 'suhaila'
  | 'family'
  | 'friends'
  | 'gaming'
  | 'social_media'
  | 'institute'
  | 'outing'
  | 'personal'
  | 'meal'
  | 'other';

export type ActivitySource = 'manual' | 'timer' | 'system' | 'sync';

export interface ActivityEntity {
  id: string; // UUID primary key
  dayId: string; // Foreign key -> days.id (YYYY-MM-DD)
  userId: string;
  type: ActivityType;
  title: string;
  startTime: string; // HH:mm or ISO timestamp
  endTime?: string; // HH:mm or ISO timestamp
  durationMinutes?: number;
  isOngoing?: boolean;
  source: ActivitySource;
  note?: string;
  
  // Polymorphic / Related Entity Links:
  relatedEntityId?: string; // e.g. designId, eventId, suhailaLogId, etc.
  relatedEntityType?: 'design' | 'work_session' | 'event' | 'prayer' | 'social_media' | 'suhaila' | 'friend' | 'habit';

  // Qualitative parameters
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  mood?: 'calm' | 'focused' | 'tired' | 'energized' | 'distracted';
  
  createdAt: string;
  updatedAt: string;
}
