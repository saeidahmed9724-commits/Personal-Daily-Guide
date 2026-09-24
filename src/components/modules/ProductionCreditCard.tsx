import React, { useState } from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { 
  Coins, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Layers, 
  CheckCircle2, 
  SunMedium,
  Coffee,
  Briefcase,
  Send,
  Heart,
  Moon,
  ChevronDown,
  ChevronUp,
  History,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { DayPhaseId } from '../../types/guide';

export const ProductionCreditCard: React.FC = () => {
  const { plan, live, updateDesignsCompleted, useCredit, setActiveTab, creditTransactions } = useDailyGuide();
  const [showLedgerHistory, setShowLedgerHistory] = useState(false);

  if (!plan || !live) return null;

  const cred = plan.productionCredit;
  const currentPhaseId = live.currentPhase.id;
  const transactions = creditTransactions && creditTransactions.length > 0 
    ? creditTransactions 
    : (cred.transactions || []);

  const phasesList: { id: DayPhaseId; label: string; icon: React.FC<{ className?: string }>; time: string }[] = [
    { id: 'waking_up', label: 'بداية هادئة', icon: Coffee, time: '12:00 - 1:30' },
    { id: 'work_prep', label: 'استعداد للشغل', icon: SunMedium, time: '1:30 - 2:00' },
    { id: 'work_session', label: 'جلسة التصميم', icon: Briefcase, time: '2:00 - 6:00' },
    { id: 'work_delivery', label: 'المراجعة والتسليم', icon: Send, time: 'قبل 9:30' },
    { id: 'personal_social', label: 'وقت شخصي وسهرة', icon: Heart, time: '21:30+' },
    { id: 'wind_down', label: 'نوم مريح', icon: Moon, time: '01:00+' },
  ];

  const handleIncrement = () => {
    updateDesignsCompleted(cred.todayCompletedDesigns + 1);
  };

  const handleDecrement = () => {
    if (cred.todayCompletedDesigns > 0) {
      updateDesignsCompleted(cred.todayCompletedDesigns - 1);
    }
  };

  const handleUseCreditQuick = () => {
    if (cred.totalCreditBalance >= 2) {
      useCredit(2);
    }
  };

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* 1. Header: Production Credit Title & Balance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
            <Coins className="w-5 h-5 text-emerald-600" />
            <h3>نظام رصيد الإنتاج (Production Credit)</h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            العمل الزائد لا يضيع، بل يتحول لرصيد أمان يحررك في أيام التعب أو المشاوير.
          </p>
        </div>

        {/* Bank Total Balance Badge */}
        <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 px-3.5 py-2 rounded-xl shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="text-[10px] text-emerald-800 font-medium">إجمالي الرصيد المحفوظ</div>
            <div className="text-base font-extrabold text-emerald-950 font-mono">
              +{cred.totalCreditBalance} تصميمات
            </div>
          </div>
        </div>
      </div>

      {/* 2. Today's Design Target & Interactive Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Box A: Daily Target */}
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 text-center">
          <span className="text-[11px] text-stone-500 block mb-1">
            {cred.isOfficialWorkDay ? 'المطلوب الأساسي لليوم' : 'عطلة أسبوعية'}
          </span>
          <div className="text-2xl font-black text-stone-800 font-mono">
            {cred.dailyBaseTarget > 0 ? `${cred.dailyBaseTarget} تصميمات` : 'اختياري (Off)'}
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">
            {cred.isOfficialWorkDay ? 'الأحد إلى الخميس' : 'الجمعة أو السبت'}
          </span>
        </div>

        {/* Box B: Completed Today with Quick Buttons */}
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 text-center space-y-2">
          <span className="text-[11px] text-stone-500 block">المنجز فعلياً اليوم</span>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleDecrement}
              disabled={cred.todayCompletedDesigns <= 0}
              className="w-8 h-8 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              title="تقليل تصميم"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="text-2xl font-black text-stone-900 font-mono w-10 text-center">
              {cred.todayCompletedDesigns}
            </div>
            <button
              onClick={handleIncrement}
              className="w-8 h-8 rounded-lg bg-stone-900 text-white hover:bg-stone-800 flex items-center justify-center"
              title="إضافة تصميم منجز"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium block">
            {cred.todayCompletedDesigns > cred.dailyBaseTarget && cred.dailyBaseTarget > 0
              ? `+${cred.todayCompletedDesigns - cred.dailyBaseTarget} إضافي يُضاف للرصيد!`
              : cred.todayRemainingRequired === 0
              ? 'تم إنجاز المطلوب بالكامل'
              : `متبقي ${cred.todayRemainingRequired} تصميمات`}
          </span>
        </div>

        {/* Box C: Delivery Target Buffer */}
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 text-center">
          <span className="text-[11px] text-stone-500 block mb-1">ديدلاين التسليم اليومي</span>
          <div className="text-2xl font-black text-stone-800 font-mono">
            {plan.deliveryDeadlineTarget || '21:30'}
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">
            التسليم قبل 9-10 مساءً لسهرة مريحة
          </span>
        </div>
      </div>

      {/* 3. Status Summary & Credit Usage Action */}
      <div className="p-3.5 bg-emerald-50/40 border border-emerald-200/60 rounded-xl text-xs space-y-2">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-emerald-950 leading-relaxed font-medium">
            {cred.statusSummary}
          </p>
        </div>

        {cred.totalCreditBalance >= 2 && cred.todayRemainingRequired > 0 && (
          <div className="flex items-center justify-between pt-1 border-t border-emerald-200/40">
            <span className="text-[11px] text-emerald-800">
              تريد تخفيف يومك اليوم دون أي إحساس بالتقصير؟
            </span>
            <button
              onClick={handleUseCreditQuick}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors shadow-xs"
            >
              استخدام 2 من الرصيد
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-emerald-200/40 flex items-center justify-between">
          <span className="text-[11px] text-emerald-900 font-medium">
            جلسة الشغل وروابط Trello & Drive:
          </span>
          <button
            onClick={() => setActiveTab('work')}
            className="text-xs font-bold text-stone-900 hover:text-emerald-800 flex items-center gap-1 bg-white border border-stone-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-stone-50 transition-colors"
          >
            <span>فتح Work Hub وتتبع المؤقت</span>
            <span className="text-emerald-600">←</span>
          </button>
        </div>
      </div>

      {/* 3.5. Immutable Ledger Audit Drawer (شفافية المعاملات) */}
      <div className="border border-stone-200/80 rounded-xl overflow-hidden bg-stone-50/50">
        <button
          onClick={() => setShowLedgerHistory(!showLedgerHistory)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-stone-800 hover:bg-stone-100/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" />
            <span>سجل المعاملات والشفافية (Audit Ledger)</span>
            <span className="bg-emerald-100/80 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
              {transactions.length} معاملات
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-stone-500 font-normal">
            <span>{showLedgerHistory ? 'إخفاء التفاصيل' : 'عرض سبب الرصيد'}</span>
            {showLedgerHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showLedgerHistory && (
          <div className="p-4 border-t border-stone-200/60 bg-white space-y-3">
            <div className="text-[11px] text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-100">
              💡 <strong>كيف يُحسب الرصيد؟</strong> لا يتم تخزين الرصيد كرقم عشوائي، بل يُحسب دائمًا بدقة كمجموع تراكمي لمعاملات الإنجاز الإضافي واستخدامات التخفيف في السجل المحاسبي.
            </div>

            <div className="space-y-2">
              {transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-xl border border-stone-100 bg-stone-50/70 text-xs"
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
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <span>{tx.note}</span>
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                          يوم المصدر: {tx.sourceDay || tx.date.split('T')[0]} • {tx.type === 'earned_extra' ? 'إنجاز فوق الهدف' : tx.type === 'weekend_bonus' ? 'عطلة اختيارية' : 'استخدام رصيد'}
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
          </div>
        )}
      </div>

      {/* 4. Day Phases Journey (Real-life flexible flow) */}
      <div className="space-y-3 pt-1 border-t border-stone-100">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-semibold text-stone-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            مراحل اليوم الحقيقي (روتين مرن، وليس جدولاً صارماً)
          </span>
          <span className="text-[11px] text-stone-400">
            المرحلة الحالية: <strong className="text-stone-800">{live.currentPhase.label}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {phasesList.map((phase) => {
            const isCurrent = currentPhaseId === phase.id;
            const Icon = phase.icon;
            return (
              <div
                key={phase.id}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200/70 bg-stone-50 text-stone-600 hover:bg-white'
                }`}
              >
                <div className="flex justify-center mb-1">
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-emerald-400' : 'text-stone-500'}`} />
                </div>
                <div className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-stone-800'}`}>
                  {phase.label}
                </div>
                <div className={`text-[10px] mt-0.5 font-mono ${isCurrent ? 'text-stone-300' : 'text-stone-400'}`}>
                  {phase.time}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100 leading-relaxed">
          <strong className="text-stone-800">ملاحظة المرشد:</strong> الاستيقاظ بعد 12 ظهرًا أو زيارة المعهد مع سهيلة/الصحاب ليست خروجاً عن المسار؛ النظام يعيد ضبط مواعيد العمل والراحة بناءً على ما تبقى من اليوم ورصيد إنتاجك.
        </div>
      </div>
    </div>
  );
};
