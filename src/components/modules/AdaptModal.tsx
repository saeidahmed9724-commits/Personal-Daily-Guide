import React from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { SlidersHorizontal, X, ArrowLeft, Check, Sparkles } from 'lucide-react';

export const AdaptModal: React.FC = () => {
  const { 
    isAdaptModalOpen, 
    closeAdaptModal, 
    adaptationOptions, 
    applyAdaptation 
  } = useDailyGuide();

  if (!isAdaptModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-xl border border-stone-200 space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
              <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
              <h3>تكييف الخطة مع معطيات الواقع</h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              الخطة وضعت لخدمتك وليس العكس. اختر السيناريو الأنسب لراحتك وطاقتك الآن.
            </p>
          </div>
          <button
            onClick={closeAdaptModal}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {adaptationOptions.map((option) => {
            return (
              <div
                key={option.id}
                className="p-4 rounded-xl border border-stone-200 hover:border-stone-900 bg-stone-50/50 hover:bg-white transition-all space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-sm">
                      {option.title}
                    </h4>
                    <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                      اقتراح متوازن
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {option.summary}
                  </p>
                </div>

                {/* Proposed Changes list */}
                <div className="bg-stone-100/70 p-3 rounded-lg text-xs space-y-1.5 text-stone-700">
                  <span className="font-semibold block text-stone-900 text-[11px]">
                    التعديلات المقترحة على مسار اليوم:
                  </span>
                  {option.proposedChanges.map((change, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                      <span>{change.detail}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => applyAdaptation(option.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>تطبيق هذا التكييف بهدوء</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-xs text-stone-400">
          يمكنك دائماً تعديل أي بلوك يدوياً في أي وقت.
        </div>
      </div>
    </div>
  );
};
