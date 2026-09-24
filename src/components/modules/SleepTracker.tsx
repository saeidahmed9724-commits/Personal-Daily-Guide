import React from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { sleepService } from '../../services/sleepService';
import { 
  Moon, 
  Sun, 
  Clock, 
  BarChart3, 
  Plus, 
  Edit2, 
  Info, 
  HeartHandshake, 
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const SleepTracker: React.FC = () => {
  const { 
    sleepState, 
    openLogSleepModal, 
    openEditSleepModal, 
    plan 
  } = useDailyGuide();

  if (!sleepState) return null;

  const { todayRecord, history, stats, targetWakeUpTime } = sleepState;

  const actualWake = todayRecord?.wakeTime || plan?.actualWakeUpTime || '12:15';
  const targetWake = targetWakeUpTime || '12:00';
  
  // Calculate drift
  const [actualH, actualM] = actualWake.split(':').map(Number);
  const [targetH, targetM] = targetWake.split(':').map(Number);
  const driftMinutes = (actualH * 60 + actualM) - (targetH * 60 + targetM);
  const isLate = driftMinutes > 30;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-stone-400">
              تتبع النوم واليقظة
            </span>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
              Sleep Context & Data Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            النوم، الاستيقاظ، وبداية اليوم
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xl">
            جمع بيانات واقعية عن نومك لفهم النمط الحقيقي، دون فرض مواعيد نوم مسبقة ودون إصدار أحكام لوم عند الاستيقاظ المتأخر.
          </p>
        </div>

        <button
          onClick={openLogSleepModal}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{todayRecord ? 'تحديث نوم اليوم' : 'تسجيل نوم اليوم'}</span>
        </button>
      </div>

      {/* Philosophy Card: Zero-Judgment Recalibration */}
      <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <HeartHandshake className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-emerald-950">
          <div className="font-bold text-sm">مبدأ المرونة وعدم إفساد اليوم (Non-Judgmental Recalibration)</div>
          <p className="text-emerald-900/90 leading-relaxed">
            الهدف المرجعي هو الاستيقاظ قرابة <span className="font-mono font-bold text-emerald-950">{targetWake} ظهرًا</span>. حتى لو استيقظت في 1:30 أو 3:00 ظهرًا، الموقع لا يعتبر اليوم فاشلًا أبدًا، ولا يفرض عليك تعويضاً مرهقاً. بل يعيد توجيه اليوم بهدوء بناءً على وقت استيقاظك الفعلي، مع إمكانية استخدام <span className="font-semibold text-emerald-950">رصيد الإنتاج التراكمي (+Credit)</span> لحماية راحة بالك.
          </p>
        </div>
      </div>

      {/* Today's Sleep Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Today Wake Time */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="font-medium">الاستيقاظ اليوم</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-stone-900">{actualWake}</span>
            <span className="text-xs text-stone-600 font-medium">ظهرًا</span>
          </div>
          <div className="text-[11px] pt-1">
            {isLate ? (
              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                متأخر {driftMinutes} دقيقة عن الهدف ({targetWake}) — وتم تكييف اليوم بسلاسة ✓
              </span>
            ) : (
              <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                متوافق تماماً مع الهدف المرجعي ({targetWake}) ✓
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Today Sleep Time & Duration */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="font-medium">ساعات النوم</span>
            <Moon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-stone-900">
              {todayRecord ? sleepService.formatDuration(todayRecord.durationMinutes) : '8 س 30 د'}
            </span>
          </div>
          <div className="text-[11px] text-stone-600 flex items-center gap-1 font-mono">
            <span>النوم: {todayRecord?.sleepTime || '03:45'}</span>
            <span>·</span>
            <span>الاستيقاظ: {todayRecord?.wakeTime || actualWake}</span>
          </div>
        </div>

        {/* Card 3: Quality & Readiness */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="font-medium">جودة النوم والراحة</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">
              {todayRecord?.quality ? `${todayRecord.quality} / 5` : '4 / 5'}
            </span>
            <span className="text-xs text-stone-600">
              {todayRecord?.quality === 5 ? 'عميق وممتاز' : todayRecord?.quality === 4 ? 'مريح وهادئ' : 'معتدل'}
            </span>
          </div>
          <div className="text-[11px] text-stone-600">
            {todayRecord?.notes || 'نوم كافٍ يمنحك صفاءً ذهنياً لجلسة تصميم رايقة'}
          </div>
        </div>
      </div>

      {/* Empirical Data Analysis Engine (Stats & Patterns) */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-stone-700" />
            <h3 className="font-bold text-stone-900 text-sm">
              تحليل البيانات المجمعة (Sleep Data & Insights)
            </h3>
          </div>
          <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-medium self-start sm:self-auto">
            سجل {stats.recordedDaysCount} أيام مسجلة (الحد الأدنى للأنماط: {stats.minDaysRequired} أيام)
          </span>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/70">
            <div className="text-[11px] text-stone-600">متوسط وقت النوم</div>
            <div className="text-base font-black font-mono text-stone-900 mt-1">
              {stats.averageSleepTime || '—'}
            </div>
            <div className="text-[10px] text-stone-600 mt-0.5">بعد منتصف الليل</div>
          </div>

          <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/70">
            <div className="text-[11px] text-stone-600">متوسط وقت الاستيقاظ</div>
            <div className="text-base font-black font-mono text-stone-900 mt-1">
              {stats.averageWakeTime || '—'}
            </div>
            <div className="text-[10px] text-stone-600 mt-0.5">قرابة الظهر</div>
          </div>

          <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/70">
            <div className="text-[11px] text-stone-600">متوسط مدة النوم</div>
            <div className="text-base font-black font-mono text-stone-900 mt-1">
              {stats.averageDurationMinutes ? sleepService.formatDuration(stats.averageDurationMinutes) : '—'}
            </div>
            <div className="text-[10px] text-stone-600 mt-0.5">معدل صحي متوازن</div>
          </div>

          <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/70">
            <div className="text-[11px] text-stone-600">تأثير النوم على الشغل</div>
            <div className="text-xs font-bold text-stone-900 mt-1 truncate">
              {stats.workStartCorrelationObservation || 'يبدأ العمل بعد ساعتين'}
            </div>
            <div className="text-[10px] text-stone-600 mt-0.5">نافذة روقان وبداية هادئة</div>
          </div>
        </div>

        {/* Scientific Pattern Rule */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
          stats.hasSufficientData 
            ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
            : 'bg-amber-50/60 border-amber-200 text-amber-950'
        }`}>
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-stone-500" />
          <div className="space-y-1">
            <div className="font-bold">
              {stats.hasSufficientData ? 'اكتشاف الأنماط بناءً على بيانات تجريبية كافية' : 'مرحلة جمع البيانات الأولية'}
            </div>
            <p className="leading-relaxed opacity-90">
              {stats.hasSufficientData
                ? `تم تسجيل ${stats.recordedDaysCount} أيام كافية لاكتشاف النمط الطبيعي بدقة. الاستيقاظ المتأخر لا يؤثر سلباً طالما يتم الحفاظ على نافذة الروقان.`
                : `تم تسجيل ${stats.recordedDaysCount} أيام حتى الآن. النظام لا يستنتج أي Pattern أو قاعدة نهائية إلا بعد جمع بيانات كافية (الحد الأدنى ${stats.minDaysRequired} أيام) حرصاً على الصدق وتجنب الافتراضات المتسرعة.`}
            </p>
          </div>
        </div>
      </div>

      {/* Sleep History Table */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-500" />
            <span>سجل الأيام السابقة (Sleep History)</span>
          </h3>
          <span className="text-xs text-stone-600 font-mono">
            {history.length} تسجيلات
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {history.map((record) => {
            const isToday = record.date === (plan?.date || new Date().toISOString().split('T')[0]);
            return (
              <div 
                key={record.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 font-mono font-bold text-xs shrink-0">
                    {record.date.slice(5)}
                  </div>
                  <div>
                    <div className="font-bold text-stone-900 text-xs flex items-center gap-2">
                      <span>{record.date}</span>
                      {isToday && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                          اليوم
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-600 flex items-center gap-2 font-mono mt-0.5">
                      <span>نوم: {record.sleepTime}</span>
                      <span>·</span>
                      <span>صحوت: {record.wakeTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left">
                    <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                      {sleepService.formatDuration(record.durationMinutes)}
                    </span>
                    {record.quality && (
                      <span className="text-xs text-amber-500 font-bold mr-2">
                        {record.quality} ★
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openEditSleepModal(record)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition"
                    title="تعديل هذا اليوم"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
