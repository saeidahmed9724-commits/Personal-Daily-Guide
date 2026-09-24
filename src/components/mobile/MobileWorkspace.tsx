import React from 'react';
import { useDailyGuide } from '../../context/GuideContext';
import { WorkHub } from '../modules/WorkHub';
import { PlanTimeline } from '../modules/PlanTimeline';
import { ActualLog } from '../modules/ActualLog';
import { EventsHub } from '../modules/EventsHub';
import { SleepTracker } from '../modules/SleepTracker';
import { PersonalLifeHub } from '../modules/personal/PersonalLifeHub';
import { MainDashboard } from '../modules/dashboard/MainDashboard';
import { AnalyticsHub } from '../modules/analytics/AnalyticsHub';
import { CalendarHub } from '../modules/calendar/CalendarHub';
import { NotesHub } from '../modules/notes/NotesHub';
import { SettingsHub } from '../modules/settings/SettingsHub';
import { ProductionCreditCard } from '../modules/ProductionCreditCard';

export const MobileWorkspace: React.FC = () => {
  const { activeTab } = useDailyGuide();

  return (
    <div className="block md:hidden min-h-screen pb-24">
      {/* Mobile Content Area */}
      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {activeTab === 'now' && (
          <MainDashboard />
        )}

        {activeTab === 'work' && (
          <div className="space-y-4">
            <WorkHub />
          </div>
        )}

        {(activeTab === 'habits' || activeTab === 'personal') && (
          <div className="space-y-4">
            <PersonalLifeHub />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            <EventsHub />
          </div>
        )}

        {(activeTab === 'analytics' || activeTab === 'understand') && (
          <div className="space-y-4">
            <AnalyticsHub />
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <CalendarHub />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <NotesHub />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <SettingsHub />
          </div>
        )}

        {activeTab === 'sleep' && (
          <div className="space-y-4">
            <SleepTracker />
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-4">
            <PlanTimeline />
            <ProductionCreditCard />
          </div>
        )}

        {activeTab === 'record' && (
          <div className="space-y-4">
            <ActualLog />
          </div>
        )}
      </main>
    </div>
  );
};
