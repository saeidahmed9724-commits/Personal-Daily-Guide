/**
 * Prayer Record Entity Model
 * Database Table: prayer_records
 */

export type PrayerType = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerRecordEntity {
  id: string; // UUID or `${date}_${prayerType}`
  dayId: string; // Foreign key -> days.id (YYYY-MM-DD)
  userId: string;
  prayerType: PrayerType;
  scheduledTime: string; // "05:10", "13:00", "16:15", "18:45", "20:00"
  prayedStatus: boolean; // true = prayed, false = pending/missed
  actualTime?: string; // HH:mm when prayer was performed
  note?: string;
  createdAt: string;
  updatedAt: string;
}
