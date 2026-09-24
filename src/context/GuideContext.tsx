/**
 * Personal Daily Guide - Context & Hook
 * Decouples state management and domain actions from presentation components.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  DayPlan, 
  TimeBlock, 
  ActualRecord, 
  DayPattern, 
  AdaptationOption, 
  LiveContextState, 
  MoodType,
  WorkDesignItem,
  LifeEvent,
  PrayerDayState,
  PrayerId,
  SleepRecord,
  SleepState,
  PersonalLifeState,
  SuhailaLog,
  SocialMediaLog,
  RecoveryLog,
  RecoveryTrigger,
  FriendActivityLog,
  FlexibleHabit,
  HabitLogEntry,
  PersonalNote,
  AppSettings,
  CreditTransactionEntity,
  ProductionCreditSummary,
  DailyCheckInEntity,
  UserProfileEntity
} from '../types/guide';
import { guideRepository } from '../services/storage/mockGuideRepository';
import { evaluateLiveContext, timeToMinutes } from '../services/guideEngine';

export type ActiveTabType = 
  | 'now' 
  | 'work' 
  | 'events' 
  | 'habits' 
  | 'analytics' 
  | 'calendar' 
  | 'notes' 
  | 'settings' 
  | 'personal' // alias for habits
  | 'sleep' 
  | 'plan' 
  | 'record' 
  | 'understand'; // alias for analytics

interface GuideContextType {
  plan: DayPlan | null;
  loading: boolean;
  live: LiveContextState | null;
  patterns: DayPattern[];
  events: LifeEvent[];
  prayerState: PrayerDayState | null;
  sleepState: SleepState | null;
  personalState: PersonalLifeState | null;
  notes: PersonalNote[];
  settings: AppSettings | null;
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  currentTime: string;
  isSimulatingTime: boolean;
  setSimulatedTime: (time: string) => void;
  resetToRealTime: () => void;
  currentEnergy: 1 | 2 | 3 | 4 | 5;
  setEnergy: (energy: 1 | 2 | 3 | 4 | 5) => void;
  currentMood: MoodType;
  setMood: (mood: MoodType) => void;
  
  // Actions
  addBlock: (block: Omit<TimeBlock, 'id'>) => Promise<void>;
  updateBlock: (blockId: string, updates: Partial<TimeBlock>) => Promise<void>;
  deleteBlock: (blockId: string) => Promise<void>;
  toggleBlockComplete: (blockId: string) => Promise<void>;
  recordActivity: (record: Omit<ActualRecord, 'id'>) => Promise<void>;
  updateActualRecord: (recordId: string, updates: Partial<ActualRecord>) => Promise<void>;
  deleteActualRecord: (recordId: string) => Promise<void>;
  endOngoingActivity: (recordId: string, endTime?: string) => Promise<void>;
  editingRecord: ActualRecord | null;
  openEditActivityModal: (record: ActualRecord) => void;
  closeEditActivityModal: () => void;
  updateIntention: (intention: string) => Promise<void>;

  // Events Hub Actions
  addEvent: (event: Omit<LifeEvent, 'id'>) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<LifeEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  isEventModalOpen: boolean;
  editingEvent: LifeEvent | null;
  openAddEventModal: () => void;
  openEditEventModal: (event: LifeEvent) => void;
  closeEventModal: () => void;

  // Prayer Anchor Actions
  togglePrayer: (prayerId: PrayerId) => Promise<void>;

  // Sleep Tracking Actions
  recordSleep: (record: Omit<SleepRecord, 'id'>) => Promise<void>;
  updateSleepRecord: (recordId: string, updates: Partial<SleepRecord>) => Promise<void>;
  deleteSleepRecord: (recordId: string) => Promise<void>;
  isSleepModalOpen: boolean;
  editingSleepRecord: SleepRecord | null;
  openLogSleepModal: () => void;
  openEditSleepModal: (record: SleepRecord) => void;
  closeSleepModal: () => void;
  
  // Personal Life & Habits Actions
  logSuhaila: (log: Omit<SuhailaLog, 'id'>) => Promise<void>;
  deleteSuhailaLog: (logId: string) => Promise<void>;
  logSocialMedia: (log: Omit<SocialMediaLog, 'id'>) => Promise<void>;
  deleteSocialMediaLog: (logId: string) => Promise<void>;
  recordRecovery: (
    status: 'clean' | 'relapse',
    trigger?: RecoveryTrigger,
    locationContext?: 'work_apartment' | 'home' | 'other',
    time?: string,
    notes?: string
  ) => Promise<void>;
  logFriendActivity: (activity: Omit<FriendActivityLog, 'id'>) => Promise<void>;
  deleteFriendActivity: (activityId: string) => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
  addHabit: (habit: Omit<FlexibleHabit, 'id'>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;

  // Personal Life Modals
  isSuhailaModalOpen: boolean;
  openSuhailaModal: () => void;
  closeSuhailaModal: () => void;
  isSocialMediaModalOpen: boolean;
  openSocialMediaModal: () => void;
  closeSocialMediaModal: () => void;
  isRecoveryModalOpen: boolean;
  openRecoveryModal: () => void;
  closeRecoveryModal: () => void;
  isFriendModalOpen: boolean;
  openFriendModal: () => void;
  closeFriendModal: () => void;
  isAddHabitModalOpen: boolean;
  openAddHabitModal: () => void;
  closeAddHabitModal: () => void;

  // Adaptations
  adaptationOptions: AdaptationOption[];
  isAdaptModalOpen: boolean;
  openAdaptModal: () => void;
  closeAdaptModal: () => void;
  applyAdaptation: (id: string) => Promise<void>;

  // Production Credit actions
  updateDesignsCompleted: (count: number) => Promise<void>;
  useCredit: (amount: number) => Promise<void>;

  // Work Hub Actions
  startWorkday: (startTime?: string) => Promise<void>;
  endWorkday: (endTime?: string) => Promise<void>;
  updateWorkdayLinks: (trelloUrl: string, driveUrl: string) => Promise<void>;
  toggleDesignTimer: (designId: string) => Promise<void>;
  finishDesign: (designId: string) => Promise<void>;
  addDesign: (title?: string) => Promise<void>;
  updateDesign: (designId: string, updates: Partial<WorkDesignItem>) => Promise<void>;

  // Check-in Modal
  isCheckinModalOpen: boolean;
  openCheckinModal: () => void;
  closeCheckinModal: () => void;

  // Architecture Modal
  isArchitectureModalOpen: boolean;
  openArchitectureModal: () => void;
  closeArchitectureModal: () => void;

  // Notes Actions & Modals
  addNote: (note: Omit<PersonalNote, 'id' | 'createdAt'>) => Promise<void>;
  updateNote: (noteId: string, updates: Partial<PersonalNote>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  togglePinNote: (noteId: string) => Promise<void>;
  isAddNoteModalOpen: boolean;
  openAddNoteModal: () => void;
  closeAddNoteModal: () => void;

  // Settings Actions
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;

  // Normalized Entities & Ledger
  creditTransactions: CreditTransactionEntity[];
  creditSummary: ProductionCreditSummary | null;
  dailyCheckIn: DailyCheckInEntity | null;
  allCheckIns: DailyCheckInEntity[];
  historicalPlans: DayPlan[];
  saveDailyCheckIn: (reflection?: { mood?: any; dailyRating?: number; note?: string }) => Promise<DailyCheckInEntity>;
  userProfile: UserProfileEntity | null;
  updateUserProfile: (updates: Partial<UserProfileEntity>) => Promise<void>;

  // Global Quick Action Modal
  isGlobalQuickActionOpen: boolean;
  openGlobalQuickAction: () => void;
  closeGlobalQuickAction: () => void;

  // Decision Engine Scenario Testing
  applyScenarioPreset: (scenarioId: string) => Promise<void>;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

function getCurrentDeviceTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export const GuideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [patterns, setPatterns] = useState<DayPattern[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Time and context state
  // Default to 12:00 for rich preview, or real time
  const [currentTime, setCurrentTime] = useState<string>('12:00');
  const [isSimulatingTime, setIsSimulatingTime] = useState<boolean>(true);
  const [currentEnergy, setCurrentEnergy] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [currentMood, setCurrentMood] = useState<MoodType>('focused');
  
  // Active Navigation Tab (Mobile-first navigation and Desktop focus)
  const [activeTab, setActiveTab] = useState<ActiveTabType>('now');

  // Events, Prayer, and Sleep state
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [prayerState, setPrayerState] = useState<PrayerDayState | null>(null);
  const [sleepState, setSleepState] = useState<SleepState | null>(null);
  const [personalState, setPersonalState] = useState<PersonalLifeState | null>(null);

  // Modals
  const [isAdaptModalOpen, setIsAdaptModalOpen] = useState(false);
  const [adaptationOptions, setAdaptationOptions] = useState<AdaptationOption[]>([]);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActualRecord | null>(null);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);

  // Sleep modal state
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [editingSleepRecord, setEditingSleepRecord] = useState<SleepRecord | null>(null);

  // Personal Life Modals state
  const [isSuhailaModalOpen, setIsSuhailaModalOpen] = useState(false);
  const [isSocialMediaModalOpen, setIsSocialMediaModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);

  // Notes and Settings state
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isGlobalQuickActionOpen, setIsGlobalQuickActionOpen] = useState(false);

  // Normalized Ledger, Profile & Check-in state
  const [creditTransactions, setCreditTransactions] = useState<CreditTransactionEntity[]>([]);
  const [creditSummary, setCreditSummary] = useState<ProductionCreditSummary | null>(null);
  const [dailyCheckIn, setDailyCheckIn] = useState<DailyCheckInEntity | null>(null);
  const [allCheckIns, setAllCheckIns] = useState<DailyCheckInEntity[]>([]);
  const [historicalPlans, setHistoricalPlans] = useState<DayPlan[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileEntity | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const currM = timeToMinutes(currentTime);
      const [
        fetchedPlan, 
        fetchedPatterns, 
        fetchedEvents, 
        fetchedPrayer, 
        fetchedSleep, 
        fetchedPersonal, 
        fetchedNotes, 
        fetchedSettings,
        fetchedTransactions,
        fetchedSummary,
        fetchedCheckIn,
        fetchedProfile
      ] = await Promise.all([
        guideRepository.getTodayPlan(todayStr),
        guideRepository.getPatterns(),
        guideRepository.getEvents(),
        guideRepository.getPrayerState(todayStr, currM),
        guideRepository.getSleepState(todayStr),
        guideRepository.getPersonalLifeState(todayStr),
        guideRepository.getNotes(),
        guideRepository.getSettings(),
        guideRepository.getCreditTransactions(),
        guideRepository.getCreditSummary(),
        guideRepository.getDailyCheckIn(todayStr),
        guideRepository.getUserProfile(),
      ]);
      setPlan(fetchedPlan);
      setPatterns(fetchedPatterns);
      setEvents(fetchedEvents);
      setPrayerState(fetchedPrayer);
      setSleepState(fetchedSleep);
      setPersonalState(fetchedPersonal);
      setNotes(fetchedNotes);
      setSettings(fetchedSettings);
      setCreditTransactions(fetchedTransactions);
      setCreditSummary(fetchedSummary);
      setDailyCheckIn(fetchedCheckIn);
      setUserProfile(fetchedProfile);
    } finally {
      setLoading(false);
    }
  }, [todayStr, currentTime]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep time synced if not simulating
  useEffect(() => {
    if (isSimulatingTime) return;
    const interval = setInterval(() => {
      setCurrentTime(getCurrentDeviceTime());
    }, 30000);
    return () => clearInterval(interval);
  }, [isSimulatingTime]);

  // Keep prayer countdown synced when currentTime changes
  useEffect(() => {
    const currM = timeToMinutes(currentTime);
    guideRepository.getPrayerState(todayStr, currM).then(res => setPrayerState(res));
  }, [currentTime, todayStr]);

  // Evaluate Live Context whenever plan, time, energy, events, prayer, or sleep changes
  const live = useMemo(() => {
    if (!plan) return null;
    return evaluateLiveContext(
      plan, 
      currentTime, 
      currentEnergy, 
      currentMood, 
      events, 
      prayerState || undefined, 
      sleepState || undefined
    );
  }, [plan, currentTime, currentEnergy, currentMood, events, prayerState, sleepState]);

  const handleSetSimulatedTime = (time: string) => {
    setIsSimulatingTime(true);
    setCurrentTime(time);
  };

  const handleResetToRealTime = () => {
    setIsSimulatingTime(false);
    setCurrentTime(getCurrentDeviceTime());
  };

  const handleAddBlock = async (block: Omit<TimeBlock, 'id'>) => {
    await guideRepository.addTimeBlock(todayStr, block);
    await loadData();
  };

  const handleUpdateBlock = async (blockId: string, updates: Partial<TimeBlock>) => {
    await guideRepository.updateTimeBlock(todayStr, blockId, updates);
    await loadData();
  };

  const handleDeleteBlock = async (blockId: string) => {
    await guideRepository.deleteTimeBlock(todayStr, blockId);
    await loadData();
  };

  const handleToggleBlockComplete = async (blockId: string) => {
    if (!plan) return;
    const block = plan.blocks.find(b => b.id === blockId);
    if (!block) return;
    await guideRepository.updateTimeBlock(todayStr, blockId, { completed: !block.completed });
    await loadData();
  };

  const handleRecordActivity = async (record: Omit<ActualRecord, 'id'>) => {
    await guideRepository.recordActualActivity(todayStr, record);
    await loadData();
  };

  const handleUpdateActualRecord = async (recordId: string, updates: Partial<ActualRecord>) => {
    await guideRepository.updateActualRecord(todayStr, recordId, updates);
    await loadData();
  };

  const handleDeleteActualRecord = async (recordId: string) => {
    await guideRepository.deleteActualRecord(todayStr, recordId);
    await loadData();
  };

  const handleEndOngoingActivity = async (recordId: string, endTime?: string) => {
    await guideRepository.endOngoingActivity(todayStr, recordId, endTime);
    await loadData();
  };

  const handleUpdateIntention = async (intention: string) => {
    await guideRepository.updateDayIntention(todayStr, intention);
    await loadData();
  };

  const handleOpenAdaptModal = async () => {
    const options = await guideRepository.getAdaptationOptions(todayStr, currentTime);
    setAdaptationOptions(options);
    setIsAdaptModalOpen(true);
  };

  const handleApplyAdaptation = async (id: string) => {
    const updatedPlan = await guideRepository.applyAdaptation(todayStr, id);
    setPlan(updatedPlan);
    setIsAdaptModalOpen(false);
  };

  const handleUpdateDesignsCompleted = async (count: number) => {
    const updated = await guideRepository.updateTodayDesigns(todayStr, count);
    setPlan(updated);
    const [txs, sum] = await Promise.all([
      guideRepository.getCreditTransactions(),
      guideRepository.getCreditSummary()
    ]);
    setCreditTransactions(txs);
    setCreditSummary(sum);
  };

  const handleUseCredit = async (amount: number) => {
    const updated = await guideRepository.useProductionCredit(todayStr, amount);
    setPlan(updated);
    const [txs, sum] = await Promise.all([
      guideRepository.getCreditTransactions(),
      guideRepository.getCreditSummary()
    ]);
    setCreditTransactions(txs);
    setCreditSummary(sum);
  };

  const handleSaveDailyCheckIn = useCallback(async (reflection?: { mood?: any; dailyRating?: number; note?: string }) => {
    const saved = await guideRepository.saveDailyCheckIn(todayStr, reflection);
    setDailyCheckIn(saved);
    return saved;
  }, [todayStr]);

  const handleUpdateUserProfile = useCallback(async (updates: Partial<UserProfileEntity>) => {
    const updated = await guideRepository.updateUserProfile(updates);
    setUserProfile(updated);
  }, []);

  // Work Hub Handlers
  const handleStartWorkday = async (startTime?: string) => {
    const updated = await guideRepository.startWorkday(todayStr, startTime);
    setPlan(updated);
  };

  const handleEndWorkday = async (endTime?: string) => {
    const updated = await guideRepository.endWorkday(todayStr, endTime);
    setPlan(updated);
  };

  const handleUpdateWorkdayLinks = async (trelloUrl: string, driveUrl: string) => {
    const updated = await guideRepository.updateWorkdayLinks(todayStr, trelloUrl, driveUrl);
    setPlan(updated);
  };

  const handleToggleDesignTimer = async (designId: string) => {
    const updated = await guideRepository.toggleDesignTimer(todayStr, designId);
    setPlan(updated);
  };

  const handleFinishDesign = async (designId: string) => {
    const updated = await guideRepository.finishDesign(todayStr, designId);
    setPlan(updated);
  };

  const handleAddDesign = async (title?: string) => {
    const updated = await guideRepository.addDesign(todayStr, title);
    setPlan(updated);
  };

  const handleUpdateDesign = async (designId: string, updates: Partial<WorkDesignItem>) => {
    const updated = await guideRepository.updateDesign(todayStr, designId, updates);
    setPlan(updated);
  };

  // Events Hub Handlers
  const handleAddEvent = async (event: Omit<LifeEvent, 'id'>) => {
    await guideRepository.addEvent(event);
    const updatedEvents = await guideRepository.getEvents();
    setEvents(updatedEvents);
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<LifeEvent>) => {
    await guideRepository.updateEvent(eventId, updates);
    const updatedEvents = await guideRepository.getEvents();
    setEvents(updatedEvents);
  };

  const handleDeleteEvent = async (eventId: string) => {
    await guideRepository.deleteEvent(eventId);
    const updatedEvents = await guideRepository.getEvents();
    setEvents(updatedEvents);
  };

  // Prayer Handlers
  const handleTogglePrayer = async (prayerId: PrayerId) => {
    const currM = timeToMinutes(currentTime);
    const updated = await guideRepository.togglePrayer(todayStr, prayerId, currM);
    setPrayerState(updated);
    // Reload plan because toggling prayer might add an actual record to today's log
    const updatedPlan = await guideRepository.getTodayPlan(todayStr);
    setPlan(updatedPlan);
  };

  // Sleep Handlers
  const handleRecordSleep = async (record: Omit<SleepRecord, 'id'>) => {
    const updated = await guideRepository.recordSleep(todayStr, record);
    setSleepState(updated);
    const updatedPlan = await guideRepository.getTodayPlan(todayStr);
    setPlan(updatedPlan);
  };

  const handleUpdateSleepRecord = async (recordId: string, updates: Partial<SleepRecord>) => {
    const updated = await guideRepository.updateSleepRecord(recordId, updates);
    setSleepState(updated);
    const updatedPlan = await guideRepository.getTodayPlan(todayStr);
    setPlan(updatedPlan);
  };

  const handleDeleteSleepRecord = async (recordId: string) => {
    const updated = await guideRepository.deleteSleepRecord(recordId);
    setSleepState(updated);
  };

  // Personal Life Handlers
  const handleLogSuhaila = async (log: Omit<SuhailaLog, 'id'>) => {
    const updated = await guideRepository.logSuhaila(todayStr, log);
    setPersonalState(updated);
  };

  const handleDeleteSuhailaLog = async (logId: string) => {
    const updated = await guideRepository.deleteSuhailaLog(todayStr, logId);
    setPersonalState(updated);
  };

  const handleLogSocialMedia = async (log: Omit<SocialMediaLog, 'id'>) => {
    const updated = await guideRepository.logSocialMedia(todayStr, log);
    setPersonalState(updated);
  };

  const handleDeleteSocialMediaLog = async (logId: string) => {
    const updated = await guideRepository.deleteSocialMediaLog(todayStr, logId);
    setPersonalState(updated);
  };

  const handleRecordRecovery = async (
    status: 'clean' | 'relapse',
    trigger?: RecoveryTrigger,
    locationContext?: 'work_apartment' | 'home' | 'other',
    time?: string,
    notes?: string
  ) => {
    const updated = await guideRepository.recordRecovery(todayStr, status, trigger, locationContext, time, notes);
    setPersonalState(updated);
  };

  const handleLogFriendActivity = async (activity: Omit<FriendActivityLog, 'id'>) => {
    const updated = await guideRepository.logFriendActivity(todayStr, activity);
    setPersonalState(updated);
  };

  const handleDeleteFriendActivity = async (activityId: string) => {
    const updated = await guideRepository.deleteFriendActivity(todayStr, activityId);
    setPersonalState(updated);
  };

  const handleToggleHabit = async (habitId: string) => {
    const updated = await guideRepository.toggleHabit(todayStr, habitId);
    setPersonalState(updated);
  };

  const handleAddHabit = async (habit: Omit<FlexibleHabit, 'id'>) => {
    const updated = await guideRepository.addHabit(habit);
    setPersonalState(updated);
  };

  const handleDeleteHabit = async (habitId: string) => {
    const updated = await guideRepository.deleteHabit(habitId);
    setPersonalState(updated);
  };

  // Live Timer Heartbeat for active design or active workday
  useEffect(() => {
    const session = plan?.workdaySession;
    const isAnyTimerRunning = session?.isWorkTimerRunning || 
      session?.designs.some(d => d.isTimerRunning);

    if (!isAnyTimerRunning) return;

    const interval = setInterval(() => {
      setPlan(prevPlan => {
        if (!prevPlan) return prevPlan;
        const currentSession = prevPlan.workdaySession;
        if (!currentSession) return prevPlan;

        let hasChanged = false;
        const nextTotalWorkSeconds = currentSession.isWorkTimerRunning 
          ? currentSession.totalWorkSeconds + 1 
          : currentSession.totalWorkSeconds;

        const nextDesigns = currentSession.designs.map(d => {
          if (d.isTimerRunning) {
            hasChanged = true;
            return { ...d, durationSeconds: d.durationSeconds + 1 };
          }
          return d;
        });

        if (currentSession.isWorkTimerRunning || hasChanged) {
          return {
            ...prevPlan,
            workdaySession: {
              ...currentSession,
              totalWorkSeconds: nextTotalWorkSeconds,
              designs: nextDesigns,
            }
          };
        }
        return prevPlan;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [plan?.workdaySession?.isWorkTimerRunning, plan?.workdaySession?.designs]);

  // Notes & Settings Handlers
  const handleAddNote = useCallback(async (note: Omit<PersonalNote, 'id' | 'createdAt'>) => {
    const updated = await guideRepository.addNote(note);
    setNotes(updated);
    setIsAddNoteModalOpen(false);
  }, []);

  const handleUpdateNote = useCallback(async (noteId: string, updates: Partial<PersonalNote>) => {
    const updated = await guideRepository.updateNote(noteId, updates);
    setNotes(updated);
  }, []);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    const updated = await guideRepository.deleteNote(noteId);
    setNotes(updated);
  }, []);

  const handleTogglePinNote = useCallback(async (noteId: string) => {
    const updated = await guideRepository.togglePinNote(noteId);
    setNotes(updated);
  }, []);

  const handleUpdateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const updated = await guideRepository.updateSettings(updates);
    setSettings(updated);
  }, []);

  const handleApplyScenarioPreset = useCallback(async (scenarioId: string) => {
    if (!plan) return;

    let newCurrentTime = currentTime;
    let newWakeTime = plan.actualWakeUpTime || '12:00';
    let newCompletedDesigns = plan.productionCredit.todayCompletedDesigns;
    let newDailyBaseTarget = plan.productionCredit.dailyBaseTarget;
    let newTotalCredit = plan.productionCredit.totalCreditBalance;
    let newSession = { ...plan.workdaySession };
    let newEvents = [...events];

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    switch (scenarioId) {
      case 'ex1_prep_work':
        // Example 1: 1:45 PM, Wake Time = 12:30 PM, Target = 4, Work = Not Started
        newCurrentTime = '13:45';
        newWakeTime = '12:30';
        newDailyBaseTarget = 4;
        newCompletedDesigns = 0;
        newSession.isActive = false;
        newSession.isWorkTimerRunning = false;
        newSession.designs = newSession.designs.map(d => ({ ...d, isCompleted: false, isTimerRunning: false }));
        break;

      case 'ex2_mid_work':
        // Example 2: 5:00 PM, Work Started = 2:15 PM, Completed = 2 / 4
        newCurrentTime = '17:00';
        newWakeTime = '12:00';
        newDailyBaseTarget = 4;
        newCompletedDesigns = 2;
        newSession.isActive = true;
        newSession.isWorkTimerRunning = true;
        newSession.workStartTime = '14:15';
        newSession.designs = newSession.designs.map((d, idx) => ({
          ...d,
          isCompleted: idx < 2,
          isTimerRunning: idx === 2
        }));
        break;

      case 'ex3_target_completed':
        // Example 3: Completed = 4 / 4
        newCurrentTime = '18:30';
        newWakeTime = '12:00';
        newDailyBaseTarget = 4;
        newCompletedDesigns = 4;
        newSession.isActive = true;
        newSession.isWorkTimerRunning = false;
        newSession.designs = newSession.designs.map(d => ({ ...d, isCompleted: true, isTimerRunning: false }));
        break;

      case 'ex4_bonus_credit':
        // Example 4: Completed = 8 / 4 (+4 credit)
        newCurrentTime = '19:45';
        newDailyBaseTarget = 4;
        newCompletedDesigns = 8;
        newTotalCredit = Math.max(newTotalCredit, 4);
        newSession.isActive = false;
        break;

      case 'ex5_credit_covered':
        // Example 5: Production Credit = +4, Today Required Work = 0
        newCurrentTime = '14:00';
        newDailyBaseTarget = 0;
        newCompletedDesigns = 0;
        newTotalCredit = 4;
        newSession.isActive = false;
        break;

      case 'ex6_tomorrow_institute':
        // Example 6: Tomorrow = Institute at 9 AM, Current Time = 2:30 AM
        newCurrentTime = '02:30';
        if (!newEvents.some(e => e.date === tomorrowStr && e.type === 'institute')) {
          const instEvent: LifeEvent = {
            id: 'evt-institute-tomorrow',
            title: 'مشوار المعهد',
            date: tomorrowStr,
            startTime: '09:00',
            endTime: '14:00',
            type: 'institute',
            location: 'المعهد',
            notes: 'محاضرات الصباح',
            prepMinutes: 45,
          };
          newEvents.push(instEvent);
          setEvents(newEvents);
          await guideRepository.saveEvents(newEvents);
        }
        break;

      case 'ex7_late_wake':
        // Example 7: User woke up late at 4:00 PM, Current Time = 4:15 PM, Normal Work Start = 2:00 PM
        newCurrentTime = '16:15';
        newWakeTime = '16:00';
        newDailyBaseTarget = 4;
        newCompletedDesigns = 0;
        newSession.isActive = false;
        break;

      default:
        break;
    }

    handleSetSimulatedTime(newCurrentTime);

    const updatedPlan: DayPlan = {
      ...plan,
      actualWakeUpTime: newWakeTime,
      productionCredit: {
        ...plan.productionCredit,
        dailyBaseTarget: newDailyBaseTarget,
        todayCompletedDesigns: newCompletedDesigns,
        totalCreditBalance: newTotalCredit,
      },
      workdaySession: newSession,
    };

    setPlan(updatedPlan);
    await guideRepository.saveDayPlan(updatedPlan);
  }, [plan, currentTime, events, handleSetSimulatedTime]);

  return (
    <GuideContext.Provider
      value={{
        plan,
        loading,
        live,
        patterns,
        events,
        prayerState,
        sleepState,
        personalState,
        notes,
        settings,
        activeTab,
        setActiveTab,
        currentTime,
        isSimulatingTime,
        setSimulatedTime: handleSetSimulatedTime,
        resetToRealTime: handleResetToRealTime,
        currentEnergy,
        setEnergy: setCurrentEnergy,
        currentMood,
        setMood: setCurrentMood,
        addBlock: handleAddBlock,
        updateBlock: handleUpdateBlock,
        deleteBlock: handleDeleteBlock,
        toggleBlockComplete: handleToggleBlockComplete,
        recordActivity: handleRecordActivity,
        updateActualRecord: handleUpdateActualRecord,
        deleteActualRecord: handleDeleteActualRecord,
        endOngoingActivity: handleEndOngoingActivity,
        editingRecord,
        openEditActivityModal: (record) => {
          setEditingRecord(record);
          setIsCheckinModalOpen(true);
        },
        closeEditActivityModal: () => {
          setEditingRecord(null);
          setIsCheckinModalOpen(false);
        },
        updateIntention: handleUpdateIntention,

        // Events Hub
        addEvent: handleAddEvent,
        updateEvent: handleUpdateEvent,
        deleteEvent: handleDeleteEvent,
        isEventModalOpen,
        editingEvent,
        openAddEventModal: () => {
          setEditingEvent(null);
          setIsEventModalOpen(true);
        },
        openEditEventModal: (event) => {
          setEditingEvent(event);
          setIsEventModalOpen(true);
        },
        closeEventModal: () => {
          setEditingEvent(null);
          setIsEventModalOpen(false);
        },

        // Prayer Anchor
        togglePrayer: handleTogglePrayer,

        // Sleep Tracking
        recordSleep: handleRecordSleep,
        updateSleepRecord: handleUpdateSleepRecord,
        deleteSleepRecord: handleDeleteSleepRecord,
        isSleepModalOpen,
        editingSleepRecord,
        openLogSleepModal: () => {
          setEditingSleepRecord(null);
          setIsSleepModalOpen(true);
        },
        openEditSleepModal: (record) => {
          setEditingSleepRecord(record);
          setIsSleepModalOpen(true);
        },
        closeSleepModal: () => {
          setEditingSleepRecord(null);
          setIsSleepModalOpen(false);
        },

        // Personal Life & Habits
        logSuhaila: handleLogSuhaila,
        deleteSuhailaLog: handleDeleteSuhailaLog,
        logSocialMedia: handleLogSocialMedia,
        deleteSocialMediaLog: handleDeleteSocialMediaLog,
        recordRecovery: handleRecordRecovery,
        logFriendActivity: handleLogFriendActivity,
        deleteFriendActivity: handleDeleteFriendActivity,
        toggleHabit: handleToggleHabit,
        addHabit: handleAddHabit,
        deleteHabit: handleDeleteHabit,

        // Personal Life Modals
        isSuhailaModalOpen,
        openSuhailaModal: () => setIsSuhailaModalOpen(true),
        closeSuhailaModal: () => setIsSuhailaModalOpen(false),
        isSocialMediaModalOpen,
        openSocialMediaModal: () => setIsSocialMediaModalOpen(true),
        closeSocialMediaModal: () => setIsSocialMediaModalOpen(false),
        isRecoveryModalOpen,
        openRecoveryModal: () => setIsRecoveryModalOpen(true),
        closeRecoveryModal: () => setIsRecoveryModalOpen(false),
        isFriendModalOpen,
        openFriendModal: () => setIsFriendModalOpen(true),
        closeFriendModal: () => setIsFriendModalOpen(false),
        isAddHabitModalOpen,
        openAddHabitModal: () => setIsAddHabitModalOpen(true),
        closeAddHabitModal: () => setIsAddHabitModalOpen(false),

        adaptationOptions,
        isAdaptModalOpen,
        openAdaptModal: handleOpenAdaptModal,
        closeAdaptModal: () => setIsAdaptModalOpen(false),
        applyAdaptation: handleApplyAdaptation,
        updateDesignsCompleted: handleUpdateDesignsCompleted,
        useCredit: handleUseCredit,
        startWorkday: handleStartWorkday,
        endWorkday: handleEndWorkday,
        updateWorkdayLinks: handleUpdateWorkdayLinks,
        toggleDesignTimer: handleToggleDesignTimer,
        finishDesign: handleFinishDesign,
        addDesign: handleAddDesign,
        updateDesign: handleUpdateDesign,
        isCheckinModalOpen,
        openCheckinModal: () => setIsCheckinModalOpen(true),
        closeCheckinModal: () => setIsCheckinModalOpen(false),
        isArchitectureModalOpen,
        openArchitectureModal: () => setIsArchitectureModalOpen(true),
        closeArchitectureModal: () => setIsArchitectureModalOpen(false),

        // Notes Actions & Modals
        addNote: handleAddNote,
        updateNote: handleUpdateNote,
        deleteNote: handleDeleteNote,
        togglePinNote: handleTogglePinNote,
        isAddNoteModalOpen,
        openAddNoteModal: () => setIsAddNoteModalOpen(true),
        closeAddNoteModal: () => setIsAddNoteModalOpen(false),

        // Settings Actions
        updateSettings: handleUpdateSettings,

        // Normalized Entities & Ledger
        creditTransactions,
        creditSummary,
        dailyCheckIn,
        saveDailyCheckIn: handleSaveDailyCheckIn,
        userProfile,
        updateUserProfile: handleUpdateUserProfile,

        // Global Quick Actions
        isGlobalQuickActionOpen,
        openGlobalQuickAction: () => setIsGlobalQuickActionOpen(true),
        closeGlobalQuickAction: () => setIsGlobalQuickActionOpen(false),

        // Decision Engine Scenario Testing
        applyScenarioPreset: handleApplyScenarioPreset,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
};

export const useDailyGuide = (): GuideContextType => {
  const context = useContext(GuideContext);
  if (!context) {
    throw new Error('useDailyGuide must be used within a GuideProvider');
  }
  return context;
};
