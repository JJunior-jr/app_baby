import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Baby,
  Utensils,
  Plus,
  Settings,
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
import { isDaytimeInBrazil } from '../services/brazilTime';
import { SleepGaugeView } from './SleepGaugeView';
import { BreastfeedingGaugeView } from './BreastfeedingGaugeView';
import { DiaperGaugeView } from './DiaperGaugeView';
import { notificationService } from '../services/notificationService';

interface HomeScreenProps {
  currentUser: UserProfile | null;
  activities?: ActivityItem[];
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
  onSaveBreastfeeding?: (data: any) => void;
  onSaveDiaper?: (data: any) => void;
  customActivities: CustomActivityDefinition[];
  onOpenFeedback?: () => void;
  onOpenOfflineSync?: () => void;
  onOpenNotificationCenter?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  activities = [],
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
  onSaveBreastfeeding,
  onSaveDiaper,
  customActivities,
  onOpenFeedback,
  onOpenOfflineSync,
  onOpenNotificationCenter,
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>(() => syncService.getSyncStatus());
  const [pendingAlarmsCount, setPendingAlarmsCount] = useState<number>(() =>
    notificationService.getPendingCount()
  );

  useEffect(() => {
    notificationService.init();
    const updateAlarms = () => {
      setPendingAlarmsCount(notificationService.getPendingCount());
    };
    const unsub = notificationService.subscribe(updateAlarms);
    return () => unsub();
  }, []);

  // Sleep state and timers
  const [isSleeping, setIsSleeping] = useState<boolean>(true);
  const [sleepAnimation, setSleepAnimation] = useState<boolean>(false);
  const [sleepSeconds, setSleepSeconds] = useState<number>(14 * 60); // Starts at 14m in progress
  const [homeViewType, setHomeViewType] = useState<'list' | 'gauge'>(() => {
    try {
      const saved = localStorage.getItem('babyjohn_home_view');
      return (saved === 'list' || saved === 'gauge') ? (saved as 'list' | 'gauge') : 'gauge';
    } catch {
      return 'gauge';
    }
  });

  const handleSetHomeViewType = (type: 'list' | 'gauge') => {
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
  const [leftNursingSeconds, setLeftNursingSeconds] = useState<number>(0);
  const [rightNursingSeconds, setRightNursingSeconds] = useState<number>(0);
  const [gaugeSubView, setGaugeSubView] = useState<'sono' | 'amamentacao' | 'fralda'>(() => {
    try {
      return (localStorage.getItem('babyjohn_gauge_subview') as 'sono' | 'amamentacao' | 'fralda') || 'sono';
    } catch {
      return 'sono';
    }
  });

  const handleSetGaugeSubView = (sub: 'sono' | 'amamentacao' | 'fralda') => {
    setGaugeSubView(sub);
    try {
      localStorage.setItem('babyjohn_gauge_subview', sub);
    } catch {}
  };

  const [isFormulaDrawerOpen, setIsFormulaDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeRemindersCount, setActiveRemindersCount] = useState<number>(() => remindersService.getActiveCount());
  const [isDaytime, setIsDaytime] = useState<boolean>(() => isDaytimeInBrazil());

  useEffect(() => {
    const checkTime = () => setIsDaytime(isDaytimeInBrazil());
    checkTime();
    const timer = setInterval(checkTime, 30000);
    window.addEventListener('focus', checkTime);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', checkTime);
    };
  }, []);

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

  // Real-time nursing timer (updates left and right sides)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeBreastSide === 'left') {
      interval = setInterval(() => {
        setLeftNursingSeconds((prev) => prev + 1);
        setNursingSeconds((prev) => prev + 1);
      }, 1000);
    } else if (activeBreastSide === 'right') {
      interval = setInterval(() => {
        setRightNursingSeconds((prev) => prev + 1);
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
      const sideSec = side === 'left' ? leftNursingSeconds : rightNursingSeconds;
      const minutesElapsed = Math.max(1, Math.round(sideSec / 60));
      const sideLabel = side === 'left' ? 'Lado Esquerdo' : 'Lado Direito';
      onQuickTrack('custom', `Amamentação (${sideLabel} - ${minutesElapsed} min)`);
      setActiveBreastSide(null);
      showToast(`Amamentação no ${sideLabel} (${minutesElapsed} min) registrada! 🤱`);
    } else {
      // Switch or start
      setActiveBreastSide(side);
      showToast(`Cronômetro iniciado: Lado ${side === 'left' ? 'Esquerdo' : 'Direito'} ⏱️`);
    }
  };

  const handleToggleBreastSideGauge = (side: 'left' | 'right') => {
    if (activeBreastSide === side) {
      setActiveBreastSide(null);
      showToast(`Amamentação no lado ${side === 'left' ? 'Esquerdo' : 'Direito'} pausada ⏸️`);
    } else {
      setActiveBreastSide(side);
      showToast(`Mamando no lado ${side === 'left' ? 'Esquerdo' : 'Direito'} ▶️`);
    }
  };

  const handleResetNursingTimers = () => {
    setActiveBreastSide(null);
    setLeftNursingSeconds(0);
    setRightNursingSeconds(0);
    setNursingSeconds(0);
    showToast('Cronômetros de amamentação zerados.');
  };

  // Calculate total nursing seconds in the last 24h from activities and/or localStorage
  const calculatePast24hNursingSeconds = (): number => {
    let seconds = 0;
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (activities && activities.length > 0) {
      for (const act of activities) {
        const actTime = act.timestamp ? new Date(act.timestamp).getTime() : 0;
        const isRecent = actTime > 0 ? (now - actTime >= 0 && now - actTime <= oneDayMs) : true;
        const isToday = act.dateStr === '2026-08-19' || act.dateStr === new Date().toISOString().split('T')[0];

        if (!isRecent && !isToday) continue;

        if (act.type === 'amamentacao') {
          const bf = act.details?.breastfeeding;
          if (bf?.mode === 'formula') continue;

          let mins = 0;
          if (bf?.leftMinutes || bf?.rightMinutes) {
            mins = (bf.leftMinutes || 0) + (bf.rightMinutes || 0);
          } else if (act.durationMinutes) {
            mins = act.durationMinutes;
          } else if (!act.title.toLowerCase().includes('mamadeira') && !act.title.toLowerCase().includes('fórmula')) {
            mins = 15;
          }
          seconds += mins * 60;
        } else if (act.type === 'custom' && act.title.toLowerCase().includes('amamentação')) {
          const matchTotal = act.title.match(/Total:\s*(\d+)\s*min/i);
          const matchMin = act.title.match(/(\d+)\s*min/i);
          if (matchTotal && matchTotal[1]) {
            seconds += parseInt(matchTotal[1], 10) * 60;
          } else if (matchMin && matchMin[1]) {
            seconds += parseInt(matchMin[1], 10) * 60;
          } else {
            seconds += 15 * 60;
          }
        }
      }
    }

    try {
      const saved = localStorage.getItem('babyjohn_past_nursing_seconds_24h');
      if (saved !== null) {
        const savedVal = parseInt(saved, 10);
        if (!isNaN(savedVal) && savedVal > 0) {
          seconds = Math.max(seconds, savedVal);
        }
      } else if (seconds === 0) {
        // Realistic default baseline (e.g. 1h 45m = 6300s) if no prior records exist yet
        seconds = 105 * 60;
        localStorage.setItem('babyjohn_past_nursing_seconds_24h', String(seconds));
      }
    } catch {}

    return seconds;
  };

  const [past24hNursingSeconds, setPast24hNursingSeconds] = useState<number>(() => calculatePast24hNursingSeconds());

  useEffect(() => {
    setPast24hNursingSeconds(calculatePast24hNursingSeconds());
  }, [activities]);

  const handleAdjust24hNursingSeconds = (addedSeconds: number) => {
    setPast24hNursingSeconds((prev) => {
      const next = Math.max(0, prev + addedSeconds);
      try {
        localStorage.setItem('babyjohn_past_nursing_seconds_24h', String(next));
      } catch {}
      return next;
    });
    const mins = Math.round(addedSeconds / 60);
    showToast(addedSeconds > 0 ? `+${mins} min adicionados ao acumulado de 24h` : `${mins} min ajustados`);
  };

  const handleSaveNursingSession = (leftMinutes: number, rightMinutes: number) => {
    const totalMin = Math.max(1, leftMinutes + rightMinutes);
    const addedSec = totalMin * 60;

    setPast24hNursingSeconds((prev) => {
      const next = prev + addedSec;
      try {
        localStorage.setItem('babyjohn_past_nursing_seconds_24h', String(next));
      } catch {}
      return next;
    });

    if (onSaveBreastfeeding) {
      onSaveBreastfeeding({
        mode: 'peito',
        leftMinutes,
        rightMinutes,
        durationMinutes: totalMin,
        feeling: 'Amamentação tranquila',
      });
    } else {
      onQuickTrack('custom', `Amamentação (Esq: ${leftMinutes}m, Dir: ${rightMinutes}m - Total: ${totalMin} min)`);
    }

    setActiveBreastSide(null);
    setLeftNursingSeconds(0);
    setRightNursingSeconds(0);
    setNursingSeconds(0);
    showToast(`Mamada registrada: ${totalMin} min (Esq: ${leftMinutes}m · Dir: ${rightMinutes}m) 🤱✨`);
  };

  const handleQuickSaveFormula = (ml: number, leftoverMl: number = 0) => {
    const consumed = Math.max(0, ml - leftoverMl);
    const pct = ml > 0 ? Math.round((consumed / ml) * 100) : 100;
    if (onSaveFormula) {
      onSaveFormula({
        offeredMl: ml,
        leftoverMl: leftoverMl,
        consumedMl: consumed,
        consumedPercentage: pct,
        milkType: 'formula',
        notes:
          leftoverMl > 0
            ? `Ofertado: ${ml}ml · Sobrou: ${leftoverMl}ml`
            : 'Registro rápido via Gauge',
      });
    } else {
      onQuickTrack('custom', `Mamadeira (${consumed}ml Fórmula)`);
    }
    showToast(
      leftoverMl > 0
        ? `Mamadeira registrada: ${consumed}ml bebidos (${leftoverMl}ml sobraram) 🍼`
        : `Mamadeira de ${ml}ml registrada! 🍼`
    );
  };

  // Handle sleep click with green animation, returning to yellow with in-progress status
  const handleSleepClick = () => {
    if (!isSleeping) {
      // Start sleeping: trigger green registration animation
      setSleepAnimation(true);
      setIsSleeping(true);
      setSleepSeconds(0);
      onQuickTrack('sleep');
      const emoji = isDaytime ? '☀️' : '🌙';
      const label = isDaytime ? 'Soneca diurna' : 'Sono noturno';
      showToast(`${label} iniciada! John começou a dormir ${emoji}💤`);
      // After 1.4s, green animation ends and card returns to yellow showing "Em andamento"
      setTimeout(() => {
        setSleepAnimation(false);
      }, 1400);
    } else {
      // If already sleeping, clicking asks to finish or opens fine details
      const durationText = formatSleepTime(sleepSeconds);
      setIsSleeping(false);
      setSleepSeconds(0);
      showToast(`Sono finalizado (${durationText})! John acordou 👶✨`);
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

  // If user selected minimalist gauge view, render SleepGaugeView or BreastfeedingGaugeView
  if (homeViewType === 'gauge') {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {gaugeSubView === 'amamentacao' ? (
          <BreastfeedingGaugeView
            currentUser={currentUser}
            leftSeconds={leftNursingSeconds}
            rightSeconds={rightNursingSeconds}
            activeSide={activeBreastSide}
            past24hNursingSeconds={past24hNursingSeconds}
            onAdjust24hNursingSeconds={handleAdjust24hNursingSeconds}
            onToggleSide={handleToggleBreastSideGauge}
            onResetTimers={handleResetNursingTimers}
            onSaveSession={handleSaveNursingSession}
            onOpenFormulaDrawer={() => setIsFormulaDrawerOpen(true)}
            onQuickSaveFormula={handleQuickSaveFormula}
            onSwitchToCardsView={() => handleSetHomeViewType('list')}
            onSwitchToSleepGauge={() => handleSetGaugeSubView('sono')}
            onSwitchToDiaperGauge={() => handleSetGaugeSubView('fralda')}
          />
        ) : gaugeSubView === 'fralda' ? (
          <DiaperGaugeView
            currentUser={currentUser}
            activities={activities}
            onQuickSaveDiaper={(type, notes) => {
              if (onSaveDiaper) {
                onSaveDiaper({ diaperType: type, notes });
              } else if (type === 'xixi') {
                onQuickTrack('diaper_xixi');
              } else if (type === 'coco') {
                onQuickTrack('diaper_coco');
              } else {
                onQuickTrack('custom', 'Fralda (Xixi + Cocô)');
              }
            }}
            onOpenDiaperModal={onOpenDiaperModal}
            onSwitchToCardsView={() => handleSetHomeViewType('list')}
            onSwitchToSleepGauge={() => handleSetGaugeSubView('sono')}
            onSwitchToBreastfeedingGauge={() => handleSetGaugeSubView('amamentacao')}
          />
        ) : (
          <SleepGaugeView
            currentUser={currentUser}
            isSleeping={isSleeping}
            sleepSeconds={sleepSeconds}
            onToggleSleep={handleSleepClick}
            onOpenSleepModal={onOpenSleepModal}
            onOpenDiaperModal={onOpenDiaperModal}
            onOpenFormulaDrawer={() => setIsFormulaDrawerOpen(true)}
            onSwitchToCardsView={() => handleSetHomeViewType('list')}
            onSwitchToBreastfeedingGauge={() => handleSetGaugeSubView('amamentacao')}
            onSwitchToDiaperGauge={() => handleSetGaugeSubView('fralda')}
            onOpenNotificationCenter={onOpenNotificationCenter}
          />
        )}
        {/* Formula Drawer can still be opened from quick action or popover */}
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

          <button
            type="button"
            onClick={onOpenNotificationCenter || onOpenAuth}
            title={
              pendingAlarmsCount > 0
                ? `${pendingAlarmsCount} alarme(s) ativo(s) - Toque para gerenciar`
                : 'Central de Notificações & Alarmes em Segundo Plano'
            }
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
              pendingAlarmsCount > 0
                ? 'bg-purple-600/30 border border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-[#181a2d] border border-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            {pendingAlarmsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-purple-500 border-2 border-[#0c0d16] text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                {pendingAlarmsCount}
              </span>
            )}
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
          <button
            type="button"
            onClick={onOpenSleepModal}
            className="text-gray-400 hover:text-gray-200 p-1 rounded-lg hover:bg-white/5 transition"
            title="Detalhes do sono"
          >
            <Info className="w-4 h-4" />
          </button>
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

            {/* View Mode Toggle: Lista vs Gauge */}
            <div className="flex bg-[#171a2d] border border-gray-800 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => handleSetHomeViewType('list')}
                title="Lista de Atividades"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  homeViewType === 'list' ? 'bg-[#7158e2] text-white shadow-xs' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetHomeViewType('gauge')}
                title="Visão Minimalista / Gauge"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  homeViewType === 'gauge' ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xs' : 'text-purple-300 hover:text-white'
                }`}
              >
                <span>⭕</span>
                <span>Gauge</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Mode: Lista de Atividades (4 elementos líquidos um abaixo do outro) */}
        <div className="flex flex-col gap-2.5 w-full animate-in fade-in-50 duration-200">
            
            {/* List Item 1: Sono */}
            <motion.button
              type="button"
              onClick={handleSleepClick}
              whileTap={{ scale: 0.95, y: 1 }}
              whileHover={{ scale: 1.015, y: -1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className={`w-full rounded-2xl p-3.5 min-h-[72px] flex items-center justify-between text-left relative overflow-hidden backdrop-blur-2xl group select-none ${
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
                      {isDaytime ? 'Soneca' : 'Sono noturno'} iniciado com sucesso {isDaytime ? '☀️' : '🌙'}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 relative z-10 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                      <span>{isDaytime ? '☀️' : '🌙'}</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 justify-center">
                      <span className="text-sm font-extrabold tracking-tight text-white leading-tight">
                        {isSleeping ? (isDaytime ? 'Soneca' : 'Sono Noturno') : (isDaytime ? 'Soneca (Dormir)' : 'Sono Noturno')}
                      </span>
                      <div className="mt-1 flex items-center justify-between gap-2 min-w-0">
                        <div className="text-xs font-medium text-amber-100/90 flex items-center gap-1.5 min-w-0">
                          {isSleeping ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-300 min-w-0 truncate whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                              <span className="truncate">
                                {isDaytime ? 'Soneca' : 'Sono'} em andamento · {formatSleepTime(sleepSeconds)}
                              </span>
                            </span>
                          ) : (
                            <span className="truncate whitespace-nowrap">
                              Toque para iniciar {isDaytime ? 'soneca ☀️' : 'sono 🌙'}
                            </span>
                          )}
                        </div>

                        <div className="shrink-0">
                          {isSleeping ? (
                            <span className="px-3 py-1 rounded-xl bg-black/30 text-white text-xs font-bold border border-white/25 shadow-inner whitespace-nowrap">
                              Acordou?
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-xl bg-white/20 border border-white/30 text-white text-xs font-bold shadow-xs whitespace-nowrap">
                              Iniciar
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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

              <div className="flex items-center space-x-3 min-w-0 relative z-10 flex-1 mr-2">
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
                  <span className="text-xs text-purple-200/90 font-medium truncate">
                    {activeBreastSide ? (
                      <span className="text-amber-300 font-mono font-bold">⏱️ {formatNursingTime(nursingSeconds)}</span>
                    ) : (
                      'Esq. há 23h'
                    )}
                  </span>
                </div>
              </div>

              {/* Quick side liquid buttons without redundant gauge button */}
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
                  className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-[11px] font-bold text-purple-100 flex items-center gap-1 border border-white/25 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] relative overflow-hidden"
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
