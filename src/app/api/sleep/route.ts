import { db } from "@/db";
import { sleepRecords } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { jsonError, jsonOk, readJson } from "@/lib/api";
import { minutesBetween, todayStr } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const limit = Number(url.searchParams.get("limit") ?? "30");

  if (date) {
    const [row] = await db.select().from(sleepRecords).where(eq(sleepRecords.date, date));
    return jsonOk(row ?? null);
  }

  const rows = await db
    .select()
    .from(sleepRecords)
    .orderBy(desc(sleepRecords.date))
    .limit(limit);
  return jsonOk(rows);
}

export async function POST(req: Request) {
  const body = await readJson<{
    date?: string;
    sleepStart?: string;
    wakeTime?: string;
    quality?: number;
    notes?: string;
  }>(req);

  const date = body.date ?? todayStr();
  if (!body.sleepStart || !body.wakeTime) {
    return jsonError("sleepStart and wakeTime are required");
  }

  const durationMinutes = minutesBetween(body.sleepStart, body.wakeTime);

  const [existing] = await db.select().from(sleepRecords).where(eq(sleepRecords.date, date));

  if (existing) {
    const [row] = await db
      .update(sleepRecords)
      .set({
        sleepStart: body.sleepStart,
        wakeTime: body.wakeTime,
        durationMinutes,
        quality: body.quality,
        notes: body.notes,
        updatedAt: new Date(),
      })
      .where(eq(sleepRecords.date, date))
      .returning();
    return jsonOk(row);
  }

  const [row] = await db
    .insert(sleepRecords)
    .values({
      date,
      sleepStart: body.sleepStart,
      wakeTime: body.wakeTime,
      durationMinutes,
      quality: body.quality,
      notes: body.notes,
    })
    .returning();
  return jsonOk(row, 201);
}
