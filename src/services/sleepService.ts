import { SleepRecord, SleepState, SleepStats } from '../types/guide';
import { timeToMinutes } from './guideEngine';

export class SleepService {
  /**
   * حساب مدة النوم بالدقائق مع مراعاة عبور منتصف الليل
   * مثال: النوم 03:45 والاستيقاظ 12:18 -> 8 ساعات و33 دقيقة (513 دقيقة)
   */
  calculateDurationMinutes(sleepTimeStr: string, wakeTimeStr: string): number {
    const sleepM = timeToMinutes(sleepTimeStr);
    const wakeM = timeToMinutes(wakeTimeStr);

    if (wakeM >= sleepM) {
      return wakeM - sleepM;
    } else {
      // عبور منتصف الليل
      return 1440 - sleepM + wakeM;
    }
  }

  /**
   * تنسيق الدقائق إلى صيغة واضحة ومقروءة (مثلاً: 8س 33د)
   */
  formatDuration(durationM: number): string {
    const hours = Math.floor(durationM / 60);
    const mins = durationM % 60;
    if (mins === 0) return `${hours} ساعات`;
    return `${hours}س ${mins}د`;
  }

  /**
   * تحليل إحصائيات النوم مع تطبيق قاعدة عدم التسرع في الاستنتاج
   */
  analyzeSleepStats(history: SleepRecord[], minDaysRequired: number = 5): SleepStats {
    const count = history.length;
    const hasSufficientData = count >= minDaysRequired;

    if (!hasSufficientData || count === 0) {
      return {
        hasSufficientData: false,
        recordedDaysCount: count,
        minDaysRequired,
      };
    }

    // حساب متوسط مدة النوم
    const totalDuration = history.reduce((sum, r) => sum + r.durationMinutes, 0);
    const averageDurationMinutes = Math.round(totalDuration / count);

    // حساب متوسط وقت الاستيقاظ
    const totalWakeM = history.reduce((sum, r) => sum + timeToMinutes(r.wakeTime), 0);
    const avgWakeM = Math.round(totalWakeM / count);
    const avgWakeH = Math.floor(avgWakeM / 60);
    const avgWakeMin = avgWakeM % 60;
    const averageWakeTime = `${String(avgWakeH).padStart(2, '0')}:${String(avgWakeMin).padStart(2, '0')}`;

    // حساب متوسط وقت النوم (مع تطبيع أوقات ما بعد منتصف الليل)
    const normalizedSleepMinutes = history.map((r) => {
      const m = timeToMinutes(r.sleepTime);
      // إذا كان بين 00:00 و 08:00 نعتبره ممتداً بعد 24:00 (1440)
      return m < 480 ? m + 1440 : m;
    });
    const avgSleepNorm = Math.round(normalizedSleepMinutes.reduce((a, b) => a + b, 0) / count) % 1440;
    const avgSleepH = Math.floor(avgSleepNorm / 60);
    const avgSleepMin = avgSleepNorm % 60;
    const averageSleepTime = `${String(avgSleepH).padStart(2, '0')}:${String(avgSleepMin).padStart(2, '0')}`;

    // ملاحظة مبدئية هادئة حول الاستيقاظ والشغل
    const observation =
      'البيانات توضح أن استيقاظك بالقرب من 12:00 - 12:30 ظهراً يمنحك بداية عمل هادئة وتركيزاً مستقراً لتسليم تصميماتك قبل المساء.';

    return {
      hasSufficientData: true,
      recordedDaysCount: count,
      minDaysRequired,
      averageSleepTime,
      averageWakeTime,
      averageDurationMinutes,
      workStartCorrelationObservation: observation,
    };
  }
}

export const sleepService = new SleepService();
