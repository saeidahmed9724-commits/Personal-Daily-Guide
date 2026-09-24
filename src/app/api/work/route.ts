import { db } from "@/db";
import { workDays } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { jsonOk, readJson } from "@/lib/api";
import { todayStr } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const limit = Number(url.searchParams.get("limit") ?? "30");

  if (date) {
    const [row] = await db.select().from(workDays).where(eq(workDays.date, date));
    return jsonOk(row ?? null);
  }

  const rows = await db.select().from(workDays).orderBy(desc(workDays.date)).limit(limit);
  return jsonOk(rows);
}

export async function POST(req: Request) {
  const body = await readJson<{
    date?: string;
    targetDesigns?: number;
    completedDesigns?: number;
    extraDesigns?: number;
    workStart?: string;
    workEnd?: string;
    focusedMinutes?: number;
    status?: string;
    notes?: string;
  }>(req);

  const date = body.date ?? todayStr();
  const [existing] = await db.select().from(workDays).where(eq(workDays.date, date));

  const values = {
    targetDesigns: body.targetDesigns ?? existing?.targetDesigns ?? 0,
    completedDesigns: body.completedDesigns ?? existing?.completedDesigns ?? 0,
    extraDesigns: body.extraDesigns ?? existing?.extraDesigns ?? 0,
    workStart: body.workStart ?? existing?.workStart,
    workEnd: body.workEnd ?? existing?.workEnd,
    focusedMinutes: body.focusedMinutes ?? existing?.focusedMinutes ?? 0,
    status: body.status ?? existing?.status ?? "pending",
    notes: body.notes ?? existing?.notes,
  };

  if (existing) {
    const [row] = await db
      .update(workDays)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(workDays.date, date))
      .returning();
    return jsonOk(row);
  }

  const [row] = await db.insert(workDays).values({ date, ...values }).returning();
  return jsonOk(row, 201);
}
