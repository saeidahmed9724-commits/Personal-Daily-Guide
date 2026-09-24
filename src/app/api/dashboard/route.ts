import { db } from "@/db";
import {
  events,
  habitRecords,
  habits,
  prayerRecords,
  recoveryRecords,
  settings,
  sleepRecords,
  workDays,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { jsonOk } from "@/lib/api";
import { computeDaySummary } from "@/lib/computeDaySummary";
import { todayStr } from "@/lib/dates";
import { buildGuidance } from "@/lib/guidance";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? todayStr();

  const [settingsRow] = await db.select().from(settings).where(eq(settings.id, "default"));
  const prayerRows = await db.select().from(prayerRecords).where(eq(prayerRecords.date, date));
  const [sleepRow] = await db.select().from(sleepRecords).where(eq(sleepRecords.date, date));
  const [workRow] = await db.select().from(workDays).where(eq(workDays.date, date));
  const eventRows = await db.select().from(events).where(eq(events.date, date));
  const recoveryRows = await db.select().from(recoveryRecords).where(eq(recoveryRecords.date, date));

  const activeHabits = await db.select().from(habits).where(eq(habits.isArchived, false));
  const habitStates = await Promise.all(
    activeHabits.map(async (h) => {
      const [record] = await db
        .select()
        .from(habitRecords)
        .where(and(eq(habitRecords.habitId, h.id), eq(habitRecords.date, date)));
      return { habit: h, completed: record?.completed ?? false };
    })
  );

  const habitsPending = habitStates.filter((h) => !h.completed).length;

  const [y, m, d] = date.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();

  const guidance = buildGuidance({
    weekday,
    workDays: settingsRow?.workDays ?? [1, 2, 3, 4, 5],
    prayers: prayerRows.map((p) => ({
      prayerType: p.prayerType,
      scheduledTime: p.scheduledTime,
      prayedStatus: p.prayedStatus,
    })),
    work: workRow
      ? {
          targetDesigns: workRow.targetDesigns,
          completedDesigns: workRow.completedDesigns,
          workStart: workRow.workStart,
          workEnd: workRow.workEnd,
        }
      : null,
    sleepLoggedToday: Boolean(sleepRow),
    habitsPending,
    habitsTotal: activeHabits.length,
    hasRelapseToday: recoveryRows.some((r) => r.status === "relapse"),
    eventsToday: eventRows.map((e) => ({ title: e.title, startTime: e.startTime })),
  });

  const summary = await computeDaySummary(date);

  return jsonOk({
    date,
    settings: settingsRow,
    prayers: prayerRows,
    sleep: sleepRow ?? null,
    work: workRow ?? null,
    events: eventRows,
    habits: habitStates.map((h) => ({ ...h.habit, completed: h.completed })),
    recovery: recoveryRows,
    guidance,
    summary,
  });
}
