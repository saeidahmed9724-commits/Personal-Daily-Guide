import { db } from "@/db";
import { habitRecords } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { jsonOk, readJson } from "@/lib/api";
import { todayStr } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readJson<{ date?: string; completed?: boolean; count?: number; notes?: string }>(req);
  const date = body.date ?? todayStr();

  const [existing] = await db
    .select()
    .from(habitRecords)
    .where(and(eq(habitRecords.habitId, id), eq(habitRecords.date, date)));

  const completed = body.completed ?? !(existing?.completed ?? false);

  if (existing) {
    const [row] = await db
      .update(habitRecords)
      .set({ completed, count: body.count ?? existing.count, notes: body.notes ?? existing.notes })
      .where(eq(habitRecords.id, existing.id))
      .returning();
    return jsonOk(row);
  }

  const [row] = await db
    .insert(habitRecords)
    .values({ habitId: id, date, completed, count: body.count ?? (completed ? 1 : 0), notes: body.notes })
    .returning();
  return jsonOk(row, 201);
}
