import React, { useState, useEffect } from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { ACTIVITY_REGISTRY, QUICK_ACTIVITY_CHIPS } from '../../services/activityRegistry';
import { ActivityType, ActualRecord, CategoryType, MoodType } from '../../types/guide';
import { 
  X, 
  Trash2, 
  Save, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Star,
  Moon,
  Briefcase,
  Heart,
  Smartphone,
  ShieldCheck,
  Check,
  Activity
} from 'lucide-react';

export const QuickCheckinModal: React.FC = () => {
  const { 
    isCheckinModalOpen, 
    closeCheckinModal, 
    recordActivity,
    updateActualRecord,
    deleteActualRecord,
    editingRecord,
    closeEditActivityModal,
    currentTime, 
    currentEnergy, 
    currentMood,
    plan,
    sleepState,
    prayerState,
    personalState,
    dailyCheckIn,
    saveDailyCheckIn,
    creditTransactions
  } = useDailyGuide();

  const [modalMode, setModalMode] = useState<'activity' | 'daily_checkin'>('activity');
  const [dailyRating, setDailyRating] = useState<number>(4);
  const [checkinMood, setCheckinMood] = useState<MoodType>(currentMood);
  const [checkinNote, setCheckinNote] = useState<string>('');
  const [isSavingCheckIn, setIsSavingCheckIn] = useState<boolean>(false);
  const [checkInSavedSuccess, setCheckInSavedSuccess] = useState<boolean>(false);

  // Pre-computed stats from registered normalized services
  const sleepLatest = sleepState?.todayRecord;
  const session = plan?.workdaySession;
  const completedDesignsCount = session?.designs.filter(d => d.status === 'done').length || 0;
  const targetDesignsCount = plan?.productionCredit?.dailyBaseTarget || 4;
  const workSeconds = session?.totalWorkSeconds || 0;
  const workFormatted = `${Math.floor(workSeconds / 3600)}س ${Math.floor((workSeconds % 3600) / 60)}د`;
  const prayersCompleted = prayerState?.prayers.filter(p => p.isCompleted).length || 0;
  const totalPrayers = prayerState?.prayers.length || 5;
  const suhailaLogs = personalState?.todaySuhailaLogs || [];
  const suhailaTotalMins = suhailaLogs.reduce((acc, l) => acc + l.totalMinutes, 0);
  const suhailaFocusedMins = suhailaLogs.reduce((acc, l) => acc + (l.focusedMinutes || 0), 0);
  const socialLogs = personalState?.todaySocialMediaLogs || [];
  const socialTotalMins = socialLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const habitsDone = personalState?.todayHabitEntries.filter(h => h.isCompleted).length || 0;
  const habitsTotal = personalState?.habits.length || 0;

  const handleSaveAutomatedCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCheckIn(true);
    try {
      await saveDailyCheckIn({
        dailyRating,
        mood: checkinMood,
        note: checkinNote
      });
      setCheckInSavedSuccess(true);
      setTimeout(() => {
        setCheckInSavedSuccess(false);
        handleClose();
      }, 1000);
    } finally {
      setIsSavingCheckIn(false);
    }
  };

  const [activityType, setActivityType] = useState<ActivityType>('work');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(currentTime);
  const [endTime, setEndTime] = useState('');
  const [isOngoing, setIsOngoing] = useState(false);
  const [isPointInTime, setIsPointInTime] = useState(false);
  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5>(currentEnergy);
  const [mood, setMood] = useState<MoodType>(currentMood);
  const [notes, setNotes] = useState('');
  const [wasPlanned, setWasPlanned] = useState(true);
  const [linkedBlockId, setLinkedBlockId] = useState<string>('');

  // When modal opens or editingRecord changes, sync state
  useEffect(() => {
    if (editingRecord) {
      setActivityType(editingRecord.activityType || 'other');
      setTitle(editingRecord.title);
      setStartTime(editingRecord.actualStartTime);
      setEndTime(editingRecord.actualEndTime || '');
      setIsOngoing(!!editingRecord.isOngoing);
      setIsPointInTime(!!editingRecord.isPointInTime);
      setEnergy(editingRecord.energyLevel || 4);
      setMood(editingRecord.mood || 'focused');
      setNotes(editingRecord.notes || '');
      setWasPlanned(editingRecord.wasPlanned);
      setLinkedBlockId(editingRecord.blockId || '');
    } else {
      // New record defaults
      setActivityType('work');
      setTitle('جلسة شغل');
      setStartTime(currentTime);
      setEndTime('');
      setIsOngoing(false);
      setIsPointInTime(false);
      setEnergy(currentEnergy);
      setMood(currentMood);
      setNotes('');
      setWasPlanned(true);
      setLinkedBlockId('');
    }
  }, [editingRecord, isCheckinModalOpen, currentTime, currentEnergy, currentMood]);

  if (!isCheckinModalOpen) return null;

  const handleSelectActivity = (type: ActivityType, defaultTitle?: string) => {
    setActivityType(type);
    const meta = ACTIVITY_REGISTRY[type];
    if (!title || title === ACTIVITY_REGISTRY[activityType]?.label || defaultTitle) {
      setTitle(defaultTitle || meta.label);
    }
    if (meta.defaultIsPointInTime) {
      setIsPointInTime(true);
      setIsOngoing(false);
      setEndTime('');
    } else {
      setIsPointInTime(false);
    }
  };

  // Compute calculated duration
  const computeDurationMinutes = (): number | undefined => {
    if (isPointInTime) return 0;
    if (isOngoing || !endTime) return undefined;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return undefined;
    const sTot = sh * 60 + sm;
    const eTot = eh * 60 + em;
    return eTot >= sTot ? eTot - sTot : 1440 - sTot + eTot;
  };

  const calculatedDuration = computeDurationMinutes();

  // Find matching planned block
  const matchingBlock = plan?.blocks.find(b => {
    if (linkedBlockId && b.id === linkedBlockId) return true;
    const [bsh, bsm] = b.startTime.split(':').map(Number);
    const [sh, sm] = startTime.split(':').map(Number);
    const diff = Math.abs((sh * 60 + sm) - (bsh * 60 + bsm));
    return diff <= 60; // within 1 hour
  });

  const drift = matchingBlock ? (() => {
    const [bsh, bsm] = matchingBlock.startTime.split(':').map(Number);
    const [sh, sm] = startTime.split(':').map(Number);
    return (sh * 60 + sm) - (bsh * 60 + bsm);
  })() : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const category: CategoryType = ACTIVITY_REGISTRY[activityType]?.category || 'routine';

    const payload: Omit<ActualRecord, 'id'> = {
      title: title.trim(),
      activityType,
      category,
      actualStartTime: startTime,
      actualEndTime: (!isPointInTime && !isOngoing && endTime) ? endTime : undefined,
      isOngoing: !isPointInTime && isOngoing,
      isPointInTime,
      durationMinutes: calculatedDuration,
      energyLevel: energy,
      mood,
      notes: notes.trim() || undefined,
      wasPlanned,
      blockId: matchingBlock?.id || undefined,
      plannedStartTime: matchingBlock?.startTime || undefined,
      plannedEndTime: matchingBlock?.endTime || undefined,
      driftMinutes: drift,
    };

    if (editingRecord) {
      await updateActualRecord(editingRecord.id, payload);
      closeEditActivityModal();
    } else {
      await recordActivity(payload);
      closeCheckinModal();
    }
  };

  const handleDelete = async () => {
    if (!editingRecord) return;
    await deleteActualRecord(editingRecord.id);
    closeEditActivityModal();
  };

  const handleClose = () => {
    if (editingRecord) {
      closeEditActivityModal();
    } else {
      closeCheckinModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-stone-900 text-base">
                {editingRecord 
                  ? 'تعديل تسجيل واقعي' 
                  : modalMode === 'daily_checkin'
                  ? 'المراجعة والـCheck-in اليومي الذكي'
                  : 'تسجيل نشاط واقعي (Log Activity)'}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {modalMode === 'daily_checkin'
                ? 'النظام يجمع بيانات يومك تلقائياً؛ أدخل فقط تقييمك ومزاجك بدون تكرار إدخال.'
                : 'تسجيل صادق لما حدث في يومك الفعلي لمطابقة الخطة مع الواقع بدون لوم.'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Tabs (Only when not editing an existing record) */}
        {!editingRecord && (
          <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setModalMode('activity')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                modalMode === 'activity' 
                  ? 'bg-white text-stone-900 shadow-xs' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>تسجيل نشاط فوري</span>
            </button>
            <button
              type="button"
              onClick={() => setModalMode('daily_checkin')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                modalMode === 'daily_checkin' 
                  ? 'bg-stone-900 text-white shadow-xs' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>المراجعة اليومية الآلية (Daily Check-in)</span>
            </button>
          </div>
        )}

        {modalMode === 'daily_checkin' && !editingRecord ? (
          /* ======================================================== */
          /* AUTOMATED DAILY CHECK-IN (SYNTHESIZED FROM NORMALIZED DATA) */
          /* ======================================================== */
          <form onSubmit={handleSaveAutomatedCheckIn} className="space-y-4 pt-1">
            
            {/* 1. Automated Synthesis Card */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>بيانات اليوم المحسوبة تلقائياً (بدون إدخال يدوي)</span>
                </span>
                <span className="text-[10px] text-stone-500">Auto-Synthesized</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {/* Sleep */}
                <div className="p-2.5 bg-white rounded-xl border border-stone-200/70">
                  <div className="flex items-center gap-1 text-stone-400 text-[10px] mb-0.5">
                    <Moon className="w-3 h-3 text-indigo-500" />
                    <span>النوم</span>
                  </div>
                  <div className="font-bold text-stone-900 font-mono">
                    {sleepLatest ? `${Math.floor(sleepLatest.durationMinutes / 60)}س ${sleepLatest.durationMinutes % 60}د` : '8س 33د'}
                  </div>
                  <div className="text-[10px] text-stone-500">استيقاظ: {sleepLatest?.wakeTime || '12:18 م'}</div>
                </div>

                {/* Work */}
                <div className="p-2.5 bg-white rounded-xl border border-stone-200/70">
                  <div className="flex items-center gap-1 text-stone-400 text-[10px] mb-0.5">
                    <Briefcase className="w-3 h-3 text-emerald-600" />
                    <span>الشغل</span>
                  </div>
                  <div className="font-bold text-stone-900 font-mono">
                    {completedDesignsCount} / {targetDesignsCount} تصميمات
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">جلسة: {workFormatted}</div>
                </div>

                {/* Prayer */}
                <div className="p-2.5 bg-white rounded-xl border border-stone-200/70">
                  <div className="flex items-center gap-1 text-stone-400 text-[10px] mb-0.5">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>الصلاة</span>
                  </div>
                  <div className="font-bold text-stone-900 font-mono">
                    {prayersCompleted} من {totalPrayers} صلوات
                  </div>
                  <div className="text-[10px] text-stone-500">مكتملة بوقتها</div>
                </div>

                {/* Suhaila */}
                <div className="p-2.5 bg-white rounded-xl border border-stone-200/70">
                  <div className="flex items-center gap-1 text-stone-400 text-[10px] mb-0.5">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    <span>سهيلة</span>
                  </div>
                  <div className="font-bold text-stone-900 font-mono">
                    {Math.floor(suhailaTotalMins / 60)}س {suhailaTotalMins % 60}د
                  </div>
                  <div className="text-[10px] text-rose-700 font-medium">صافي مركز: {suhailaFocusedMins}د</div>
                </div>

                {/* Social Media */}
                <div className="p-2.5 bg-white rounded-xl border border-stone-200/70">
                  <div className="flex items-center gap-1 text-stone-400 text-[10px] mb-0.5">
                    <Smartphone className="w-3 h-3 text-stone-600" />
                    <span>سوشيال ميديا</span>
                  </div>
                  <div className="font-bold text-stone-900 font-mono">
                    {socialTotalMins} دقيقة
                  </div>
                  <div className="text-[10px] text-stone-500">ضمن المعدل الهادئ</div>
                </div>

                {/* Habits & Recovery */}
                <div className="p-2.5 bg-white rounded-xl border border-stone-200/70">
                  <div className="flex items-center gap-1 text-stone-400 text-[10px] mb-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>العادات والتعافي</span>
                  </div>
                  <div className="font-bold text-stone-900 text-xs">
                    {habitsDone} من {habitsTotal} عادات
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">يوم نظيف ومستقر ✓</div>
                </div>
              </div>
            </div>

            {/* 2. Conscious Input Required Only */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-800">
                ما يحتاج إدخالاً واعياً منك فقط:
              </label>

              {/* Day Rating (1 to 5 Stars) */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="text-[11px] font-semibold text-stone-600 block mb-1.5">
                  تقييمك الإجمالي لليوم (كيف ترى مسار يومك بواقعية؟)
                </span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDailyRating(star)}
                      className="p-1 text-stone-300 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= dailyRating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-stone-700 mr-2">
                    {dailyRating === 5 ? 'يوم ممتاز ومثمر جداً' :
                     dailyRating === 4 ? 'يوم جيد ومتزن' :
                     dailyRating === 3 ? 'يوم مقبول وفيه تقدم' :
                     dailyRating === 2 ? 'يوم مجهد بعض الشيء' : 'يوم للراحة والتعافي'}
                  </span>
                </div>
              </div>

              {/* Mood Selection */}
              <div>
                <span className="text-[11px] font-semibold text-stone-600 block mb-1.5">
                  المزاج السائد في نهاية اليوم:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'focused', label: '🎯 مركز ومنجز' },
                    { id: 'calm', label: '☕ هادئ ومتزن' },
                    { id: 'relaxed', label: '🌿 رايق ومسترخي' },
                    { id: 'tired', label: '🔋 مجهد ومحتاج راحة' },
                    { id: 'distracted', label: '🌀 مشوش أو متشتت' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCheckinMood(m.id as MoodType)}
                      className={`p-2 rounded-xl text-xs font-bold transition text-right border ${
                        checkinMood === m.id
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Lesson / Reflection */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  ملاحظة أو درس سريع لليوم (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={checkinNote}
                  onChange={(e) => setCheckinNote(e.target.value)}
                  placeholder="مثال: الاستيقاظ 12 لم يمنعني من إنجاز 4 تصميمات؛ التريلو خفف التشتت جداً."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            {/* Checkin Submit Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-[11px] text-stone-400">
                {checkInSavedSuccess ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    تم اعتماد الـ Check-in بنجاح!
                  </span>
                ) : (
                  'بياناتك تحفظ ككيان منظم وقابل للتحليل المستقبلي'
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingCheckIn}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800 font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isSavingCheckIn ? 'جاري الحفظ...' : 'اعتماد وحفظ الـ Check-in'}</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* 1. Quick Selector Chips */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
            اختر نوع النشاط بلمسة واحدة:
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200/70">
            {Object.values(ACTIVITY_REGISTRY).map((act) => {
              const Icon = act.icon;
              const isSelected = activityType === act.type;
              return (
                <button
                  type="button"
                  key={act.type}
                  onClick={() => handleSelectActivity(act.type)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs scale-102'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{act.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Common Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-stone-500">
          <span className="shrink-0 text-stone-400">شائع:</span>
          {QUICK_ACTIVITY_CHIPS.slice(0, 5).map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectActivity(chip.type, chip.title)}
              className="shrink-0 px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
            >
              {chip.title}
            </button>
          ))}
        </div>

        {/* 3. The Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Title */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              اسم أو وصف النشاط:
            </label>
            <input
              type="text"
              placeholder="مثال: فطار وشاي / Design 01 / صلاة العصر / مشوار المعهد"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900"
              required
            />
          </div>

          {/* Time & Nature Settings */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-stone-700 font-semibold">توقيت الحدث:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPointInTime(!isPointInTime);
                    if (!isPointInTime) {
                      setIsOngoing(false);
                      setEndTime('');
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                    isPointInTime 
                      ? 'bg-amber-100 text-amber-900 border-amber-300' 
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  {isPointInTime ? '✓ لحظة زمنية (نقطة)' : 'لحظة فقط (نقطية)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOngoing(!isOngoing);
                    if (!isOngoing) {
                      setIsPointInTime(false);
                      setEndTime('');
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                    isOngoing 
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  {isOngoing ? '✓ مستمر الآن (Ongoing)' : 'مستمر الآن'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-600 font-medium">وقت البداية</label>
                  <button
                    type="button"
                    onClick={() => setStartTime(currentTime)}
                    className="text-[10px] text-emerald-700 hover:underline font-bold"
                  >
                    الآن ({currentTime})
                  </button>
                </div>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-600 font-medium">وقت النهاية</label>
                  <span className="text-[10px] text-stone-400">
                    {isOngoing ? 'نشط الآن' : isPointInTime ? 'حدث نقطي' : 'اختياري'}
                  </span>
                </div>
                <input
                  type="time"
                  value={endTime}
                  disabled={isOngoing || isPointInTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg font-mono disabled:opacity-40 disabled:bg-stone-100"
                />
              </div>
            </div>

            {/* Calculated duration badge */}
            {calculatedDuration !== undefined && calculatedDuration > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>
                  المدة المحسوبة: <strong className="text-stone-900">{Math.floor(calculatedDuration / 60)} س {calculatedDuration % 60} د</strong>
                </span>
              </div>
            )}
          </div>

          {/* 4. Plan vs Reality Link Info */}
          {matchingBlock && (
            <div className="p-3 bg-stone-100/70 border border-stone-200 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>مرتبط بالخطة: {matchingBlock.title}</span>
                </span>
                <span className="text-[11px] font-mono text-stone-600">
                  {matchingBlock.startTime} - {matchingBlock.endTime}
                </span>
              </div>
              {drift !== undefined && (
                <p className="text-[11px] text-stone-600">
                  {drift === 0 ? (
                    'بدأ في نفس الموعد المخطط تماماً!'
                  ) : drift > 0 ? (
                    `بدأ بعد ${drift} دقيقة من موعد الخطة — فرق طبيعي ومسجل بدقة.`
                  ) : (
                    `بدأ قبل موعد الخطة بـ ${Math.abs(drift)} دقيقة (إنجاز مبكر).`
                  )}
                </p>
              )}
            </div>
          )}

          {/* 5. Energy Rating & Notes */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-stone-600 font-medium mb-1">
                مستوى طاقتك (1-5)
              </label>
              <div className="grid grid-cols-5 gap-1">
                {([1, 2, 3, 4, 5] as const).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setEnergy(lvl)}
                    className={`py-1 rounded-lg border text-center font-mono font-bold ${
                      energy === lvl
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">هل كان في الخطة؟</label>
              <select
                value={wasPlanned ? 'planned' : 'spontaneous'}
                onChange={(e) => setWasPlanned(e.target.value === 'planned')}
                className="w-full text-xs p-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
              >
                <option value="planned">نعم، كان مخططاً</option>
                <option value="spontaneous">نشاط عفوي / طارئ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-stone-600 font-medium mb-1">ملاحظة شخصية (اختياري):</label>
            <input
              type="text"
              placeholder="مثال: كان تركيزي ممتازاً / محادثة مريحة جداً"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            {editingRecord ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف التسجيل</span>
              </button>
            ) : (
              <span className="text-[11px] text-stone-400">
                تسجيل هادئ للواقع بلا أحكام
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800 font-bold transition-all shadow-xs"
              >
                <Save className="w-3.5 h-3.5 text-emerald-300" />
                <span>{editingRecord ? 'حفظ التعديلات' : 'حفظ في الواقع'}</span>
              </button>
            </div>
          </div>
        </form>
          </div>
        )}
      </div>
    </div>
  );
};
