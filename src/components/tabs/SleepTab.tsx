"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, formatMinutes } from "@/lib/client";
import { Button, Card, DateNav, Input, SectionTitle, Select, Spinner, Textarea } from "@/components/ui";
import type { SleepRecord } from "@/types";

export default function SleepTab({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  const [record, setRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ sleepStart: "23:00", wakeTime: "06:30", quality: "3", notes: "" });
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      apiGet<SleepRecord | null>(`/api/sleep?date=${date}`),
      apiGet<SleepRecord[]>(`/api/sleep?limit=14`),
    ])
      .then(([rec, hist]) => {
        setRecord(rec);
        setHistory(hist);
        if (rec) {
          setForm({
            sleepStart: rec.sleepStart,
            wakeTime: rec.wakeTime,
            quality: String(rec.quality ?? 3),
            notes: rec.notes ?? "",
          });
        } else {
          setForm({ sleepStart: "23:00", wakeTime: "06:30", quality: "3", notes: "" });
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [date]);

  async function save() {
    setSaving(true);
    try {
      await apiSend("/api/sleep", "POST", {
        date,
        sleepStart: form.sleepStart,
        wakeTime: form.wakeTime,
        quality: Number(form.quality),
        notes: form.notes,
      });
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionTitle title="Sleep" subtitle="Log rest and track your sleep quality over time." action={<DateNav date={date} setDate={setDate} />} />
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Log sleep for {date}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-slate-500">
                  Sleep time
                  <Input
                    type="time"
                    value={form.sleepStart}
                    onChange={(e) => setForm((f) => ({ ...f, sleepStart: e.target.value }))}
                    className="mt-1"
                  />
                </label>
                <label className="text-xs font-medium text-slate-500">
                  Wake time
                  <Input
                    type="time"
                    value={form.wakeTime}
                    onChange={(e) => setForm((f) => ({ ...f, wakeTime: e.target.value }))}
                    className="mt-1"
                  />
                </label>
              </div>
              <label className="block text-xs font-medium text-slate-500">
                Quality
                <Select value={form.quality} onChange={(e) => setForm((f) => ({ ...f, quality: e.target.value }))} className="mt-1">
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Below average</option>
                  <option value="3">3 - Okay</option>
                  <option value="4">4 - Good</option>
                  <option value="5">5 - Excellent</option>
                </Select>
              </label>
              <label className="block text-xs font-medium text-slate-500">
                Notes
                <Textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="mt-1"
                />
              </label>
              {record && (
                <p className="text-xs text-slate-500">
                  Current duration: <span className="font-medium text-slate-700">{formatMinutes(record.durationMinutes)}</span>
                </p>
              )}
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving..." : record ? "Update sleep log" : "Save sleep log"}
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Recent history</h3>
            {history.length === 0 ? (
              <p className="text-sm text-slate-400">No sleep records yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-600">{h.date}</span>
                    <span className="text-slate-800">{formatMinutes(h.durationMinutes)}</span>
                    <span className="text-slate-400">{h.quality ? `⭐ ${h.quality}` : "—"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
