
import React, { useEffect, Suspense, lazy } from 'react';
import { StatusBar } from './components/StatusBar';
import { BottomNav } from './components/BottomNav';
import { remindersService } from './services/reminders';
import { useAppStore } from './services/store';

// Dynamic Screen Imports (Code Splitting for Mobile PWA/TWA Performance)
const HomeScreen = lazy(() => import('./components/HomeScreen').then((m) => ({ default: m.HomeScreen })));
const DiaryScreen = lazy(() => import('./components/DiaryScreen').then((m) => ({ default: m.DiaryScreen })));
const RoutinesScreen = lazy(() => import('./components/RoutinesScreen').then((m) => ({ default: m.RoutinesScreen })));
const InsightsScreen = lazy(() => import('./components/InsightsScreen').then((m) => ({ default: m.InsightsScreen })));
const HealthScreen = lazy(() => import('./components/HealthScreen').then((m) => ({ default: m.HealthScreen })));

// Dynamic Modal & Heavy Component Imports
const ActivityBottomSheet = lazy(() => import('./components/modals/ActivityBottomSheet').then((m) => ({ default: m.ActivityBottomSheet })));
const BreastfeedingModal = lazy(() => import('./components/modals/BreastfeedingModal').then((m) => ({ default: m.BreastfeedingModal })));
const DiaperModal = lazy(() => import('./components/modals/DiaperModal').then((m) => ({ default: m.DiaperModal })));
const SleepModal = lazy(() => import('./components/modals/SleepModal').then((m) => ({ default: m.SleepModal })));
const MealModal = lazy(() => import('./components/modals/MealModal').then((m) => ({ default: m.MealModal })));
const FilterModal = lazy(() => import('./components/modals/FilterModal').then((m) => ({ default: m.FilterModal })));
const ManageActivitiesModal = lazy(() => import('./components/modals/ManageActivitiesModal').then((m) => ({ default: m.ManageActivitiesModal })));
const NewActivityModal = lazy(() => import('./components/modals/NewActivityModal').then((m) => ({ default: m.NewActivityModal })));
const AuthModal = lazy(() => import('./components/modals/AuthModal').then((m) => ({ default: m.AuthModal })));
const DockerVpsGuideModal = lazy(() => import('./components/modals/DockerVpsGuideModal').then((m) => ({ default: m.DockerVpsGuideModal })));
const CalendarSyncModal = lazy(() => import('./components/modals/CalendarSyncModal').then((m) => ({ default: m.CalendarSyncModal })));
const PermissionsDiagnosticsModal = lazy(() => import('./components/modals/PermissionsDiagnosticsModal').then((m) => ({ default: m.PermissionsDiagnosticsModal })));
const FeedbackPromptModal = lazy(() => import('./components/modals/FeedbackPromptModal').then((m) => ({ default: m.FeedbackPromptModal })));
const FeedbackManagementModal = lazy(() => import('./components/modals/FeedbackManagementModal').then((m) => ({ default: m.FeedbackManagementModal })));
const OfflineSyncModal = lazy(() => import('./components/modals/OfflineSyncModal').then((m) => ({ default: m.OfflineSyncModal })));
const NotificationCenterModal = lazy(() => import('./components/modals/NotificationCenterModal').then((m) => ({ default: m.NotificationCenterModal })));
const ThemeModal = lazy(() => import('./components/modals/ThemeModal').then((m) => ({ default: m.ThemeModal })));
const EditActivityModal = lazy(() => import('./components/modals/EditActivityModal').then((m) => ({ default: m.EditActivityModal })));
const SettingsSidebar = lazy(() => import('./components/SettingsSidebar').then((m) => ({ default: m.SettingsSidebar })));

// Lightweight Loading Spinner Fallback for Smooth View Switching
const ScreenFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3 min-h-[300px]">
    <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    <span className="text-xs font-semibold text-slate-400 tracking-wide animate-pulse">
      Carregando...
    </span>
  </div>
);

export default function App() {
  const {
    activeTab,
    selectedDate,
    selectedFilter,
    currentPalette,
    activeModal,
    activities,
    customActivities,
    dailySummary,
    currentUser,
    syncStatus,
    pendingAlarmsCount,
    feedbackTriggerContext,
    themeModalSection,
    editingActivity,

    setActiveTab,
    setSelectedDate,
    setSelectedFilter,
    setCurrentUser,
    openModal,
    closeModal,
    openThemeModal,
    openEditActivityModal,

    loadData,
    saveBreastfeeding,
    saveFormula,
    saveDiaper,
    saveSleep,
    saveMeal,
    quickTrack,
    deleteActivity,
    updateActivity,
    createCustomActivity,
    deleteCustomActivity,
    checkForFeedbackPrompt,
    initStore,
  } = useAppStore();

  useEffect(() => {
    const cleanup = initStore();
    return cleanup;
  }, [initStore]);

  return (
    <div
      className="min-h-screen h-[100dvh] w-full flex justify-center items-stretch text-slate-100 font-sans selection:bg-purple-600/30 selection:text-white overflow-hidden transition-colors duration-300 relative"
      style={{ backgroundColor: currentPalette.dominant }}
    >
      {/* Mobile Device Frame Container - Solid Minimalist Theme */}
      <main
        className="w-full max-w-[430px] landscape:max-w-xl sm:max-w-md md:max-w-lg lg:max-w-xl h-full max-h-[100dvh] flex flex-col relative shadow-2xl mx-auto overflow-hidden transition-all duration-200 border-x border-[#334155] z-10"
        data-purpose="mobile-viewport"
        style={{
          backgroundColor: currentPalette.dominant,
          borderColor: currentPalette.border,
        }}
      >
        {/* Native Mobile Status Bar (9:41, WiFi, Battery) */}
        <div className="relative z-20">
          <StatusBar onOpenOfflineSync={() => openModal('offlineSync')} />
        </div>

        {/* Dynamic Screen Tabs Container */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
          <Suspense fallback={<ScreenFallback />}>
            {activeTab === 'inicio' && (
              <HomeScreen
                currentUser={currentUser}
                activities={activities}
                onOpenAuth={() => openModal('auth')}
                onOpenDockerGuide={() => openModal('dockerGuide')}
                onOpenManageActivities={() => openModal('settingsSidebar')}
                onOpenNewActivity={() => openModal('newActivity')}
                onOpenActivitySheet={() => openModal('activitySheet')}
                onOpenSleepModal={() => openModal('sleep')}
                onOpenBreastfeedingModal={() => openModal('breastfeeding')}
                onOpenDiaperModal={() => openModal('diaper')}
                onOpenMealModal={() => openModal('meal')}
                onQuickTrack={quickTrack}
                onSaveFormula={saveFormula}
                onSaveBreastfeeding={saveBreastfeeding}
                onSaveDiaper={saveDiaper}
                customActivities={customActivities}
                onOpenFeedback={() => openModal('feedbackManagement')}
                onOpenOfflineSync={() => openModal('offlineSync')}
                onOpenNotificationCenter={() => openModal('notificationCenter')}
              />
            )}

            {activeTab === 'diario' && (
              <DiaryScreen
                activities={activities}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
                onOpenFilterModal={() => openModal('filter')}
                onOpenActivitySheet={() => openModal('activitySheet')}
                onDeleteActivity={deleteActivity}
                onUpdateActivity={updateActivity}
                onEditActivity={openEditActivityModal}
                dailySummary={dailySummary}
                onOpenCalendarSync={() => openModal('calendarSync')}
              />
            )}

            {activeTab === 'rotinas' && (
              <RoutinesScreen
                onOpenCalendarSync={() => openModal('calendarSync')}
                onOpenDiagnostics={() => openModal('diagnostics')}
                onOpenFeedback={() => openModal('feedbackManagement')}
                onOpenOfflineSync={() => openModal('offlineSync')}
              />
            )}

            {activeTab === 'insights' && <InsightsScreen />}

            {activeTab === 'saude' && <HealthScreen />}
          </Suspense>
        </div>

        {/* Mobile Bottom Navigation Bar (Persistent across all registration screens) - Floating glass dock */}
        <div className="shrink-0 z-30 w-full px-3 pb-3 pt-1 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-[400px] landscape:max-w-[480px] sm:max-w-[440px] mx-auto">
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        {/* Modals & Bottom Sheets (Wrapped in Suspense fallback={null}) */}
        <Suspense fallback={null}>
          <ActivityBottomSheet
            isOpen={activeModal === 'activitySheet'}
            onClose={closeModal}
            onSelectActivity={(type) => {
              if (type === 'sono') openModal('sleep');
              else if (type === 'amamentacao') openModal('breastfeeding');
              else if (type === 'fralda') openModal('diaper');
              else if (type === 'comeu') openModal('meal');
            }}
          />

          <BreastfeedingModal
            isOpen={activeModal === 'breastfeeding'}
            onClose={closeModal}
            onSave={saveBreastfeeding}
          />

          <DiaperModal
            isOpen={activeModal === 'diaper'}
            onClose={closeModal}
            onSave={saveDiaper}
          />

          <SleepModal
            isOpen={activeModal === 'sleep'}
            onClose={closeModal}
            onSave={saveSleep}
          />

          <MealModal
            isOpen={activeModal === 'meal'}
            onClose={closeModal}
            onSave={saveMeal}
          />

          <FilterModal
            isOpen={activeModal === 'filter'}
            onClose={closeModal}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />

          <ManageActivitiesModal
            isOpen={activeModal === 'manageActivities'}
            onClose={closeModal}
            activities={customActivities}
            onDeleteActivity={deleteCustomActivity}
            onOpenNewActivity={() => openModal('newActivity')}
            onOpenCalendarSync={() => openModal('calendarSync')}
            onOpenDiagnostics={() => openModal('diagnostics')}
            onOpenFeedback={() => openModal('feedbackManagement')}
            onOpenOfflineSync={() => openModal('offlineSync')}
            initialTab="reminders"
            initialSubTab="colors"
            onOpenSidebar={() => openModal('settingsSidebar')}
          />

          <ThemeModal
            isOpen={activeModal === 'theme'}
            section={themeModalSection || 'colors'}
            onClose={closeModal}
          />

          <NewActivityModal
            isOpen={activeModal === 'newActivity'}
            onClose={closeModal}
            onCreate={createCustomActivity}
          />

          <AuthModal
            isOpen={activeModal === 'auth'}
            onClose={closeModal}
            currentUser={currentUser}
            onUserChange={setCurrentUser}
          />

          <DockerVpsGuideModal
            isOpen={activeModal === 'dockerGuide'}
            onClose={closeModal}
          />

          <CalendarSyncModal
            isOpen={activeModal === 'calendarSync'}
            onClose={closeModal}
            onTriggerFeedback={() => checkForFeedbackPrompt('calendar')}
          />

          <PermissionsDiagnosticsModal
            isOpen={activeModal === 'diagnostics'}
            onClose={closeModal}
            onOpenCalendarSync={() => openModal('calendarSync')}
          />

          <FeedbackPromptModal
            isOpen={activeModal === 'feedbackPrompt'}
            onClose={closeModal}
            triggerContext={feedbackTriggerContext}
            userName={currentUser?.name || 'Papai/Mamãe'}
            userEmail={currentUser?.email || ''}
            onFeedbackSubmitted={loadData}
          />

          <FeedbackManagementModal
            isOpen={activeModal === 'feedbackManagement'}
            onClose={closeModal}
            onOpenNewFeedback={() => openModal('feedbackPrompt')}
          />

          <OfflineSyncModal
            isOpen={activeModal === 'offlineSync'}
            onClose={closeModal}
            onSyncComplete={loadData}
          />

          <NotificationCenterModal
            isOpen={activeModal === 'notificationCenter'}
            onClose={closeModal}
          />

          <EditActivityModal
            isOpen={activeModal === 'editActivity'}
            onClose={closeModal}
            activity={editingActivity}
            onSave={(id, updates) => updateActivity(id, updates)}
          />

          {/* Lateral Settings Sidebar / Navbar */}
          <SettingsSidebar
            isOpen={activeModal === 'settingsSidebar'}
            onClose={closeModal}
            onNavigateTo={(section) => {
              if (section === 'colors') openThemeModal('colors');
              else if (section === 'typography') openThemeModal('typography');
              else if (section === 'shapes') openThemeModal('shapes');
              else if (section === 'reminders') openModal('manageActivities');
              else if (section === 'calendar') openModal('calendarSync');
              else if (section === 'diagnostics') openModal('diagnostics');
              else if (section === 'notifications') openModal('notificationCenter');
              else if (section === 'sync' || section === 'offline') openModal('offlineSync');
              else if (section === 'feedback' || section === 'suggestions') openModal('feedbackManagement');
              else if (section === 'docker') openModal('dockerGuide');
            }}
            activeRemindersCount={remindersService.getActiveCount()}
            pendingAlarmsCount={pendingAlarmsCount}
            syncPendingCount={syncStatus.pendingCount}
            isOnline={syncStatus.isOnline}
            isSyncing={syncStatus.isSyncing}
          />
        </Suspense>
      </main>
    </div>
  );
}


