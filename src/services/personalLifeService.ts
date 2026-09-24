import { 
  SuhailaLog, 
  SocialMediaLog, 
  RecoveryLog, 
  FriendActivityLog, 
  FlexibleHabit, 
  HabitLogEntry, 
  PersonalLifeState,
  RecoveryTrigger
} from '../types/guide';

export class PersonalLifeService {
  /**
   * Format minutes into readable Arabic duration
   * e.g. 130 min -> "ساعتان و10 دقائق" or "2h 10m"
   */
  formatDuration(minutes: number): string {
    if (minutes <= 0) return '0 د';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} دقيقة`;
    if (mins === 0) return `${hrs} س`;
    return `${hrs} س و${mins} د`;
  }

  /**
   * Calculate difference between two HH:mm strings
   */
  calculateMinutes(start: string, end: string): number {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;
    if (endTotal < startTotal) {
      endTotal += 24 * 60; // Next day wrap
    }
    return Math.max(0, endTotal - startTotal);
  }

  /**
   * Calculate summary of Suhaila connection today
   */
  calculateSuhailaSummary(logs: SuhailaLog[]) {
    const totalMinutes = logs.reduce((acc, l) => acc + l.totalMinutes, 0);
    const focusedMinutes = logs.reduce((acc, l) => acc + l.focusedMinutes, 0);
    const backgroundMinutes = Math.max(0, totalMinutes - focusedMinutes);
    const focusedRatio = totalMinutes > 0 ? Math.round((focusedMinutes / totalMinutes) * 100) : 0;

    return {
      totalMinutes,
      focusedMinutes,
      backgroundMinutes,
      focusedRatio,
      totalFormatted: this.formatDuration(totalMinutes),
      focusedFormatted: this.formatDuration(focusedMinutes),
      backgroundFormatted: this.formatDuration(backgroundMinutes),
    };
  }

  /**
   * Calculate summary of Social Media usage today
   */
  calculateSocialMediaSummary(logs: SocialMediaLog[]) {
    const totalMinutes = logs.reduce((acc, l) => acc + l.durationMinutes, 0);
    const automaticMinutes = logs
      .filter(l => l.mode === 'automatic')
      .reduce((acc, l) => acc + l.durationMinutes, 0);
    const intentionalMinutes = logs
      .filter(l => l.mode === 'intentional')
      .reduce((acc, l) => acc + l.durationMinutes, 0);

    const automaticRatio = totalMinutes > 0 ? Math.round((automaticMinutes / totalMinutes) * 100) : 0;

    return {
      totalMinutes,
      automaticMinutes,
      intentionalMinutes,
      automaticRatio,
      totalFormatted: this.formatDuration(totalMinutes),
      automaticFormatted: this.formatDuration(automaticMinutes),
      intentionalFormatted: this.formatDuration(intentionalMinutes),
    };
  }

  /**
   * Analyze recovery data and triggers empirically
   */
  analyzeRecoveryPatterns(history: RecoveryLog[]) {
    const totalRecorded = history.length;
    const cleanDays = history.filter(r => r.status === 'clean').length;
    const relapseDays = history.filter(r => r.status === 'relapse').length;

    // Count triggers
    const triggerCounts: Record<RecoveryTrigger, number> = {
      boredom: 0,
      loneliness: 0,
      social_media: 0,
      staying_up_late: 0,
      empty_time: 0,
      sexual_content: 0,
      other: 0,
    };

    history
      .filter(r => r.status === 'relapse' && r.trigger)
      .forEach(r => {
        if (r.trigger && triggerCounts[r.trigger] !== undefined) {
          triggerCounts[r.trigger]++;
        }
      });

    // Check primary context
    const workApartmentRelapses = history.filter(
      r => r.status === 'relapse' && r.locationContext === 'work_apartment'
    ).length;

    return {
      totalRecorded,
      cleanDays,
      relapseDays,
      cleanPercentage: totalRecorded > 0 ? Math.round((cleanDays / totalRecorded) * 100) : 100,
      triggerCounts,
      workApartmentRelapses,
      topTrigger: Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0],
    };
  }

  /**
   * Get trigger label in Arabic
   */
  getTriggerLabel(trigger?: RecoveryTrigger): string {
    switch (trigger) {
      case 'boredom':
        return 'الملل وركود الوقت';
      case 'loneliness':
        return 'الوحدة والانعزال الفردي';
      case 'social_media':
        return 'تصفح وسوشيال ميديا لا واعي';
      case 'staying_up_late':
        return 'السهر المتأخر وحدك';
      case 'empty_time':
        return 'وقت فارغ بدون وجهة واضحة';
      case 'sexual_content':
        return 'محتوى مثير مصادف على الشاشات';
      case 'other':
      default:
        return 'سبب آخر';
    }
  }
}

export const personalLifeService = new PersonalLifeService();
