import { PrayerDayState, PrayerId, PrayerItem } from '../types/guide';
import { timeToMinutes } from './guideEngine';

export interface IPrayerProvider {
  getPrayerTimes(dateStr: string): Promise<Record<PrayerId, string>>;
}

/**
 * Mock Prayer Times Provider
 * Realistic default prayer times architecture ready to be swapped with a real API (e.g. Aladhan API) later.
 */
export class MockPrayerProvider implements IPrayerProvider {
  async getPrayerTimes(_dateStr: string): Promise<Record<PrayerId, string>> {
    return {
      fajr: '04:45',
      dhuhr: '12:45',
      asr: '16:05',
      maghrib: '18:45',
      isha: '20:05',
    };
  }
}

export const DEFAULT_PRAYER_NAMES: Record<PrayerId, string> = {
  fajr: 'صلاة الفجر',
  dhuhr: 'صلاة الظهر',
  asr: 'صلاة العصر',
  maghrib: 'صلاة المغرب',
  isha: 'صلاة العشاء',
};

export const DEFAULT_PRAYER_SHORT_NAMES: Record<PrayerId, string> = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export class PrayerService {
  private provider: IPrayerProvider;

  constructor(provider: IPrayerProvider = new MockPrayerProvider()) {
    this.provider = provider;
  }

  /**
   * حساب حالة صلوات اليوم بناءً على الوقت الحالي والصلوات المسجلة
   */
  computeDayState(
    dateStr: string,
    currentMinutes: number,
    completedMap: Partial<Record<PrayerId, { isCompleted: boolean; completedAt?: string }>>,
    prayerTimes: Record<PrayerId, string> = {
      fajr: '04:45',
      dhuhr: '12:45',
      asr: '16:05',
      maghrib: '18:45',
      isha: '20:05',
    }
  ): PrayerDayState {
    const prayerOrder: PrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    const prayers: PrayerItem[] = prayerOrder.map((id) => {
      const time = prayerTimes[id];
      const entry = completedMap[id];
      return {
        id,
        name: DEFAULT_PRAYER_NAMES[id],
        time,
        isCompleted: !!entry?.isCompleted,
        completedAt: entry?.completedAt,
      };
    });

    const completedCount = prayers.filter((p) => p.isCompleted).length;

    // البحث عن الصلاة القادمة
    let nextPrayerItem = prayers.find((p) => timeToMinutes(p.time) > currentMinutes);

    let nextPrayer: PrayerDayState['nextPrayer'];

    if (nextPrayerItem) {
      const prayerM = timeToMinutes(nextPrayerItem.time);
      nextPrayer = {
        id: nextPrayerItem.id,
        name: nextPrayerItem.name,
        time: nextPrayerItem.time,
        minutesRemaining: prayerM - currentMinutes,
        isPast: false,
      };
    } else {
      // إذا تخطى الوقت صلاة العشاء، فالصلاة القادمة هي فجر اليوم التالي
      const fajrM = timeToMinutes(prayerTimes.fajr);
      const minutesRemaining = 1440 - currentMinutes + fajrM;
      nextPrayer = {
        id: 'fajr',
        name: 'صلاة فجر الغد',
        time: prayerTimes.fajr,
        minutesRemaining,
        isPast: false,
      };
    }

    return {
      date: dateStr,
      prayers,
      nextPrayer,
      completedCount,
    };
  }
}

export const prayerService = new PrayerService();
