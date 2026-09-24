/**
 * Personal Daily Guide (مرشدك اليومي)
 * Core cycle: Plan → Live → Record → Understand → Adapt
 * Architecture: Clean domain models, swappable repository, pure guide logic engine, responsive dual-workspace.
 */

import React from 'react';
import { GuideProvider, useDailyGuide } from './context/GuideContext';
import { Header } from './components/layout/Header';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { DesktopWorkspace } from './components/desktop/DesktopWorkspace';
import { MobileWorkspace } from './components/mobile/MobileWorkspace';
import { AdaptModal } from './components/modules/AdaptModal';
import { QuickCheckinModal } from './components/modules/QuickCheckinModal';
import { ArchitectureRoadmapModal } from './components/modules/ArchitectureRoadmapModal';
import { EventModal } from './components/modules/EventModal';
import { SleepModal } from './components/modules/SleepModal';
import { GlobalQuickActionModal } from './components/common/GlobalQuickActionModal';
import { SuhailaModal } from './components/modules/personal/SuhailaModal';
import { SocialMediaModal } from './components/modules/personal/SocialMediaModal';
import { RecoveryModal } from './components/modules/personal/RecoveryModal';
import { FriendModal } from './components/modules/personal/FriendModal';
import { AddHabitModal } from './components/modules/personal/AddHabitModal';

const MainLayout: React.FC = () => {
  const { loading } = useDailyGuide();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">تهيئة مرشدك اليومي...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans selection:bg-stone-200">
      {/* Top Header */}
      <Header />

      {/* Main Responsive Workspaces */}
      <div className="flex-1 flex flex-row">
        {/* Desktop Collapsible Sidebar */}
        <DesktopSidebar />

        {/* Workspaces Container */}
        <div className="flex-1 flex flex-col min-w-0">
          <DesktopWorkspace />
          <MobileWorkspace />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />

      {/* Global Quick Action Modal */}
      <GlobalQuickActionModal />

      {/* Domain Modals & Dialogs */}
      <AdaptModal />
      <QuickCheckinModal />
      <ArchitectureRoadmapModal />
      <EventModal />
      <SleepModal />

      {/* Personal Life & Habits Modals */}
      <SuhailaModal />
      <SocialMediaModal />
      <RecoveryModal />
      <FriendModal />
      <AddHabitModal />
    </div>
  );
};

export default function App() {
  return (
    <GuideProvider>
      <MainLayout />
    </GuideProvider>
  );
}
