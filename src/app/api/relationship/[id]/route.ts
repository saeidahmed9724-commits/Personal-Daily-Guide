import { db } from "@/db";
import { relationshipActivities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(relationshipActivities).where(eq(relationshipActivities.id, id));
  return jsonOk({ success: true });
}
