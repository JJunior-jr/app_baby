import React, { useState, useEffect } from 'react';
import { StatusBar } from './components/StatusBar';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { DiaryScreen } from './components/DiaryScreen';
import { RoutinesScreen } from './components/RoutinesScreen';
import { InsightsScreen } from './components/InsightsScreen';
import { HealthScreen } from './components/HealthScreen';

import { ActivityBottomSheet } from './components/modals/ActivityBottomSheet';
import { BreastfeedingModal } from './components/modals/BreastfeedingModal';
import { DiaperModal } from './components/modals/DiaperModal';
import { SleepModal } from './components/modals/SleepModal';
import { MealModal } from './components/modals/MealModal';
import { FilterModal } from './components/modals/FilterModal';
import { ManageActivitiesModal } from './components/modals/ManageActivitiesModal';
import { NewActivityModal } from './components/modals/NewActivityModal';
import { AuthModal } from './components/modals/AuthModal';
import { DockerVpsGuideModal } from './components/modals/DockerVpsGuideModal';
import { CalendarSyncModal } from './components/modals/CalendarSyncModal';
import { PermissionsDiagnosticsModal } from './components/modals/PermissionsDiagnosticsModal';

import { apiService } from './services/api';
import { authService } from './services/auth';
import { themeService, PaletteTheme } from './services/theme';
import {
  ActivityItem,
  ActivityType,
  CustomActivityDefinition,
  DailySummary,
  UserProfile,
} from './types';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<TabType>('diario');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-19');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [currentPalette, setCurrentPalette] = useState<PaletteTheme>(themeService.getCurrentPalette());

  // Core Data State
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [customActivities, setCustomActivities] = useState<CustomActivityDefinition[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary>({
    totalSleepMinutes: 336,
    breastfeedingSessions: 3,
    diaperChanges: 4,
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Modal Visibility State
  const [isActivitySheetOpen, setIsActivitySheetOpen] = useState(false);
  const [isBreastfeedingModalOpen, setIsBreastfeedingModalOpen] = useState(false);
  const [isDiaperModalOpen, setIsDiaperModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isManageActivitiesOpen, setIsManageActivitiesOpen] = useState(false);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDockerGuideOpen, setIsDockerGuideOpen] = useState(false);
  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Initialize data and theme on mount
  useEffect(() => {
    const pal = themeService.initTheme();
    setCurrentPalette(pal);
    const unsub = themeService.subscribe((p) => {
      setCurrentPalette(p);
    });

    loadData();
    // Check or create default parent user
    let user = authService.getCurrentUser();
    if (!user) {
      const res = authService.login('jacsonsajr.study@gmail.com', 'default123');
      user = res.user;
    }
    setCurrentUser(user);

    return unsub;
  }, []);

  const loadData = async () => {
    try {
      const [acts, customs, summary] = await Promise.all([
        apiService.getActivities(),
        apiService.getCustomActivities(),
        apiService.getDailySummary(selectedDate),
      ]);
      setActivities(acts);
      setCustomActivities(customs);
      setDailySummary(summary);
    } catch (err) {
      console.error('Erro ao carregar dados da API:', err);
    }
  };

  // Activity Sheet selection handler
  const handleSelectActivityType = (type: ActivityType) => {
    setIsActivitySheetOpen(false);
    if (type === 'sono') {
      setIsSleepModalOpen(true);
    } else if (type === 'amamentacao') {
      setIsBreastfeedingModalOpen(true);
    } else if (type === 'fralda') {
      setIsDiaperModalOpen(true);
    } else if (type === 'comeu') {
      setIsMealModalOpen(true);
    }
  };

  // Save Handlers
  const handleSaveBreastfeeding = async (data: any) => {
    const isFormula = data.mode === 'formula';
    const isBottle = isFormula || data.mode === 'bottle';
    const consumed = data.consumedMl ?? data.formulaMl ?? 120;
    const pct = data.consumedPercentage ?? (data.offeredMl ? Math.round((consumed / data.offeredMl) * 100) : 100);
    const milkLabel = data.milkType === 'maternal' ? 'Leite Materno' : 'Fórmula';

    let title = 'Amamentação';
    let subtitle = `Peito ${data.leftMinutes ? 'esquerdo' : 'direito'}`;

    if (isFormula || isBottle) {
      title = `Mamadeira (${milkLabel})`;
      subtitle = `${consumed}ml bebidos (${pct}%)`;
    }

    const newAct = await apiService.createActivity({
      type: 'amamentacao',
      title,
      subtitle,
      timestamp: new Date().toISOString(),
      dateStr: selectedDate,
      timeStr: '22:54',
      period: 'Noite',
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
    setActivities((prev) => [newAct, ...prev]);
    loadData();
  };

  const handleSaveFormula = async (data: any, notes?: string) => {
    const isObject = typeof data === 'object' && data !== null;
    const consumed = isObject ? (data.consumedMl ?? data.formulaMl) : data;
    const offered = isObject ? data.offeredMl : data;
    const leftover = isObject ? data.leftoverMl : 0;
    const pct = isObject ? data.consumedPercentage : 100;
    const milkType = isObject && data.milkType ? data.milkType : 'formula';
    const milkLabel = milkType === 'maternal' ? 'Leite Materno' : 'Fórmula';

    const newAct = await apiService.createActivity({
      type: 'amamentacao',
      title: `Mamadeira (${milkLabel})`,
      subtitle: `${consumed}ml bebidos (${pct}%)`,
      timestamp: new Date().toISOString(),
      dateStr: selectedDate,
      timeStr: '22:55',
      period: 'Noite',
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
    setActivities((prev) => [newAct, ...prev]);
    loadData();
  };

  const handleSaveDiaper = async (data: any) => {
    let title = 'Fralda (Xixi + Cocô)';
    if (data.diaperType === 'xixi') title = 'Fralda (Xixi)';
    if (data.diaperType === 'coco') title = 'Fralda (Cocô)';

    const newAct = await apiService.createActivity({
      type: 'fralda',
      title,
      timestamp: new Date().toISOString(),
      dateStr: selectedDate,
      timeStr: '23:10',
      period: 'Noite',
      assignee: currentUser?.name || 'Papai',
      details: data,
    });
    setActivities((prev) => [newAct, ...prev]);
    loadData();
  };

  const handleSaveSleep = async (data: any) => {
    const newAct = await apiService.createActivity({
      type: 'sono',
      title: data.sleepType === 'noturno' ? 'Sono Noturno' : 'Soneca',
      subtitle: data.isInProgress ? 'Em andamento' : 'Finalizado',
      timestamp: new Date().toISOString(),
      dateStr: selectedDate,
      timeStr: '22:38',
      period: 'Noite',
      isInProgress: data.isInProgress,
      assignee: currentUser?.name || 'Papai',
      details: data,
    });
    setActivities((prev) => [newAct, ...prev]);
    loadData();
  };

  const handleSaveMeal = async (data: any) => {
    const newAct = await apiService.createActivity({
      type: 'comeu',
      title: 'Refeição',
      subtitle: data.mealType === 'janta' ? 'Janta' : 'Lanche',
      timestamp: new Date().toISOString(),
      dateStr: selectedDate,
      timeStr: '23:05',
      period: 'Noite',
      assignee: currentUser?.name || 'Papai',
      details: data,
    });
    setActivities((prev) => [newAct, ...prev]);
    loadData();
  };

  // Quick Action Tracking (from Home screen)
  const handleQuickTrack = async (
    type: 'sleep' | 'diaper_xixi' | 'diaper_coco' | 'custom',
    customName?: string
  ) => {
    if (type === 'diaper_xixi') {
      await handleSaveDiaper({ diaperType: 'xixi' });
    } else if (type === 'diaper_coco') {
      await handleSaveDiaper({ diaperType: 'coco' });
    } else if (type === 'custom' && customName) {
      const newAct = await apiService.createActivity({
        type: 'custom',
        title: customName,
        timestamp: new Date().toISOString(),
        dateStr: selectedDate,
        timeStr: '23:05',
        period: 'Noite',
        assignee: currentUser?.name || 'Papai',
      });
      setActivities((prev) => [newAct, ...prev]);
      loadData();
    }
  };

  // Delete activity
  const handleDeleteActivity = async (id: string) => {
    await apiService.deleteActivity(id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
    loadData();
  };

  // Update activity
  const handleUpdateActivity = async (id: string, updates: Partial<ActivityItem>) => {
    const updated = await apiService.updateActivity(id, updates);
    if (updated) {
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
      loadData();
    }
  };

  // Custom activity definition creation
  const handleCreateCustomActivity = async (def: Omit<CustomActivityDefinition, 'id'>) => {
    const created = await apiService.createCustomActivity(def);
    setCustomActivities((prev) => [...prev, created]);
  };

  const handleDeleteCustomActivity = async (id: string) => {
    await apiService.deleteCustomActivity(id);
    setCustomActivities((prev) => prev.filter((c) => c.id !== id));
  };

  // Switch tab and guarantee navigation is always persistent and immediate
  const handleTabChange = (tab: TabType) => {
    setIsActivitySheetOpen(false);
    setIsBreastfeedingModalOpen(false);
    setIsDiaperModalOpen(false);
    setIsSleepModalOpen(false);
    setIsMealModalOpen(false);
    setIsFilterModalOpen(false);
    setIsManageActivitiesOpen(false);
    setIsNewActivityModalOpen(false);
    setIsAuthModalOpen(false);
    setIsDockerGuideOpen(false);
    setIsCalendarSyncOpen(false);
    setIsDiagnosticsOpen(false);
    setActiveTab(tab);
  };

  return (
    <div
      className="min-h-screen h-[100dvh] w-full flex justify-center items-stretch text-slate-100 font-sans selection:bg-purple-600/30 selection:text-white overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: currentPalette.dominant }}
    >
      {/* Mobile Device Frame Container with smooth landscape & portrait centering */}
      <main
        className="w-full max-w-[430px] landscape:max-w-xl sm:max-w-md md:max-w-lg lg:max-w-xl h-full max-h-[100dvh] flex flex-col relative shadow-2xl mx-auto overflow-hidden transition-all duration-300 border-x"
        data-purpose="mobile-viewport"
        style={{
          backgroundColor: currentPalette.dominant,
          borderColor: currentPalette.border,
        }}
      >
        {/* Native Mobile Status Bar (9:41, WiFi, Battery) */}
        <StatusBar />

        {/* Dynamic Screen Tabs Container */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activeTab === 'inicio' && (
            <HomeScreen
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenDockerGuide={() => setIsDockerGuideOpen(true)}
              onOpenManageActivities={() => setIsManageActivitiesOpen(true)}
              onOpenNewActivity={() => setIsNewActivityModalOpen(true)}
              onOpenActivitySheet={() => setIsActivitySheetOpen(true)}
              onOpenSleepModal={() => setIsSleepModalOpen(true)}
              onOpenBreastfeedingModal={() => setIsBreastfeedingModalOpen(true)}
              onOpenDiaperModal={() => setIsDiaperModalOpen(true)}
              onOpenMealModal={() => setIsMealModalOpen(true)}
              onQuickTrack={handleQuickTrack}
              onSaveFormula={handleSaveFormula}
              customActivities={customActivities}
            />
          )}

          {activeTab === 'diario' && (
            <DiaryScreen
              activities={activities}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              onOpenFilterModal={() => setIsFilterModalOpen(true)}
              onOpenActivitySheet={() => setIsActivitySheetOpen(true)}
              onDeleteActivity={handleDeleteActivity}
              onUpdateActivity={handleUpdateActivity}
              dailySummary={dailySummary}
              onOpenCalendarSync={() => setIsCalendarSyncOpen(true)}
            />
          )}

          {activeTab === 'rotinas' && (
            <RoutinesScreen
              onOpenCalendarSync={() => setIsCalendarSyncOpen(true)}
              onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
            />
          )}

          {activeTab === 'insights' && <InsightsScreen />}

          {activeTab === 'saude' && <HealthScreen />}
        </div>

        {/* Mobile Bottom Navigation Bar (Persistent across all registration screens) - Floating glass dock */}
        <div className="shrink-0 z-30 w-full px-3 pb-3 pt-1 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-[400px] landscape:max-w-[480px] sm:max-w-[440px] mx-auto">
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        </div>

        {/* Modals & Bottom Sheets (Always preserve bottom-nav visibility) */}
        <ActivityBottomSheet
          isOpen={isActivitySheetOpen}
          onClose={() => setIsActivitySheetOpen(false)}
          onSelectActivity={handleSelectActivityType}
        />

        <BreastfeedingModal
          isOpen={isBreastfeedingModalOpen}
          onClose={() => setIsBreastfeedingModalOpen(false)}
          onSave={handleSaveBreastfeeding}
        />

        <DiaperModal
          isOpen={isDiaperModalOpen}
          onClose={() => setIsDiaperModalOpen(false)}
          onSave={handleSaveDiaper}
        />

        <SleepModal
          isOpen={isSleepModalOpen}
          onClose={() => setIsSleepModalOpen(false)}
          onSave={handleSaveSleep}
        />

        <MealModal
          isOpen={isMealModalOpen}
          onClose={() => setIsMealModalOpen(false)}
          onSave={handleSaveMeal}
        />

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />

        <ManageActivitiesModal
          isOpen={isManageActivitiesOpen}
          onClose={() => setIsManageActivitiesOpen(false)}
          activities={customActivities}
          onDeleteActivity={handleDeleteCustomActivity}
          onOpenNewActivity={() => {
            setIsManageActivitiesOpen(false);
            setIsNewActivityModalOpen(true);
          }}
          onOpenCalendarSync={() => {
            setIsManageActivitiesOpen(false);
            setIsCalendarSyncOpen(true);
          }}
          onOpenDiagnostics={() => {
            setIsManageActivitiesOpen(false);
            setIsDiagnosticsOpen(true);
          }}
        />

        <NewActivityModal
          isOpen={isNewActivityModalOpen}
          onClose={() => setIsNewActivityModalOpen(false)}
          onCreate={handleCreateCustomActivity}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onUserChange={setCurrentUser}
        />

        <DockerVpsGuideModal
          isOpen={isDockerGuideOpen}
          onClose={() => setIsDockerGuideOpen(false)}
        />

        <CalendarSyncModal
          isOpen={isCalendarSyncOpen}
          onClose={() => setIsCalendarSyncOpen(false)}
        />

        <PermissionsDiagnosticsModal
          isOpen={isDiagnosticsOpen}
          onClose={() => setIsDiagnosticsOpen(false)}
          onOpenCalendarSync={() => setIsCalendarSyncOpen(true)}
        />
      </main>
    </div>
  );
}
