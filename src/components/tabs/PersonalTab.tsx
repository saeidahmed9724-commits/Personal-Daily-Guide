"use client";

import { useEffect, useState } from "react";
import { Heart, Smartphone, ShieldCheck, Trash2, AlertTriangle } from "lucide-react";
import { apiGet, apiSend, formatMinutes } from "@/lib/client";
import { Button, Card, DateNav, Input, Pill, SectionTitle, Select, Spinner, Textarea } from "@/components/ui";
import type { RecoveryRecord, RelationshipActivity, SocialMediaRecord } from "@/types";

export default function PersonalTab({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  const [relationship, setRelationship] = useState<RelationshipActivity[]>([]);
  const [social, setSocial] = useState<SocialMediaRecord[]>([]);
  const [recovery, setRecovery] = useState<RecoveryRecord[]>([]);
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [relForm, setRelForm] = useState({ startTime: "19:00", endTime: "20:00", notes: "" });
  const [socialForm, setSocialForm] = useState({ platform: "Instagram", startTime: "12:00", endTime: "12:30", mode: "intentional", notes: "" });
  const [recoveryStatus, setRecoveryStatus] = useState<"clean" | "relapse">("clean");
  const [recoveryNotes, setRecoveryNotes] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      apiGet<RelationshipActivity[]>(`/api/relationship?date=${date}`),
      apiGet<SocialMediaRecord[]>(`/api/social-media?date=${date}`),
      apiGet<RecoveryRecord[]>(`/api/recovery?date=${date}`),
      apiGet<{ totals: { cleanStreak: number } }>("/api/analytics?days=365"),
    ]).then(([rel, soc, rec, analytics]) => {
      setRelationship(rel);
      setSocial(soc);
      setRecovery(rec);
      setStreak(analytics.totals.cleanStreak);
      setLoading(false);
    });
  }

  useEffect(load, [date]);

  async function addRelationship() {
    await apiSend("/api/relationship", "POST", { date, ...relForm });
    setRelForm({ startTime: "19:00", endTime: "20:00", notes: "" });
    load();
  }

  async function addSocial() {
    await apiSend("/api/social-media", "POST", { date, ...socialForm });
    setSocialForm({ platform: "Instagram", startTime: "12:00", endTime: "12:30", mode: "intentional", notes: "" });
    load();
  }

  async function logRecovery() {
    await apiSend("/api/recovery", "POST", { date, status: recoveryStatus, notes: recoveryNotes });
    setRecoveryNotes("");
    load();
  }

  async function removeItem(url: string) {
    await apiSend(url, "DELETE");
    load();
  }

  return (
    <div>
      <SectionTitle title="Personal Life" subtitle="Relationships, digital wellbeing, and self-control." action={<DateNav date={date} setDate={setDate} />} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Heart size={16} className="text-rose-500" />
              <h3 className="text-sm font-semibold text-slate-800">Quality time</h3>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input type="time" value={relForm.startTime} onChange={(e) => setRelForm((f) => ({ ...f, startTime: e.target.value }))} />
                <Input type="time" value={relForm.endTime} onChange={(e) => setRelForm((f) => ({ ...f, endTime: e.target.value }))} />
              </div>
              <Textarea rows={1} placeholder="Notes" value={relForm.notes} onChange={(e) => setRelForm((f) => ({ ...f, notes: e.target.value }))} />
              <Button className="w-full" onClick={addRelationship}>
                Log time together
              </Button>
            </div>
            <ul className="mt-3 space-y-2">
              {relationship.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    {r.startTime}-{r.endTime} · {formatMinutes(r.totalMinutes)}
                  </span>
                  <button onClick={() => removeItem(`/api/relationship/${r.id}`)} className="text-slate-300 hover:text-rose-500">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Smartphone size={16} className="text-sky-500" />
              <h3 className="text-sm font-semibold text-slate-800">Social media</h3>
            </div>
            <div className="space-y-2">
              <Input placeholder="Platform" value={socialForm.platform} onChange={(e) => setSocialForm((f) => ({ ...f, platform: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="time" value={socialForm.startTime} onChange={(e) => setSocialForm((f) => ({ ...f, startTime: e.target.value }))} />
                <Input type="time" value={socialForm.endTime} onChange={(e) => setSocialForm((f) => ({ ...f, endTime: e.target.value }))} />
              </div>
              <Select value={socialForm.mode} onChange={(e) => setSocialForm((f) => ({ ...f, mode: e.target.value }))}>
                <option value="intentional">Intentional</option>
                <option value="automatic">Automatic / mindless</option>
              </Select>
              <Button className="w-full" onClick={addSocial}>
                Log usage
              </Button>
            </div>
            <ul className="mt-3 space-y-2">
              {social.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    {s.platform} · {formatMinutes(s.durationMinutes)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Pill tone={s.mode === "automatic" ? "amber" : "slate"}>{s.mode}</Pill>
                    <button onClick={() => removeItem(`/api/social-media/${s.id}`)} className="text-slate-300 hover:text-rose-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-800">Self-control streak</h3>
            </div>
            <p className="text-3xl font-semibold text-slate-900">{streak ?? 0}</p>
            <p className="text-xs text-slate-500">consecutive clean days</p>
            <div className="mt-3 space-y-2">
              <Select value={recoveryStatus} onChange={(e) => setRecoveryStatus(e.target.value as "clean" | "relapse")}>
                <option value="clean">Clean today</option>
                <option value="relapse">Relapse today</option>
              </Select>
              <Textarea rows={1} placeholder="Notes (optional)" value={recoveryNotes} onChange={(e) => setRecoveryNotes(e.target.value)} />
              <Button
                className="w-full"
                variant={recoveryStatus === "relapse" ? "danger" : "primary"}
                onClick={logRecovery}
              >
                {recoveryStatus === "relapse" ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
                Log entry
              </Button>
            </div>
            <ul className="mt-3 space-y-1">
              {recovery.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <Pill tone={r.status === "clean" ? "green" : "red"}>{r.status}</Pill>
                  <button onClick={() => removeItem(`/api/recovery/${r.id}`)} className="text-slate-300 hover:text-rose-500">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
