"use client";

import { useEffect, useState } from "react";
import { Pin, Plus, Trash2 } from "lucide-react";
import { apiGet, apiSend } from "@/lib/client";
import { Button, Card, Input, Pill, SectionTitle, Select, Spinner, Textarea } from "@/components/ui";
import type { NoteItem } from "@/types";

const CATEGORIES = ["general", "ideas", "gratitude", "goals", "reflection"];

export default function NotesTab() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general", tags: "" });

  function load() {
    setLoading(true);
    apiGet<NoteItem[]>("/api/notes")
      .then(setNotes)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function createNote() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await apiSend("/api/notes", "POST", {
        title: form.title,
        content: form.content,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setForm({ title: "", content: "", category: "general", tags: "" });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function togglePin(note: NoteItem) {
    await apiSend(`/api/notes/${note.id}`, "PATCH", { isPinned: !note.isPinned });
    load();
  }

  async function remove(id: string) {
    await apiSend(`/api/notes/${id}`, "DELETE");
    load();
  }

  return (
    <div>
      <SectionTitle title="Notes" subtitle="Capture thoughts, ideas, and reflections." />

      <div className="mb-4 flex justify-end">
        <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} /> New note
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Write something..." rows={3} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Input placeholder="tags, comma, separated" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
            </div>
          </div>
          <Button className="mt-3" onClick={createNote} disabled={saving}>
            {saving ? "Saving..." : "Save note"}
          </Button>
        </Card>
      )}

      {loading ? (
        <Spinner />
      ) : notes.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-400">No notes yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {notes.map((n) => (
            <Card key={n.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <p className="font-medium text-slate-800">{n.title}</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePin(n)}
                    className={`rounded-lg p-1.5 ${n.isPinned ? "text-amber-500" : "text-slate-300 hover:text-amber-400"}`}
                  >
                    <Pin size={16} />
                  </button>
                  <button onClick={() => remove(n.id)} className="rounded-lg p-1.5 text-slate-300 hover:text-rose-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-600">{n.content}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Pill tone="indigo">{n.category}</Pill>
                {n.tags.map((t) => (
                  <Pill key={t}>{t}</Pill>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
