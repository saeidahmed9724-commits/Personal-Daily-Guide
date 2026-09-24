import React, { useState } from 'react';
import { useDailyGuide } from '../../../context/GuideContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Globe, 
  Clock, 
  Briefcase, 
  Bell, 
  Palette, 
  Database, 
  Check, 
  Save, 
  Moon, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { AppSettings } from '../../../types/guide';

export const SettingsHub: React.FC = () => {
  const { settings, updateSettings } = useDailyGuide();

  const [formData, setFormData] = useState<AppSettings>(() => settings || {
    profileName: 'سعيد أحمد',
    timezone: 'Africa/Cairo',
    wakeTargetTime: '12:00',
    officialWorkDays: [0, 1, 2, 3, 4],
    dailyBaseDesignTarget: 4,
    deliveryDeadline: '21:30',
    appearanceTheme: 'calm_light',
    quietHoursStart: '23:00',
    quietHoursEnd: '11:30',
  });

  const [isSavedMessage, setIsSavedMessage] = useState(false);

  const dayOptions = [
    { day: 0, label: 'الأحد' },
    { day: 1, label: 'الإثنين' },
    { day: 2, label: 'الثلاثاء' },
    { day: 3, label: 'الأربعاء' },
    { day: 4, label: 'الخميس' },
    { day: 5, label: 'الجمعة' },
    { day: 6, label: 'السبت' },
  ];

  const handleToggleWorkDay = (dayIndex: number) => {
    setFormData(prev => {
      const exists = prev.officialWorkDays.includes(dayIndex);
      return {
        ...prev,
        officialWorkDays: exists
          ? prev.officialWorkDays.filter(d => d !== dayIndex)
          : [...prev.officialWorkDays, dayIndex].sort(),
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setIsSavedMessage(true);
    setTimeout(() => setIsSavedMessage(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <SettingsIcon className="w-4 h-4 text-emerald-600" />
            <span>إعدادات النظام (Settings)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            تخصيص التجربة وإيقاع العمل
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            اضبط أهدافك الواقعية وأيام عملك وساعات الهدوء لتناسب نمط حياتك.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSavedMessage && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <Check className="w-4 h-4" />
              <span>تم حفظ الإعدادات بنجاح</span>
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>حفظ التغييرات</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Profile & Timezone */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <User className="w-4 h-4 text-stone-600" />
            <h2 className="font-bold text-stone-900 text-sm">الملف الشخصي والمنطقة الزمنية</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">الاسم الشخصي</label>
              <input
                type="text"
                value={formData.profileName}
                onChange={e => setFormData({ ...formData, profileName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">المنطقة الزمنية (Timezone)</label>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-stone-400" />
                <select
                  value={formData.timezone}
                  onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 font-medium"
                >
                  <option value="Africa/Cairo">مصر (القاهرة - UTC+2 / UTC+3)</option>
                  <option value="Asia/Riyadh">السعودية (الرياض - UTC+3)</option>
                  <option value="UTC">توقيت جرينتش (UTC)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Wake Target & Daily Rhythm */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h2 className="font-bold text-stone-900 text-sm">إيقاع الاستيقاظ اليومي (Wake Target)</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">الهدف المرجعي للاستيقاظ</label>
              <input
                type="time"
                value={formData.wakeTargetTime}
                onChange={e => setFormData({ ...formData, wakeTargetTime: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono font-bold focus:ring-2 focus:ring-stone-900"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                هدف واقعي مرن. إذا صحوت بعد هذا الوقت، لا يعتبر اليوم فاشلاً بل يتكيف المرشد بهدوء.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Freelance Work System */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-stone-900 text-sm">نظام العمل والتصميمات</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">أيام العمل الأسبوعية الرسمية</label>
              <div className="flex flex-wrap gap-1.5">
                {dayOptions.map(opt => {
                  const isSelected = formData.officialWorkDays.includes(opt.day);
                  return (
                    <button
                      key={opt.day}
                      type="button"
                      onClick={() => handleToggleWorkDay(opt.day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">الهدف اليومي للتصاميم</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.dailyBaseDesignTarget}
                  onChange={e => setFormData({ ...formData, dailyBaseDesignTarget: parseInt(e.target.value) || 4 })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">موعد التسليم الأقصى</label>
                <input
                  type="time"
                  value={formData.deliveryDeadline}
                  onChange={e => setFormData({ ...formData, deliveryDeadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Quiet Hours & Appearance */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Moon className="w-4 h-4 text-purple-600" />
            <h2 className="font-bold text-stone-900 text-sm">ساعات الهدوء وإيقاف التشتت</h2>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">بدء التهدئة والراحة</label>
                <input
                  type="time"
                  value={formData.quietHoursStart}
                  onChange={e => setFormData({ ...formData, quietHoursStart: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">نهاية وقت الهدوء</label>
                <input
                  type="time"
                  value={formData.quietHoursEnd}
                  onChange={e => setFormData({ ...formData, quietHoursEnd: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">سمة الواجهة (Appearance)</label>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-stone-400" />
                <select
                  value={formData.appearanceTheme}
                  onChange={e => setFormData({ ...formData, appearanceTheme: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 font-medium"
                >
                  <option value="calm_light">النمط الهادئ النقي (Calm Light)</option>
                  <option value="midnight_slate">النمط الليلي المريح (Midnight Slate)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Data Management & Export */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Database className="w-4 h-4 text-stone-600" />
            <h2 className="font-bold text-stone-900 text-sm">إدارة البيانات والنسخ الاحتياطي</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p className="text-stone-500 max-w-xl">
              النظام مصمم ببنية معمارية مستقلة وقابلة للتصدير الفوري أو الربط المستقبلي بقاعدة بيانات سحابية دون الحاجة لتغيير واجهات المستخدم.
            </p>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  const dataBlob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `personal-guide-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold rounded-xl transition"
              >
                تصدير نسخة JSON
              </button>
            </div>
          </div>
        </div>

      </div>

    </form>
  );
};
