/**
 * Relationship Activity Model (Suhaila)
 * Not a task or CRM system; records personal connection time.
 * Crucial distinction: Total Time vs. Focused Time (genuine presence without screen multitasking).
 * Database Table: relationship_activities
 */

export interface RelationshipActivityEntity {
  id: string; // UUID primary key
  dayId: string; // Foreign key -> days.id (YYYY-MM-DD)
  userId: string;
  partnerName: string; // 'Suhaila'
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  totalMinutes: number; // Total duration of phone call or meeting
  focusedMinutes: number; // Pure focused presence without distraction
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
