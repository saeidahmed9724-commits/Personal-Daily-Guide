import React, { useState } from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { SlidersHorizontal, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface ScenarioItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  expectedOutput: string;
}

const SCENARIOS: ScenarioItem[] = [
  {
    id: 'ex1_prep_work',
    badge: 'مثال 1 · 1:45 م',
    title: 'الاستعداد لبدء الشغل',
    description: 'استيقاظ 12:30 م · هدف 4 تصميمات · العمل لم يبدأ بعد',
    expectedOutput: 'فاضل حوالي 15 دقيقة على بداية وقت الشغل. لو جاهز، ممكن تبدأ أول Design.',
  },
  {
    id: 'ex2_mid_work',
    badge: 'مثال 2 · 5:00 م',
    title: 'في منتصف هدف الشغل',
    description: 'بدأ العمل 2:15 م · منجز 2 من 4',
    expectedOutput: 'أنت في منتصف هدف الشغل تقريبًا. فاضلك تصميمين.',
  },
  {
    id: 'ex3_target_completed',
    badge: 'مثال 3 · 6:30 م',
    title: 'اكتمال هدف الشغل لليوم',
    description: 'المنجز 4 من 4 تصميمات',
    expectedOutput: 'هدف الشغل اكتمل. باقي اليوم مفتوح، وممكن تستخدم الوقت كما يناسبك.',
  },
  {
    id: 'ex4_bonus_credit',
    badge: 'مثال 4 · 7:45 م',
    title: 'إنجاز تصميمات إضافية (+Credit)',
    description: 'المنجز 8 من 4 تصميمات',
    expectedOutput: 'أنجزت 4 تصميمات إضافية اليوم. تم إضافة +4 Production Credit لرصيدك.',
  },
  {
    id: 'ex5_credit_covered',
    badge: 'مثال 5 · 2:00 م',
    title: 'الرصيد يغطي هدف اليوم',
    description: 'رصيد إنتاج +4 · المطلوب اليوم 0',
    expectedOutput: 'عندك رصيد إنتاج يغطي هدف اليوم. الشغل اليوم اختياري، إلا إذا عندك حاجة أخرى مرتبطة بالعمل.',
  },
  {
    id: 'ex6_tomorrow_institute',
    badge: 'مثال 6 · 2:30 ص',
    title: 'الاستعداد لحدث صباحي مبكر',
    description: 'الساعة 2:30 فجراً · غداً معهد 9:00 ص',
    expectedOutput: 'عندك معهد الساعة 9 صباحًا. خليك واخد الموعد ده في الاعتبار وأنت بتقرر تكمل يومك أو تبدأ تهدي.',
  },
  {
    id: 'ex7_late_wake',
    badge: 'مثال 7 · 4:15 م',
    title: 'استيقاظ متأخر وتكييف بدون لوم',
    description: 'استيقاظ فعلي 4:00 م (المعتاد 2:00 م)',
    expectedOutput: 'صحيت الساعة 4:00 م براحة — لا داعي للقلق، رتبنا بداية الشغل بهدوء الساعة 5:00 م. اليوم لم يضع!',
  },
];

export const DecisionEngineScenariosBar: React.FC = () => {
  const { applyScenarioPreset } = useDailyGuide();
  const [isOpen, setIsOpen] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const handleSelect = async (scenario: ScenarioItem) => {
    setActiveScenarioId(scenario.id);
    await applyScenarioPreset(scenario.id);
  };

  return (
    <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs text-stone-700 hover:text-stone-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-stone-900">
            مختبر سيناريوهات المحرك (7 أمثلة مطابقة للمتطلبات)
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
            Rule-Based & Deterministic
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
          <span>{isOpen ? 'إخفاء الأمثلة' : 'عرض الأمثلة وتجربتها'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-stone-200/60 space-y-2.5">
          <p className="text-[11px] text-stone-600 leading-relaxed">
            اضغط على أي سيناريو لاختبار المحرك فورياً. تلاحظ أن المحرك حتمي تماماً (Deterministic)، 
            لا يستخدم أي افتراضات غير مسجلة، ولا يلوم أبداً عند تغير الواقع:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SCENARIOS.map((sc) => {
              const isSelected = activeScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelect(sc)}
                  className={`text-right p-3 rounded-xl border text-xs transition relative flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white hover:bg-stone-100/70 border-stone-200/80 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-800">
                      {sc.badge}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>مطبق الآن</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-stone-900 text-xs mt-0.5">
                      {sc.title}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {sc.description}
                    </div>
                  </div>

                  <div className="text-[10px] text-stone-600 bg-stone-50 p-1.5 rounded border border-stone-200/50 mt-1 italic">
                    <span className="font-semibold text-stone-700">التوجيه المتوقع: </span>
                    "{sc.expectedOutput}"
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
