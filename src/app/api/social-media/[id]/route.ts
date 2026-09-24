import { db } from "@/db";
import { socialMediaRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(socialMediaRecords).where(eq(socialMediaRecords.id, id));
  return jsonOk({ success: true });
}
