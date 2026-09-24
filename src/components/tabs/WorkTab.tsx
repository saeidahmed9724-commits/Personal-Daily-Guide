"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, formatMinutes } from "@/lib/client";
import { Button, Card, DateNav, Input, ProgressBar, SectionTitle, Select, Spinner, Textarea } from "@/components/ui";
import type { WorkDay } from "@/types";

export default function WorkTab({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  const [work, setWork] = useState<WorkDay | null>(null);
  const [history, setHistory] = useState<WorkDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    targetDesigns: 5,
    completedDesigns: 0,
    extraDesigns: 0,
    workStart: "09:00",
    workEnd: "17:00",
    focusedMinutes: 0,
    status: "pending",
    notes: "",
  });

  function load() {
    setLoading(true);
    Promise.all([apiGet<WorkDay | null>(`/api/work?date=${date}`), apiGet<WorkDay[]>(`/api/work?limit=14`)])
      .then(([w, hist]) => {
        setWork(w);
        setHistory(hist);
        setForm({
          targetDesigns: w?.targetDesigns ?? 5,
          completedDesigns: w?.completedDesigns ?? 0,
          extraDesigns: w?.extraDesigns ?? 0,
          workStart: w?.workStart ?? "09:00",
          workEnd: w?.workEnd ?? "17:00",
          focusedMinutes: w?.focusedMinutes ?? 0,
          status: w?.status ?? "pending",
          notes: w?.notes ?? "",
        });
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [date]);

  async function save() {
    setSaving(true);
    try {
      await apiSend("/api/work", "POST", { date, ...form });
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionTitle title="Work" subtitle="Track your daily production and focus time." action={<DateNav date={date} setDate={setDate} />} />
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Log work for {date}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <NumberField label="Target" value={form.targetDesigns} onChange={(v) => setForm((f) => ({ ...f, targetDesigns: v }))} />
                <NumberField label="Completed" value={form.completedDesigns} onChange={(v) => setForm((f) => ({ ...f, completedDesigns: v }))} />
                <NumberField label="Extra" value={form.extraDesigns} onChange={(v) => setForm((f) => ({ ...f, extraDesigns: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-slate-500">
                  Work start
                  <Input type="time" value={form.workStart} onChange={(e) => setForm((f) => ({ ...f, workStart: e.target.value }))} className="mt-1" />
                </label>
                <label className="text-xs font-medium text-slate-500">
                  Work end
                  <Input type="time" value={form.workEnd} onChange={(e) => setForm((f) => ({ ...f, workEnd: e.target.value }))} className="mt-1" />
                </label>
              </div>
              <NumberField label="Focused minutes" value={form.focusedMinutes} onChange={(v) => setForm((f) => ({ ...f, focusedMinutes: v }))} />
              <label className="block text-xs font-medium text-slate-500">
                Status
                <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="mt-1">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </Select>
              </label>
              <label className="block text-xs font-medium text-slate-500">
                Notes
                <Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="mt-1" />
              </label>
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving..." : work ? "Update work log" : "Save work log"}
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Today&apos;s progress</h3>
              <ProgressBar value={form.completedDesigns} max={form.targetDesigns || 1} colorClass="bg-emerald-500" />
              <p className="mt-2 text-sm text-slate-500">
                {form.completedDesigns}/{form.targetDesigns} completed
                {form.extraDesigns > 0 && ` (+${form.extraDesigns} extra)`} · Focus: {formatMinutes(form.focusedMinutes)}
              </p>
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Recent history</h3>
              {history.length === 0 ? (
                <p className="text-sm text-slate-400">No work records yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {history.map((h) => (
                    <li key={h.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-slate-600">{h.date}</span>
                      <span className="text-slate-800">
                        {h.completedDesigns}/{h.targetDesigns}
                      </span>
                      <span className="text-slate-400">{formatMinutes(h.focusedMinutes)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="text-xs font-medium text-slate-500">
      {label}
      <Input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1" />
    </label>
  );
}
