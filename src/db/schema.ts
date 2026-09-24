import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Settings (single row personal preferences)
// ---------------------------------------------------------------------------
export const settings = pgTable("settings", {
  id: text("id").primaryKey().$defaultFn(() => "default"),
  displayName: text("display_name").notNull().default("Friend"),
  timezone: text("timezone").notNull().default("UTC"),
  wakeTarget: text("wake_target").notNull().default("06:00"),
  sleepTarget: text("sleep_target").notNull().default("22:30"),
  dailyWorkTarget: integer("daily_work_target").notNull().default(5),
  workDays: integer("work_days").array().notNull().default([1, 2, 3, 4, 5]),
  partnerName: text("partner_name").notNull().default("Partner"),
  prayerTimes: jsonb("prayer_times")
    .$type<{ fajr: string; dhuhr: string; asr: string; maghrib: string; isha: string }>()
    .notNull()
    .default({ fajr: "05:10", dhuhr: "13:00", asr: "16:15", maghrib: "18:45", isha: "20:00" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Prayers
// ---------------------------------------------------------------------------
export const prayerRecords = pgTable(
  "prayer_records",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    date: text("date").notNull(),
    prayerType: text("prayer_type").notNull(), // fajr | dhuhr | asr | maghrib | isha
    scheduledTime: text("scheduled_time").notNull(),
    prayedStatus: boolean("prayed_status").notNull().default(false),
    actualTime: text("actual_time"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("prayer_date_type_idx").on(table.date, table.prayerType)]
);

// ---------------------------------------------------------------------------
// Sleep
// ---------------------------------------------------------------------------
export const sleepRecords = pgTable(
  "sleep_records",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    date: text("date").notNull(), // wake-up date YYYY-MM-DD
    sleepStart: text("sleep_start").notNull(),
    wakeTime: text("wake_time").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(0),
    quality: integer("quality"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("sleep_date_idx").on(table.date)]
);

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------
export const habits = pgTable("habits", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  category: text("category").notNull().default("general"),
  description: text("description"),
  frequency: text("frequency").notNull().default("daily"),
  targetCountPerPeriod: integer("target_count_per_period").notNull().default(1),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const habitRecords = pgTable(
  "habit_records",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    habitId: text("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    completed: boolean("completed").notNull().default(false),
    count: integer("count").notNull().default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("habit_record_habit_date_idx").on(table.habitId, table.date)]
);

// ---------------------------------------------------------------------------
// Work
// ---------------------------------------------------------------------------
export const workDays = pgTable(
  "work_days",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    date: text("date").notNull(),
    targetDesigns: integer("target_designs").notNull().default(0),
    completedDesigns: integer("completed_designs").notNull().default(0),
    extraDesigns: integer("extra_designs").notNull().default(0),
    workStart: text("work_start"),
    workEnd: text("work_end"),
    focusedMinutes: integer("focused_minutes").notNull().default(0),
    status: text("status").notNull().default("pending"), // pending | in_progress | completed
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("work_day_date_idx").on(table.date)]
);

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export const events = pgTable("events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  type: text("type").notNull().default("general"),
  date: text("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  durationMinutes: integer("duration_minutes"),
  location: text("location"),
  notes: text("notes"),
  status: text("status").notNull().default("upcoming"), // upcoming | completed | cancelled
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------
export const notes = pgTable("notes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  category: text("category").notNull().default("general"),
  tags: text("tags").array().notNull().default([]),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Personal life: relationship, social media, recovery
// ---------------------------------------------------------------------------
export const relationshipActivities = pgTable("relationship_activities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: text("date").notNull(),
  partnerName: text("partner_name"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  totalMinutes: integer("total_minutes").notNull().default(0),
  focusedMinutes: integer("focused_minutes").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const socialMediaRecords = pgTable("social_media_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: text("date").notNull(),
  platform: text("platform").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  durationMinutes: integer("duration_minutes").notNull().default(0),
  mode: text("mode").notNull().default("intentional"), // intentional | automatic
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const recoveryRecords = pgTable("recovery_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: text("date").notNull(),
  status: text("status").notNull().default("clean"), // clean | relapse
  time: text("time"),
  trigger: text("trigger"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Daily Check-in
// ---------------------------------------------------------------------------
export const dailyCheckins = pgTable(
  "daily_checkins",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    date: text("date").notNull(),
    mood: text("mood"), // calm | focused | tired | energized | distracted
    dailyRating: integer("daily_rating"),
    note: text("note"),
    computedSummary: jsonb("computed_summary"),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("checkin_date_idx").on(table.date)]
);
