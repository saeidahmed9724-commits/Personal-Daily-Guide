"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, MapPin, Trash2 } from "lucide-react";
import { apiGet, apiSend } from "@/lib/client";
import { addDays } from "@/lib/dates";
import { Button, Card, DateNav, Input, Pill, SectionTitle, Select, Spinner, Textarea } from "@/components/ui";
import type { EventItem } from "@/types";

const TYPES = ["general", "work", "personal", "health", "social", "spiritual"];

export default function EventsTab({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "general",
    date,
    startTime: "09:00",
    endTime: "",
    location: "",
    notes: "",
  });

  function load() {
    setLoading(true);
    const from = addDays(date, -3);
    const to = addDays(date, 14);
    apiGet<EventItem[]>(`/api/events?from=${from}&to=${to}`)
      .then(setEvents)
      .finally(() => setLoading(false));
  }

  useEffect(load, [date]);
  useEffect(() => setForm((f) => ({ ...f, date })), [date]);

  async function createEvent() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await apiSend("/api/events", "POST", form);
      setForm((f) => ({ ...f, title: "", location: "", notes: "" }));
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(ev: EventItem, status: string) {
    await apiSend(`/api/events/${ev.id}`, "PATCH", { status });
    load();
  }

  async function remove(id: string) {
    await apiSend(`/api/events/${id}`, "DELETE");
    load();
  }

  const grouped = events.reduce<Record<string, EventItem[]>>((acc, ev) => {
    acc[ev.date] = acc[ev.date] ? [...acc[ev.date], ev] : [ev];
    return acc;
  }, {});

  return (
    <div>
      <SectionTitle title="Calendar" subtitle="Upcoming events and appointments." action={<DateNav date={date} setDate={setDate} />} />

      <div className="mb-4 flex justify-end">
        <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>
          <CalendarPlus size={16} /> New event
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Event title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
              <Input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
            </div>
            <Input placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            <Textarea placeholder="Notes" rows={1} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <Button className="mt-3" onClick={createEvent} disabled={saving}>
            {saving ? "Adding..." : "Add event"}
          </Button>
        </Card>
      )}

      {loading ? (
        <Spinner />
      ) : Object.keys(grouped).length === 0 ? (
        <Card>
          <p className="text-sm text-slate-400">No events in this range.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, items]) => (
              <div key={day}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{day}</p>
                <div className="space-y-2">
                  {items.map((ev) => (
                    <Card key={ev.id} className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800">{ev.title}</p>
                          <Pill tone="indigo">{ev.type}</Pill>
                        </div>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                          {ev.startTime && <span>{ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ""}</span>}
                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {ev.location}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={ev.status} onChange={(e) => updateStatus(ev, e.target.value)} className="w-auto text-xs">
                          <option value="upcoming">Upcoming</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </Select>
                        <button onClick={() => remove(ev.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
