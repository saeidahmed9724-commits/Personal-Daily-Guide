/**
 * Domain Models Index & PostgreSQL / Supabase Schema Blueprint
 * 
 * Normalized, extensible, and independent from the UI.
 * Ready for migration to PostgreSQL or Supabase with no business logic rewrite.
 */

export * from './user';
export * from './day';
export * from './activity';
export * from './work';
export * from './productionCredit';
export * from './prayer';
export * from './sleep';
export * from './event';
export * from './relationship';
export * from './socialMedia';
export * from './recovery';
export * from './habit';
export * from './checkin';
export * from './note';

/**
 * DATABASE SCHEMA BLUEPRINT (PostgreSQL / Supabase Ready)
 * 
 * Tables:
 * 1. users (id UUID PRIMARY KEY, name TEXT, timezone TEXT, wake_target TIME, work_days INT[], daily_work_target INT, preferences JSONB, notification_preferences JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 2. days (id TEXT PRIMARY KEY /* YYYY-MM-DD * /, user_id UUID REFERENCES users(id), planned_wake TIME, actual_wake TIME, sleep_time TIME, sleep_duration_minutes INT, daily_rating INT, main_focus_intention TEXT, notes TEXT, day_status TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 3. activities (id UUID PRIMARY KEY, day_id TEXT REFERENCES days(id), user_id UUID REFERENCES users(id), type TEXT, title TEXT, start_time TEXT, end_time TEXT, duration_minutes INT, is_ongoing BOOLEAN, source TEXT, note TEXT, related_entity_id UUID, related_entity_type TEXT, energy_level INT, mood TEXT, created_at TIMESTAMPTZ)
 * 4. work_days (id TEXT PRIMARY KEY, day_id TEXT REFERENCES days(id), user_id UUID REFERENCES users(id), target_designs INT, completed_designs INT, extra_designs INT, work_start TEXT, work_end TEXT, focused_work_duration_minutes INT, production_credit_generated INT, production_credit_used INT, status TEXT, is_official_work_day BOOLEAN, delivery_deadline TEXT, trello_board_url TEXT, google_drive_folder_url TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 5. designs (id UUID PRIMARY KEY, work_day_id TEXT REFERENCES work_days(id), title TEXT, status TEXT, planned_order INT, start_time TEXT, end_time TEXT, duration_seconds INT, duration_minutes INT, counts_toward_target BOOLEAN, is_extra BOOLEAN, trello_card_url TEXT, google_drive_file_url TEXT, notes TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 6. work_sessions (id UUID PRIMARY KEY, work_day_id TEXT REFERENCES work_days(id), design_id UUID REFERENCES designs(id), start_time TEXT, end_time TEXT, duration_minutes INT, duration_seconds INT, is_timer_running BOOLEAN, pauses JSONB, notes TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 7. production_credit_transactions (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), amount INT NOT NULL, type TEXT NOT NULL, source_day TEXT NOT NULL, related_day TEXT, date TIMESTAMPTZ NOT NULL, note TEXT NOT NULL, related_design_id UUID REFERENCES designs(id), created_at TIMESTAMPTZ NOT NULL)
 *    -> INDEX on (user_id, source_day), INDEX on (date)
 * 8. prayer_records (id UUID PRIMARY KEY, day_id TEXT REFERENCES days(id), user_id UUID REFERENCES users(id), prayer_type TEXT NOT NULL, scheduled_time TEXT NOT NULL, prayed_status BOOLEAN NOT NULL, actual_time TEXT, note TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 9. sleep_records (id UUID PRIMARY KEY, day_id TEXT REFERENCES days(id), user_id UUID REFERENCES users(id), sleep_start TEXT NOT NULL, wake_time TEXT NOT NULL, duration_minutes INT NOT NULL, quality INT, notes TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 10. events (id UUID PRIMARY KEY, day_id TEXT REFERENCES days(id), user_id UUID REFERENCES users(id), title TEXT NOT NULL, type TEXT NOT NULL, date TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT, duration_minutes INT, prep_minutes INT, location TEXT, notes TEXT, status TEXT NOT NULL, reminder_settings JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 11. relationship_activities (id UUID PRIMARY KEY, day_id TEXT REFERENCES days(id), user_id UUID REFERENCES users(id), partner_name TEXT NOT NULL, start_time TEXT, end_time TEXT, total_minutes INT NOT NULL, focused_minutes INT NOT NULL, notes TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 12. social_media_records (id UUID PRIMARY KEY, day_id TEXT REFERENCES days(id), user_id UUID REFERENCES users(id), platform TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL, duration_minutes INT NOT NULL, mode TEXT NOT NULL, notes TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 13. recovery_records (id UUID PRIMARY KEY, day_id TEXT REFERENCES days(id), user_id UUID REFERENCES users(id), status TEXT NOT NULL, time TEXT, trigger TEXT, location_context TEXT, notes TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 14. habit_definitions (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), title TEXT NOT NULL, category TEXT NOT NULL, description TEXT, frequency TEXT NOT NULL, target_count_per_period INT, is_archived BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 15. habit_records (id UUID PRIMARY KEY, habit_id UUID REFERENCES habit_definitions(id), day_id TEXT REFERENCES days(id), user_id UUID REFERENCES users(id), completed BOOLEAN NOT NULL, count INT, notes TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 16. daily_checkins (id UUID PRIMARY KEY, day_id TEXT REFERENCES days(id), user_id UUID REFERENCES users(id), computed_summary JSONB NOT NULL, mood TEXT, daily_rating INT, note TEXT, completed_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
 * 17. notes (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), title TEXT NOT NULL, content TEXT NOT NULL, category TEXT NOT NULL, tags TEXT[], is_pinned BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ)
 */
