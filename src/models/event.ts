/**
 * Event Entity Model
 * Database Table: events
 */

export type EventType = 
  | 'institute'            // المعهد
  | 'appointment'          // موعد
  | 'meeting'              // اجتماع
  | 'outing'               // مشوار / خروجة
  | 'important_deadline'   // ديدلاين هام
  | 'personal'             // حدث شخصي
  | 'work'                 // حدث عمل
  | 'custom';

export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface ReminderSettings {
  enabled: boolean;
  minutesBefore: number; // e.g. 30, 60
}

export interface EventEntity {
  id: string; // UUID primary key
  userId: string;
  dayId: string; // Foreign key -> days.id (YYYY-MM-DD)
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  durationMinutes?: number;
  prepMinutes?: number; // Pre-event preparation and transit buffer
  location?: string;
  notes?: string;
  status: EventStatus;
  reminderSettings?: ReminderSettings;
  createdAt: string;
  updatedAt: string;
}
