import { db } from "@/db";
import { dailyCheckins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jsonOk, readJson } from "@/lib/api";
import { computeDaySummary } from "@/lib/computeDaySummary";
import { todayStr } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? todayStr();

  const [existing] = await db.select().from(dailyCheckins).where(eq(dailyCheckins.date, date));
  const summary = await computeDaySummary(date);

  return jsonOk({ checkin: existing ?? null, summary });
}

export async function POST(req: Request) {
  const body = await readJson<{
    date?: string;
    mood?: string;
    dailyRating?: number;
    note?: string;
  }>(req);

  const date = body.date ?? todayStr();
  const summary = await computeDaySummary(date);

  const [existing] = await db.select().from(dailyCheckins).where(eq(dailyCheckins.date, date));

  const values = {
    mood: body.mood,
    dailyRating: body.dailyRating,
    note: body.note,
    computedSummary: summary,
    completedAt: new Date(),
    updatedAt: new Date(),
  };

  if (existing) {
    const [row] = await db
      .update(dailyCheckins)
      .set(values)
      .where(eq(dailyCheckins.date, date))
      .returning();
    return jsonOk(row);
  }

  const [row] = await db.insert(dailyCheckins).values({ date, ...values }).returning();
  return jsonOk(row, 201);
}
