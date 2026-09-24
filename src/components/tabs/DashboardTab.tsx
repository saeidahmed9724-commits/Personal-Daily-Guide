"use client";

import { useEffect, useState } from "react";
import { Sparkles, Moon, BedDouble, Briefcase, CheckCircle2, Heart, CalendarClock } from "lucide-react";
import { apiGet } from "@/lib/client";
import { formatMinutes } from "@/lib/client";
import { Card, DateNav, Pill, ProgressBar, SectionTitle, Spinner, Button } from "@/components/ui";
import type { DashboardResponse } from "@/types";

const TONE_STYLES: Record<string, string> = {
  focus: "from-indigo-500 to-indigo-600",
  success: "from-emerald-500 to-emerald-600",
  warning: "from-amber-500 to-rose-500",
  info: "from-sky-500 to-indigo-500",
};

export default function DashboardTab({
  date,
  setDate,
  onNavigate,
}: {
  date: string;
  setDate: (d: string) => void;
  onNavigate: (tab: string) => void;
}) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet<DashboardResponse>(`/api/dashboard?date=${date}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div>
      <SectionTitle
        title={`Hi ${data?.settings?.displayName ?? ""} 👋`}
        subtitle="Here's your snapshot for the day."
        action={<DateNav date={date} setDate={setDate} />}
      />

      {loading || !data ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div className={`rounded-2xl bg-gradient-to-r ${TONE_STYLES[data.guidance.tone]} p-6 text-white shadow-md`}>
            <div className="flex items-center gap-2 text-white/80">
              <Sparkles size={16} />
              <span className="text-xs font-medium uppercase tracking-wide">Right now</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">{data.guidance.headline}</h2>
            <p className="mt-1 text-sm text-white/90">{data.guidance.detail}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              icon={<Moon size={16} />}
              label="Prayers"
              value={`${data.summary.prayer.completedCount}/${data.summary.prayer.totalPrayers}`}
              onClick={() => onNavigate("prayers")}
            />
            <StatCard
              icon={<BedDouble size={16} />}
              label="Sleep"
              value={formatMinutes(data.summary.sleep.durationMinutes)}
              onClick={() => onNavigate("sleep")}
            />
            <StatCard
              icon={<Briefcase size={16} />}
              label="Work"
              value={`${data.summary.work.completedDesigns}/${data.summary.work.targetDesigns}`}
              onClick={() => onNavigate("work")}
            />
            <StatCard
              icon={<CheckCircle2 size={16} />}
              label="Habits"
              value={`${data.summary.habits.completedCount}/${data.summary.habits.totalCount}`}
              onClick={() => onNavigate("habits")}
            />
            <StatCard
              icon={<Heart size={16} />}
              label="Clean streak"
              value={data.summary.personal.cleanStatus === "clean" ? "On track" : "Reset today"}
              onClick={() => onNavigate("personal")}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Prayer progress</h3>
                <Pill tone={data.summary.prayer.allCompleted ? "green" : "slate"}>
                  {data.summary.prayer.allCompleted ? "All done" : "In progress"}
                </Pill>
              </div>
              <ProgressBar value={data.summary.prayer.completedCount} max={data.summary.prayer.totalPrayers} colorClass="bg-indigo-500" />
              <div className="mt-3 flex flex-wrap gap-2">
                {data.prayers.map((p) => (
                  <Pill key={p.id} tone={p.prayedStatus ? "green" : "slate"}>
                    {p.prayerType} · {p.scheduledTime}
                  </Pill>
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Work target</h3>
                <Pill tone={data.summary.work.wasTargetMet ? "green" : "amber"}>
                  {data.summary.work.wasTargetMet ? "Target met" : "In progress"}
                </Pill>
              </div>
              <ProgressBar value={data.summary.work.completedDesigns} max={data.summary.work.targetDesigns || 1} colorClass="bg-emerald-500" />
              <p className="mt-3 text-sm text-slate-500">
                {data.summary.work.completedDesigns} completed
                {data.summary.work.extraDesigns > 0 && ` (+${data.summary.work.extraDesigns} extra)`} · Focused time:{" "}
                {formatMinutes(data.summary.work.focusedMinutes)}
              </p>
            </Card>

            <Card>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Today&apos;s habits</h3>
              {data.habits.length === 0 ? (
                <p className="text-sm text-slate-400">No habits yet. Add one from the Habits tab.</p>
              ) : (
                <ul className="space-y-2">
                  {data.habits.map((h) => (
                    <li key={h.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{h.title}</span>
                      <Pill tone={h.completed ? "green" : "slate"}>{h.completed ? "Done" : "Pending"}</Pill>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <div className="mb-3 flex items-center gap-2">
                <CalendarClock size={16} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800">Today&apos;s events</h3>
              </div>
              {data.events.length === 0 ? (
                <p className="text-sm text-slate-400">No events scheduled today.</p>
              ) : (
                <ul className="space-y-2">
                  {data.events.map((e) => (
                    <li key={e.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{e.title}</span>
                      <span className="text-slate-500">{e.startTime ?? ""}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="secondary" className="mt-3 w-full" onClick={() => onNavigate("events")}>
                Manage calendar
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">{icon}</span>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-lg font-semibold text-slate-900">{value}</span>
    </button>
  );
}
