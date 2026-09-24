/**
 * Automated Daily Computation Service
 * 
 * Computes end-of-day summaries from recorded normalized data (WorkSessions, Designs,
 * Prayers, Sleep, Suhaila logs, Social media logs, Recovery records, Habits)
 * so that the user never needs to re-enter information manually!
 */

import { WorkDayEntity, DesignEntity, WorkSessionEntity } from '../../models/work';
import { PrayerRecordEntity } from '../../models/prayer';
import { SleepRecordEntity } from '../../models/sleep';
import { RelationshipActivityEntity } from '../../models/relationship';
import { SocialMediaRecordEntity } from '../../models/socialMedia';
import { RecoveryRecordEntity } from '../../models/recovery';
import { HabitRecordEntity } from '../../models/habit';
import { ComputedDaySummary, DailyCheckInEntity } from '../../models/checkin';

export interface DailyRawInputs {
  date: string;
  userId: string;
  workDay?: WorkDayEntity;
  designs?: DesignEntity[];
  workSessions?: WorkSessionEntity[];
  prayers?: PrayerRecordEntity[];
  sleepRecord?: SleepRecordEntity;
  suhailaLogs?: RelationshipActivityEntity[];
  socialMediaLogs?: SocialMediaRecordEntity[];
  recoveryRecord?: RecoveryRecordEntity;
  habitRecords?: HabitRecordEntity[];
}

export class DailyComputationService {
  /**
   * حساب ملخص اليوم تلقائياً من الكيانات المسجلة بالفعل
   */
  public static computeSummary(inputs: DailyRawInputs): ComputedDaySummary {
    const {
      date,
      workDay,
      designs = [],
      workSessions = [],
      prayers = [],
      sleepRecord,
      suhailaLogs = [],
      socialMediaLogs = [],
      recoveryRecord,
      habitRecords = [],
    } = inputs;

    // 1. Work Computation
    const targetDesigns = workDay?.targetDesigns ?? 4;
    const completedDesigns = designs.length > 0 
      ? designs.filter(d => d.status === 'done').length
      : (workDay?.completedDesigns ?? 0);
    const extraDesigns = designs.length > 0
      ? designs.filter(d => d.status === 'done' && d.isExtra).length
      : Math.max(0, completedDesigns - targetDesigns);

    // Focused duration from work sessions or designs
    const sessionDurationMinutes = workSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const designDurationMinutes = designs.reduce((acc, d) => acc + d.durationMinutes, 0);
    const focusedDurationMinutes = workDay?.focusedWorkDurationMinutes 
      ?? (sessionDurationMinutes > 0 ? sessionDurationMinutes : designDurationMinutes);

    const creditGenerated = workDay?.productionCreditGenerated ?? extraDesigns;
    const creditUsed = workDay?.productionCreditUsed ?? 0;
    const wasTargetMet = completedDesigns >= targetDesigns || (completedDesigns + creditUsed) >= targetDesigns;

    // 2. Prayer Computation
    const totalPrayers = 5;
    const completedPrayers = prayers.filter(p => p.prayedStatus).map(p => p.prayerType);
    const prayerCompletedCount = completedPrayers.length;

    // 3. Suhaila & Relationship Computation
    const suhailaTotalMinutes = suhailaLogs.reduce((acc, log) => acc + log.totalMinutes, 0);
    const suhailaFocusedMinutes = suhailaLogs.reduce((acc, log) => acc + log.focusedMinutes, 0);

    // 4. Social Media Computation
    let socialMediaTotalMinutes = 0;
    let socialMediaAutomaticMinutes = 0;
    let socialMediaIntentionalMinutes = 0;

    for (const log of socialMediaLogs) {
      socialMediaTotalMinutes += log.durationMinutes;
      if (log.mode === 'automatic') {
        socialMediaAutomaticMinutes += log.durationMinutes;
      } else {
        socialMediaIntentionalMinutes += log.durationMinutes;
      }
    }

    // 5. Recovery Status
    const cleanStatus = recoveryRecord?.status === 'relapse' ? 'relapse' : 'clean';

    // 6. Habits Completion
    const habitsCompletedCount = habitRecords.filter(h => h.completed).length;
    const habitsTotalCount = habitRecords.length;

    return {
      date,
      wakeTime: sleepRecord?.wakeTime,
      sleepDurationMinutes: sleepRecord?.durationMinutes,
      sleepQuality: sleepRecord?.quality,
      work: {
        completedDesigns,
        targetDesigns,
        extraDesigns,
        focusedDurationMinutes,
        wasTargetMet,
        creditGenerated,
        creditUsed,
      },
      prayer: {
        completedCount: prayerCompletedCount,
        totalPrayers,
        allCompleted: prayerCompletedCount >= totalPrayers,
        completedPrayers,
      },
      personal: {
        suhailaTotalMinutes,
        suhailaFocusedMinutes,
        socialMediaTotalMinutes,
        socialMediaAutomaticMinutes,
        socialMediaIntentionalMinutes,
        cleanStatus,
        habitsCompletedCount,
        habitsTotalCount,
      },
    };
  }

  /**
   * إنشاء كائن DailyCheckInEntity جاهز يحتوي على الملخص المحسوب تلقائياً
   * مع إمكانية إضافة التقييم والمشاعر الذاتية دون تكرار أي إدخال
   */
  public static createCheckIn(
    inputs: DailyRawInputs,
    subjectiveReflection?: {
      mood?: 'calm' | 'focused' | 'tired' | 'energized' | 'distracted';
      dailyRating?: number;
      note?: string;
    }
  ): DailyCheckInEntity {
    const computedSummary = this.computeSummary(inputs);

    return {
      id: `checkin-${inputs.date}`,
      dayId: inputs.date,
      userId: inputs.userId,
      computedSummary,
      mood: subjectiveReflection?.mood,
      dailyRating: subjectiveReflection?.dailyRating,
      note: subjectiveReflection?.note,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
