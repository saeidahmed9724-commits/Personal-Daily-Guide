/**
 * Social Media Usage Record Model
 * Non-judgmental behavioral observation: Intentional vs Automatic scrolling.
 * Database Table: social_media_records
 */

export type SocialPlatform = 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'other';
export type SocialUsageMode = 'intentional' | 'automatic';

export interface SocialMediaRecordEntity {
  id: string; // UUID primary key
  dayId: string; // Foreign key -> days.id (YYYY-MM-DD)
  userId: string;
  platform: SocialPlatform;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  mode: SocialUsageMode; // 'intentional' (focused reading/messaging) vs 'automatic' (mindless scrolling)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
