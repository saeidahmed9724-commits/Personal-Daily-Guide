import { db } from "@/db";
import { socialMediaRecords } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { jsonError, jsonOk, readJson } from "@/lib/api";
import { minutesBetween, todayStr } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const limit = Number(url.searchParams.get("limit") ?? "60");

  const rows = date
    ? await db.select().from(socialMediaRecords).where(eq(socialMediaRecords.date, date))
    : await db.select().from(socialMediaRecords).orderBy(desc(socialMediaRecords.date)).limit(limit);

  return jsonOk(rows);
}

export async function POST(req: Request) {
  const body = await readJson<{
    date?: string;
    platform?: string;
    startTime?: string;
    endTime?: string;
    mode?: string;
    notes?: string;
  }>(req);

  if (!body.platform || !body.startTime || !body.endTime) {
    return jsonError("platform, startTime and endTime are required");
  }

  const date = body.date ?? todayStr();
  const durationMinutes = minutesBetween(body.startTime, body.endTime);

  const [row] = await db
    .insert(socialMediaRecords)
    .values({
      date,
      platform: body.platform,
      startTime: body.startTime,
      endTime: body.endTime,
      durationMinutes,
      mode: body.mode ?? "intentional",
      notes: body.notes,
    })
    .returning();

  return jsonOk(row, 201);
}
