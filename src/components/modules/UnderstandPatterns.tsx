import React from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { Brain, Lightbulb, Compass, ShieldCheck } from 'lucide-react';

export const UnderstandPatterns: React.FC = () => {
  const { patterns } = useDailyGuide();

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
      {/* 1. Header */}
      <div className="border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-stone-900" />
          <h3 className="font-bold text-stone-900 text-lg">فهم الأنماط الشخصية</h3>
        </div>
        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
          هذه الرؤى تتولد تدريجياً من مقارنة خططك بما حدث فعلياً، لتتعرف على إيقاعك البيولوجي دون افتراضات مثالية غير واقعية.
        </p>
      </div>

      {/* 2. Patterns Grid */}
      <div className="space-y-4">
        {patterns.map((pattern) => {
          return (
            <div
              key={pattern.id}
              className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h4 className="text-sm font-bold text-stone-900">
                    {pattern.title}
                  </h4>
                </div>

                <span className="text-[11px] text-stone-500 font-medium">
                  {pattern.confidence === 'strong' ? 'نمط متكرر ومؤكد' : 'نمط ناشئ في طور الملاحظة'}
                </span>
              </div>

              {/* Observation */}
              <p className="text-xs text-stone-700 leading-relaxed">
                <span className="font-semibold text-stone-900">الملاحظة: </span>
                {pattern.observation}
              </p>

              {/* Practical Tip */}
              <div className="bg-white p-3 rounded-lg border border-stone-200/80 flex items-start gap-2 text-xs text-stone-800">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-stone-900">النصيحة العملية: </span>
                  {pattern.practicalTip}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Principles Box */}
      <div className="p-4 rounded-xl bg-stone-900 text-stone-200 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>مبدأ النظام: المرونة المعرفية</span>
        </div>
        <p className="text-stone-300 leading-relaxed text-[12px]">
          النظام لا يحكم عليك إذا لم تكمل كل شيء. هو يتعلم أن يضع لك في الأيام القادمة خططاً قابلة للتنفس، تحترم طاقتك وتمنحك الإنجاز دون استنزاف.
        </p>
      </div>
    </div>
  );
};
