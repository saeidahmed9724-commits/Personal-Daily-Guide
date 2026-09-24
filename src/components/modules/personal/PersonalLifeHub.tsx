import React from 'react';
import { useDailyGuide } from '../../../context/GuideContext';
import { 
  Heart, 
  Smartphone, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Clock, 
  Trash2, 
  Compass, 
  Coffee, 
  AlertCircle,
  Building2,
  HelpCircle,
  Eye
} from 'lucide-react';
import { personalLifeService } from '../../../services/personalLifeService';
import { SuhailaModal } from './SuhailaModal';
import { SocialMediaModal } from './SocialMediaModal';
import { RecoveryModal } from './RecoveryModal';
import { FriendModal } from './FriendModal';
import { AddHabitModal } from './AddHabitModal';

export const PersonalLifeHub: React.FC = () => {
  const { 
    personalState, 
    openSuhailaModal, 
    openSocialMediaModal, 
    openRecoveryModal, 
    openFriendModal, 
    openAddHabitModal,
    deleteSuhailaLog,
    deleteSocialMediaLog,
    deleteFriendActivity,
    toggleHabit,
    deleteHabit,
    recordRecovery
  } = useDailyGuide();

  if (!personalState) {
    return (
      <div className="p-8 text-center text-stone-500">
        جاري تحميل سجلات الحياة الشخصية والعادات...
      </div>
    );
  }

  const suhailaSummary = personalLifeService.calculateSuhailaSummary(personalState.todaySuhailaLogs);
  const socialSummary = personalLifeService.calculateSocialMediaSummary(personalState.todaySocialMediaLogs);
  const recoveryAnalysis = personalLifeService.analyzeRecoveryPatterns(personalState.recoveryHistory);

  const isTodayClean = personalState.todayRecovery?.status === 'clean';
  const hasTodayRecovery = !!personalState.todayRecovery;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header & Philosophy Manifesto Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 text-stone-100 p-6 md:p-8 border border-stone-800 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/90 text-stone-300 text-xs font-medium border border-stone-700/80">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              <span>متابعة شخصية محترمة وغير حكمية</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              الحياة الشخصية والعادات
            </h1>
            <p className="text-sm md:text-base text-stone-300 leading-relaxed font-light">
              <strong className="text-white font-semibold">«Understand my behavior, not gamify my life»</strong>
              <br />
              هذا الركن ليس للمهام أو التقييمات أو الـ Badges. هدفه تسجيل شكل يومك الحقيقي، ومعرفة الفارق بين الحضور الصافي والتشتت، وفهم أنماطك الذاتية برفق.
            </p>
          </div>

          {/* Quick Fast Logger Action Bar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={openSuhailaModal}
              className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
              <span>+ سهيلة</span>
            </button>
            <button
              onClick={openSocialMediaModal}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition flex items-center gap-1.5 border border-stone-700"
            >
              <Smartphone className="w-3.5 h-3.5 text-stone-400" />
              <span>+ سوشيال</span>
            </button>
            <button
              onClick={openRecoveryModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>التعافي</span>
            </button>
            <button
              onClick={openFriendModal}
              className="px-3.5 py-2 rounded-xl bg-sky-800/80 hover:bg-sky-800 text-sky-100 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-sky-300" />
              <span>+ خالد / أصحاب</span>
            </button>
            <button
              onClick={openAddHabitModal}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition flex items-center gap-1 border border-stone-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>عادة مرنة</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ======================================================== */}
        {/* 2. SUHAILA SECTION (Activity, NOT a Task; Focused Time)  */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                </div>
                <div>
                  <h2 className="font-bold text-stone-900 text-base">سهيلة (Suhaila Time)</h2>
                  <p className="text-xs text-stone-500">نشاط إنساني وتواصل حقيقي، ليس مجرد مهمة Done/Not Done</p>
                </div>
              </div>
              <button
                onClick={openSuhailaModal}
                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل وقت</span>
              </button>
            </div>

            {/* Total vs Focused Card */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/70 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-stone-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    إجمالي الوقت اليوم:
                  </span>
                  <div className="text-xl font-extrabold font-mono text-stone-900">
                    {suhailaSummary.totalFormatted}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    الوقت الصافي الحقيقي (Focused):
                  </span>
                  <div className="text-xl font-extrabold font-mono text-rose-600">
                    {suhailaSummary.focusedFormatted}
                  </div>
                </div>
              </div>

              {/* Visual Proportion Bar */}
              {suhailaSummary.totalMinutes > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full h-3 rounded-full bg-stone-200 overflow-hidden flex">
                    <div 
                      className="h-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${suhailaSummary.focusedRatio}%` }}
                      title={`صافي مركز: ${suhailaSummary.focusedRatio}%`}
                    />
                    <div 
                      className="h-full bg-rose-200 transition-all duration-500"
                      style={{ width: `${100 - suhailaSummary.focusedRatio}%` }}
                      title={`اتصال عام في الخلفية: ${100 - suhailaSummary.focusedRatio}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      حضور مركز بدون تشتت ({suhailaSummary.focusedRatio}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-200 inline-block" />
                      تواصل عام في الخلفية ({100 - suhailaSummary.focusedRatio}%)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-stone-500 text-center py-2">
                  لم يسجل وقت بعد اليوم. اضغط "تسجيل وقت" لتوثيق تواصلك معها.
                </div>
              )}

              {/* Gentle Non-Judgmental Explanation */}
              <div className="text-[11px] text-stone-600 bg-white/80 p-2.5 rounded-lg border border-stone-200/60 leading-relaxed">
                💡 <strong>فهم الفكرة:</strong> الوقت الصافي هو الوقت الذي كنت فيه متصلاً معها فعلياً دون التنقل في نفس الوقت بين TikTok أو Instagram. الفرق لا يعني أن باقي الوقت سيء؛ الهدف فقط معرفة الفارق بين الحضور الحقيقي وبين مجرد البقاء متصلاً في الخلفية أثناء أمور أخرى، بدون أي تقييم أو Score للعلاقة.
              </div>
            </div>

            {/* Today's Logs List */}
            {personalState.todaySuhailaLogs.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-700">سجلات تواصل اليوم:</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                  {personalState.todaySuhailaLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-white border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 font-mono">
                            {personalLifeService.formatDuration(log.totalMinutes)}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium text-[10px] border border-rose-100">
                            صافي: {personalLifeService.formatDuration(log.focusedMinutes)}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-[11px] text-stone-500 truncate">{log.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteSuhailaLog(log.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-50 rounded-lg transition shrink-0"
                        title="حذف السجل"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. SOCIAL MEDIA SECTION (Understanding, not Demonizing)   */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-200">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-stone-900 text-base">السوشيال ميديا (Social Media)</h2>
                  <p className="text-xs text-stone-500">TikTok و Instagram — فهم الاستخدام بوعي بدون عداء أو مشاعر ذنب</p>
                </div>
              </div>
              <button
                onClick={openSocialMediaModal}
                className="px-3 py-1.5 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل جلسة</span>
              </button>
            </div>

            {/* Time breakdown: Automatic vs Intentional */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/70 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <span className="text-[11px] text-stone-500">إجمالي اليوم:</span>
                  <div className="text-lg font-extrabold font-mono text-stone-900">
                    {socialSummary.totalFormatted}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-amber-800 font-medium">تلقائي / غير واعي:</span>
                  <div className="text-lg font-extrabold font-mono text-amber-700">
                    {socialSummary.automaticFormatted}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-emerald-800 font-medium">مقصود وواعي:</span>
                  <div className="text-lg font-extrabold font-mono text-emerald-700">
                    {socialSummary.intentionalFormatted}
                  </div>
                </div>
              </div>

              {/* Progress Split */}
              {socialSummary.totalMinutes > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full h-3 rounded-full bg-stone-200 overflow-hidden flex">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${socialSummary.automaticRatio}%` }}
                      title={`تلقائي: ${socialSummary.automaticRatio}%`}
                    />
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${100 - socialSummary.automaticRatio}%` }}
                      title={`مقصود: ${100 - socialSummary.automaticRatio}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      Scrolling غير واعي ({socialSummary.automaticRatio}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      تصفح مقصود وبحث ({100 - socialSummary.automaticRatio}%)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-stone-500 text-center py-2">
                  لم تسجل جلسة اليوم.
                </div>
              )}

              <div className="text-[11px] text-stone-600 bg-white/80 p-2.5 rounded-lg border border-stone-200/60 leading-relaxed">
                💡 <strong>لا عداء:</strong> السوشيال ميديا ليست عدواً ولا توجد هنا كلمة "فشل". الهدف فقط أن تلاحظ متى تسحبك الفيديوهات تلقائياً عند شعورك بالملل، ومتى تستخدمها بوعي.
              </div>
            </div>

            {/* List of today's social logs */}
            {personalState.todaySocialMediaLogs.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-700">جلسات تصفح اليوم:</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                  {personalState.todaySocialMediaLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-white border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            log.platform === 'tiktok' ? 'bg-stone-900 text-white' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {log.platform === 'tiktok' ? 'TikTok' : log.platform === 'instagram' ? 'Instagram' : 'Social'}
                          </span>
                          <span className="font-mono font-bold text-stone-900">
                            {personalLifeService.formatDuration(log.durationMinutes)}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                            log.mode === 'automatic' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {log.mode === 'automatic' ? 'تلقائي' : 'مقصود'}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-[11px] text-stone-500 truncate">{log.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteSocialMediaLog(log.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-50 rounded-lg transition shrink-0"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. RECOVERY SECTION (Clean Day ✓ / Relapse; Dignified)     */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 md:p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">
                مسار التعافي والوعي (Recovery & Clarity)
              </h2>
              <p className="text-xs text-stone-500">
                تسجيل بسيط لاكتشاف الأنماط وحماية وقتك، بدون عقاب أو إحساس بالذنب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => recordRecovery('clean')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isTodayClean
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span>✓ يوم نظيف ومستقر (Clean Day)</span>
            </button>

            <button
              onClick={openRecoveryModal}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                hasTodayRecovery && !isTodayClean
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>{hasTodayRecovery && !isTodayClean ? 'تم تسجيل انتكاسة' : 'تسجيل انتكاسة'}</span>
            </button>
          </div>
        </div>

        {/* Real Context Banner (Crucial user guidance: Bed != Trigger) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <Building2 className="w-4 h-4 text-stone-700" />
              <span>فهم السياق الواقعي (Empirical Context)</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              <strong>المحفز ليس السرير تحديداً.</strong> التحليل يوضح أن الانتكاسة ترتبط بوجودك <strong>بمفردك في شقة الشغل</strong>، ومعك الكمبيوتر والموبايل، في أوقات فراغ غير محددة أو عند الاستغراق في الـ Scrolling والملل.
            </p>
            <div className="text-[11px] text-stone-500 pt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>الوعي بالسياق هو الحل الفعلي: كسر الفراغ، أو النزول للتمشية، أو لقاء الأصدقاء، يقطع الدائرة تلقائياً.</span>
            </div>
          </div>

          {/* Compassionate Continuation Philosophy */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>مبدأ اليوم المستمر</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              إذا حدثت انتكاسة، النظام <strong>لا يعتبر اليوم انتهى أو فشل</strong>. يُسجل الحدث لفهم المحفز فقط، ويستمر يومك بسلام وأداء طبيعي تماماً دون جلد ذات.
            </p>
          </div>
        </div>

        {/* History Insights without Gamification */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-stone-500 block">الأيام المسجلة:</span>
              <span className="font-bold text-stone-900 font-mono text-sm">
                {recoveryAnalysis.totalRecorded} أيام
              </span>
            </div>
            <div className="w-px h-8 bg-stone-200" />
            <div>
              <span className="text-stone-500 block">أيام مستقرة ونظيفة:</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">
                {recoveryAnalysis.cleanDays} يوم
              </span>
            </div>
            <div className="w-px h-8 bg-stone-200" />
            <div>
              <span className="text-stone-500 block">المحفز الأبرز الملاحظ:</span>
              <span className="font-bold text-stone-800">
                {personalLifeService.getTriggerLabel(recoveryAnalysis.topTrigger[0] as any)}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
            بدون عدادات أيام ضاغطة أو Streaks، التركيز على فهم السلوك.
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. FRIENDS & GENERAL HABITS (Behavior Observation)       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Friends & Social (Khaled, Outings, Unscheduled) */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-stone-900 text-base">الأصدقاء والأنشطة الاجتماعية</h2>
                  <p className="text-xs text-stone-500">خالد والأصدقاء — أنشطة غير دورية تسجل وقت حدوثها</p>
                </div>
              </div>
              <button
                onClick={openFriendModal}
                className="px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-xl transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل نشاط</span>
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              هذه اللقاءات لا تحتاج جدولاً ثابتاً ولا نعتبرها واجبات، بل تُوثق عند حدوثها كجزء من توازنك النفسي وخروجك من عزلة شقة الشغل.
            </p>

            {/* List of Friend activities */}
            <div className="space-y-2">
              {personalState.todayFriendActivities.length > 0 ? (
                personalState.todayFriendActivities.map(act => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white border border-stone-200 text-sky-700">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">{act.friendName}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1">
                          <span>المدة: {personalLifeService.formatDuration(act.durationMinutes)}</span>
                          {act.notes && <span>• {act.notes}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteFriendActivity(act.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-xs text-stone-500 text-center py-4 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                  لا توجد خروجات أو مكالمات مسجلة اليوم مع الأصدقاء.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* General Habits (Zero Gamification, Zero Badges/Streaks) */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-stone-900 text-base">سلوكيات للملاحظة (Flexible Habits)</h2>
                  <p className="text-xs text-stone-500">فهم السلوك بدون ألعاب، بدون عدادات Streaks، وبدون نقاط</p>
                </div>
              </div>
              <button
                onClick={openAddHabitModal}
                className="px-3 py-1.5 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة عادة</span>
              </button>
            </div>

            <div className="space-y-2">
              {personalState.habits.map(habit => {
                const entry = personalState.todayHabitEntries.find(e => e.habitId === habit.id);
                const isCompleted = !!entry?.isCompleted;

                return (
                  <div
                    key={habit.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                      isCompleted 
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                        : 'bg-white border-stone-200 text-stone-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleHabit(habit.id)}
                      className="flex items-center gap-3 text-right flex-1"
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-stone-300 bg-white hover:border-stone-400'
                      }`}>
                        {isCompleted && <span className="text-xs font-bold">✓</span>}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isCompleted ? 'text-emerald-950' : 'text-stone-900'}`}>
                          {habit.title}
                        </div>
                        {habit.description && (
                          <div className="text-[10px] text-stone-500 mt-0.5">{habit.description}</div>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 text-stone-300 hover:text-stone-600 rounded transition"
                      title="حذف العادة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Modals */}
      <SuhailaModal />
      <SocialMediaModal />
      <RecoveryModal />
      <FriendModal />
      <AddHabitModal />
    </div>
  );
};
