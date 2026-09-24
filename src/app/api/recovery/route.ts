import { db } from "@/db";
import { recoveryRecords } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { jsonError, jsonOk, readJson } from "@/lib/api";
import { todayStr } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const limit = Number(url.searchParams.get("limit") ?? "365");

  const rows = date
    ? await db.select().from(recoveryRecords).where(eq(recoveryRecords.date, date))
    : await db.select().from(recoveryRecords).orderBy(desc(recoveryRecords.date)).limit(limit);

  return jsonOk(rows);
}

export async function POST(req: Request) {
  const body = await readJson<{
    date?: string;
    status?: string;
    time?: string;
    trigger?: string;
    notes?: string;
  }>(req);

  if (!body.status) return jsonError("status is required");

  const [row] = await db
    .insert(recoveryRecords)
    .values({
      date: body.date ?? todayStr(),
      status: body.status,
      time: body.time,
      trigger: body.trigger,
      notes: body.notes,
    })
    .returning();

  return jsonOk(row, 201);
}
