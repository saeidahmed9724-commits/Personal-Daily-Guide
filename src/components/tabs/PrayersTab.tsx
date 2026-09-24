"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { apiGet, apiSend } from "@/lib/client";
import { Card, DateNav, Pill, SectionTitle, Spinner, Textarea } from "@/components/ui";
import type { PrayerRecord } from "@/types";

const LABELS: Record<string, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export default function PrayersTab({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  const [prayers, setPrayers] = useState<PrayerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  function load() {
    setLoading(true);
    apiGet<PrayerRecord[]>(`/api/prayers?date=${date}`)
      .then((rows) => {
        setPrayers(rows);
        setNoteDraft(Object.fromEntries(rows.map((r) => [r.prayerType, r.note ?? ""])));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [date]);

  async function toggle(p: PrayerRecord) {
    const updated = await apiSend<PrayerRecord>("/api/prayers", "PATCH", {
      date,
      prayerType: p.prayerType,
      prayedStatus: !p.prayedStatus,
    });
    setPrayers((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
  }

  async function saveNote(p: PrayerRecord) {
    const updated = await apiSend<PrayerRecord>("/api/prayers", "PATCH", {
      date,
      prayerType: p.prayerType,
      note: noteDraft[p.prayerType] ?? "",
    });
    setPrayers((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
  }

  const completed = prayers.filter((p) => p.prayedStatus).length;

  return (
    <div>
      <SectionTitle
        title="Prayers"
        subtitle={`${completed}/${prayers.length || 5} completed`}
        action={<DateNav date={date} setDate={setDate} />}
      />
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          {prayers.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button onClick={() => toggle(p)} className="flex items-center gap-3 text-left">
                  {p.prayedStatus ? (
                    <CheckCircle2 className="text-emerald-500" size={24} />
                  ) : (
                    <Circle className="text-slate-300" size={24} />
                  )}
                  <div>
                    <p className="font-medium text-slate-800">{LABELS[p.prayerType] ?? p.prayerType}</p>
                    <p className="text-xs text-slate-500">Scheduled {p.scheduledTime}</p>
                  </div>
                </button>
                <Pill tone={p.prayedStatus ? "green" : "slate"}>
                  {p.prayedStatus ? `Prayed ${p.actualTime ?? ""}` : "Pending"}
                </Pill>
              </div>
              <div className="flex items-center gap-2">
                <Textarea
                  rows={1}
                  placeholder="Add a note..."
                  value={noteDraft[p.prayerType] ?? ""}
                  onChange={(e) => setNoteDraft((prev) => ({ ...prev, [p.prayerType]: e.target.value }))}
                  onBlur={() => saveNote(p)}
                  className="text-xs"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
