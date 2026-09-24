import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jsonOk, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readJson<Record<string, unknown>>(req);

  const update: Record<string, unknown> = { updatedAt: new Date() };
  const allowed = ["title", "type", "date", "startTime", "endTime", "durationMinutes", "location", "notes", "status"];
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const [row] = await db.update(events).set(update).where(eq(events.id, id)).returning();
  return jsonOk(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(events).where(eq(events.id, id));
  return jsonOk({ success: true });
}
