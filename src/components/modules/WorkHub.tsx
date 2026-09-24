import React, { useState } from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { 
  Briefcase, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Layers, 
  StopCircle,
  FileText,
  FolderOpen,
  Trello,
  Check,
  RotateCcw,
  Zap,
  Info,
  History,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { WorkDesignItem } from '../../types/guide';

function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  }
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function formatMinutesOnly(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m} دقيقة`;
}

export const WorkHub: React.FC = () => {
  const { 
    plan, 
    live, 
    startWorkday, 
    endWorkday, 
    updateWorkdayLinks,
    toggleDesignTimer, 
    finishDesign, 
    addDesign, 
    updateDesign,
    useCredit,
    creditTransactions,
    creditSummary
  } = useDailyGuide();

  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [trelloUrlInput, setTrelloUrlInput] = useState('');
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [expandedDesignId, setExpandedDesignId] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showLedger, setShowLedger] = useState(false);

  if (!plan || !plan.workdaySession) return null;

  const session = plan.workdaySession;
  const cred = plan.productionCredit;

  // Progress calculations
  const totalDesigns = session.designs.length;
  const completedCount = session.designs.filter(d => d.status === 'done').length;
  const inProgressDesign = session.designs.find(d => d.status === 'in_progress');
  const targetCount = cred.dailyBaseTarget;
  const remainingRequired = cred.todayRemainingRequired;
  const progressPercent = targetCount > 0 ? Math.min(100, Math.round((completedCount / targetCount) * 100)) : 100;

  const handleStartEditingLinks = () => {
    setTrelloUrlInput(session.trelloBoardUrl);
    setDriveUrlInput(session.googleDriveFolderUrl);
    setIsEditingLinks(true);
  };

  const handleSaveLinks = async () => {
    await updateWorkdayLinks(trelloUrlInput, driveUrlInput);
    setIsEditingLinks(false);
  };

  const handleStartWorkdayClick = async () => {
    await startWorkday();
  };

  const handleEndWorkdayClick = async () => {
    await endWorkday();
    setShowSummaryModal(true);
  };

  const handleUseCreditForToday = async () => {
    if (cred.totalCreditBalance >= 4) {
      await useCredit(4);
    } else if (cred.totalCreditBalance > 0) {
      await useCredit(cred.totalCreditBalance);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Quick Links */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
                <Briefcase className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  Work Hub (مركز الشغل والإنتاج)
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  منصتك لبدء ومتابعة يوم العمل، إدارة التصميمات الأربعة، وربط أدواتك الخارجية.
                </p>
              </div>
            </div>
          </div>

          {/* External Hub Links (Trello & Google Drive) */}
          <div className="flex items-center flex-wrap gap-2">
            <a
              href={session.trelloBoardUrl || 'https://trello.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200/70 transition-colors shadow-2xs"
            >
              <Trello className="w-3.5 h-3.5 text-sky-600" />
              <span>لوحة Trello</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href={session.googleDriveFolderUrl || 'https://drive.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200/70 transition-colors shadow-2xs"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>مجلد Google Drive</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <button
              onClick={handleStartEditingLinks}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              title="تعديل روابط تريلو ودرايف"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal / Inline Link Editor */}
        {isEditingLinks && (
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-stone-800">تعديل الروابط السريعة للعمل:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">رابط لوحة Trello:</label>
                <input
                  type="url"
                  value={trelloUrlInput}
                  onChange={(e) => setTrelloUrlInput(e.target.value)}
                  placeholder="https://trello.com/b/..."
                  className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">رابط مجلد Google Drive:</label>
                <input
                  type="url"
                  value={driveUrlInput}
                  onChange={(e) => setDriveUrlInput(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-800 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsEditingLinks(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveLinks}
                className="px-3 py-1.5 text-xs bg-stone-900 text-white font-semibold rounded-lg hover:bg-stone-800"
              >
                حفظ الروابط
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Ergonomic Metrics Grid (Anti-Clutter) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Metric 1: Today's Target */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-stone-500 block mb-1 font-medium">هدف اليوم (Target)</span>
          <div className="text-xl sm:text-2xl font-black text-stone-900 font-mono">
            {targetCount > 0 ? `${targetCount} تصميمات` : 'عطلة (0)'}
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">
            {cred.isOfficialWorkDay ? 'الأحد إلى الخميس' : 'عطلة أسبوعية'}
          </span>
        </div>

        {/* Metric 2: Completed Designs */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-stone-500 block mb-1 font-medium">المنجز (Completed)</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
            {completedCount} / {targetCount}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">
            {completedCount >= targetCount && targetCount > 0
              ? 'تم إنجاز الهدف كاملاً'
              : `متبقي ${remainingRequired} تصميمات`}
          </span>
        </div>

        {/* Metric 3: Production Credit */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-500 font-medium">رصيد الأمان (Credit)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 font-mono mt-1">
            +{cred.totalCreditBalance}
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">
            تصميمات إضافية محفوظة
          </span>
        </div>

        {/* Metric 4: Total Work Time */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-stone-500 block mb-1 font-medium">وقت الشغل (Work Time)</span>
          <div className="text-xl sm:text-2xl font-black text-stone-900 font-mono">
            {formatMinutesOnly(session.totalWorkSeconds)}
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block font-mono">
            {session.isWorkTimerRunning ? 'المؤقت نشط الآن' : 'صافي الجلسة'}
          </span>
        </div>

        {/* Metric 5: Current Design Focus */}
        <div className="col-span-2 sm:col-span-1 bg-stone-900 text-white rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block mb-0.5">التركيز الحالي</span>
            <div className="text-sm font-bold truncate">
              {inProgressDesign ? inProgressDesign.title : 'لا يوجد مؤقت شغال'}
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 font-mono flex items-center gap-1.5">
            {inProgressDesign ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{formatSeconds(inProgressDesign.durationSeconds)}</span>
              </>
            ) : (
              <span>جاهز لبدء أي تصميم</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Workday Session Control Banner (Start / End Workday) */}
      <div className={`rounded-2xl p-5 sm:p-6 border transition-all ${
        session.isActive 
          ? 'bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 text-white border-emerald-900/60 shadow-md'
          : 'bg-stone-50 border-stone-200/90 text-stone-900'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {session.isActive ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  يوم العمل نشط الآن
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-stone-500 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  يوم العمل غير مبدوء
                </span>
              )}

              {session.workStartTime && (
                <span className="text-xs text-stone-400 font-mono">
                  بداية العمل: {session.workStartTime}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold">
              {session.isActive
                ? 'جلسة التركيز اليومية قيد التشغيل'
                : 'جاهز لبدء يوم عملك؟'}
            </h3>

            <p className={`text-xs max-w-xl leading-relaxed ${session.isActive ? 'text-stone-300' : 'text-stone-500'}`}>
              {session.isActive
                ? 'استخدم الروابط السريعة لفتح ملفاتك، وشغّل المؤقت مع كل تصميم تفتحه. عند الانتهاء اضغط إنهاء يوم العمل لتسجيل ملخصك وحفظ رصيدك.'
                : 'الضغط على بدء يوم العمل يسجل وقت بدايتك ويهيئ روابط Trello وDrive لتنطلق بهدوء دون تشتيت.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-3 shrink-0">
            {!session.isActive ? (
              <button
                onClick={handleStartWorkdayClick}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white hover:bg-stone-800 font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Start Workday (بدء يوم العمل)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-stone-800/80 px-3.5 py-2 rounded-xl border border-stone-700 text-right">
                  <span className="text-[10px] text-stone-400 block">وقت العمل المسجل</span>
                  <span className="text-base font-extrabold font-mono text-emerald-400">
                    {formatSeconds(session.totalWorkSeconds)}
                  </span>
                </div>

                <button
                  onClick={handleEndWorkdayClick}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>End Workday (إنهاء يوم العمل)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar inside Workday Banner */}
        <div className="mt-5 pt-4 border-t border-stone-800/50 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className={session.isActive ? 'text-stone-300' : 'text-stone-600'}>
              نسبة إنجاز اليوم: <strong>{progressPercent}%</strong>
            </span>
            <span className={session.isActive ? 'text-stone-400' : 'text-stone-500'}>
              {completedCount} من {targetCount} تصميمات منجزة
            </span>
          </div>
          <div className="h-2 w-full bg-stone-800/40 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                completedCount >= targetCount ? 'bg-emerald-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 4. Production Credit Safety Net (Starting day with credit) */}
      {cred.totalCreditBalance > 0 && remainingRequired > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                لديك رصيد محفوظ (+{cred.totalCreditBalance} تصميمات) يمكنك استخدامه اليوم
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                هل تشعر بإرهاق أو لديك مشوار؟ يمكنك استخدام رصيدك لتقليل المطلوب لليوم إلى 0، أو إنجاز ما تحب اختيارياً دون أي ضغط أو شعور بالتقصير.
              </p>
            </div>
          </div>
          <button
            onClick={handleUseCreditForToday}
            className="px-3.5 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs transition-colors shrink-0"
          >
            تطبيق الرصيد وتخفيف اليوم
          </button>
        </div>
      )}

      {/* 4.5. Production Credit Immutable Ledger Card */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                سجل معاملات رصيد الإنتاج (Transaction Ledger)
              </h3>
              <p className="text-[11px] text-stone-500">
                الرصيد ناتج من معاملات محاسبية موثقة؛ لا يتم تعديله عشوائياً.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono font-bold px-3 py-1 rounded-xl">
              الرصيد الصافي: +{cred.totalCreditBalance}
            </span>
            <button
              onClick={() => setShowLedger(!showLedger)}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-xl transition"
            >
              {showLedger ? 'إخفاء المعاملات' : 'عرض المعاملات'}
            </button>
          </div>
        </div>

        {/* Ledger Summary Stats */}
        {creditSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-[10px] text-stone-400 block">إجمالي المكتسب</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">+{creditSummary.totalEarnedAllTime}</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-[10px] text-stone-400 block">إجمالي المستهلك</span>
              <span className="font-mono font-bold text-rose-700 text-sm">-{creditSummary.totalSpentAllTime}</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-[10px] text-stone-400 block">الرصيد الصافي</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">+{creditSummary.currentBalance}</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-[10px] text-stone-400 block">عدد المعاملات</span>
              <span className="font-mono font-bold text-stone-700 text-sm">{creditSummary.transactionsCount}</span>
            </div>
          </div>
        )}

        {/* Detailed Transactions List */}
        {showLedger && (
          <div className="space-y-2 pt-2 border-t border-stone-100">
            {(creditTransactions.length > 0 ? creditTransactions : (cred.transactions || [])).map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/60 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="font-bold text-stone-900">{tx.note}</div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                        التاريخ: {tx.date.split('T')[0]} {tx.sourceDay ? `• اليوم المصدر: ${tx.sourceDay}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className={`font-mono font-bold text-sm shrink-0 ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isPositive ? `+${tx.amount}` : tx.amount}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Last Workday Summary (if ended or available) */}
      {session.lastSummary && (
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>آخر ملخص يوم عمل مسجل ({session.lastSummary.completedAtTime})</span>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">
              {session.lastSummary.totalWorkFormatted}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-center">
            <div className="p-2.5 bg-stone-50 rounded-xl">
              <span className="text-[10px] text-stone-400 block">التصميمات المنجزة</span>
              <span className="text-base font-bold text-stone-800 font-mono">
                {session.lastSummary.completedCount} / {session.lastSummary.targetCount}
              </span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl">
              <span className="text-[10px] text-stone-400 block">وقت العمل الفعلي</span>
              <span className="text-base font-bold text-stone-800 font-mono">
                {session.lastSummary.totalWorkFormatted}
              </span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl">
              <span className="text-[10px] text-stone-400 block">تحقيق الهدف</span>
              <span className={`text-base font-bold font-mono ${session.lastSummary.wasTargetMet ? 'text-emerald-700' : 'text-amber-700'}`}>
                {session.lastSummary.wasTargetMet ? 'تم بنجاح ✓' : 'معذور بالرصيد'}
              </span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl">
              <span className="text-[10px] text-stone-400 block">رصيد مضاف (+Credit)</span>
              <span className="text-base font-bold text-emerald-800 font-mono">
                +{session.lastSummary.creditEarned}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Designs Interactive List (Target Designs + Extra Credit) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              قائمة تصميمات اليوم ({session.designs.length})
            </h2>
            <p className="text-xs text-stone-500">
              مؤقت مستقل لكل تصميم (Start → Pause → Resume → Finish).
            </p>
          </div>

          <button
            onClick={() => addDesign()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة تصميم إضافي (+Credit)</span>
          </button>
        </div>

        <div className="space-y-3">
          {session.designs.map((design, index) => {
            const isRunning = design.isTimerRunning;
            const isDone = design.status === 'done';
            const isInProgress = design.status === 'in_progress';
            const isExpanded = expandedDesignId === design.id;

            return (
              <div
                key={design.id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-xs ${
                  isRunning
                    ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-sm'
                    : isDone
                    ? 'border-stone-200/70 bg-stone-50/40'
                    : 'border-stone-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Design Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-stone-400">
                        #{String(design.orderNumber).padStart(2, '0')}
                      </span>

                      {/* Status Badges */}
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Done (تم الإنجاز)</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>In Progress (قيد التنفيذ)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md text-[11px] font-medium">
                          <span>Not Started</span>
                        </span>
                      )}

                      {design.isExtra && (
                        <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          +Extra Credit
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-bold ${isDone ? 'text-stone-700' : 'text-stone-900'}`}>
                      {design.title}
                    </h3>

                    {/* Time range note */}
                    <div className="flex items-center gap-3 text-xs text-stone-400 font-mono">
                      {design.startTime && (
                        <span>البدء: {design.startTime}</span>
                      )}
                      {design.endTime && (
                        <span>الانتهاء: {design.endTime}</span>
                      )}
                      {design.notes && (
                        <span className="text-stone-500 truncate max-w-xs font-sans">
                          • {design.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Real Timer Controls */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Live Duration Display */}
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block font-medium">
                        الوقت المستغرق
                      </span>
                      <span className={`text-lg font-mono font-bold ${
                        isRunning ? 'text-emerald-700' : 'text-stone-800'
                      }`}>
                        {formatSeconds(design.durationSeconds)}
                      </span>
                    </div>

                    {/* Timer Buttons */}
                    <div className="flex items-center gap-1.5">
                      {!isDone ? (
                        <>
                          <button
                            onClick={() => toggleDesignTimer(design.id)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                              isRunning
                                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                : 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800'
                            }`}
                            title={isRunning ? 'إيقاف مؤقت' : 'بدء / استئناف المؤقت'}
                          >
                            {isRunning ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-amber-700" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>{design.durationSeconds > 0 ? 'Resume' : 'Start'}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => finishDesign(design.id)}
                            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                            title="إنهاء التصميم وحفظ النتيجة"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Finish</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => updateDesign(design.id, { status: 'in_progress' })}
                          className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-medium flex items-center gap-1"
                          title="إعادة فتح التصميم للتعديل"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>إعادة فتح</span>
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedDesignId(isExpanded ? null : design.id)}
                        className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                        title="تفاصيل إضافية والروابط"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Details & Links per Design */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-stone-500 block mb-1">
                        تعديل عنوان التصميم:
                      </label>
                      <input
                        type="text"
                        value={design.title}
                        onChange={(e) => updateDesign(design.id, { title: e.target.value })}
                        className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-stone-500 block mb-1">
                        ملاحظات أو نوع العمل:
                      </label>
                      <input
                        type="text"
                        value={design.notes || ''}
                        onChange={(e) => updateDesign(design.id, { notes: e.target.value })}
                        placeholder="مثل: تصدير ألوان CMYK للطباعة"
                        className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-stone-500 block mb-1">
                        رابط كارت Trello للتصميم:
                      </label>
                      <input
                        type="url"
                        value={design.trelloCardUrl || ''}
                        onChange={(e) => updateDesign(design.id, { trelloCardUrl: e.target.value })}
                        placeholder="https://trello.com/c/..."
                        className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-stone-500 block mb-1">
                        رابط ملف التصميم في Drive:
                      </label>
                      <input
                        type="url"
                        value={design.driveFileUrl || ''}
                        onChange={(e) => updateDesign(design.id, { driveFileUrl: e.target.value })}
                        placeholder="https://drive.google.com/file/..."
                        className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-800 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Modal when clicking End Workday */}
      {showSummaryModal && session.lastSummary && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-700 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 block mb-1">
                تم إنهاء يوم العمل بنجاح
              </span>
              <h3 className="text-2xl font-black text-stone-900">
                عاش! مبروك إنجاز اليوم
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                سجلت تفاصيل يومك بنجاح، والآن وقت الاستمتاع بالراحة وسهرتك دون أي التزام.
              </p>
            </div>

            {/* Quick Summary Pill Details */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs space-y-2 text-right">
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500">التصميمات المنجزة:</span>
                <strong className="font-mono text-stone-900">
                  {session.lastSummary.completedCount} / {session.lastSummary.targetCount}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500">وقت العمل الفعلي:</span>
                <strong className="font-mono text-stone-900">{session.lastSummary.totalWorkFormatted}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500">حالة الهدف اليومي:</span>
                <strong className="text-emerald-700 font-bold">
                  {session.lastSummary.wasTargetMet ? 'تم إنجاز الهدف كاملاً ✓' : 'معذور بالرصيد المحفوظ'}
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">رصيد إضافي مكتسب (+Credit):</span>
                <strong className="text-emerald-800 font-bold font-mono">+{session.lastSummary.creditEarned}</strong>
              </div>
            </div>

            <button
              onClick={() => setShowSummaryModal(false)}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
            >
              إغلاق والاستمتاع بوقتي الحر
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
