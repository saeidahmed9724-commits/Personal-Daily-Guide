import { currentTimeStr, timeToMinutes } from "@/lib/dates";

export interface GuidanceContext {
  now?: string;
  weekday: number; // 0-6
  workDays: number[];
  prayers: { prayerType: string; scheduledTime: string; prayedStatus: boolean }[];
  work: { targetDesigns: number; completedDesigns: number; workStart?: string | null; workEnd?: string | null } | null;
  sleepLoggedToday: boolean;
  habitsPending: number;
  habitsTotal: number;
  hasRelapseToday: boolean;
  eventsToday: { title: string; startTime?: string | null }[];
}

export interface Guidance {
  headline: string;
  detail: string;
  tone: "focus" | "success" | "warning" | "info";
}

const PRAYER_LABELS: Record<string, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export function buildGuidance(ctx: GuidanceContext): Guidance {
  const now = ctx.now ?? currentTimeStr();
  const nowMinutes = timeToMinutes(now) ?? 0;

  if (ctx.hasRelapseToday) {
    return {
      headline: "Reset and refocus",
      detail: "A slip happened today — acknowledge it, forgive yourself, and return to your routine with the next small action.",
      tone: "warning",
    };
  }

  const nextEvent = ctx.eventsToday
    .filter((e) => e.startTime && (timeToMinutes(e.startTime) ?? Infinity) >= nowMinutes)
    .sort((a, b) => (timeToMinutes(a.startTime) ?? 0) - (timeToMinutes(b.startTime) ?? 0))[0];
  if (nextEvent) {
    const diff = (timeToMinutes(nextEvent.startTime) ?? 0) - nowMinutes;
    if (diff >= 0 && diff <= 45) {
      return {
        headline: `Upcoming: ${nextEvent.title}`,
        detail: `Starts at ${nextEvent.startTime}, in about ${diff} minute${diff === 1 ? "" : "s"}. Get ready.`,
        tone: "info",
      };
    }
  }

  const upcomingPrayer = ctx.prayers
    .filter((p) => !p.prayedStatus)
    .sort((a, b) => (timeToMinutes(a.scheduledTime) ?? 0) - (timeToMinutes(b.scheduledTime) ?? 0))[0];

  if (upcomingPrayer) {
    const diff = (timeToMinutes(upcomingPrayer.scheduledTime) ?? 0) - nowMinutes;
    if (diff <= 20 && diff >= -60) {
      const label = PRAYER_LABELS[upcomingPrayer.prayerType] ?? upcomingPrayer.prayerType;
      return {
        headline: diff >= 0 ? `${label} prayer time is near` : `${label} prayer is due`,
        detail: diff >= 0
          ? `Scheduled for ${upcomingPrayer.scheduledTime}. Pause what you're doing and prepare.`
          : `Scheduled for ${upcomingPrayer.scheduledTime}. Try to pray as soon as you can.`,
        tone: "focus",
      };
    }
  }

  const isWorkday = ctx.workDays.includes(ctx.weekday);
  if (isWorkday && ctx.work) {
    const remaining = Math.max(0, ctx.work.targetDesigns - ctx.work.completedDesigns);
    const withinHours =
      ctx.work.workStart && ctx.work.workEnd
        ? nowMinutes >= (timeToMinutes(ctx.work.workStart) ?? 0) && nowMinutes <= (timeToMinutes(ctx.work.workEnd) ?? 1440)
        : true;
    if (remaining > 0 && withinHours) {
      return {
        headline: `Focus on work — ${remaining} left`,
        detail: `You've completed ${ctx.work.completedDesigns}/${ctx.work.targetDesigns} today. Keep the momentum going.`,
        tone: "focus",
      };
    }
    if (remaining === 0 && ctx.work.completedDesigns > 0) {
      return {
        headline: "Work target met — great job!",
        detail: "You hit your production target for today. Consider a short break or a bonus task.",
        tone: "success",
      };
    }
  }

  if (!ctx.sleepLoggedToday && nowMinutes < 12 * 60) {
    return {
      headline: "Log last night's sleep",
      detail: "Recording your sleep helps track your rest patterns and energy levels.",
      tone: "info",
    };
  }

  if (ctx.habitsPending > 0) {
    return {
      headline: `${ctx.habitsPending} habit${ctx.habitsPending === 1 ? "" : "s"} left today`,
      detail: `You've completed ${ctx.habitsTotal - ctx.habitsPending}/${ctx.habitsTotal} habits so far.`,
      tone: "info",
    };
  }

  return {
    headline: "You're on track",
    detail: "Everything looks good right now. Keep up the steady rhythm of your day.",
    tone: "success",
  };
}
