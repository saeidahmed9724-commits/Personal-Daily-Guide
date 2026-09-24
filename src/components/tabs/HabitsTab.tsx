"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Flame, Plus, Trash2 } from "lucide-react";
import { apiGet, apiSend } from "@/lib/client";
import { Button, Card, DateNav, Input, Pill, SectionTitle, Select, Spinner } from "@/components/ui";
import type { Habit } from "@/types";

const CATEGORIES = ["health", "learning", "spiritual", "mindset", "routine", "general"];

export default function HabitsTab({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "general", description: "" });
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    apiGet<Habit[]>(`/api/habits?date=${date}`)
      .then(setHabits)
      .finally(() => setLoading(false));
  }

  useEffect(load, [date]);

  async function toggle(habit: Habit) {
    setHabits((prev) =>
      prev.map((h) => (h.id === habit.id ? { ...h, completed: !h.completed, record: { completed: !h.completed, count: 1 } } : h))
    );
    await apiSend(`/api/habits/${habit.id}/toggle`, "POST", { date, completed: !(habit.record?.completed ?? false) });
    load();
  }

  async function createHabit() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await apiSend("/api/habits", "POST", form);
      setForm({ title: "", category: "general", description: "" });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function removeHabit(id: string) {
    await apiSend(`/api/habits/${id}`, "DELETE");
    load();
  }

  return (
    <div>
      <SectionTitle
        title="Habits"
        subtitle="Build consistency, one day at a time."
        action={<DateNav date={date} setDate={setDate} />}
      />

      <div className="mb-4 flex justify-end">
        <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} /> New habit
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Habit title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <Button className="mt-3" onClick={createHabit} disabled={saving}>
            {saving ? "Adding..." : "Add habit"}
          </Button>
        </Card>
      )}

      {loading ? (
        <Spinner />
      ) : habits.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-400">No habits yet. Create your first one above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {habits.map((h) => (
            <Card key={h.id} className="flex items-center justify-between gap-3">
              <button onClick={() => toggle(h)} className="flex flex-1 items-center gap-3 text-left">
                {h.record?.completed ? (
                  <CheckCircle2 className="text-emerald-500" size={22} />
                ) : (
                  <Circle className="text-slate-300" size={22} />
                )}
                <div>
                  <p className="font-medium text-slate-800">{h.title}</p>
                  <p className="text-xs text-slate-500">{h.description || h.category}</p>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <Pill tone="indigo">
                  <span className="flex items-center gap-1">
                    <Flame size={12} /> {h.streak ?? 0}
                  </span>
                </Pill>
                <button onClick={() => removeHabit(h.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
