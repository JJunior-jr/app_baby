import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Palette,
  Type,
  Box,
  Bell,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  MessageSquareHeart,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Sliders,
  Clock,
  Cloud,
  WifiOff,
} from 'lucide-react';
import { themeService } from '../services/theme';

export type SettingsSection =
  | 'colors'
  | 'typography'
  | 'shapes'
  | 'reminders'
  | 'notifications'
  | 'calendar'
  | 'sync'
  | 'offline'
  | 'feedback'
  | 'suggestions'
  | 'diagnostics'
  | 'docker';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (section: SettingsSection) => void;
  activeRemindersCount?: number;
  pendingAlarmsCount?: number;
  syncPendingCount?: number;
  isOnline?: boolean;
  isSyncing?: boolean;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  isOpen,
  onClose,
  onNavigateTo,
  activeRemindersCount = 0,
  pendingAlarmsCount = 0,
  syncPendingCount = 0,
  isOnline = true,
  isSyncing = false,
}) => {
  const currentPalette = themeService.getCurrentPalette();
  const currentFont = themeService.getFont();
  const currentRadius = themeService.getRadius();

  const totalPending =
    activeRemindersCount + pendingAlarmsCount + (syncPendingCount > 0 ? syncPendingCount : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-start pointer-events-auto">
          {/* Subtle Frosted Backdrop - keeps background content visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px] cursor-pointer"
          />

          {/* Liquid Glass Sidebar Drawer sliding from Left to Right (takes ~30% to 40% of the screen) */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              stiffness: 340,
              damping: 32,
              mass: 0.85,
            }}
            className="relative w-[38vw] min-w-[210px] max-w-[500px] sm:w-[36vw] md:w-[35vw] lg:w-[32vw] h-full bg-slate-950/40 backdrop-blur-2xl backdrop-saturate-180 border-r border-t border-b border-white/25 rounded-r-3xl text-white flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_1px_1px_2px_rgba(255,255,255,0.35)] z-10 overflow-hidden"
          >
            {/* Liquid Refraction Ambient Orbs (Soft organic movement behind glass) */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-gradient-to-tr from-purple-500/35 to-indigo-500/20 rounded-full blur-3xl pointer-events-none liquid-orb-1" />
            <div className="absolute top-1/3 -right-12 w-40 h-40 bg-gradient-to-bl from-cyan-400/30 to-blue-500/20 rounded-full blur-3xl pointer-events-none liquid-orb-2" />
            <div className="absolute bottom-10 left-2 w-44 h-44 bg-gradient-to-r from-pink-500/30 to-purple-400/20 rounded-full blur-3xl pointer-events-none liquid-orb-1" />

            {/* Specular Liquid Glass Sheen */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-white/70 via-white/25 to-transparent pointer-events-none z-20" />
            <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-white/40 via-white/10 to-white/30 pointer-events-none z-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.10] via-transparent to-black/[0.15] pointer-events-none z-0" />

            {/* Header: Frosted Glass Capsule Bar */}
            <div className="p-3 sm:p-4 border-b border-white/15 flex items-center justify-between bg-white/[0.06] backdrop-blur-xl relative z-10 shrink-0">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-purple-500/40 to-pink-500/30 border border-white/25 flex items-center justify-center text-purple-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xs sm:text-sm font-extrabold tracking-tight text-white drop-shadow-sm truncate">
                      Configurações
                    </h2>
                    {totalPending > 0 && (
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
                    )}
                  </div>
                  <p className="text-[9px] sm:text-[10.5px] text-gray-200/80 truncate">Menu & Ajustes</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-gray-200 hover:text-white transition cursor-pointer active:scale-95 shrink-0 ml-1.5 shadow-sm"
                title="Fechar menu lateral"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Scrollable Components Menu */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-3 sm:space-y-3.5 no-scrollbar relative z-10">
              {/* Quick Status Card - Frosted Glass Pill */}
              <div className="p-2 sm:p-2.5 rounded-2xl bg-white/[0.07] border border-white/20 backdrop-blur-xl space-y-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-purple-200">
                  <span className="flex items-center gap-1 truncate">
                    <Sparkles className="w-3 h-3 text-purple-300 shrink-0" />
                    Tema: {currentPalette.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                      }`}
                      title={isOnline ? 'Online' : 'Offline'}
                    />
                    <span className="text-[9px] text-gray-200 font-mono">
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* 60/30/10 Miniature Bar */}
                <div className="h-1.5 rounded-full overflow-hidden flex border border-white/20 shadow-inner">
                  <div className="w-[60%]" style={{ backgroundColor: currentPalette.dominant }} title="60% Fundo" />
                  <div className="w-[30%]" style={{ backgroundColor: currentPalette.secondary }} title="30% Cards" />
                  <div className="w-[10%]" style={{ backgroundColor: currentPalette.accent }} title="10% CTA" />
                </div>
              </div>

              {/* SEÇÃO 1: CENTRAL DE AÇÕES & PENDÊNCIAS (Notificação, Sugestão, Sincronização, Lembretes) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-gray-300/80 block">
                    Central & Alertas
                  </span>
                  {totalPending > 0 && (
                    <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 font-bold border border-purple-400/40">
                      {totalPending} pendente{totalPending > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* 1. NOTIFICAÇÕES */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTo('notifications');
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/15 hover:border-purple-400/40 flex items-center justify-between transition cursor-pointer text-left group gooey-card-hover backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-500/30 text-purple-200 flex items-center justify-center shrink-0 border border-purple-400/40 shadow-inner">
                      <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-[11px] sm:text-xs font-bold text-white group-hover:text-purple-200 transition truncate">
                          Notificações
                        </h3>
                      </div>
                      <p className="text-[9px] text-gray-300/80 truncate hidden sm:block">
                        Alarmes e avisos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                    {pendingAlarmsCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-500 text-white text-[8.5px] sm:text-[9px] font-black border border-purple-400 shadow-sm animate-pulse">
                        {pendingAlarmsCount}
                      </span>
                    ) : (
                      <span className="text-[8.5px] text-emerald-400/90 font-semibold hidden sm:inline">
                        Ativo
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-white transition" />
                  </div>
                </button>

                {/* 2. SINCRONIZAÇÃO */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTo('sync');
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/15 hover:border-teal-400/40 flex items-center justify-between transition cursor-pointer text-left group gooey-card-hover backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-teal-500/30 text-teal-200 flex items-center justify-center shrink-0 border border-teal-400/40 shadow-inner">
                      {isSyncing ? (
                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-teal-200" />
                      ) : !isOnline ? (
                        <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                      ) : (
                        <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-200" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] sm:text-xs font-bold text-white group-hover:text-teal-200 transition truncate">
                        Sincronização
                      </h3>
                      <p className="text-[9px] text-gray-300/80 truncate hidden sm:block">
                        Offline & Banco Nuvem
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                    {isSyncing ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[8px] sm:text-[8.5px] font-bold border border-blue-400 animate-pulse">
                        Gravando
                      </span>
                    ) : syncPendingCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[8px] sm:text-[8.5px] font-black border border-amber-400 shadow-sm animate-pulse">
                        {syncPendingCount} pendente{syncPendingCount > 1 ? 's' : ''}
                      </span>
                    ) : !isOnline ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[8px] sm:text-[8.5px] font-bold border border-amber-500/40">
                        Offline
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[8px] sm:text-[8.5px] font-bold border border-emerald-500/30">
                        Nuvem OK
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-white transition" />
                  </div>
                </button>

                {/* 3. SUGESTÕES & FEEDBACK */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTo('feedback');
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/15 hover:border-pink-400/40 flex items-center justify-between transition cursor-pointer text-left group gooey-card-hover backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-pink-500/30 text-pink-200 flex items-center justify-center shrink-0 border border-pink-400/40 shadow-inner">
                      <MessageSquareHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] sm:text-xs font-bold text-white group-hover:text-pink-200 transition truncate">
                        Sugestões
                      </h3>
                      <p className="text-[9px] text-gray-300/80 truncate hidden sm:block">
                        Opiniões e ideias
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                    <span className="px-1.5 py-0.5 rounded-full bg-pink-500/25 text-pink-200 text-[8px] sm:text-[8.5px] font-bold border border-pink-400/40">
                      Feedback
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-white transition" />
                  </div>
                </button>

                {/* 4. LEMBRETES */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTo('reminders');
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/15 hover:border-amber-400/40 flex items-center justify-between transition cursor-pointer text-left group gooey-card-hover backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/30 text-amber-200 flex items-center justify-center shrink-0 border border-amber-400/40 shadow-inner">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] sm:text-xs font-bold text-white group-hover:text-amber-200 transition truncate">
                        Lembretes
                      </h3>
                      <p className="text-[9px] text-gray-300/80 truncate hidden sm:block">
                        Rotina & intervalos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                    {activeRemindersCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-pink-500 text-white text-[8px] sm:text-[8.5px] font-black border border-pink-400 shadow-sm">
                        {activeRemindersCount} ativo{activeRemindersCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[8.5px] text-gray-400 hidden sm:inline">
                        0 ativos
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-white transition" />
                  </div>
                </button>
              </div>

              {/* SEÇÃO 2: APARÊNCIA & DESIGN */}
              <div className="space-y-1.5">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-gray-300/80 px-1 block">
                  Aparência
                </span>

                {/* Cores 60/30/10 */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTo('colors');
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/15 hover:border-purple-400/40 flex items-center justify-between transition cursor-pointer text-left group gooey-card-hover backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-500/30 text-purple-200 flex items-center justify-center shrink-0 border border-purple-400/40 shadow-inner">
                      <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] sm:text-xs font-bold text-white group-hover:text-purple-200 transition truncate">
                        Cores 60/30/10
                      </h3>
                      <p className="text-[9px] text-gray-300/80 truncate hidden sm:block">
                        Paletas e regra de cor
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-white transition shrink-0 ml-1" />
                </button>

                {/* Tipografia */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTo('typography');
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/15 hover:border-blue-400/40 flex items-center justify-between transition cursor-pointer text-left group gooey-card-hover backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/30 text-blue-200 flex items-center justify-center shrink-0 border border-blue-400/40 shadow-inner">
                      <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] sm:text-xs font-bold text-white group-hover:text-blue-200 transition truncate">
                        Tipografia
                      </h3>
                      <p className="text-[9px] text-gray-300/80 truncate hidden sm:block">
                        Família de fontes
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-white transition shrink-0 ml-1" />
                </button>

                {/* Formas & Brilho */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTo('shapes');
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/15 hover:border-amber-400/40 flex items-center justify-between transition cursor-pointer text-left group gooey-card-hover backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/30 text-amber-200 flex items-center justify-center shrink-0 border border-amber-400/40 shadow-inner">
                      <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] sm:text-xs font-bold text-white group-hover:text-amber-200 transition truncate">
                        Formas & Brilho
                      </h3>
                      <p className="text-[9px] text-gray-300/80 truncate hidden sm:block">
                        Cantos e efeito neon
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-white transition shrink-0 ml-1" />
                </button>
              </div>

              {/* SEÇÃO 3: SISTEMA & INTEGRAÇÕES */}
              <div className="space-y-1.5">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-gray-300/80 px-1 block">
                  Sistema
                </span>

                {/* Calendário */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTo('calendar');
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/15 hover:border-emerald-400/40 flex items-center justify-between transition cursor-pointer text-left group gooey-card-hover backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/30 text-emerald-200 flex items-center justify-center shrink-0 border border-emerald-400/40 shadow-inner">
                      <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] sm:text-xs font-bold text-white group-hover:text-emerald-200 transition truncate">
                        Calendário
                      </h3>
                      <p className="text-[9px] text-gray-300/80 truncate hidden sm:block">
                        Google Agenda e ICS
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-white transition shrink-0 ml-1" />
                </button>

                {/* Permissões */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTo('diagnostics');
                  }}
                  className="w-full p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 hover:border-indigo-400/30 flex items-center justify-between transition cursor-pointer text-left group backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                    <span className="text-[10.5px] sm:text-xs text-gray-200 group-hover:text-white truncate">Permissões</span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-200 text-[8px] font-semibold border border-indigo-400/30">
                      Checar
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  </div>
                </button>

                {/* Guia VPS */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTo('docker');
                  }}
                  className="w-full p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 hover:border-amber-400/30 flex items-center justify-between transition cursor-pointer text-left group backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="text-[10.5px] sm:text-xs text-gray-200 group-hover:text-white truncate">Guia VPS Docker</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Subtle Liquid Glass Footer */}
            <div className="p-2.5 border-t border-white/15 text-center text-[9px] sm:text-[10px] text-gray-300/80 bg-white/[0.03] backdrop-blur-md relative z-10 shrink-0">
              Baby John · Configurações
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
