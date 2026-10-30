import { create } from 'zustand';
import { apiService } from './api';
import { authService } from './auth';
import { themeService, PaletteTheme } from './theme';
import { feedbackService, FeedbackPromptTrigger } from './feedback';
import { syncService } from './syncService';
import { remindersService } from './reminders';
import { notificationService } from './notificationService';
import {
  getBrazilDateString,
  getBrazilTimeString,
  getBrazilPeriod,
  syncGeolocationTimezone,
} from './brazilTime';
import {
  ActivityItem,
  ActivityType,
  CustomActivityDefinition,
  DailySummary,
  UserProfile,
  SyncStatusState,
} from '../types';
import { TabType } from '../components/BottomNav';

export type ModalType =
  | 'activitySheet'
  | 'breastfeeding'
  | 'diaper'
  | 'sleep'
  | 'meal'
  | 'filter'
  | 'manageActivities'
  | 'newActivity'
  | 'auth'
  | 'dockerGuide'
  | 'calendarSync'
  | 'diagnostics'
  | 'feedbackPrompt'
  | 'feedbackManagement'
  | 'offlineSync'
  | 'notificationCenter'
  | 'settingsSidebar'
  | 'theme'
  | 'editActivity'
  | null;

export interface AppState {
  // Navigation & View State
  activeTab: TabType;
  selectedDate: string;
  selectedFilter: string;
  currentPalette: PaletteTheme;

  // Active Unified Modal State
  activeModal: ModalType;
  modalData: any; // payload for modal if needed

  // Core Data State
  activities: ActivityItem[];
  customActivities: CustomActivityDefinition[];
  dailySummary: DailySummary;
  currentUser: UserProfile | null;
  syncStatus: SyncStatusState;
  pendingAlarmsCount: number;
  feedbackTriggerContext: FeedbackPromptTrigger | null;
  themeModalSection: 'colors' | 'typography' | 'shapes' | null;
  editingActivity: ActivityItem | null;

  // Actions
  setActiveTab: (tab: TabType) => void;
  setSelectedDate: (date: string) => void;
  setSelectedFilter: (filter: string) => void;
  setCurrentUser: (user: UserProfile | null) => void;
  
  // Modal Actions
  openModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;
  closeAllModals: () => void;
  openThemeModal: (section: 'colors' | 'typography' | 'shapes') => void;
  openEditActivityModal: (activity: ActivityItem) => void;

  // Data Handlers
  loadData: () => Promise<void>;
  saveBreastfeeding: (data: any) => Promise<void>;
  saveFormula: (data: any, notes?: string) => Promise<void>;
  saveDiaper: (data: any) => Promise<void>;
  saveSleep: (data: any) => Promise<void>;
  saveMeal: (data: any) => Promise<void>;
  quickTrack: (
    type: 'sleep' | 'diaper_xixi' | 'diaper_coco' | 'custom',
    customName?: string
  ) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  updateActivity: (id: string, updates: Partial<ActivityItem>) => Promise<void>;
  createCustomActivity: (def: Omit<CustomActivityDefinition, 'id'>) => Promise<void>;
  deleteCustomActivity: (id: string) => Promise<void>;
  checkForFeedbackPrompt: (
    type: 'activity' | 'calendar' | 'general',
    featureType?: string
  ) => void;
  initStore: () => () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation & View Defaults
  activeTab: 'diario',
  selectedDate: getBrazilDateString(),
  selectedFilter: 'all',
  currentPalette: themeService.getCurrentPalette(),

  // Modal Defaults
  activeModal: null,
  modalData: null,

  // Data Defaults
  activities: [],
  customActivities: [],
  dailySummary: {
    totalSleepMinutes: 0,
    breastfeedingSessions: 0,
    diaperChanges: 0,
  },
  currentUser: null,
  syncStatus: syncService.getSyncStatus(),
  pendingAlarmsCount: notificationService.getPendingCount(),
  feedbackTriggerContext: null,
  themeModalSection: null,
  editingActivity: null,

  // Setters
  setActiveTab: (tab) => {
    set({
      activeTab: tab,
      activeModal: null,
      themeModalSection: null,
    });
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().loadData();
  },

  setSelectedFilter: (filter) => set({ selectedFilter: filter }),
  setCurrentUser: (user) => set({ currentUser: user }),

  // Unified Modal Management
  openModal: (modal, data = null) => {
    set({ activeModal: modal, modalData: data });
  },

  closeModal: () => {
    set({
      activeModal: null,
      modalData: null,
      themeModalSection: null,
      editingActivity: null,
    });
  },

  closeAllModals: () => {
    set({
      activeModal: null,
      modalData: null,
      themeModalSection: null,
      editingActivity: null,
    });
  },

  openThemeModal: (section) => {
    set({
      themeModalSection: section,
      activeModal: 'theme',
    });
  },

  openEditActivityModal: (activity) => {
    set({
      editingActivity: activity,
      activeModal: 'editActivity',
    });
  },

  // Feedback Check Helper
  checkForFeedbackPrompt: (type, featureType) => {
    let trigger: FeedbackPromptTrigger | null = null;
    if (type === 'activity' && featureType) {
      trigger = feedbackService.recordActivityCreated(featureType);
    } else if (type === 'calendar') {
      trigger = feedbackService.recordFeatureMilestone('calendario');
    } else {
      trigger = feedbackService.recordInteraction();
    }

    if (trigger && trigger.shouldShow) {
      set({ feedbackTriggerContext: trigger });
      setTimeout(() => {
        get().openModal('feedbackPrompt');
      }, 900);
    }
  },

  // Data Loading
  loadData: async () => {
    try {
      const { selectedDate, selectedFilter } = get();
      const [acts, customs, summary] = await Promise.all([
        apiService.getActivities(undefined, selectedFilter),
        apiService.getCustomActivities(),
        apiService.getDailySummary(selectedDate),
      ]);
      set({
        activities: acts,
        customActivities: customs,
        dailySummary: summary,
      });
    } catch (err) {
      console.error('Erro ao carregar dados na store:', err);
    }
  },

  // Time context helper
  getCurrentTimeContext: () => {
    const now = new Date();
    const dateStr = getBrazilDateString(now);
    const timeStr = getBrazilTimeString(now);
    const period = getBrazilPeriod(now);
    return { now, dateStr, timeStr, period };
  },

  // Save Breastfeeding
  saveBreastfeeding: async (data: any) => {
    const now = new Date();
    const dateStr = getBrazilDateString(now);
    const timeStr = getBrazilTimeString(now);
    const period = getBrazilPeriod(now);

    const isFormula = data.mode === 'formula';
    const isBottle = isFormula || data.mode === 'bottle';
    const consumed = data.consumedMl ?? data.formulaMl ?? 120;
    const pct =
      data.consumedPercentage ??
      (data.offeredMl ? Math.round((consumed / data.offeredMl) * 100) : 100);
    const milkLabel = data.milkType === 'maternal' ? 'Leite Materno' : 'Fórmula';

    let title = 'Amamentação';
    let subtitle = `Peito ${data.leftMinutes ? 'esquerdo' : 'direito'}`;

    if (isFormula || isBottle) {
      title = `Mamadeira (${milkLabel})`;
      subtitle = `${consumed}ml bebidos (${pct}%)`;
    }

    const { currentUser } = get();
    const newAct = await apiService.createActivity({
      type: 'amamentacao',
      title,
      subtitle,
      timestamp: now.toISOString(),
      dateStr,
      timeStr,
      period,
      assignee: currentUser?.name || 'Papai',
      details: {
        ...data,
        formulaMl: consumed,
        breastfeeding: {
          mode: data.mode,
          milkType: data.milkType,
          offeredMl: data.offeredMl,
          leftoverMl: data.leftoverMl,
          consumedMl: consumed,
          consumedPercentage: pct,
          leftMinutes: data.leftMinutes,
          rightMinutes: data.rightMinutes,
        },
      },
    });

    set((state) => ({
      selectedDate: dateStr,
      activities: [newAct, ...state.activities],
    }));
    await get().loadData();
    get().checkForFeedbackPrompt('activity', 'amamentacao');
  },

  // Save Formula
  saveFormula: async (data: any, notes?: string) => {
    const now = new Date();
    const dateStr = getBrazilDateString(now);
    const timeStr = getBrazilTimeString(now);
    const period = getBrazilPeriod(now);

    const isObject = typeof data === 'object' && data !== null;
    const consumed = isObject ? (data.consumedMl ?? data.formulaMl) : data;
    const offered = isObject ? data.offeredMl : data;
    const leftover = isObject ? data.leftoverMl : 0;
    const pct = isObject ? data.consumedPercentage : 100;
    const milkType = isObject && data.milkType ? data.milkType : 'formula';
    const milkLabel = milkType === 'maternal' ? 'Leite Materno' : 'Fórmula';

    const { currentUser } = get();
    const newAct = await apiService.createActivity({
      type: 'amamentacao',
      title: `Mamadeira (${milkLabel})`,
      subtitle: `${consumed}ml bebidos (${pct}%)`,
      timestamp: now.toISOString(),
      dateStr,
      timeStr,
      period,
      assignee: currentUser?.name || 'Papai',
      details: {
        notes,
        formulaMl: consumed,
        breastfeeding: {
          mode: 'formula',
          milkType,
          offeredMl: offered,
          leftoverMl: leftover,
          consumedMl: consumed,
          consumedPercentage: pct,
        },
      },
    });

    set((state) => ({
      selectedDate: dateStr,
      activities: [newAct, ...state.activities],
    }));
    await get().loadData();
    get().checkForFeedbackPrompt('activity', 'amamentacao');
  },

  // Save Diaper
  saveDiaper: async (data: any) => {
    const now = new Date();
    const dateStr = getBrazilDateString(now);
    const timeStr = getBrazilTimeString(now);
    const period = getBrazilPeriod(now);

    let title = 'Fralda (Xixi + Cocô)';
    if (data.diaperType === 'xixi') title = 'Fralda (Xixi)';
    if (data.diaperType === 'coco') title = 'Fralda (Cocô)';

    const { currentUser } = get();
    const newAct = await apiService.createActivity({
      type: 'fralda',
      title,
      timestamp: now.toISOString(),
      dateStr,
      timeStr,
      period,
      assignee: currentUser?.name || 'Papai',
      details: data,
    });

    set((state) => ({
      selectedDate: dateStr,
      activities: [newAct, ...state.activities],
    }));
    await get().loadData();
    get().checkForFeedbackPrompt('activity', 'fralda');
  },

  // Save Sleep
  saveSleep: async (data: any) => {
    const now = new Date();
    const dateStr = getBrazilDateString(now);
    const timeStr = getBrazilTimeString(now);
    const period = getBrazilPeriod(now);

    const { currentUser } = get();
    const newAct = await apiService.createActivity({
      type: 'sono',
      title: data.sleepType === 'noturno' ? 'Sono Noturno' : 'Soneca',
      subtitle: data.isInProgress ? 'Em andamento' : 'Finalizado',
      timestamp: now.toISOString(),
      dateStr,
      timeStr,
      period,
      isInProgress: data.isInProgress,
      assignee: currentUser?.name || 'Papai',
      details: data,
    });

    set((state) => ({
      selectedDate: dateStr,
      activities: [newAct, ...state.activities],
    }));
    await get().loadData();
    get().checkForFeedbackPrompt('activity', 'sono');
  },

  // Save Meal
  saveMeal: async (data: any) => {
    const now = new Date();
    const dateStr = getBrazilDateString(now);
    const timeStr = getBrazilTimeString(now);
    const period = getBrazilPeriod(now);

    const { currentUser } = get();
    const newAct = await apiService.createActivity({
      type: 'comeu',
      title: 'Refeição',
      subtitle: data.mealType === 'janta' ? 'Janta' : 'Lanche',
      timestamp: now.toISOString(),
      dateStr,
      timeStr,
      period,
      assignee: currentUser?.name || 'Papai',
      details: data,
    });

    set((state) => ({
      selectedDate: dateStr,
      activities: [newAct, ...state.activities],
    }));
    await get().loadData();
    get().checkForFeedbackPrompt('activity', 'comeu');
  },

  // Quick Track
  quickTrack: async (type, customName) => {
    const { saveDiaper, currentUser, loadData } = get();
    if (type === 'diaper_xixi') {
      await saveDiaper({ diaperType: 'xixi' });
    } else if (type === 'diaper_coco') {
      await saveDiaper({ diaperType: 'coco' });
    } else if (type === 'custom' && customName) {
      const now = new Date();
      const dateStr = getBrazilDateString(now);
      const timeStr = getBrazilTimeString(now);
      const period = getBrazilPeriod(now);

      const newAct = await apiService.createActivity({
        type: 'custom',
        title: customName,
        timestamp: now.toISOString(),
        dateStr,
        timeStr,
        period,
        assignee: currentUser?.name || 'Papai',
      });

      set((state) => ({
        selectedDate: dateStr,
        activities: [newAct, ...state.activities],
      }));
      await loadData();
    }
  },

  // Delete Activity
  deleteActivity: async (id) => {
    await apiService.deleteActivity(id);
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }));
    await get().loadData();
  },

  // Update Activity
  updateActivity: async (id, updates) => {
    const updated = await apiService.updateActivity(id, updates);
    if (updated) {
      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      }));
      await get().loadData();
    }
  },

  // Custom Activities Definition
  createCustomActivity: async (def) => {
    const created = await apiService.createCustomActivity(def);
    set((state) => ({
      customActivities: [...state.customActivities, created],
    }));
  },

  deleteCustomActivity: async (id) => {
    await apiService.deleteCustomActivity(id);
    set((state) => ({
      customActivities: state.customActivities.filter((c) => c.id !== id),
    }));
  },

  // Initialize Listeners & System Integrations
  initStore: () => {
    // Theme
    const pal = themeService.initTheme();
    set({ currentPalette: pal });
    const unsubTheme = themeService.subscribe((p) => {
      set({ currentPalette: p });
    });

    // Initial user login / check
    let user = authService.getCurrentUser();
    if (!user) {
      const res = authService.login('jacsonsajr.study@gmail.com', 'default123');
      user = res.user;
    }
    set({ currentUser: user });

    // Initial Data Load
    get().loadData();

    // Geolocation sync
    syncGeolocationTimezone().then(() => {
      set({ selectedDate: getBrazilDateString() });
    });

    // Notifications & Sync Services
    notificationService.init();
    const unsubSync = syncService.subscribe((status) => {
      set({ syncStatus: status });
      if (!status.isSyncing && status.pendingCount === 0) {
        get().loadData();
      }
    });

    const unsubNotif = notificationService.subscribe(() => {
      set({ pendingAlarmsCount: notificationService.getPendingCount() });
    });

    const handleFocusSync = () => {
      set({ selectedDate: getBrazilDateString() });
    };
    window.addEventListener('focus', handleFocusSync);
    document.addEventListener('visibilitychange', handleFocusSync);

    // Engagement interval
    const engagementInterval = setInterval(() => {
      const trigger = feedbackService.recordInteraction();
      if (trigger.shouldShow) {
        set({ feedbackTriggerContext: trigger });
        get().openModal('feedbackPrompt');
      }
    }, 45000);

    return () => {
      unsubTheme();
      unsubSync();
      unsubNotif();
      clearInterval(engagementInterval);
      window.removeEventListener('focus', handleFocusSync);
      document.removeEventListener('visibilitychange', handleFocusSync);
    };
  },
}));
