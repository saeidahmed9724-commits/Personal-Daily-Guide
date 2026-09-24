import { db } from "@/db";
import { events } from "@/db/schema";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { jsonError, jsonOk, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const conditions = [];
  if (date) conditions.push(eq(events.date, date));
  if (from) conditions.push(gte(events.date, from));
  if (to) conditions.push(lte(events.date, to));

  const rows = await db
    .select()
    .from(events)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(events.date), asc(events.startTime));

  return jsonOk(rows);
}

export async function POST(req: Request) {
  const body = await readJson<{
    title?: string;
    type?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    durationMinutes?: number;
    location?: string;
    notes?: string;
    status?: string;
  }>(req);

  if (!body.title || !body.date) return jsonError("title and date are required");

  const [row] = await db
    .insert(events)
    .values({
      title: body.title,
      type: body.type ?? "general",
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      durationMinutes: body.durationMinutes,
      location: body.location,
      notes: body.notes,
      status: body.status ?? "upcoming",
    })
    .returning();

  return jsonOk(row, 201);
}
