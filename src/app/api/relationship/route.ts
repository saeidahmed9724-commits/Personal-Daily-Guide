import { db } from "@/db";
import { relationshipActivities, settings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { jsonError, jsonOk, readJson } from "@/lib/api";
import { minutesBetween, todayStr } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const limit = Number(url.searchParams.get("limit") ?? "60");

  const rows = date
    ? await db.select().from(relationshipActivities).where(eq(relationshipActivities.date, date))
    : await db.select().from(relationshipActivities).orderBy(desc(relationshipActivities.date)).limit(limit);

  return jsonOk(rows);
}

export async function POST(req: Request) {
  const body = await readJson<{
    date?: string;
    partnerName?: string;
    startTime?: string;
    endTime?: string;
    focusedMinutes?: number;
    notes?: string;
  }>(req);

  if (!body.startTime || !body.endTime) return jsonError("startTime and endTime are required");

  const date = body.date ?? todayStr();
  const totalMinutes = minutesBetween(body.startTime, body.endTime);

  let partnerName = body.partnerName;
  if (!partnerName) {
    const [settingsRow] = await db.select().from(settings).where(eq(settings.id, "default"));
    partnerName = settingsRow?.partnerName ?? "Partner";
  }

  const [row] = await db
    .insert(relationshipActivities)
    .values({
      date,
      partnerName,
      startTime: body.startTime,
      endTime: body.endTime,
      totalMinutes,
      focusedMinutes: body.focusedMinutes ?? totalMinutes,
      notes: body.notes,
    })
    .returning();

  return jsonOk(row, 201);
}
