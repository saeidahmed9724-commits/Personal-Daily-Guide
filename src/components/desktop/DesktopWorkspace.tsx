import React from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { NowGuidanceCard } from '../modules/NowGuidanceCard';
import { ProductionCreditCard } from '../modules/ProductionCreditCard';
import { WorkHub } from '../modules/WorkHub';
import { PlanTimeline } from '../modules/PlanTimeline';
import { ActualLog } from '../modules/ActualLog';
import { UnderstandPatterns } from '../modules/UnderstandPatterns';
import { EventsHub } from '../modules/EventsHub';
import { SleepTracker } from '../modules/SleepTracker';
import { PrayerAnchorCard } from '../modules/PrayerAnchorCard';
import { PersonalLifeHub } from '../modules/personal/PersonalLifeHub';
import { MainDashboard } from '../modules/dashboard/MainDashboard';
import { AnalyticsHub } from '../modules/analytics/AnalyticsHub';
import { CalendarHub } from '../modules/calendar/CalendarHub';
import { NotesHub } from '../modules/notes/NotesHub';
import { SettingsHub } from '../modules/settings/SettingsHub';

export const DesktopWorkspace: React.FC = () => {
  const { activeTab } = useDailyGuide();

  return (
    <div className="hidden md:block flex-1 max-w-7xl mx-auto px-6 py-6 w-full">
      {/* 1. Work Hub */}
      {activeTab === 'work' ? (
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-8 space-y-6">
            <WorkHub />
          </div>
          <div className="col-span-4 sticky top-20 space-y-6">
            <NowGuidanceCard />
            <ProductionCreditCard />
          </div>
        </div>
      ) : activeTab === 'habits' || activeTab === 'personal' ? (
        /* 2. Habits & Personal Life */
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-8 space-y-6">
            <PersonalLifeHub />
          </div>
          <div className="col-span-4 sticky top-20 space-y-6">
            <NowGuidanceCard />
            <PrayerAnchorCard />
          </div>
        </div>
      ) : activeTab === 'events' ? (
        /* 3. Events */
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-8 space-y-6">
            <EventsHub />
          </div>
          <div className="col-span-4 sticky top-20 space-y-6">
            <NowGuidanceCard />
            <PrayerAnchorCard />
          </div>
        </div>
      ) : activeTab === 'analytics' || activeTab === 'understand' ? (
        /* 4. Analytics */
        <AnalyticsHub />
      ) : activeTab === 'calendar' ? (
        /* 5. Calendar */
        <CalendarHub />
      ) : activeTab === 'notes' ? (
        /* 6. Notes */
        <NotesHub />
      ) : activeTab === 'settings' ? (
        /* 7. Settings */
        <SettingsHub />
      ) : activeTab === 'sleep' ? (
        /* Secondary: Sleep */
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-8 space-y-6">
            <SleepTracker />
          </div>
          <div className="col-span-4 sticky top-20 space-y-6">
            <NowGuidanceCard />
            <ProductionCreditCard />
          </div>
        </div>
      ) : activeTab === 'plan' ? (
        /* Secondary: Plan Timeline */
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-8 space-y-6">
            <PlanTimeline />
            <ProductionCreditCard />
          </div>
          <div className="col-span-4 sticky top-20 space-y-6">
            <NowGuidanceCard />
            <PrayerAnchorCard />
          </div>
        </div>
      ) : activeTab === 'record' ? (
        /* Secondary: Actual Log */
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-8 space-y-6">
            <ActualLog />
          </div>
          <div className="col-span-4 sticky top-20 space-y-6">
            <NowGuidanceCard />
            <ProductionCreditCard />
          </div>
        </div>
      ) : (
        /* 8. Main Dashboard ("يومي / Dashboard") */
        <MainDashboard />
      )}
    </div>
  );
};
