/**
 * User / Profile Entity Model
 * Database Table: users / profiles
 */

export interface UserPreferences {
  appearanceTheme: 'calm_light' | 'midnight_slate' | 'system';
  quietHoursStart: string; // e.g. "23:00"
  quietHoursEnd: string;   // e.g. "11:30"
  language: 'ar' | 'en';
}

export interface NotificationPreferences {
  prayerReminders: boolean;
  eventReminders: boolean;
  quietHoursMuted: boolean;
  dailyWrapUpReminder: boolean;
  wrapUpReminderTime: string; // e.g. "22:00"
}

export interface UserProfileEntity {
  id: string; // UUID primary key
  name: string; // "سعيد أحمد"
  email?: string;
  timezone: string; // "Africa/Cairo"
  wakeTargetTime: string; // "12:00"
  workDays: number[]; // [0, 1, 2, 3, 4] for Sunday to Thursday
  dailyWorkTarget: number; // 4 designs per day
  deliveryDeadline: string; // "21:30"
  preferences: UserPreferences;
  notificationPreferences: NotificationPreferences;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
