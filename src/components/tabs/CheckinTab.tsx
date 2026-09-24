"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, formatMinutes } from "@/lib/client";
import { Button, Card, DateNav, Pill, SectionTitle, Select, Spinner, Textarea } from "@/components/ui";
import type { ComputedDaySummary, DailyCheckin } from "@/types";

const MOODS = ["calm", "focused", "tired", "energized", "distracted"];

export default function CheckinTab({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
  const [summary, setSummary] = useState<ComputedDaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mood, setMood] = useState("calm");
  const [rating, setRating] = useState(3);
  const [note, setNote] = useState("");

  function load() {
    setLoading(true);
    apiGet<{ checkin: DailyCheckin | null; summary: ComputedDaySummary }>(`/api/checkin?date=${date}`)
      .then(({ checkin, summary }) => {
        setCheckin(checkin);
        setSummary(summary);
        setMood(checkin?.mood ?? "calm");
        setRating(checkin?.dailyRating ?? 3);
        setNote(checkin?.note ?? "");
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [date]);

  async function submit() {
    setSaving(true);
    try {
      await apiSend("/api/checkin", "POST", { date, mood, dailyRating: rating, note });
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionTitle title="Daily Check-in" subtitle="Reflect on your day — the numbers are computed for you." action={<DateNav date={date} setDate={setDate} />} />
      {loading || !summary ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Auto-computed summary</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center justify-between">
                <span>Prayers</span>
                <Pill tone={summary.prayer.allCompleted ? "green" : "slate"}>
                  {summary.prayer.completedCount}/{summary.prayer.totalPrayers}
                </Pill>
              </li>
              <li className="flex items-center justify-between">
                <span>Sleep</span>
                <span>{formatMinutes(summary.sleep.durationMinutes)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Work</span>
                <span>
                  {summary.work.completedDesigns}/{summary.work.targetDesigns}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Habits</span>
                <span>
                  {summary.habits.completedCount}/{summary.habits.totalCount}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Quality time</span>
                <span>{formatMinutes(summary.personal.relationshipTotalMinutes)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Social media</span>
                <span>{formatMinutes(summary.personal.socialMediaTotalMinutes)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Self-control</span>
                <Pill tone={summary.personal.cleanStatus === "clean" ? "green" : "red"}>{summary.personal.cleanStatus}</Pill>
              </li>
            </ul>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Your reflection</h3>
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-500">
                Mood
                <Select value={mood} onChange={(e) => setMood(e.target.value)} className="mt-1">
                  {MOODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block text-xs font-medium text-slate-500">
                Daily rating: {rating}/5
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </label>
              <label className="block text-xs font-medium text-slate-500">
                Reflection note
                <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} className="mt-1" placeholder="How did today go?" />
              </label>
              <Button onClick={submit} disabled={saving} className="w-full">
                {saving ? "Saving..." : checkin ? "Update check-in" : "Complete check-in"}
              </Button>
              {checkin && <p className="text-center text-xs text-slate-400">Last saved {new Date(checkin.completedAt).toLocaleString()}</p>}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
