import { db } from "@/db";
import {
  habitRecords,
  habits,
  prayerRecords,
  recoveryRecords,
  sleepRecords,
  socialMediaRecords,
  workDays,
} from "@/db/schema";
import { and, gte } from "drizzle-orm";
import { jsonOk } from "@/lib/api";
import { lastNDays, todayStr } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days") ?? "30");
  const dateList = lastNDays(days);
  const startDate = dateList[0];

  const [prayerRows, sleepRows, workRows, habitRecordRows, activeHabits, socialRows, recoveryRows] = await Promise.all([
    db.select().from(prayerRecords).where(gte(prayerRecords.date, startDate)),
    db.select().from(sleepRecords).where(gte(sleepRecords.date, startDate)),
    db.select().from(workDays).where(gte(workDays.date, startDate)),
    db.select().from(habitRecords).where(gte(habitRecords.date, startDate)),
    db.select().from(habits),
    db.select().from(socialMediaRecords).where(gte(socialMediaRecords.date, startDate)),
    db.select().from(recoveryRecords).where(gte(recoveryRecords.date, startDate)),
  ]);

  const activeHabitCount = activeHabits.filter((h) => !h.isArchived).length || 1;

  const daily = dateList.map((date) => {
    const prayersForDate = prayerRows.filter((p) => p.date === date);
    const sleepForDate = sleepRows.find((s) => s.date === date);
    const workForDate = workRows.find((w) => w.date === date);
    const habitsForDate = habitRecordRows.filter((h) => h.date === date && h.completed).length;
    const socialForDate = socialRows.filter((s) => s.date === date).reduce((sum, s) => sum + s.durationMinutes, 0);
    const hadRelapse = recoveryRows.some((r) => r.date === date && r.status === "relapse");

    return {
      date,
      prayerCompletedCount: prayersForDate.filter((p) => p.prayedStatus).length,
      prayerTotal: prayersForDate.length,
      sleepDurationMinutes: sleepForDate?.durationMinutes ?? null,
      sleepQuality: sleepForDate?.quality ?? null,
      workTarget: workForDate?.targetDesigns ?? 0,
      workCompleted: workForDate?.completedDesigns ?? 0,
      habitsCompleted: habitsForDate,
      habitsTotal: activeHabitCount,
      socialMediaMinutes: socialForDate,
      relapse: hadRelapse,
    };
  });

  // Clean streak: consecutive days up to today without relapse (only counting days that have passed)
  let cleanStreak = 0;
  const today = todayStr();
  for (let i = dateList.length - 1; i >= 0; i--) {
    const date = dateList[i];
    if (date > today) continue;
    const hadRelapse = recoveryRows.some((r) => r.date === date && r.status === "relapse");
    if (hadRelapse) break;
    cleanStreak += 1;
  }

  const totals = {
    avgSleepMinutes:
      daily.filter((d) => d.sleepDurationMinutes !== null).reduce((sum, d) => sum + (d.sleepDurationMinutes ?? 0), 0) /
      (daily.filter((d) => d.sleepDurationMinutes !== null).length || 1),
    avgPrayerRate:
      daily.reduce((sum, d) => sum + (d.prayerTotal ? d.prayerCompletedCount / d.prayerTotal : 0), 0) / daily.length,
    workCompletionRate:
      daily.reduce((sum, d) => sum + (d.workTarget ? Math.min(1, d.workCompleted / d.workTarget) : 0), 0) /
      (daily.filter((d) => d.workTarget > 0).length || 1),
    habitCompletionRate:
      daily.reduce((sum, d) => sum + d.habitsCompleted / (d.habitsTotal || 1), 0) / daily.length,
    cleanStreak,
    totalSocialMediaMinutes: daily.reduce((sum, d) => sum + d.socialMediaMinutes, 0),
  };

  return jsonOk({ daily, totals });
}
