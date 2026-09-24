import React from 'react';
import { useDailyGuide } from '../../../context/GuideContext';
import { dashboardService } from '../../../services/dashboardService';
import { personalLifeService } from '../../../services/personalLifeService';
import { 
  Sparkles, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Play, 
  Pause, 
  Plus, 
  Calendar, 
  Heart, 
  Smartphone, 
  ShieldCheck, 
  Moon, 
  Briefcase, 
  Check, 
  PlusCircle, 
  Coins, 
  ChevronRight,
  TrendingUp,
  Compass
} from 'lucide-react';

export const MainDashboard: React.FC = () => {
  const {
    currentTime,
    plan,
    events,
    prayerState,
    sleepState,
    personalState,
    setActiveTab,
    togglePrayer,
    toggleDesignTimer,
    finishDesign,
    startWorkday,
    openCheckinModal,
    openAddEventModal,
    openSuhailaModal,
    openSocialMediaModal,
    openRecoveryModal,
    openLogSleepModal,
    toggleHabit
  } = useDailyGuide();

  // 1. Compute dynamic context
  const contextCard = dashboardService.getContextualState(
    currentTime,
    plan,
    events,
    prayerState,
    sleepState,
    personalState
  );

  const weeklySnapshot = dashboardService.getWeeklySnapshot(plan, personalState);

  // Work session details
  const session = plan?.workdaySession;
  const designs = session?.designs || [];
  const completedDesignsCount = designs.filter(d => d.status === 'done').length;
  const totalDesignsCount = designs.length || 4;
  const isWorkTimerRunning = session?.isWorkTimerRunning || designs.some(d => d.isTimerRunning);
  const activeDesign = designs.find(d => d.isTimerRunning) || designs.find(d => d.status !== 'done');
  const credit = plan?.productionCredit;

  // Upcoming Event (nearest 1 or 2)
  const upcomingEvents = events.slice(0, 2);

  // Next prayer
  const nextPrayer = prayerState?.prayers.find(p => !p.isCompleted) || prayerState?.prayers[0];

  // Quick stats calculations
  const sleepLatest = sleepState?.todayRecord || sleepState?.history[sleepState.history.length - 1];
  const suhailaSummary = personalLifeService.calculateSuhailaSummary(personalState?.todaySuhailaLogs || []);
  const socialSummary = personalLifeService.calculateSocialMediaSummary(personalState?.todaySocialMediaLogs || []);
  const completedHabitsCount = personalState?.todayHabitEntries.filter(e => e.isCompleted).length || 0;
  const totalHabitsCount = personalState?.habits.length || 0;
  const completedPrayersCount = prayerState?.prayers.filter(p => p.isCompleted).length || 0;

  // Handle primary contextual action
  const handlePrimaryAction = async () => {
    if (contextCard.primaryActionType === 'finish_design' && activeDesign) {
      await finishDesign(activeDesign.id);
    } else if (contextCard.primaryActionType === 'start_work') {
      if (!session?.isWorkTimerRunning) {
        await startWorkday();
      }
      if (activeDesign && !activeDesign.isTimerRunning) {
        await toggleDesignTimer(activeDesign.id);
      }
    } else if (contextCard.primaryActionType === 'log_suhaila') {
      openSuhailaModal();
    } else if (contextCard.primaryActionType === 'prepare_sleep') {
      openLogSleepModal();
    } else {
      openCheckinModal();
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & CENTRAL QUESTION ("دلوقتي أعمل إيه؟")      */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900 text-stone-100 rounded-2xl p-5 md:p-6 shadow-md border border-stone-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>يومي — البوصلة الحية</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            «دلوقتي أعمل إيه؟»
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-light">
            النظام يفهم سياقك الحالي ويرشدك بهدوء للخطوة الأنسب، دون أوامر أو لوم.
          </p>
        </div>

        {/* Current Time & Day State Indicator */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-stone-800/90 px-3.5 py-2 rounded-xl border border-stone-700/80">
          <Clock className="w-4 h-4 text-stone-400" />
          <span className="font-mono font-bold text-sm text-stone-100">
            {currentTime}
          </span>
          <span className="text-stone-600">|</span>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${contextCard.dayStateBadgeClass}`}>
            {contextCard.dayStateLabel}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. THE MAIN HERO: NOW CARD + DAILY GUIDE                 */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* HERO CARD: NOW / دلوقتي (Col 8 on Desktop, Top on Mobile) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* NOW CARD */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-5">
            
            {/* Now status headline */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                  الحالة الحالية الآن (Now)
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                  {contextCard.nowHeadline}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {contextCard.nowDetail}
                </p>
              </div>

              {contextCard.remainingContextNote && (
                <div className="bg-stone-50 border border-stone-200/80 px-3 py-1.5 rounded-xl text-[11px] text-stone-700 font-medium shrink-0 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>{contextCard.remainingContextNote}</span>
                </div>
              )}
            </div>

            {/* Next Step / Suggestion */}
            <div className="bg-stone-50 rounded-xl p-4 sm:p-5 border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-bold">
                  الخطوة التالية المقترحة
                </span>
                <span className="text-xs font-bold text-stone-800">
                  {contextCard.nextStepTitle}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {contextCard.nextStepSubtitle}
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
              <button
                onClick={handlePrimaryAction}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-xs"
              >
                <span>{contextCard.primaryActionLabel}</span>
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={openCheckinModal}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition"
                >
                  تسجيل لحظي
                </button>
                <button
                  onClick={() => setActiveTab('work')}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition"
                >
                  Work Hub ←
                </button>
              </div>
            </div>

          </div>

          {/* DAILY GUIDE CARD (الجزء الثاني: مرشدك اليومي) */}
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-stone-100 rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-700/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>مرشدك اليومي (Daily Guide)</span>
            </div>
            <p className="text-sm sm:text-base font-medium leading-relaxed text-stone-100">
              «{contextCard.bannerGuidance}»
            </p>
            <div className="text-[11px] text-stone-400 pt-1 flex items-center gap-2">
              <span>* نبرة هادئة وواقعية ومباشرة، بدون أوامر أو لوم أو لغة مدير.</span>
            </div>
          </div>

          {/* WORK PROGRESS CARD (الجزء الرابع: تقدم العمل) */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    تقدم العمل اليومي (Work Progress)
                  </h3>
                  <p className="text-xs text-stone-500">
                    الهدف الأساسي: 4 تصميمات متقنة قبل 9:30 مساءً
                  </p>
                </div>
              </div>

              {/* Production Credit Balance */}
              {credit && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>+{credit.totalCreditBalance} تصاميم رصيد</span>
                </div>
              )}
            </div>

            {/* Designs Count & Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-stone-800">
                  المكتمل اليوم: {completedDesignsCount} / {totalDesignsCount} Designs
                </span>
                <span className="text-emerald-700 font-mono">
                  {Math.round((completedDesignsCount / totalDesignsCount) * 100)}%
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                  style={{ width: `${(completedDesignsCount / totalDesignsCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Designs Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {designs.map((design, idx) => (
                <div
                  key={design.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs transition ${
                    design.status === 'done'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : design.isTimerRunning
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white border-stone-200 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      design.status === 'done'
                        ? 'bg-emerald-600 text-white'
                        : design.isTimerRunning
                        ? 'bg-emerald-400 text-stone-900 animate-pulse'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {design.status === 'done' ? '✓' : `0${idx + 1}`}
                    </span>
                    <span className="font-semibold truncate">{design.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[11px] opacity-80">
                      {Math.floor(design.durationSeconds / 60)}د
                    </span>
                    {design.status !== 'done' && (
                      <button
                        onClick={() => toggleDesignTimer(design.id)}
                        className={`p-1.5 rounded-lg transition ${
                          design.isTimerRunning
                            ? 'bg-white/20 text-white hover:bg-white/30'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                        title={design.isTimerRunning ? 'إيقاف مؤقت' : 'بدء الموقت'}
                      >
                        {design.isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-stone-500">
              <span>إجمالي وقت العمل اليوم: {Math.floor((session?.totalWorkSeconds || 0) / 60)} دقيقة</span>
              <button
                onClick={() => setActiveTab('work')}
                className="font-bold text-stone-800 hover:text-stone-950 flex items-center gap-1"
              >
                <span>فتح Work Hub للتفاصيل الكاملة</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TIMELINE PREVIEW (الجزء الخامس: معاينة الخط الزمني) */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-500" />
                <h3 className="font-bold text-stone-900 text-sm">
                  معاينة الخط الزمني (Timeline Preview)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('plan')}
                className="text-xs font-bold text-stone-800 hover:text-black flex items-center gap-1"
              >
                <span>عرض الخط الزمني الكامل</span>
                <ArrowLeft className="w-3 h-3 text-stone-500" />
              </button>
            </div>

            <div className="space-y-2">
              {plan?.blocks.slice(0, 3).map(block => (
                <div
                  key={block.id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    block.completed
                      ? 'bg-stone-50 border-stone-200 text-stone-600'
                      : 'bg-white border-stone-200 text-stone-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] text-stone-500">
                      {block.startTime} - {block.endTime}
                    </span>
                    <span>{block.title}</span>
                  </div>
                  {block.completed && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      تم ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SIDEBAR / SECONDARY COLUMN (Col 4 on Desktop) */}
        <div className="lg:col-span-4 space-y-6">

          {/* NEXT PRAYER CARD (الجزء السابع: الصلاة القادمة) */}
          {nextPrayer && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-xs font-bold text-stone-900">مرساة الصلاة القادمة</span>
                </div>
                <span className="text-[11px] font-mono text-stone-500">Daily Anchor</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-lg font-black text-stone-900">{nextPrayer.name}</div>
                  <div className="text-xs text-stone-500 font-mono">{nextPrayer.time}</div>
                </div>

                <div className="text-left">
                  <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    خلال {prayerState?.nextPrayer.minutesRemaining || 38} دقيقة
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                <span className="text-[11px] text-stone-500">
                  صلوات اليوم: {completedPrayersCount} / 5
                </span>
                <button
                  onClick={() => togglePrayer(nextPrayer.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>تسجيل الأداء ✓</span>
                </button>
              </div>
            </div>
          )}

          {/* UPCOMING EVENTS (الجزء السادس: أقرب الأحداث) */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-stone-900">الأحداث القادمة (Events)</span>
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="text-[11px] font-bold text-purple-700 hover:underline"
              >
                كل الأحداث
              </button>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-purple-950">
                      <span>{event.title}</span>
                      <span className="font-mono text-[11px] text-purple-700">{event.startTime}</span>
                    </div>
                    <div className="text-[11px] text-stone-600 flex items-center justify-between">
                      <span>{event.date === new Date().toISOString().split('T')[0] ? 'اليوم' : 'غداً'}</span>
                      {event.location && <span className="text-stone-500">{event.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-stone-500 text-center py-3">
                لا توجد مواعيد عاجلة اليوم أو غداً.
              </div>
            )}

            <button
              onClick={openAddEventModal}
              className="w-full py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ إضافة حدث جديد</span>
            </button>
          </div>

          {/* QUICK STATS (الجزء الثالث: المؤشرات السريعة) */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900">مؤشرات اليوم (Quick Stats)</span>
              <span className="text-[10px] text-stone-500">أهم المؤشرات دون تشتيت</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              
              {/* Sleep */}
              <button
                onClick={() => setActiveTab('sleep')}
                className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-right transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>النوم</span>
                </div>
                <div className="font-bold font-mono text-stone-900">
                  {sleepLatest ? `${Math.floor(sleepLatest.durationMinutes / 60)}س ${sleepLatest.durationMinutes % 60}د` : '8س 33د'}
                </div>
                <div className="text-[10px] text-stone-500">
                  استيقاظ: {sleepLatest?.wakeTime || '12:18 م'}
                </div>
              </button>

              {/* Suhaila */}
              <button
                onClick={() => setActiveTab('personal')}
                className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-right transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-rose-600 text-[11px]">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>سهيلة</span>
                </div>
                <div className="font-bold font-mono text-stone-900">
                  {suhailaSummary.totalFormatted}
                </div>
                <div className="text-[10px] text-rose-700 font-medium">
                  صافي: {suhailaSummary.focusedFormatted}
                </div>
              </button>

              {/* Social Media */}
              <button
                onClick={() => setActiveTab('personal')}
                className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-right transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                  <Smartphone className="w-3.5 h-3.5 text-stone-600" />
                  <span>سوشيال</span>
                </div>
                <div className="font-bold font-mono text-stone-900">
                  {socialSummary.totalFormatted}
                </div>
                <div className="text-[10px] text-amber-700">
                  تلقائي: {socialSummary.automaticFormatted}
                </div>
              </button>

              {/* Recovery */}
              <button
                onClick={() => setActiveTab('personal')}
                className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-right transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-emerald-600 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>التعافي</span>
                </div>
                <div className="font-bold text-stone-900 text-xs">
                  {personalState?.todayRecovery?.status === 'clean' ? 'يوم نظيف ✓' : 'مسار هادئ'}
                </div>
                <div className="text-[10px] text-stone-500">
                  بدون عدادات ضاغطة
                </div>
              </button>

              {/* Prayer */}
              <button
                onClick={() => setActiveTab('events')}
                className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-right transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                  <span>🕌</span>
                  <span>الصلوات</span>
                </div>
                <div className="font-bold font-mono text-stone-900">
                  {completedPrayersCount} / 5
                </div>
                <div className="text-[10px] text-emerald-700">
                  {nextPrayer ? `القادمة: ${nextPrayer.name}` : 'مكتملة'}
                </div>
              </button>

              {/* Habits */}
              <button
                onClick={() => setActiveTab('personal')}
                className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-right transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-700" />
                  <span>العادات</span>
                </div>
                <div className="font-bold font-mono text-stone-900">
                  {completedHabitsCount} / {totalHabitsCount}
                </div>
                <div className="text-[10px] text-stone-500">
                  ملاحظة بدون ألعاب
                </div>
              </button>

            </div>
          </div>

          {/* WEEKLY SNAPSHOT (الجزء الثامن: ملخص الأسبوع المستقل) */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 shadow-xs border border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">ملخص الأسبوع (Weekly Snapshot)</span>
              </div>
              <span className="text-[10px] text-stone-400">مؤشرات مستقلة (بدون Score)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-0.5">
                <span className="text-[10px] text-stone-400">التصميمات المنجزة</span>
                <div className="font-bold font-mono text-white text-sm">
                  {weeklySnapshot.designsCompleted} / {weeklySnapshot.designsTarget}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-0.5">
                <span className="text-[10px] text-stone-400">ساعات العمل الكلية</span>
                <div className="font-bold font-mono text-white text-sm">
                  {dashboardService.formatDuration(weeklySnapshot.totalWorkMinutes)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-0.5">
                <span className="text-[10px] text-stone-400">متوسط ساعات النوم</span>
                <div className="font-bold font-mono text-white text-sm">
                  {weeklySnapshot.avgSleepHours} س (صحو {weeklySnapshot.avgWakeTime})
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-0.5">
                <span className="text-[10px] text-stone-400">نسبة أداء الصلوات</span>
                <div className="font-bold font-mono text-emerald-400 text-sm">
                  {weeklySnapshot.prayerCompletionRate}%
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-0.5">
                <span className="text-[10px] text-stone-400">وقت سهيلة المركز</span>
                <div className="font-bold font-mono text-rose-300 text-sm">
                  {dashboardService.formatDuration(weeklySnapshot.totalFocusedSuhailaMinutes)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-0.5">
                <span className="text-[10px] text-stone-400">الأيام النظيفة المستقرة</span>
                <div className="font-bold font-mono text-emerald-300 text-sm">
                  {weeklySnapshot.cleanDaysCount} من {weeklySnapshot.totalDaysRecorded} أيام
                </div>
              </div>
            </div>

            <div className="text-[10px] text-stone-400 text-center pt-1 border-t border-stone-800/80">
              «Understand my behavior, not gamify my life»
            </div>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 9. QUICK ACTIONS BAR (الجزء التاسع: الإجراءات السريعة)    */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-stone-900 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>إجراءات وتوثيق سريع (Quick Actions)</span>
          </span>
          <span className="text-[11px] text-stone-500">تسجيل مباشر بضغطة واحدة</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => setActiveTab('work')}
            className="p-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>جلسة الشغل</span>
          </button>

          <button
            onClick={openCheckinModal}
            className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4 text-stone-600" />
            <span>تسجيل نشاط</span>
          </button>

          <button
            onClick={openAddEventModal}
            className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>+ حدث جديد</span>
          </button>

          <button
            onClick={openSuhailaModal}
            className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>وقت سهيلة</span>
          </button>

          <button
            onClick={openRecoveryModal}
            className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>تسجيل التعافي</span>
          </button>
        </div>
      </div>

    </div>
  );
};
