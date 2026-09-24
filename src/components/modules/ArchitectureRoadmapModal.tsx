import React from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { Layers, X, Database, Smartphone, Monitor, Cpu, ArrowRight, ShieldCheck, Compass } from 'lucide-react';

export const ArchitectureRoadmapModal: React.FC = () => {
  const { isArchitectureModalOpen, closeArchitectureModal } = useDailyGuide();

  if (!isArchitectureModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-stone-200 space-y-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 text-emerald-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-lg">معمارية النظام وخريطة التصدير المستقل</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Personal Daily Guide Architecture & Future Backend Decoupling
              </p>
            </div>
          </div>
          <button
            onClick={closeArchitectureModal}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Core Philosophy Mapping */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>حلقة القيمة الأساسية (The 5-Pillar Cycle)</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-[11px] pt-1 font-medium">
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="block font-bold text-stone-900">Plan</span>
              <span className="text-[10px] text-stone-500">نوايا وبلوكات مرنة</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="block font-bold text-emerald-800">Live</span>
              <span className="text-[10px] text-stone-500">محرك الخطوة الحالية</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="block font-bold text-stone-900">Record</span>
              <span className="text-[10px] text-stone-500">سجل الواقع بلا لوم</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="block font-bold text-stone-900">Understand</span>
              <span className="text-[10px] text-stone-500">استخراج الأنماط</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="block font-bold text-stone-900">Adapt</span>
              <span className="text-[10px] text-stone-500">تكييف الخطة مع الواقع</span>
            </div>
          </div>
        </div>

        {/* 2. Layered Architecture Breakdown */}
        <div className="space-y-3">
          <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-stone-700" />
            <span>طبقات الكود وكيف تم عزل المنطق عن الواجهة:</span>
          </h4>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg border border-stone-200 bg-white">
              <div className="font-semibold text-stone-900 flex items-center justify-between">
                <span>1. Domain Models & Types (`src/types/guide.ts`)</span>
                <span className="text-[10px] text-emerald-700 font-mono">Storage Agnostic</span>
              </div>
              <p className="text-stone-600 mt-1 text-[11px] leading-relaxed">
                عقود بيانات نقية لـ (TimeBlock, ActualRecord, DayPlan, DayPattern, LiveContext, NextStepGuidance). هذه الأنواع متوافقة 100% مع جداول PostgreSQL / Drizzle أو مستندات MongoDB / Firestore.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-stone-200 bg-white">
              <div className="font-semibold text-stone-900 flex items-center justify-between">
                <span>2. Repository Pattern (`src/services/storage/guideRepository.ts`)</span>
                <span className="text-[10px] text-emerald-700 font-mono">Swappable Engine</span>
              </div>
              <p className="text-stone-600 mt-1 text-[11px] leading-relaxed">
                واجهة مجردة (Interface). المكونات لا تعرف كيف يتم التخزين! حالياً تعمل عبر `MockGuideRepository`، وعند النقل خارج البيئة يكفي استبدال التنفيذ بـ `RestGuideRepository` أو `SupabaseGuideRepository` دون المساس بأي سطر في الـ UI.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-stone-200 bg-white">
              <div className="font-semibold text-stone-900 flex items-center justify-between">
                <span>3. Guide Logic Engine (`src/services/guideEngine.ts`)</span>
                <span className="text-[10px] text-emerald-700 font-mono">Pure Business Logic</span>
              </div>
              <p className="text-stone-600 mt-1 text-[11px] leading-relaxed">
                الدماغ الذي يحدد "أين أنا الآن وما الخطوة المناسبة التالية" بناءً على الوقت ومستوى الطاقة والانحراف عن الخطة. لا يحتوي على أي كود React، ويمكن نقله إلى خادم Node.js / Python كـ Backend Service مباشرة.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-stone-200 bg-white">
              <div className="font-semibold text-stone-900 flex items-center justify-between">
                <span>4. State Decoupling (`src/context/GuideContext.tsx`)</span>
                <span className="text-[10px] text-emerald-700 font-mono">Hook-Based Bridge</span>
              </div>
              <p className="text-stone-600 mt-1 text-[11px] leading-relaxed">
                يوفر هوك `useDailyGuide()` الذي يربط الواجهات بالمنطق، مما يجعل الواجهات نظيفة وخالية من أي تشابك.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Desktop vs Mobile UX Strategy */}
        <div className="space-y-3">
          <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Monitor className="w-4 h-4 text-stone-700" />
            <span>فصل تجربة المستخدم (Desktop vs Mobile):</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-stone-600" />
                <span>تجربة الـ Desktop</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                مساحة عمل هادئة مقسمة إلى 3 أعمدة متوازنة (مسار الخطة على اليمين · بوصلة "الآن" في المنتصف · سجل الواقع والأنماط على اليسار)، لتوفير رؤية شاملة أثناء العمل المكتبي.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-stone-600" />
                <span>تجربة الـ Mobile (Touch-First)</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                تصميم مخصص لمنطقة الإبهام (Thumb-Zone) مع شريط تنقل سفلي ثابت (الآن / الخطة / السجل / الأنماط)، وبطاقة تركيز عريضة بدون تشتيت، وأدراج سحب للتسجيل السريع بأقل من 5 ثوانٍ.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Independent Export Checklist */}
        <div className="bg-stone-900 text-stone-200 p-4 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>جاهزية التصدير والتشغيل خارج المنصة (Zero Lock-in)</span>
          </div>
          <p className="text-stone-300 text-[11px] leading-relaxed">
            - لا يوجد أي اعتماد على مكتبات خاصة بـ Google AI Studio داخل التطبيق.<br />
            - لا توجد أي أسرار أو API keys في الكود.<br />
            - تم إعداد التنسيق والـ Types لتعمل فوراً في أي مشروع Vite + React أو Next.js خارج البيئة.<br />
            - في المرحلة القادمة سنقرر معاً آلية ربط قاعدة البيانات والتوثيق (Auth & Database).
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={closeArchitectureModal}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 text-xs font-semibold"
          >
            إغلاق ومتابعة الاستكشاف
          </button>
        </div>
      </div>
    </div>
  );
};
