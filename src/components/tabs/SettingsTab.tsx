"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend } from "@/lib/client";
import { Button, Card, Input, SectionTitle, Spinner } from "@/components/ui";
import type { Settings } from "@/types";

const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiGet<Settings>("/api/settings")
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  function toggleWorkDay(day: number) {
    if (!settings) return;
    const has = settings.workDays.includes(day);
    const next = has ? settings.workDays.filter((d) => d !== day) : [...settings.workDays, day].sort();
    update("workDays", next);
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await apiSend<Settings>("/api/settings", "PUT", settings);
      setSettings(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return (
      <div>
        <SectionTitle title="Settings" subtitle="Personalize your daily guide." />
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle title="Settings" subtitle="Personalize your daily guide." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Profile</h3>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-500">
              Display name
              <Input value={settings.displayName} onChange={(e) => update("displayName", e.target.value)} className="mt-1" />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Partner name
              <Input value={settings.partnerName} onChange={(e) => update("partnerName", e.target.value)} className="mt-1" />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Timezone
              <Input value={settings.timezone} onChange={(e) => update("timezone", e.target.value)} className="mt-1" />
            </label>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Routine targets</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-slate-500">
                Wake target
                <Input type="time" value={settings.wakeTarget} onChange={(e) => update("wakeTarget", e.target.value)} className="mt-1" />
              </label>
              <label className="text-xs font-medium text-slate-500">
                Sleep target
                <Input type="time" value={settings.sleepTarget} onChange={(e) => update("sleepTarget", e.target.value)} className="mt-1" />
              </label>
            </div>
            <label className="block text-xs font-medium text-slate-500">
              Daily work target (designs/tasks)
              <Input
                type="number"
                min={0}
                value={settings.dailyWorkTarget}
                onChange={(e) => update("dailyWorkTarget", Number(e.target.value))}
                className="mt-1"
              />
            </label>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500">Work days</p>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => toggleWorkDay(d.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                      settings.workDays.includes(d.value) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Prayer schedule</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(Object.keys(settings.prayerTimes) as (keyof Settings["prayerTimes"])[]).map((key) => (
              <label key={key} className="text-xs font-medium capitalize text-slate-500">
                {key}
                <Input
                  type="time"
                  value={settings.prayerTimes[key]}
                  onChange={(e) => update("prayerTimes", { ...settings.prayerTimes, [key]: e.target.value })}
                  className="mt-1"
                />
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </Button>
        {saved && <span className="text-sm text-emerald-600">Saved!</span>}
      </div>
    </div>
  );
}
