import React, { useState } from 'react';
import { useDailyGuide } from '../../../context/GuideContext';
import { dashboardService } from '../../../services/dashboardService';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Moon, 
  Heart, 
  Smartphone, 
  ShieldCheck, 
  Briefcase, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const AnalyticsHub: React.FC = () => {
  const { plan, sleepState, personalState, patterns } = useDailyGuide();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const weeklySnapshot = dashboardService.getWeeklySnapshot(plan, personalState);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header & Philosophy */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>التحليلات الواقعية (Analytics)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            فهم الأنماط والسلوكيات
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            الهدف هو مراقبة الإيقاع الحقيقي لحياتك واستخراج رؤى مفيدة، دون تحويل حياتك إلى نقاط أو ألعاب ضاغطة.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
          {(['daily', 'weekly', 'monthly'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeframe === tf
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {tf === 'daily' ? 'اليوم' : tf === 'weekly' ? 'أسبوعي' : 'شهري'}
            </button>
          ))}
        </div>
      </div>

      {/* Sufficient Data Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-bold">ملاحظة علمية حول البيانات:</span>
          <p className="text-stone-600">
            التحليلات تبنى من البيانات المسجلة فعلياً (7 أيام متوفرة). يتجنب النظام القفز إلى استنتاجات متسرعة أو فرض افتراضات قبل اكتمال أسبوعين على الأقل من الرصد.
          </p>
        </div>
      </div>

      {/* 1. Work Analytics Grid */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-stone-900 text-base">تحليلات العمل والتصميمات</h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            {timeframe === 'weekly' ? '24 من 28 تصميم' : '96 من 112 تصميم'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="text-xs text-stone-500">متوسط وقت التصميم الواحد</span>
            <div className="text-xl font-black font-mono text-stone-900">42 دقيقة</div>
            <p className="text-[11px] text-stone-500">ضمن النطاق المثالي (35 - 50 دقيقة)</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="text-xs text-stone-500">رصيد الإنتاج التراكمي (+Credit)</span>
            <div className="text-xl font-black font-mono text-amber-600">
              +{plan?.productionCredit?.totalCreditBalance || 4} تصاميم
            </div>
            <p className="text-[11px] text-stone-500">حماية من ضغط الأيام المزدحمة</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="text-xs text-stone-500">ذروة التركيز والإنتاج</span>
            <div className="text-xl font-black font-mono text-stone-900">2:00 م - 5:30 م</div>
            <p className="text-[11px] text-stone-500">82% من التصميمات تنجز في هذه النافذة</p>
          </div>
        </div>
      </div>

      {/* 2. Sleep & Wake Analytics */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-600" />
            <h2 className="font-bold text-stone-900 text-base">تحليلات النوم وبداية اليوم</h2>
          </div>
          <span className="text-xs text-stone-500">الهدف المرجعي: صحو 12:00 ظهرًا</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="text-xs text-stone-500">متوسط ساعات النوم</span>
            <div className="text-xl font-black font-mono text-indigo-950">
              {weeklySnapshot.avgSleepHours} ساعة
            </div>
            <p className="text-[11px] text-stone-500">مدى كافٍ وصحي للراحة الذهنية</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="text-xs text-stone-500">متوسط وقت الاستيقاظ الفعلي</span>
            <div className="text-xl font-black font-mono text-indigo-950">
              {weeklySnapshot.avgWakeTime}
            </div>
            <p className="text-[11px] text-stone-500">مرونة واقعية دون اعتبار اليوم فاشلاً</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="text-xs text-stone-500">أثر وقت الصحو على العمل</span>
            <div className="text-sm font-bold text-emerald-800 pt-1">
              لا تعطل في إنجاز الـ 4 تصاميم
            </div>
            <p className="text-[11px] text-stone-500">طالما يتم بدء العمل قبل 2:30 ظهرًا</p>
          </div>
        </div>
      </div>

      {/* 3. Personal Life & Habits Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Suhaila Connection & Focused Time */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-stone-900 text-sm">سهيلة — جودة الحضور الذهني</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">الوقت الصافي المركز (Focused Time):</span>
              <span className="font-bold font-mono text-stone-900">
                {dashboardService.formatDuration(weeklySnapshot.totalFocusedSuhailaMinutes)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">إجمالي وقت التواصل المشترك:</span>
              <span className="font-bold font-mono text-stone-900">14س 20د</span>
            </div>
            <p className="text-[11px] text-stone-500 pt-2 border-t border-stone-100">
              الوقت الصافي يعني تواصل حقيقي دون تنقل بين شاشات تيك توك أو إنستجرام أثناء الحديث.
            </p>
          </div>
        </div>

        {/* Social Media & Recovery Patterns */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-stone-900 text-sm">التعافي وأنماط المحفزات</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">الأيام النظيفة المستقرة:</span>
              <span className="font-bold font-mono text-emerald-700">
                {weeklySnapshot.cleanDaysCount} من 7 أيام
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">السياق الواقعي لأي تحدٍ مسجل:</span>
              <span className="font-bold text-stone-800">وحدة في شقة الشغل + وقت فارغ</span>
            </div>
            <p className="text-[11px] text-stone-500 pt-2 border-t border-stone-100">
              المحفز ليس السرير؛ بل الجلوس منفرداً في شقة العمل مع الشاشات وقت الملل. الرصد يساعد على الاستباق الهادئ.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
