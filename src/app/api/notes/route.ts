import { db } from "@/db";
import { notes } from "@/db/schema";
import { desc } from "drizzle-orm";
import { jsonError, jsonOk, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(notes).orderBy(desc(notes.isPinned), desc(notes.updatedAt));
  return jsonOk(rows);
}

export async function POST(req: Request) {
  const body = await readJson<{
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
    isPinned?: boolean;
  }>(req);

  if (!body.title) return jsonError("title is required");

  const [row] = await db
    .insert(notes)
    .values({
      title: body.title,
      content: body.content ?? "",
      category: body.category ?? "general",
      tags: body.tags ?? [],
      isPinned: body.isPinned ?? false,
    })
    .returning();

  return jsonOk(row, 201);
}
