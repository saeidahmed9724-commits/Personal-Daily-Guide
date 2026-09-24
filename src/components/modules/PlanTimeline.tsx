import React, { useState } from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { CATEGORY_LABELS } from '../../services/guideEngine';
import { CategoryType, TimeBlock } from '../../types/guide';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Sparkles, 
  Edit3, 
  Trash2,
  Lock,
  RefreshCw
} from 'lucide-react';

export const PlanTimeline: React.FC = () => {
  const { 
    plan, 
    currentTime, 
    toggleBlockComplete, 
    deleteBlock, 
    addBlock, 
    updateIntention 
  } = useDailyGuide();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditingIntention, setIsEditingIntention] = useState(false);
  const [intentionText, setIntentionText] = useState(plan?.mainFocusIntention || '');

  // Form states for adding block
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('16:30');
  const [endTime, setEndTime] = useState('17:30');
  const [category, setCategory] = useState<CategoryType>('deep_work');
  const [intention, setIntention] = useState('');
  const [isFlexible, setIsFlexible] = useState(true);

  if (!plan) return null;

  const handleSaveIntention = () => {
    if (intentionText.trim()) {
      updateIntention(intentionText.trim());
      setIsEditingIntention(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addBlock({
      kind: isFlexible ? 'flexible_block' : 'fixed_event',
      title: title.trim(),
      startTime,
      endTime,
      category,
      intention: intention.trim() || undefined,
      isFlexible,
      completed: false,
    });

    setTitle('');
    setIntention('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. Today's Main Intention (Core Anchor) */}
      <div className="bg-stone-100/80 border border-stone-200/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
          <span className="font-semibold text-stone-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-stone-500" />
            نية اليوم الحاكمة
          </span>
          <button
            onClick={() => {
              setIntentionText(plan.mainFocusIntention);
              setIsEditingIntention(!isEditingIntention);
            }}
            className="text-stone-500 hover:text-stone-900 flex items-center gap-1"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditingIntention ? 'إلغاء' : 'تعديل'}</span>
          </button>
        </div>

        {isEditingIntention ? (
          <div className="space-y-2 pt-1">
            <textarea
              value={intentionText}
              onChange={(e) => setIntentionText(e.target.value)}
              className="w-full text-sm bg-white border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-stone-900 resize-none text-stone-900"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSaveIntention}
                className="px-3 py-1.5 text-xs bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium"
              >
                حفظ النية
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium text-stone-800 leading-relaxed">
            "{plan.mainFocusIntention}"
          </p>
        )}
      </div>

      {/* 2. Timeline List */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-600" />
            <h3 className="font-bold text-stone-900 text-base">مسار الخطة لليوم</h3>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 text-xs font-medium text-stone-800 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة بلوك</span>
          </button>
        </div>

        {/* Inline Add Form */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 text-xs">
            <div className="font-semibold text-stone-800">إضافة بلوك زمني جديد</div>
            <div>
              <label className="block text-stone-600 mb-1">عنوان البلوك</label>
              <input
                type="text"
                placeholder="مثلاً: قراءة فصل في الكتاب أو برمجة واجهة"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-600 mb-1">من</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1">إلى</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-600 mb-1">التصنيف</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-600 mb-1">المرونة</label>
                <select
                  value={isFlexible ? 'flex' : 'fixed'}
                  onChange={(e) => setIsFlexible(e.target.value === 'flex')}
                  className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                >
                  <option value="flex">بلوك مرن (يمكن إزاحته)</option>
                  <option value="fixed">موعد ثابت (غير مرن)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-600 mb-1">النية وراء هذا البلوك (اختياري)</label>
              <input
                type="text"
                placeholder="لماذا هذا الوقت مهم؟ وما هو الشعور المستهدف؟"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-stone-600 hover:text-stone-900"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 font-medium"
              >
                إضافة للخطة
              </button>
            </div>
          </form>
        )}

          {/* Blocks timeline */}
        <div className="space-y-2.5">
          {plan.blocks.map((block) => {
            const isCurrentlyActive = currentTime >= block.startTime && currentTime < block.endTime;
            const catInfo = CATEGORY_LABELS[block.category];
            const isFixedEvent = block.kind === 'fixed_event';

            return (
              <div
                key={block.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isFixedEvent
                    ? 'border-amber-300/80 bg-amber-50/40 shadow-xs'
                    : isCurrentlyActive
                    ? 'border-stone-900/30 bg-stone-50/80 shadow-xs ring-1 ring-stone-900/10'
                    : 'border-stone-200/70 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => toggleBlockComplete(block.id)}
                      className="mt-0.5 text-stone-400 hover:text-stone-900 transition-colors shrink-0"
                      title={block.completed ? 'تعليم كغير مكتمل' : 'تعليم كمكتمل'}
                    >
                      {block.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-0.5">
                        <span className="font-mono tabular-nums font-semibold text-stone-800">
                          {block.startTime} - {block.endTime}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={catInfo.text}>{catInfo.label}</span>
                        <span aria-hidden="true">·</span>
                        
                        {isFixedEvent ? (
                          <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            حدث ثابت (Event)
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-stone-500 text-[11px]">
                            <RefreshCw className="w-2.5 h-2.5 text-stone-400" />
                            بلوك مرن
                          </span>
                        )}

                        {isCurrentlyActive && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-bold">نشط الآن</span>
                          </>
                        )}
                      </div>

                      <h4 className={`text-sm font-semibold text-stone-900 ${block.completed ? 'line-through text-stone-400' : ''}`}>
                        {block.title}
                      </h4>

                      {block.location && (
                        <p className="text-xs text-amber-900/80 mt-0.5 font-medium">
                          📍 {block.location} {block.prepMinutesBefore ? `(استعداد ${block.prepMinutesBefore} دقيقة)` : ''}
                        </p>
                      )}

                      {block.intention && (
                        <p className="text-xs text-stone-500 mt-1">
                          {block.intention}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="text-stone-300 hover:text-rose-600 p-1 transition-colors shrink-0"
                    title="حذف البلوك"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
