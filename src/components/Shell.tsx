"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Moon,
  BedDouble,
  Briefcase,
  CheckCircle2,
  CalendarDays,
  StickyNote,
  Heart,
  ClipboardCheck,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
} from "lucide-react";
import { todayStr } from "@/lib/client";
import DashboardTab from "@/components/tabs/DashboardTab";
import PrayersTab from "@/components/tabs/PrayersTab";
import SleepTab from "@/components/tabs/SleepTab";
import WorkTab from "@/components/tabs/WorkTab";
import HabitsTab from "@/components/tabs/HabitsTab";
import EventsTab from "@/components/tabs/EventsTab";
import NotesTab from "@/components/tabs/NotesTab";
import PersonalTab from "@/components/tabs/PersonalTab";
import CheckinTab from "@/components/tabs/CheckinTab";
import AnalyticsTab from "@/components/tabs/AnalyticsTab";
import SettingsTab from "@/components/tabs/SettingsTab";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "prayers", label: "Prayers", icon: Moon },
  { id: "sleep", label: "Sleep", icon: BedDouble },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "habits", label: "Habits", icon: CheckCircle2 },
  { id: "events", label: "Calendar", icon: CalendarDays },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "personal", label: "Personal Life", icon: Heart },
  { id: "checkin", label: "Check-in", icon: ClipboardCheck },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: SettingsIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Shell() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [date, setDate] = useState(todayStr());
  const [menuOpen, setMenuOpen] = useState(false);

  function renderTab() {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab date={date} setDate={setDate} onNavigate={(t: string) => setActiveTab(t as TabId)} />;
      case "prayers":
        return <PrayersTab date={date} setDate={setDate} />;
      case "sleep":
        return <SleepTab date={date} setDate={setDate} />;
      case "work":
        return <WorkTab date={date} setDate={setDate} />;
      case "habits":
        return <HabitsTab date={date} setDate={setDate} />;
      case "events":
        return <EventsTab date={date} setDate={setDate} />;
      case "notes":
        return <NotesTab />;
      case "personal":
        return <PersonalTab date={date} setDate={setDate} />;
      case "checkin":
        return <CheckinTab date={date} setDate={setDate} />;
      case "analytics":
        return <AnalyticsTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-emerald-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white/70 px-4 py-6 backdrop-blur lg:flex">
          <Brand />
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {TABS.map((tab) => (
              <NavButton
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </nav>
          <p className="mt-4 text-[11px] text-slate-400">Your personal daily companion.</p>
        </aside>

        {/* Mobile top bar */}
        <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <Brand compact />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {menuOpen && (
          <div className="fixed inset-x-0 top-[57px] z-20 max-h-[70vh] overflow-y-auto border-b border-slate-200 bg-white p-3 shadow-lg lg:hidden">
            <div className="grid grid-cols-3 gap-2">
              {TABS.map((tab) => (
                <NavButton
                  key={tab.id}
                  tab={tab}
                  active={activeTab === tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMenuOpen(false);
                  }}
                  grid
                />
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 px-4 pb-24 pt-20 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
          <div className="mx-auto max-w-5xl">{renderTab()}</div>
        </main>
      </div>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-sm font-bold text-white shadow-sm">
        PDG
      </div>
      {!compact && (
        <div>
          <p className="text-sm font-semibold leading-tight text-slate-900">Personal Daily Guide</p>
          <p className="text-[11px] text-slate-500">Plan. Reflect. Grow.</p>
        </div>
      )}
    </div>
  );
}

function NavButton({
  tab,
  active,
  onClick,
  grid,
}: {
  tab: { id: string; label: string; icon: typeof LayoutDashboard };
  active: boolean;
  onClick: () => void;
  grid?: boolean;
}) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
        grid ? "flex-col justify-center gap-1 py-3 text-center text-[11px]" : ""
      } ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon size={grid ? 18 : 16} />
      <span className={grid ? "leading-tight" : ""}>{tab.label}</span>
    </button>
  );
}
