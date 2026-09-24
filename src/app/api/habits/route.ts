import { db } from "@/db";
import { habitRecords, habits } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { jsonError, jsonOk, readJson } from "@/lib/api";
import { addDays, todayStr } from "@/lib/dates";

export const dynamic = "force-dynamic";

async function computeStreak(habitId: string, date: string) {
  const records = await db
    .select()
    .from(habitRecords)
    .where(eq(habitRecords.habitId, habitId))
    .orderBy(desc(habitRecords.date));

  const completedDates = new Set(records.filter((r) => r.completed).map((r) => r.date));
  let streak = 0;
  let cursor = date;
  while (completedDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? todayStr();
  const includeArchived = url.searchParams.get("includeArchived") === "true";

  const allHabits = await db.select().from(habits).orderBy(habits.createdAt);
  const filtered = includeArchived ? allHabits : allHabits.filter((h) => !h.isArchived);

  const enriched = await Promise.all(
    filtered.map(async (habit) => {
      const [record] = await db
        .select()
        .from(habitRecords)
        .where(and(eq(habitRecords.habitId, habit.id), eq(habitRecords.date, date)));
      const streak = await computeStreak(habit.id, date);
      return { ...habit, record: record ?? null, streak };
    })
  );

  return jsonOk(enriched);
}

export async function POST(req: Request) {
  const body = await readJson<{
    title?: string;
    category?: string;
    description?: string;
    frequency?: string;
    targetCountPerPeriod?: number;
  }>(req);

  if (!body.title) return jsonError("title is required");

  const [row] = await db
    .insert(habits)
    .values({
      title: body.title,
      category: body.category ?? "general",
      description: body.description,
      frequency: body.frequency ?? "daily",
      targetCountPerPeriod: body.targetCountPerPeriod ?? 1,
    })
    .returning();

  return jsonOk(row, 201);
}
