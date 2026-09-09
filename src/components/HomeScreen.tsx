import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Baby,
  Utensils,
  Plus,
  Settings,
  LayoutGrid,
  List,
  Sparkles,
  Send,
  Info,
  CheckCircle2,
  Clock,
  Shirt,
  Moon,
  Volume2,
  MessageSquareHeart,
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react';
import { ActivityItem, CustomActivityDefinition, UserProfile, SyncStatusState } from '../types';
import { FormulaDrawer } from './modals/FormulaDrawer';
import { remindersService } from '../services/reminders';
import { syncService } from '../services/syncService';
import { SleepGaugeView } from './SleepGaugeView';

interface HomeScreenProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenDockerGuide: () => void;
  onOpenManageActivities: () => void;
  onOpenNewActivity: () => void;
  onOpenActivitySheet: () => void;
  onOpenSleepModal: () => void;
  onOpenBreastfeedingModal: () => void;
  onOpenDiaperModal: () => void;
  onOpenMealModal: () => void;
  onQuickTrack: (type: 'sleep' | 'diaper_xixi' | 'diaper_coco' | 'custom', customName?: string) => void;
  onSaveFormula?: (data: any, notes?: string) => void;
  customActivities: CustomActivityDefinition[];
  onOpenFeedback?: () => void;
  onOpenOfflineSync?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  onOpenAuth,
  onOpenDockerGuide,
  onOpenManageActivities,
  onOpenNewActivity,
  onOpenActivitySheet,
  onOpenSleepModal,
  onOpenBreastfeedingModal,
  onOpenDiaperModal,
  onOpenMealModal,
  onQuickTrack,
  onSaveFormula,
  customActivities,
  onOpenFeedback,
  onOpenOfflineSync,
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>(() => syncService.getSyncStatus());
  // Sleep state and timers
  const [isSleeping, setIsSleeping] = useState<boolean>(true);
  const [sleepAnimation, setSleepAnimation] = useState<boolean>(false);
  const [sleepSeconds, setSleepSeconds] = useState<number>(14 * 60); // Starts at 14m in progress
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [homeViewType, setHomeViewType] = useState<'cards' | 'gauge'>(() => {
    try {
      return (localStorage.getItem('babyjohn_home_view') as 'cards' | 'gauge') || 'cards';
    } catch {
      return 'cards';
    }
  });

  const handleSetHomeViewType = (type: 'cards' | 'gauge') => {
    setHomeViewType(type);
    try {
      localStorage.setItem('babyjohn_home_view', type);
    } catch {}
  };
  // UI Visibility Flags (preservando o código original intacto)
  const isAiAssistantVisible = false; // Desativado para não aparecer na interface do usuário
  const isBabyJohnVisible = false; // Desabilitado e sem ficar visível na interface do usuário
  const isRoutineLevelVisible = false; // Desabilitado e sem ficar visível na interface do usuário (contabilização de rotina e nível)

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Breastfeeding timer state (item 4)
  const [activeBreastSide, setActiveBreastSide] = useState<'left' | 'right' | null>(null);
  const [nursingSeconds, setNursingSeconds] = useState<number>(0);
  const [isFormulaDrawerOpen, setIsFormulaDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeRemindersCount, setActiveRemindersCount] = useState<number>(() => remindersService.getActiveCount());

  useEffect(() => {
    const syncReminders = () => {
      setActiveRemindersCount(remindersService.getActiveCount());
    };
    syncReminders();
    window.addEventListener('focus', syncReminders);
    return () => window.removeEventListener('focus', syncReminders);
  }, []);

  // Sync state subscription
  useEffect(() => {
    const unsubscribe = syncService.subscribe((status) => {
      setSyncStatus(status);
    });
    return () => unsubscribe();
  }, []);

  // Real-time sleep timer when isSleeping is active
  useEffect(() => {
    let sleepInterval: NodeJS.Timeout | null = null;
    if (isSleeping) {
      sleepInterval = setInterval(() => {
        setSleepSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (sleepInterval) clearInterval(sleepInterval);
    };
  }, [isSleeping]);

  // Real-time nursing timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeBreastSide) {
      interval = setInterval(() => {
        setNursingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeBreastSide]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const formatSleepTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${Math.max(1, mins)}min`;
  };

  const formatNursingTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle side click (item 4)
  const handleBreastSideClick = (side: 'left' | 'right') => {
    if (activeBreastSide === side) {
      // Toggle off and save
      const minutesElapsed = Math.max(1, Math.round(nursingSeconds / 60));
      const sideLabel = side === 'left' ? 'Lado Esquerdo' : 'Lado Direito';
      onQuickTrack('custom', `Amamentação (${sideLabel} - ${minutesElapsed} min)`);
      setActiveBreastSide(null);
      setNursingSeconds(0);
      showToast(`Amamentação no ${sideLabel} (${minutesElapsed} min) registrada! 🤱`);
    } else {
      // Switch or start
      setActiveBreastSide(side);
      if (!activeBreastSide) {
        setNursingSeconds(0);
      }
      showToast(`Cronômetro iniciado: Lado ${side === 'left' ? 'Esquerdo' : 'Direito'} ⏱️`);
    }
  };

  // Handle sleep click with green animation, returning to yellow with in-progress status
  const handleSleepClick = () => {
    if (!isSleeping) {
      // Start sleeping: trigger green registration animation
      setSleepAnimation(true);
      setIsSleeping(true);
      setSleepSeconds(0);
      onQuickTrack('sleep');
      showToast('Soneca registrada! John começou a dormir 🌙💤');
      // After 1.4s, green animation ends and card returns to yellow showing "Em andamento"
      setTimeout(() => {
        setSleepAnimation(false);
      }, 1400);
    } else {
      // If already sleeping, clicking asks to finish or opens fine details
      const durationText = formatSleepTime(sleepSeconds);
      setIsSleeping(false);
      setSleepSeconds(0);
      showToast(`Soneca finalizada (${durationText})! John acordou ☀️`);
    }
  };

  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setAiResponse(
      `👶 Sobre o John: Ele dormiu bem na última noite e a próxima janela de sono ideal é por volta das 00:44. Mantenha o ambiente calmo e meia-luz.`
    );
  };

  const handleConfirmFormula = (data: any, notes?: string) => {
    const isObject = typeof data === 'object' && data !== null;
    const consumed = isObject ? data.consumedMl : data;
    const pct = isObject ? data.consumedPercentage : 100;
    if (onSaveFormula) {
      onSaveFormula(data, notes);
    } else {
      onQuickTrack('custom', `Mamadeira (${consumed}ml - ${pct}%)`);
    }
    showToast(`Mamadeira registrada: ${consumed}ml (${pct}%)! 🍼`);
  };

  // If user selected minimalist sleep gauge view, render SleepGaugeView
  if (homeViewType === 'gauge') {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <SleepGaugeView
          currentUser={currentUser}
          isSleeping={isSleeping}
          sleepSeconds={sleepSeconds}
          onToggleSleep={handleSleepClick}
          onOpenSleepModal={onOpenSleepModal}
          onOpenDiaperModal={onOpenDiaperModal}
          onOpenFormulaDrawer={() => setIsFormulaDrawerOpen(true)}
          onSwitchToCardsView={() => handleSetHomeViewType('cards')}
        />
        {/* Formula Drawer can still be opened from quick action */}
        <FormulaDrawer
          isOpen={isFormulaDrawerOpen}
          onClose={() => setIsFormulaDrawerOpen(false)}
          onConfirm={handleConfirmFormula}
        />
        {/* Toast feedback notification */}
        {toastMessage && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#7158e2] text-white text-xs font-bold shadow-2xl border border-purple-400 flex items-center space-x-2 animate-in fade-in slide-in-from-top-3">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 landscape:px-6 pt-2 pb-6 space-y-4 no-scrollbar">
      
      {/* Toast feedback notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#7158e2] text-white text-xs font-bold shadow-2xl border border-purple-400 flex items-center space-x-2 animate-in fade-in slide-in-from-top-3">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header: Baby Avatar + Greeting + Baby John Badge + Notifications */}
      <header className="flex items-center justify-between pt-1">
        {/* Left: Avatar & Greeting */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              type="button"
              onClick={onOpenAuth}
              title="Gerenciar Conta & JWT"
              className="w-13 h-13 rounded-full bg-[#242842] border-2 border-purple-500/40 flex items-center justify-center text-2xl shadow-md active:scale-95 transition"
            >
              👶
            </button>
            <button
              type="button"
              onClick={onOpenAuth}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#7158e2] border-2 border-[#0c0d16] flex items-center justify-center text-white text-xs font-bold"
            >
              +
            </button>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              Boa noite, {currentUser?.name || 'Papai'}!
            </h1>
            <p className="text-xs text-[#8c91af] flex items-center gap-1 mt-0.5">
              <span>{currentUser?.babyName || 'John'} está {isSleeping ? 'dormindo...' : 'acordado'}</span>
              <span>{isSleeping ? '😴' : '👀'}</span>
              {isSleeping && <span className="text-xs">🌙</span>}
            </p>
          </div>
        </div>

        {/* Right: Baby John badge (desabilitado e invisível na UI, código preservado) + Bell */}
        <div className="flex items-center space-x-2">
          {isBabyJohnVisible && (
            <button
              type="button"
              disabled
              onClick={onOpenDockerGuide}
              className="hidden pointer-events-none items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-[#201d42] border border-[#52449a]/60 text-xs font-bold text-white shadow-sm hover:border-purple-400 transition"
              aria-hidden="true"
            >
              <span className="text-amber-400 text-xs">👶</span>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] font-black text-amber-300 tracking-wider">Baby</span>
                <span className="text-[7.5px] text-purple-200 tracking-tighter">John</span>
              </div>
            </button>
          )}

          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              title="Opiniões & Sugestões do App"
              className="w-9 h-9 rounded-full bg-[#201738] border border-purple-500/30 flex items-center justify-center text-purple-300 hover:text-white transition active:scale-95 cursor-pointer shadow-xs"
            >
              <MessageSquareHeart className="w-4 h-4" />
            </button>
          )}

          {onOpenOfflineSync && (
            <button
              type="button"
              onClick={onOpenOfflineSync}
              title={
                syncStatus.isSyncing
                  ? 'Sincronizando dados com o banco...'
                  : syncStatus.isOnline
                  ? 'Online: Sincronização com o Banco Ativa'
                  : 'Modo Offline: Clique para gerenciar a fila'
              }
              className={`h-9 px-2.5 rounded-full flex items-center space-x-1.5 transition active:scale-95 cursor-pointer shadow-xs ${
                syncStatus.isSyncing
                  ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                  : !syncStatus.isOnline
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                  : syncStatus.pendingCount > 0
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                  : 'bg-[#181a2d] border border-gray-800 text-emerald-400 hover:text-white'
              }`}
            >
              {syncStatus.isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-300" />
                  <span className="text-[11px] font-bold">Gravando</span>
                </>
              ) : !syncStatus.isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[11px] font-bold">
                    Offline{syncStatus.pendingCount > 0 ? ` (${syncStatus.pendingCount})` : ''}
                  </span>
                </>
              ) : syncStatus.pendingCount > 0 ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-purple-300" />
                  <span className="text-[11px] font-bold">{syncStatus.pendingCount} pendentes</span>
                </>
              ) : (
                <Cloud className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          )}

          {/* Quick toggle to Minimalist Gauge View */}
          <button
            type="button"
            onClick={() => handleSetHomeViewType('gauge')}
            title="Abrir Visão Minimalista em Gauge do Sono"
            className="h-9 px-2.5 rounded-full bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/40 text-purple-200 hover:text-white flex items-center space-x-1.5 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <span className="text-xs">⭕</span>
            <span className="text-[11px] font-bold">Gauge</span>
          </button>

          <button
            type="button"
            onClick={onOpenAuth}
            title="Notificações & JWT"
            className="w-9 h-9 rounded-full bg-[#181a2d] border border-gray-800 flex items-center justify-center text-gray-300 hover:text-white transition"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Offline Alert Banner (shown when offline or has pending items to sync) */}
      {(!syncStatus.isOnline || syncStatus.pendingCount > 0) && onOpenOfflineSync && (
        <div
          onClick={onOpenOfflineSync}
          className={`p-3 rounded-2xl border flex items-center justify-between transition cursor-pointer active:scale-98 text-xs shadow-sm ${
            !syncStatus.isOnline
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-purple-950/40 border-purple-500/40 text-purple-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {!syncStatus.isOnline ? (
              <WifiOff className="w-4 h-4 text-amber-300 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-purple-300 shrink-0" />
            )}
            <span className="text-[11.5px] font-medium leading-snug">
              {!syncStatus.isOnline
                ? 'Modo Offline Ativo: Mamadas e atividades são salvas no aparelho e gravadas no banco ao reconectar.'
                : `${syncStatus.pendingCount} ite${syncStatus.pendingCount === 1 ? 'm pendente' : 'ns pendentes'} para gravar no banco.`}
            </span>
          </div>
          <span className="text-[10.5px] font-bold underline shrink-0 ml-2 text-white">
            Ver Fila
          </span>
        </div>
      )}

      {/* Top Banner Row */}
      <div className="flex flex-col gap-3">
        {/* Next Nap Info Card */}
        <section className="bg-[#151728] border border-[#262a44] rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2.5">
            <span className="text-base">🌙</span>
            <p className="text-xs text-gray-300">
              Próxima soneca <span className="font-extrabold text-white">00:44</span> · em 1h 40min
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleSetHomeViewType('gauge')}
              className="px-2 py-0.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-[10.5px] font-bold text-purple-200 hover:text-white transition flex items-center gap-1 cursor-pointer"
              title="Abrir gráfico de gauge do sono"
            >
              <span>⭕</span>
              <span>Visão Gauge</span>
            </button>
            <button
              type="button"
              onClick={onOpenSleepModal}
              className="text-gray-400 hover:text-gray-200 p-0.5"
              title="Detalhes do sono"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* VIP AI Assistant Bar (Desativado da interface do usuário, código preservado) */}
        {isAiAssistantVisible && (
          <section className="relative bg-[#16182a] border border-[#272a44] rounded-2xl p-3 shadow-sm">
            <div className="absolute -top-2 left-4 px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-[8.5px] font-black text-[#1c1917] tracking-wider uppercase flex items-center gap-1 shadow-sm">
              <span>👑 VIP</span>
            </div>

            <form onSubmit={handleAiAsk} className="flex items-center space-x-2.5 mt-1">
              <div className="relative w-9 h-9 rounded-xl bg-[#2b224c] border border-purple-500/30 flex items-center justify-center text-lg shrink-0">
                <span>🧑‍🍼</span>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#16182a]"></span>
              </div>

              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder={`Pergunte algo sobre o ${currentUser?.babyName || 'John'}...`}
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-400 focus:outline-none"
              />

              <button
                type="submit"
                aria-label="Enviar pergunta"
                className="w-8 h-8 rounded-xl bg-[#7158e2] text-white flex items-center justify-center active:scale-95 shadow-md shadow-purple-600/30 transition shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {aiResponse && (
              <div className="mt-2.5 pt-2 border-t border-white/5 text-[11px] text-purple-200 leading-relaxed bg-[#1b1933]/60 p-2.5 rounded-xl">
                {aiResponse}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Section: "O que aconteceu agora?" + Settings Gear & Grid Toggle */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">O que aconteceu agora?</h2>
          
          <div className="flex items-center space-x-1.5">
            {/* Settings button with dynamic active reminders badge */}
            <button
              type="button"
              onClick={onOpenManageActivities}
              title="Gerenciar Atividades & Lembretes"
              className="relative p-2 rounded-xl bg-[#171a2d] border border-gray-800 text-gray-300 hover:text-white transition"
            >
              <Settings className="w-4 h-4" />
              {activeRemindersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center border border-[#0c0d16]">
                  {activeRemindersCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-[#171a2d] border border-gray-800 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setViewMode('grid');
                  handleSetHomeViewType('cards');
                }}
                title="Grade de Cards 2x2"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' && homeViewType === 'cards' ? 'bg-[#7158e2] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  handleSetHomeViewType('cards');
                }}
                title="Lista de Atividades"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' && homeViewType === 'cards' ? 'bg-[#7158e2] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSetHomeViewType('gauge')}
                title="Visão Minimalista / Gauge do Sono"
                className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/40 transition flex items-center justify-center text-xs font-bold"
              >
                <span>⭕</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Mode: Card (Grid 2x2: 2 em cima, 2 embaixo) vs List (um embaixo do outro) */}
        {viewMode === 'grid' ? (
          /* Strict 2x2 Grid: 4 Liquid Action Elements */
          <div className="grid grid-cols-2 gap-3 w-full animate-in fade-in-50 duration-200">
            
            {/* Card 1: Sono (Liquid Gel Âmbar/Mel) */}
            <motion.button
              type="button"
              onClick={handleSleepClick}
              whileTap={{ scale: 0.93, y: 2 }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className={`h-36 rounded-3xl p-4 flex flex-col justify-between text-left relative overflow-hidden backdrop-blur-2xl group select-none ${
                sleepAnimation
                  ? 'bg-gradient-to-br from-emerald-400/40 via-teal-500/35 to-emerald-600/35 text-white shadow-[0_12px_35px_rgba(16,185,129,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.5),inset_0_-2px_6px_rgba(0,0,0,0.25)] border border-emerald-300/60 ring-2 ring-emerald-400/60'
                  : isSleeping
                    ? 'bg-gradient-to-br from-emerald-500/30 via-teal-500/20 to-emerald-600/20 border border-emerald-300/45 shadow-[0_12px_32px_rgba(16,185,129,0.2),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.25)] text-white hover:border-emerald-300/60'
                    : 'bg-gradient-to-br from-amber-400/25 via-amber-500/18 to-yellow-600/12 border border-amber-300/40 hover:border-amber-300/60 shadow-[0_12px_32px_rgba(245,158,11,0.18),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.25)] text-white'
              }`}
            >
              {/* Liquid Upper Convex Lens Highlight */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/35 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />
              {/* Liquid Diagonal Shimmer Beam */}
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
              {/* Bottom Caustic Glow */}
              <div className={`absolute -bottom-2 inset-x-4 h-5 rounded-full blur-md pointer-events-none ${isSleeping ? 'bg-emerald-400/30' : 'bg-amber-400/30'}`} />

              {sleepAnimation ? (
                /* Animação Verde de Confirmação do Registro */
                <div className="flex flex-col items-center justify-center my-auto w-full text-center space-y-2 animate-in zoom-in-75 duration-200 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#16a34a] shadow-[0_4px_16px_rgba(22,163,74,0.4)]">
                    <CheckCircle2 className="w-8 h-8 fill-current stroke-white animate-bounce" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-wider text-white drop-shadow">
                      Registrado!
                    </span>
                    <span className="text-[11px] font-medium text-emerald-100">
                      Soneca iniciada com sucesso
                    </span>
                  </div>
                </div>
              ) : (
                /* Card Sono em Vidro Líquido */
                <>
                  {/* Top row with title "Dormiu" + Gauge shortcut button */}
                  <div className="flex items-center justify-between w-full relative z-10">
                    <span className="text-base font-extrabold tracking-tight text-white drop-shadow-xs">
                      Dormiu
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetHomeViewType('gauge');
                      }}
                      title="Abrir no modo Gauge Minimalista"
                      className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-[10px] font-bold text-amber-100 hover:text-white flex items-center gap-1 transition shadow-xs"
                    >
                      <span>⭕</span>
                      <span>Gauge</span>
                    </button>
                  </div>

                  {/* Center Visual State: Lua 🌛 + Pill identificando estado */}
                  <div className="flex items-center justify-center space-x-2.5 my-auto relative z-10">
                    <span className="text-3xl drop-shadow-sm select-none group-hover:scale-110 transition-transform duration-200">🌛</span>
                    {isSleeping ? (
                      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/25 text-white shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-bold tracking-tight">
                          Em andamento 💤
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                        há agora
                      </span>
                    )}
                  </div>

                  {/* Bottom Status Text */}
                  <div className="flex items-center justify-between w-full text-[10.5px] font-medium text-amber-100/90 relative z-10">
                    <span>
                      {isSleeping
                        ? `⏱️ Soneca: ${formatSleepTime(sleepSeconds)}`
                        : 'Toque para iniciar'}
                    </span>
                    <span className="font-bold text-white">
                      {isSleeping ? 'Toque p/ acordar' : 'Pendente'}
                    </span>
                  </div>
                </>
              )}
            </motion.button>

            {/* Card 2: Amamentação (Liquid Gel Lavanda/Violeta) */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className={`h-36 rounded-3xl p-3.5 bg-gradient-to-br from-violet-500/28 via-purple-500/18 to-indigo-500/18 backdrop-blur-2xl text-white flex flex-col justify-between relative cursor-pointer border overflow-hidden select-none group ${
                activeBreastSide
                  ? 'border-purple-300/90 ring-2 ring-purple-400/50 shadow-[0_12px_32px_rgba(139,92,246,0.3),inset_0_1.5px_2px_rgba(255,255,255,0.45),inset_0_-2px_6px_rgba(0,0,0,0.25)]'
                  : 'border-purple-300/35 hover:border-purple-300/60 shadow-[0_12px_32px_rgba(139,92,246,0.18),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.25)]'
              }`}
              onClick={onOpenBreastfeedingModal}
            >
              {/* Liquid Upper Convex Lens Highlight */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/35 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />
              {/* Liquid Diagonal Shimmer Beam */}
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
              {/* Bottom Caustic Glow */}
              <div className="absolute -bottom-2 inset-x-4 h-5 bg-purple-500/30 rounded-full blur-md pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className="text-base font-extrabold tracking-tight truncate">Amamentação</span>
                  {activeBreastSide && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                  )}
                </div>
                <Baby className="w-5 h-5 opacity-90 shrink-0 text-purple-200 group-hover:scale-110 transition-transform duration-200" />
              </div>

              {/* Quick side liquid buttons */}
              <div className="grid grid-cols-3 gap-1.5 w-full pt-1 relative z-10" onClick={(e) => e.stopPropagation()}>
                {/* Botão Esquerdo */}
                <motion.button
                  type="button"
                  onClick={() => handleBreastSideClick('left')}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className={`w-full py-1.5 px-1 rounded-xl text-[10.5px] font-extrabold flex items-center justify-center space-x-1 backdrop-blur-md relative overflow-hidden shadow-xs ${
                    activeBreastSide === 'left'
                      ? 'bg-white/95 text-[#131127] shadow-[0_4px_12px_rgba(255,255,255,0.4)] ring-2 ring-white'
                      : 'bg-white/15 hover:bg-white/25 text-purple-100 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
                  }`}
                  title={activeBreastSide === 'left' ? 'Toque para pausar e registrar' : 'Iniciar amamentação lado esquerdo'}
                >
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  {activeBreastSide === 'left' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse shrink-0" />
                  )}
                  <span className="truncate relative z-10">← Esq.</span>
                </motion.button>

                {/* Botão Direito */}
                <motion.button
                  type="button"
                  onClick={() => handleBreastSideClick('right')}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className={`w-full py-1.5 px-1 rounded-xl text-[10.5px] font-extrabold flex items-center justify-center space-x-1 backdrop-blur-md relative overflow-hidden shadow-xs ${
                    activeBreastSide === 'right'
                      ? 'bg-white/95 text-[#131127] shadow-[0_4px_12px_rgba(255,255,255,0.4)] ring-2 ring-white'
                      : 'bg-white/15 hover:bg-white/25 text-purple-100 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
                  }`}
                  title={activeBreastSide === 'right' ? 'Toque para pausar e registrar' : 'Iniciar amamentação lado direito'}
                >
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  {activeBreastSide === 'right' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse shrink-0" />
                  )}
                  <span className="truncate relative z-10">→ Dir.</span>
                </motion.button>

                {/* Botão Fórmula */}
                <motion.button
                  type="button"
                  onClick={() => setIsFormulaDrawerOpen(true)}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="w-full py-1.5 px-1 rounded-xl bg-white/15 hover:bg-white/25 text-[10.5px] font-extrabold text-purple-100 flex items-center justify-center space-x-0.5 border border-white/25 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] relative overflow-hidden"
                  title="Escolher fórmula ou mamadeira"
                >
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  <span>🍼</span>
                  <span className="truncate relative z-10">Fórm.</span>
                </motion.button>
              </div>

              {/* Bottom Status text */}
              <div className="flex items-center justify-between text-[10.5px] relative z-10">
                {activeBreastSide ? (
                  <span className="text-white font-bold flex items-center gap-1 truncate">
                    <span>⏱️ {activeBreastSide === 'left' ? 'Esq:' : 'Dir:'}</span>
                    <span className="text-amber-300 font-mono font-extrabold">{formatNursingTime(nursingSeconds)}</span>
                  </span>
                ) : (
                  <span className="text-purple-200/90 font-medium truncate">
                    Toque p/ cronometrar
                  </span>
                )}
                <span className="text-[9.5px] text-purple-300 opacity-80 shrink-0 ml-1">
                  {activeBreastSide ? 'Gravando ●' : 'Esq. há 23h'}
                </span>
              </div>
            </motion.div>

            {/* Card 3: Troca de fralda (Liquid Gel Menta/Turquesa) */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="h-36 rounded-3xl p-3.5 bg-gradient-to-br from-teal-400/25 via-emerald-400/18 to-cyan-500/18 backdrop-blur-2xl text-teal-100 flex flex-col justify-between shadow-[0_12px_32px_rgba(20,184,166,0.18),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.25)] border border-teal-300/40 hover:border-teal-300/60 cursor-pointer relative overflow-hidden select-none group"
              onClick={onOpenDiaperModal}
            >
              {/* Liquid Upper Convex Lens Highlight */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/35 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />
              {/* Liquid Diagonal Shimmer Beam */}
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
              {/* Bottom Caustic Glow */}
              <div className="absolute -bottom-2 inset-x-4 h-5 bg-teal-400/30 rounded-full blur-md pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className="text-base font-extrabold tracking-tight text-white">
                  Troca de fralda
                </span>
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">🚼</span>
              </div>

              {/* Quick sub-actions: Xixi and Cocô (Liquid buttons) */}
              <div className="flex items-center space-x-2 my-auto relative z-10" onClick={(e) => e.stopPropagation()}>
                <motion.button
                  type="button"
                  onClick={() => {
                    onQuickTrack('diaper_xixi');
                    showToast('Troca de fralda (Xixi) registrada! 💧');
                  }}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.35)] relative overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  <span>💧</span>
                  <span className="relative z-10">Xixi</span>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    onQuickTrack('diaper_coco');
                    showToast('Troca de fralda (Cocô) registrada! 🚼');
                  }}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.35)] relative overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  <span>🚼</span>
                  <span className="relative z-10">Cocô</span>
                </motion.button>
              </div>

              <span className="text-[10.5px] text-teal-200/90 font-medium relative z-10">
                há 5h 36min
              </span>
            </motion.div>

            {/* Card 4: Comeu (Liquid Gel Pêssego/Coral) */}
            <motion.div
              whileTap={{ scale: 0.93, y: 2 }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="h-36 rounded-3xl p-3.5 bg-gradient-to-br from-rose-400/25 via-pink-500/18 to-orange-400/18 backdrop-blur-2xl text-rose-100 flex flex-col justify-between shadow-[0_12px_32px_rgba(244,63,94,0.18),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.25)] border border-rose-300/40 hover:border-rose-300/60 cursor-pointer relative overflow-hidden select-none group"
              onClick={onOpenMealModal}
            >
              {/* Liquid Upper Convex Lens Highlight */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/35 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />
              {/* Liquid Diagonal Shimmer Beam */}
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
              {/* Bottom Caustic Glow */}
              <div className="absolute -bottom-2 inset-x-4 h-5 bg-rose-400/30 rounded-full blur-md pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className="text-base font-extrabold tracking-tight text-white">Comeu</span>
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">🥣</span>
              </div>

              <div className="flex items-center space-x-2 my-auto relative z-10">
                <span className="px-2.5 py-1 rounded-xl bg-white/15 border border-white/25 text-xs font-bold text-rose-100 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                  Janta · 17:27
                </span>
              </div>

              <span className="text-[10.5px] text-rose-200/90 font-medium relative z-10">
                Toque para registrar refeição
              </span>
            </motion.div>

          </div>
        ) : (
          /* List Mode: 4 Liquid Elements One Below the Other */
          <div className="flex flex-col gap-2.5 w-full animate-in fade-in-50 duration-200">
            
            {/* List Item 1: Sono */}
            <motion.button
              type="button"
              onClick={handleSleepClick}
              whileTap={{ scale: 0.95, y: 1 }}
              whileHover={{ scale: 1.015, y: -1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className={`w-full rounded-2xl p-3.5 flex items-center justify-between text-left relative overflow-hidden backdrop-blur-2xl group select-none ${
                sleepAnimation
                  ? 'bg-gradient-to-r from-emerald-400/40 to-teal-500/35 text-white shadow-[0_8px_25px_rgba(16,185,129,0.3),inset_0_1.5px_2px_rgba(255,255,255,0.45)] ring-2 ring-emerald-400/60 border border-emerald-300/60'
                  : isSleeping
                    ? 'bg-gradient-to-r from-emerald-500/25 via-teal-500/18 to-emerald-600/18 border border-emerald-300/40 shadow-[0_8px_24px_rgba(16,185,129,0.15),inset_0_1.5px_2px_rgba(255,255,255,0.35)] text-white'
                    : 'bg-gradient-to-r from-amber-400/22 via-amber-500/18 to-yellow-600/12 border border-amber-300/35 hover:border-amber-300/55 text-white shadow-[0_8px_24px_rgba(245,158,11,0.15),inset_0_1.5px_2px_rgba(255,255,255,0.35)]'
              }`}
            >
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl pointer-events-none" />
              {sleepAnimation ? (
                <div className="flex items-center space-x-3 w-full justify-center py-1 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#16a34a] shadow-sm">
                    <CheckCircle2 className="w-5 h-5 fill-current stroke-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-wider text-white">
                      Registrado!
                    </span>
                    <span className="text-[11px] text-emerald-100 font-medium">
                      Soneca iniciada com sucesso
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 relative z-10">
                    <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                      <span>🌛</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold tracking-tight text-white">
                          Dormiu
                        </span>
                        {isSleeping && (
                          <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px] font-bold text-white border border-white/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Em andamento 💤</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-amber-100/90">
                        {isSleeping
                          ? `Soneca em andamento · ${formatSleepTime(sleepSeconds)}`
                          : 'Toque para iniciar soneca'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 shrink-0 relative z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetHomeViewType('gauge');
                      }}
                      title="Abrir no modo Gauge Minimalista"
                      className="px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-[10px] font-bold text-amber-100 hover:text-white flex items-center gap-1 transition"
                    >
                      <span>⭕</span>
                      <span>Gauge</span>
                    </button>
                    {isSleeping ? (
                      <span className="px-3 py-1.5 rounded-xl bg-black/30 text-white text-xs font-bold border border-white/25 shadow-inner">
                        Acordou?
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-white/20 border border-white/30 text-white text-xs font-bold shadow-xs">
                        há agora
                      </span>
                    )}
                  </div>
                </>
              )}
            </motion.button>

            {/* List Item 2: Amamentação */}
            <motion.div
              whileHover={{ scale: 1.015, y: -1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className={`w-full rounded-2xl p-3.5 bg-gradient-to-r from-violet-500/22 via-purple-500/18 to-indigo-500/18 backdrop-blur-2xl text-white flex items-center justify-between shadow-[0_8px_24px_rgba(139,92,246,0.15),inset_0_1.5px_2px_rgba(255,255,255,0.35)] cursor-pointer border relative overflow-hidden select-none group ${
                activeBreastSide ? 'border-purple-300/80 ring-2 ring-purple-400/50' : 'border-purple-300/35 hover:border-purple-300/60'
              }`}
              onClick={onOpenBreastfeedingModal}
            >
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl pointer-events-none" />

              <div className="flex items-center space-x-3 min-w-0 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center text-xl shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                  <Baby className="w-6 h-6 text-purple-200" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold tracking-tight truncate">Amamentação</span>
                    {activeBreastSide && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                    )}
                  </div>
                  <span className="text-xs text-purple-200/90 font-medium">
                    {activeBreastSide ? (
                      <span className="text-amber-300 font-mono font-bold">⏱️ {formatNursingTime(nursingSeconds)}</span>
                    ) : (
                      'Esq. há 23h'
                    )}
                  </span>
                </div>
              </div>

              {/* Quick side liquid buttons */}
              <div className="flex items-center gap-1.5 shrink-0 relative z-10" onClick={(e) => e.stopPropagation()}>
                <motion.button
                  type="button"
                  onClick={() => handleBreastSideClick('left')}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1 backdrop-blur-md relative overflow-hidden ${
                    activeBreastSide === 'left'
                      ? 'bg-white/95 text-[#131127] shadow-[0_4px_12px_rgba(255,255,255,0.4)] ring-2 ring-white scale-105'
                      : 'bg-white/15 hover:bg-white/25 text-purple-100 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
                  }`}
                  title="Iniciar amamentação lado esquerdo"
                >
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  <span>← Esq.</span>
                  {activeBreastSide === 'left' && (
                    <span className="font-mono font-black text-purple-900 bg-purple-200 px-1 rounded-md text-[10px]">
                      {formatNursingTime(nursingSeconds)}
                    </span>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => handleBreastSideClick('right')}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1 backdrop-blur-md relative overflow-hidden ${
                    activeBreastSide === 'right'
                      ? 'bg-white/95 text-[#131127] shadow-[0_4px_12px_rgba(255,255,255,0.4)] ring-2 ring-white scale-105'
                      : 'bg-white/15 hover:bg-white/25 text-purple-100 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
                  }`}
                  title="Iniciar amamentação lado direito"
                >
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  <span>→ Dir.</span>
                  {activeBreastSide === 'right' && (
                    <span className="font-mono font-black text-purple-900 bg-purple-200 px-1 rounded-md text-[10px]">
                      {formatNursingTime(nursingSeconds)}
                    </span>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setIsFormulaDrawerOpen(true)}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="px-2 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-[11px] font-bold text-purple-100 flex items-center gap-0.5 border border-white/25 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] relative overflow-hidden"
                  title="Escolher fórmula em drawer"
                >
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  <span>🍼</span>
                  <span>Fórm.</span>
                </motion.button>
              </div>
            </motion.div>

            {/* List Item 3: Troca de fralda */}
            <motion.div
              whileHover={{ scale: 1.015, y: -1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="w-full rounded-2xl p-3.5 bg-gradient-to-r from-teal-400/22 via-emerald-400/18 to-cyan-500/18 backdrop-blur-2xl text-white flex items-center justify-between shadow-[0_8px_24px_rgba(20,184,166,0.15),inset_0_1.5px_2px_rgba(255,255,255,0.35)] border border-teal-300/35 hover:border-teal-300/55 cursor-pointer relative overflow-hidden select-none group"
              onClick={onOpenDiaperModal}
            >
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl pointer-events-none" />

              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center text-xl shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                  <span>🚼</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold tracking-tight text-white">
                    Troca de fralda
                  </span>
                  <span className="text-xs text-teal-100 font-medium">
                    há 5h 36min
                  </span>
                </div>
              </div>

              {/* Quick sub-actions: Xixi and Cocô */}
              <div className="flex items-center space-x-1.5 shrink-0 relative z-10" onClick={(e) => e.stopPropagation()}>
                <motion.button
                  type="button"
                  onClick={() => {
                    onQuickTrack('diaper_xixi');
                    showToast('Troca de fralda (Xixi) registrada! 💧');
                  }}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] relative overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  <span>💧</span>
                  <span>Xixi</span>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    onQuickTrack('diaper_coco');
                    showToast('Troca de fralda (Cocô) registrada! 🚼');
                  }}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] relative overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  <span>🚼</span>
                  <span>Cocô</span>
                </motion.button>
              </div>
            </motion.div>

            {/* List Item 4: Comeu */}
            <motion.div
              whileTap={{ scale: 0.95, y: 1 }}
              whileHover={{ scale: 1.015, y: -1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="w-full rounded-2xl p-3.5 bg-gradient-to-r from-rose-400/22 via-pink-500/18 to-orange-400/18 backdrop-blur-2xl text-white flex items-center justify-between shadow-[0_8px_24px_rgba(244,63,94,0.15),inset_0_1.5px_2px_rgba(255,255,255,0.35)] border border-rose-300/35 hover:border-rose-300/55 cursor-pointer relative overflow-hidden select-none group"
              onClick={onOpenMealModal}
            >
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl pointer-events-none" />

              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                  <span>🥣</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold tracking-tight">Comeu</span>
                  <span className="text-xs text-rose-100 font-medium">
                    Janta · 17:27
                  </span>
                </div>
              </div>

              <div className="shrink-0 relative z-10">
                <span className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 backdrop-blur-md text-xs font-bold text-rose-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
                  Registrar refeição
                </span>
              </div>
            </motion.div>

          </div>
        )}
      </section>

      {/* Section: Atividades personalizadas */}
      <section className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight">Atividades personalizadas</h2>
          <button
            type="button"
            onClick={onOpenManageActivities}
            className="text-xs font-bold text-[#9a7ffc] hover:underline"
          >
            Editar &gt;
          </button>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
          {/* Add custom activity button */}
          <motion.button
            type="button"
            onClick={onOpenNewActivity}
            whileTap={{ scale: 0.88, y: 1 }}
            whileHover={{ scale: 1.08, y: -2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="flex flex-col items-center justify-center shrink-0 space-y-1.5 focus:outline-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/18 border border-white/25 hover:border-purple-300/60 backdrop-blur-2xl flex items-center justify-center text-purple-200 shadow-[0_4px_16px_rgba(168,85,247,0.15),inset_0_1px_1.5px_rgba(255,255,255,0.4)] relative overflow-hidden transition-colors">
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
              <Plus className="w-6 h-6 stroke-[2.2] relative z-10" />
            </div>
            <span className="text-[11px] font-medium text-purple-300">Adicionar</span>
          </motion.button>

          {/* Tommy time (instant) */}
          <motion.button
            type="button"
            onClick={() => {
              onQuickTrack('custom', 'Tommy time');
              showToast('Tommy time registrado! 🎯');
            }}
            whileTap={{ scale: 0.88, y: 1 }}
            whileHover={{ scale: 1.08, y: -2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="flex flex-col items-center justify-center shrink-0 space-y-1.5 relative group focus:outline-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/18 border border-white/25 hover:border-purple-300/60 backdrop-blur-2xl flex items-center justify-center text-gray-100 relative shadow-[0_4px_16px_rgba(168,85,247,0.15),inset_0_1px_1.5px_rgba(255,255,255,0.4)] overflow-hidden transition-colors">
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
              <span className="text-xl relative z-10">🎯</span>
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-extrabold flex items-center justify-center shadow-md z-20">
                🔔
              </span>
            </div>
            <span className="text-[11px] font-medium text-gray-300 max-w-[70px] truncate text-center">
              Tommy tim...
            </span>
          </motion.button>

          {/* Tammy time (timer) */}
          <motion.button
            type="button"
            onClick={() => {
              onQuickTrack('custom', 'Tammy time');
              showToast('Tammy time registrado! 👶');
            }}
            whileTap={{ scale: 0.88, y: 1 }}
            whileHover={{ scale: 1.08, y: -2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="flex flex-col items-center justify-center shrink-0 space-y-1.5 relative group focus:outline-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/18 border border-white/25 hover:border-purple-300/60 backdrop-blur-2xl flex items-center justify-center text-gray-100 relative shadow-[0_4px_16px_rgba(168,85,247,0.15),inset_0_1px_1.5px_rgba(255,255,255,0.4)] overflow-hidden transition-colors">
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
              <span className="text-xl relative z-10">👶</span>
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-extrabold flex items-center justify-center shadow-md z-20">
                🔔
              </span>
            </div>
            <span className="text-[11px] font-medium text-gray-300 max-w-[70px] truncate text-center">
              Tammy time
            </span>
          </motion.button>

          {/* Any other dynamically defined activities */}
          {customActivities
            .filter((c) => !['Tommy time botao estantaneo', 'Tammy time', 'Amamentação', 'Comeu', 'Fralda', 'Sono'].includes(c.name))
            .map((custom) => (
              <motion.button
                key={custom.id}
                type="button"
                onClick={() => {
                  onQuickTrack('custom', custom.name);
                  showToast(`${custom.name} registrada! ✨`);
                }}
                whileTap={{ scale: 0.88, y: 1 }}
                whileHover={{ scale: 1.08, y: -2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="flex flex-col items-center justify-center shrink-0 space-y-1.5 focus:outline-hidden"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/18 border border-white/25 hover:border-purple-300/60 backdrop-blur-2xl flex items-center justify-center text-gray-100 shadow-[0_4px_16px_rgba(168,85,247,0.15),inset_0_1px_1.5px_rgba(255,255,255,0.4)] relative overflow-hidden transition-colors">
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  <span className="text-xl relative z-10">✨</span>
                </div>
                <span className="text-[11px] font-medium text-gray-300 max-w-[70px] truncate text-center">
                  {custom.name}
                </span>
              </motion.button>
            ))}
        </div>
      </section>

      {/* Routine Gamification Progress Card (Desabilitado e oculto da interface do usuário, código mantido) */}
      {isRoutineLevelVisible && (
        <section
          className="hidden pointer-events-none opacity-40 bg-[#17192b] border border-[#272b45] rounded-2xl p-3.5 shadow-sm space-y-2"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between text-xs font-bold text-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">💤 0</span>
              <div className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 fill-current text-[#17192b]" />
                <span className="text-white">D2 · Rotina variada</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 font-normal">2/2</span>
              <span className="px-2 py-0.5 rounded-full bg-[#372f63] text-purple-300 text-[10px] font-extrabold flex items-center gap-0.5">
                ⭐ Nv. 1
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 w-full rounded-full"></div>
          </div>
        </section>
      )}

      {/* Formula Quick Drawer (Item 4) */}
      <FormulaDrawer
        isOpen={isFormulaDrawerOpen}
        onClose={() => setIsFormulaDrawerOpen(false)}
        onConfirm={handleConfirmFormula}
      />

    </div>
  );
};
