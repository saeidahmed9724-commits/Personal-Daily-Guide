import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jsonOk, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

async function ensureSettings() {
  const rows = await db.select().from(settings).where(eq(settings.id, "default"));
  if (rows.length > 0) return rows[0];
  const [created] = await db
    .insert(settings)
    .values({ id: "default" })
    .onConflictDoNothing()
    .returning();
  if (created) return created;
  const [row] = await db.select().from(settings).where(eq(settings.id, "default"));
  return row;
}

export async function GET() {
  const row = await ensureSettings();
  return jsonOk(row);
}

export async function PUT(req: Request) {
  const body = await readJson<Record<string, unknown>>(req);
  await ensureSettings();

  const update: Record<string, unknown> = { updatedAt: new Date() };
  const allowed = [
    "displayName",
    "timezone",
    "wakeTarget",
    "sleepTarget",
    "dailyWorkTarget",
    "workDays",
    "partnerName",
    "prayerTimes",
  ];
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const [row] = await db
    .update(settings)
    .set(update)
    .where(eq(settings.id, "default"))
    .returning();

  return jsonOk(row);
}
