/**
 * Personal Note Entity Model
 * Database Table: notes
 */

export type NoteCategory = 'general' | 'work' | 'reflection' | 'institute' | 'ideas';

export interface PersonalNoteEntity {
  id: string; // UUID primary key
  userId: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags?: string[];
  isPinned: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
