import { db } from "@/db";
import {
  habitRecords,
  habits,
  prayerRecords,
  recoveryRecords,
  relationshipActivities,
  settings,
  sleepRecords,
  socialMediaRecords,
  workDays,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

export interface ComputedDaySummary {
  date: string;
  sleep: {
    durationMinutes: number | null;
    quality: number | null;
    wakeTime: string | null;
  };
  work: {
    targetDesigns: number;
    completedDesigns: number;
    extraDesigns: number;
    focusedMinutes: number;
    wasTargetMet: boolean;
  };
  prayer: {
    completedCount: number;
    totalPrayers: number;
    allCompleted: boolean;
    completedPrayers: string[];
  };
  habits: {
    completedCount: number;
    totalCount: number;
  };
  personal: {
    relationshipTotalMinutes: number;
    relationshipFocusedMinutes: number;
    socialMediaTotalMinutes: number;
    socialMediaAutomaticMinutes: number;
    socialMediaIntentionalMinutes: number;
    cleanStatus: "clean" | "relapse";
  };
}

export async function computeDaySummary(date: string): Promise<ComputedDaySummary> {
  const [sleepRow] = await db.select().from(sleepRecords).where(eq(sleepRecords.date, date));
  const [workRow] = await db.select().from(workDays).where(eq(workDays.date, date));
  const prayerRows = await db.select().from(prayerRecords).where(eq(prayerRecords.date, date));

  const activeHabits = await db.select().from(habits).where(eq(habits.isArchived, false));
  const habitRecordRows = await Promise.all(
    activeHabits.map((h) =>
      db
        .select()
        .from(habitRecords)
        .where(and(eq(habitRecords.habitId, h.id), eq(habitRecords.date, date)))
    )
  );
  const completedHabits = habitRecordRows.filter((r) => r[0]?.completed).length;

  const relationshipRows = await db
    .select()
    .from(relationshipActivities)
    .where(eq(relationshipActivities.date, date));
  const socialRows = await db.select().from(socialMediaRecords).where(eq(socialMediaRecords.date, date));
  const recoveryRows = await db.select().from(recoveryRecords).where(eq(recoveryRecords.date, date));

  const [settingsRow] = await db.select().from(settings).where(eq(settings.id, "default"));

  const completedPrayers = prayerRows.filter((p) => p.prayedStatus).map((p) => p.prayerType);

  const socialTotal = socialRows.reduce((sum, r) => sum + r.durationMinutes, 0);
  const socialAutomatic = socialRows
    .filter((r) => r.mode === "automatic")
    .reduce((sum, r) => sum + r.durationMinutes, 0);
  const socialIntentional = socialTotal - socialAutomatic;

  const hasRelapse = recoveryRows.some((r) => r.status === "relapse");

  return {
    date,
    sleep: {
      durationMinutes: sleepRow?.durationMinutes ?? null,
      quality: sleepRow?.quality ?? null,
      wakeTime: sleepRow?.wakeTime ?? null,
    },
    work: {
      targetDesigns: workRow?.targetDesigns ?? settingsRow?.dailyWorkTarget ?? 0,
      completedDesigns: workRow?.completedDesigns ?? 0,
      extraDesigns: workRow?.extraDesigns ?? 0,
      focusedMinutes: workRow?.focusedMinutes ?? 0,
      wasTargetMet: (workRow?.completedDesigns ?? 0) >= (workRow?.targetDesigns ?? settingsRow?.dailyWorkTarget ?? 0),
    },
    prayer: {
      completedCount: completedPrayers.length,
      totalPrayers: prayerRows.length || 5,
      allCompleted: prayerRows.length > 0 && completedPrayers.length === prayerRows.length,
      completedPrayers,
    },
    habits: {
      completedCount: completedHabits,
      totalCount: activeHabits.length,
    },
    personal: {
      relationshipTotalMinutes: relationshipRows.reduce((sum, r) => sum + r.totalMinutes, 0),
      relationshipFocusedMinutes: relationshipRows.reduce((sum, r) => sum + r.focusedMinutes, 0),
      socialMediaTotalMinutes: socialTotal,
      socialMediaAutomaticMinutes: socialAutomatic,
      socialMediaIntentionalMinutes: socialIntentional,
      cleanStatus: hasRelapse ? "relapse" : "clean",
    },
  };
}
