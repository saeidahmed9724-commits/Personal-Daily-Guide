"use client";

import { useEffect, useState } from "react";
import { apiGet, formatMinutes } from "@/lib/client";
import { Card, SectionTitle, Select, Spinner } from "@/components/ui";
import type { AnalyticsResponse } from "@/types";

export default function AnalyticsTab() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet<AnalyticsResponse>(`/api/analytics?days=${days}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div>
      <SectionTitle
        title="Analytics"
        subtitle="Patterns and trends across your daily guide."
        action={
          <Select value={String(days)} onChange={(e) => setDays(Number(e.target.value))} className="w-auto">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Select>
        }
      />

      {loading || !data ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <MetricCard label="Avg sleep" value={formatMinutes(Math.round(data.totals.avgSleepMinutes))} />
            <MetricCard label="Prayer rate" value={`${Math.round(data.totals.avgPrayerRate * 100)}%`} />
            <MetricCard label="Work rate" value={`${Math.round(data.totals.workCompletionRate * 100)}%`} />
            <MetricCard label="Habit rate" value={`${Math.round(data.totals.habitCompletionRate * 100)}%`} />
            <MetricCard label="Clean streak" value={`${data.totals.cleanStreak}d`} />
          </div>

          <Card>
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Sleep duration (minutes)</h3>
            <BarChart data={data.daily} valueKey="sleepDurationMinutes" color="bg-indigo-400" max={600} />
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Prayer completion</h3>
            <BarChart
              data={data.daily}
              valueKey="prayerCompletedCount"
              color="bg-emerald-400"
              max={5}
            />
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Work output (completed designs)</h3>
            <BarChart data={data.daily} valueKey="workCompleted" color="bg-amber-400" max={Math.max(5, ...data.daily.map((d) => d.workTarget))} />
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Social media minutes</h3>
            <BarChart data={data.daily} valueKey="socialMediaMinutes" color="bg-sky-400" max={180} />
          </Card>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function BarChart<T extends { date: string }>({
  data,
  valueKey,
  color,
  max,
}: {
  data: T[];
  valueKey: keyof T;
  color: string;
  max: number;
}) {
  return (
    <div className="flex h-32 items-end gap-1 overflow-x-auto">
      {data.map((d) => {
        const raw = d[valueKey];
        const value = typeof raw === "number" ? raw : 0;
        const heightPct = max > 0 ? Math.min(100, Math.max(2, (value / max) * 100)) : 2;
        return (
          <div key={d.date} className="group relative flex min-w-[6px] flex-1 flex-col items-center justify-end">
            <div
              className={`w-full rounded-t ${color} transition-all`}
              style={{ height: `${heightPct}%` }}
              title={`${d.date}: ${value}`}
            />
          </div>
        );
      })}
    </div>
  );
}
