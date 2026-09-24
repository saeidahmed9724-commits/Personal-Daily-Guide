import { db } from "@/db";
import { prayerRecords, settings } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { jsonError, jsonOk, readJson } from "@/lib/api";
import { todayStr } from "@/lib/dates";

export const dynamic = "force-dynamic";

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

async function ensureDay(date: string) {
  const [settingsRow] = await db.select().from(settings).where(eq(settings.id, "default"));
  const times = settingsRow?.prayerTimes ?? {
    fajr: "05:10",
    dhuhr: "13:00",
    asr: "16:15",
    maghrib: "18:45",
    isha: "20:00",
  };

  const existing = await db.select().from(prayerRecords).where(eq(prayerRecords.date, date));
  const byType = new Map(existing.map((r) => [r.prayerType, r]));

  for (const type of PRAYER_ORDER) {
    if (!byType.has(type)) {
      await db
        .insert(prayerRecords)
        .values({
          date,
          prayerType: type,
          scheduledTime: times[type as keyof typeof times],
        })
        .onConflictDoNothing();
    }
  }

  const rows = await db.select().from(prayerRecords).where(eq(prayerRecords.date, date));
  return rows.sort(
    (a, b) => PRAYER_ORDER.indexOf(a.prayerType as (typeof PRAYER_ORDER)[number]) - PRAYER_ORDER.indexOf(b.prayerType as (typeof PRAYER_ORDER)[number])
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? todayStr();
  const rows = await ensureDay(date);
  return jsonOk(rows);
}

export async function PATCH(req: Request) {
  const body = await readJson<{
    date?: string;
    prayerType?: string;
    prayedStatus?: boolean;
    actualTime?: string | null;
    note?: string | null;
  }>(req);

  if (!body.date || !body.prayerType) {
    return jsonError("date and prayerType are required");
  }

  await ensureDay(body.date);

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.prayedStatus === "boolean") {
    update.prayedStatus = body.prayedStatus;
    update.actualTime = body.prayedStatus ? body.actualTime ?? new Date().toTimeString().slice(0, 5) : null;
  }
  if (body.note !== undefined) update.note = body.note;

  const [row] = await db
    .update(prayerRecords)
    .set(update)
    .where(and(eq(prayerRecords.date, body.date), eq(prayerRecords.prayerType, body.prayerType)))
    .returning();

  return jsonOk(row);
}
