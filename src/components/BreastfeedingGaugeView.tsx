import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Baby,
  Play,
  Pause,
  RotateCcw,
  Check,
  Milk,
  Heart,
  Clock,
  LayoutGrid,
  ChevronRight,
  Info,
  Sliders,
  Sparkles,
  Plus,
  Minus,
  Settings2,
} from 'lucide-react';
import { UserProfile } from '../types';

interface BreastfeedingGaugeViewProps {
  currentUser: UserProfile | null;
  leftSeconds: number;
  rightSeconds: number;
  activeSide: 'left' | 'right' | null;
  past24hNursingSeconds?: number;
  onAdjust24hNursingSeconds?: (addedSeconds: number) => void;
  onToggleSide: (side: 'left' | 'right') => void;
  onResetTimers: () => void;
  onSaveSession: (leftMinutes: number, rightMinutes: number) => void;
  onOpenFormulaDrawer: () => void;
  onQuickSaveFormula: (ml: number) => void;
  onSwitchToCardsView: () => void;
  onSwitchToSleepGauge: () => void;
}

// Background cosmic stars
const STARS = Array.from({ length: 42 }).map((_, i) => ({
  id: i,
  top: `${((i * 37 + 13) % 94) + 3}%`,
  left: `${((i * 47 + 29) % 94) + 3}%`,
  size: i % 3 === 0 ? 2.5 : i % 2 === 0 ? 2 : 1.2,
  opacity: i % 4 === 0 ? 0.85 : i % 3 === 0 ? 0.55 : 0.35,
  delay: (i % 5) * 0.7,
  duration: 2 + (i % 4),
}));

// Scale of 24 Hours in Seconds
const SCALE_24H_SECONDS = 24 * 3600; // 86,400 seconds

export const BreastfeedingGaugeView: React.FC<BreastfeedingGaugeViewProps> = ({
  currentUser,
  leftSeconds,
  rightSeconds,
  activeSide,
  past24hNursingSeconds = 0,
  onAdjust24hNursingSeconds,
  onToggleSide,
  onResetTimers,
  onSaveSession,
  onOpenFormulaDrawer,
  onQuickSaveFormula,
  onSwitchToCardsView,
  onSwitchToSleepGauge,
}) => {
  // Popover state for formula / bottle
  const [isFormulaPopoverOpen, setIsFormulaPopoverOpen] = useState(false);
  const [isAdjust24hOpen, setIsAdjust24hOpen] = useState(false);
  const [centerDisplayMode, setCenterDisplayMode] = useState<'24h' | 'session'>('24h');
  const popoverRef = useRef<HTMLDivElement>(null);
  const adjustRef = useRef<HTMLDivElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsFormulaPopoverOpen(false);
      }
      if (adjustRef.current && !adjustRef.current.contains(e.target as Node)) {
        setIsAdjust24hOpen(false);
      }
    };
    if (isFormulaPopoverOpen || isAdjust24hOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFormulaPopoverOpen, isAdjust24hOpen]);

  // Real-time calculations:
  // Current in-progress session
  const currentSessionSeconds = leftSeconds + rightSeconds;
  const activeSeconds = activeSide === 'left' ? leftSeconds : activeSide === 'right' ? rightSeconds : currentSessionSeconds;

  // Total Breastfeeding in the 24-hour cycle:
  // Accumulated past nursing in 24h + active session running live
  const total24hNursingSeconds = past24hNursingSeconds + currentSessionSeconds;

  // Breakdown in hours and minutes
  const totalHoursFloat = total24hNursingSeconds / 3600;
  const hoursInt = Math.floor(total24hNursingSeconds / 3600);
  const minsInt = Math.floor((total24hNursingSeconds % 3600) / 60);
  const secsInt = total24hNursingSeconds % 60;

  // Format seconds into MM:SS
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Arc Gauge Geometry (270 degrees total sweep, open at bottom)
  const cx = 160;
  const cy = 160;
  const r = 118;
  const strokeWidth = 24;
  const startX = (cx - r * 0.7071).toFixed(2);
  const startY = (cy + r * 0.7071).toFixed(2);
  const endX = (cx + r * 0.7071).toFixed(2);
  const endY = (cy + r * 0.7071).toFixed(2);
  const trackPath = `M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`;
  const arcLength = 2 * Math.PI * r * 0.75;

  // Calculation of gauge progress based on 24 hours:
  // Percentage = (totalNursingSeconds / 24hrs) * 100
  const rawPercentage = (total24hNursingSeconds / SCALE_24H_SECONDS) * 100;
  const progressPercent = Math.min(100, Math.max(0, rawPercentage));
  
  // Ensure a subtle visible glow at start if > 0 seconds
  const visualPercent = total24hNursingSeconds > 0 ? Math.max(1.0, progressPercent) : 0;
  const strokeDashoffset = arcLength - (arcLength * visualPercent) / 100;

  const babyName = currentUser?.babyName || 'John';

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none overflow-hidden bg-[#0c0d1c] text-white">
      {/* Background Deep Cosmic Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#120e24] via-[#0d0d1c] to-[#070811] pointer-events-none" />

      {/* Gentle Radial Atmosphere Glow behind Gauge in soft Rose/Violet */}
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-fuchsia-900/15 blur-3xl pointer-events-none" />

      {/* Scattered Star Field */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STARS.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: star.opacity }}
            animate={{ opacity: [star.opacity, star.opacity * 0.35, star.opacity] }}
            transition={{
              repeat: Infinity,
              duration: star.duration,
              delay: star.delay,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              boxShadow: star.size > 2 ? '0 0 3px rgba(255,255,255,0.8)' : undefined,
            }}
          />
        ))}
      </div>

      {/* Top Header Bar inside Gauge View */}
      <div className="relative z-20 px-5 pt-2 flex items-center justify-between">
        {/* Left button: return to Cards */}
        <button
          type="button"
          onClick={onSwitchToCardsView}
          title="Voltar para Visão em Cards"
          className="w-10 h-10 rounded-full bg-[#1b1e36]/80 border border-purple-500/30 backdrop-blur-md flex items-center justify-center text-purple-200 hover:text-white transition active:scale-95 shadow-lg shadow-black/40 cursor-pointer"
        >
          <span className="text-base select-none">👓</span>
        </button>

        {/* Center: Gauge Selector (Sono vs Amamentação) */}
        <div className="flex items-center space-x-1 bg-[#16182c]/90 border border-white/10 rounded-full p-1 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={onSwitchToSleepGauge}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <span>🌙</span>
            <span>Sono</span>
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-pink-400/40 shadow-xs flex items-center gap-1 cursor-default"
          >
            <span>🤱</span>
            <span>Amamentação</span>
          </button>
        </div>

        {/* Right: Quick adjustment for 24h baseline or switch to cards */}
        <div className="flex items-center space-x-1.5" ref={adjustRef}>
          <button
            type="button"
            onClick={() => setIsAdjust24hOpen(!isAdjust24hOpen)}
            title="Ajustar tempo acumulado nas 24h"
            className="p-2 rounded-full text-xs font-bold text-gray-300 hover:text-white bg-[#1b1e36]/80 border border-white/10 hover:border-pink-500/40 transition active:scale-95 cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-pink-300" />
          </button>
          <button
            type="button"
            onClick={onSwitchToCardsView}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-300 hover:text-white bg-[#1b1e36]/80 border border-white/10 flex items-center gap-1 cursor-pointer"
            title="Ver como Cards"
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Cards</span>
          </button>

          {/* Popover to adjust 24h baseline */}
          <AnimatePresence>
            {isAdjust24hOpen && onAdjust24hNursingSeconds && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-12 right-4 w-64 bg-[#141629] border border-pink-500/40 rounded-2xl p-3 shadow-2xl shadow-black/90 z-50 backdrop-blur-2xl text-white"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="text-xs font-bold text-pink-200">Ajustar Total em 24h</span>
                  <span className="text-[10px] text-gray-400">
                    {hoursInt}h {minsInt}m atuais
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 mb-2.5 leading-relaxed">
                  Adicione ou subtraia tempo de peito já realizado nas 24h para acertar o gráfico:
                </p>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      onAdjust24hNursingSeconds(15 * 60);
                      setIsAdjust24hOpen(false);
                    }}
                    className="py-1 px-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-[11px] font-bold text-pink-200 cursor-pointer"
                  >
                    +15 min
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAdjust24hNursingSeconds(30 * 60);
                      setIsAdjust24hOpen(false);
                    }}
                    className="py-1 px-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-[11px] font-bold text-pink-200 cursor-pointer"
                  >
                    +30 min
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAdjust24hNursingSeconds(60 * 60);
                      setIsAdjust24hOpen(false);
                    }}
                    className="py-1 px-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-[11px] font-bold text-purple-200 cursor-pointer"
                  >
                    +1 hora
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAdjust24hNursingSeconds(-15 * 60);
                      setIsAdjust24hOpen(false);
                    }}
                    className="py-1 px-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold text-gray-300 cursor-pointer"
                  >
                    -15 min
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Centerpiece: The Circular 24-Hour Arc Gauge */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-3">
        <div className="relative w-[310px] h-[310px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
          {/* SVG Arc Gauge with 24 Hours scale markers */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320" fill="none">
            <defs>
              {/* Linear Gradient for Track */}
              <linearGradient id="nursingTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2c1e40" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#1e1832" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#2e1b3d" stopOpacity="0.75" />
              </linearGradient>

              {/* Glowing Gradient for Nursing Progress Arc */}
              <linearGradient id="nursingProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="40%" stopColor="#c084fc" />
                <stop offset="80%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="nursingGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ec4899" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Background Track Arc representing full 24h */}
            <path
              d={trackPath}
              stroke="url(#nursingTrackGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Subtle glass reflection edge */}
            <path
              d={trackPath}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* 24-Hour Tick dots along track */}
            {/* 0h tick dot */}
            <circle cx="76.6" cy="243.4" r="2.5" fill="#f472b6" opacity="0.6" />
            {/* 3h tick dot (intermediate) */}
            <circle cx="56.0" cy="180.0" r="1.5" fill="#ffffff" opacity="0.3" />
            {/* 6h tick dot */}
            <circle cx="51.0" cy="114.8" r="2.5" fill="#c084fc" opacity="0.6" />
            {/* 9h tick dot (intermediate) */}
            <circle cx="98.0" cy="62.0" r="1.5" fill="#ffffff" opacity="0.3" />
            {/* 12h tick dot (top center) */}
            <circle cx="160.0" cy="42.0" r="3" fill="#818cf8" opacity="0.7" />
            {/* 15h tick dot (intermediate) */}
            <circle cx="222.0" cy="62.0" r="1.5" fill="#ffffff" opacity="0.3" />
            {/* 18h tick dot */}
            <circle cx="269.0" cy="114.8" r="2.5" fill="#c084fc" opacity="0.6" />
            {/* 21h tick dot (intermediate) */}
            <circle cx="264.0" cy="180.0" r="1.5" fill="#ffffff" opacity="0.3" />
            {/* 24h tick dot */}
            <circle cx="243.4" cy="243.4" r="2.5" fill="#f472b6" opacity="0.6" />

            {/* Foreground Progress Arc (Calculated from Nursing Hours / 24 Hours) */}
            <path
              d={trackPath}
              stroke="url(#nursingProgressGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              filter="url(#nursingGlow)"
              className="transition-all duration-700 ease-out"
            />

            {/* Scale Numbers around the Arc (0h, 6h, 12h, 18h, 24h) */}
            <text x="60" y="268" fill="#f472b6" fontSize="10" fontWeight="800" textAnchor="middle" opacity="0.85">
              0h
            </text>
            <text x="24" y="110" fill="#e9d5ff" fontSize="10" fontWeight="700" textAnchor="middle" opacity="0.8">
              6h
            </text>
            <text x="160" y="22" fill="#c7d2fe" fontSize="11" fontWeight="800" textAnchor="middle" opacity="0.9">
              12h
            </text>
            <text x="296" y="110" fill="#e9d5ff" fontSize="10" fontWeight="700" textAnchor="middle" opacity="0.8">
              18h
            </text>
            <text x="260" y="268" fill="#f472b6" fontSize="10" fontWeight="800" textAnchor="middle" opacity="0.85">
              24h
            </text>
          </svg>

          {/* Gauge Center Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-[230px]">
            {/* Display Mode Pill: Toggle between 24h Total and Active Session */}
            <div className="flex items-center space-x-1 mb-1.5 bg-black/40 p-0.5 rounded-full border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setCenterDisplayMode('24h')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition cursor-pointer ${
                  centerDisplayMode === '24h'
                    ? 'bg-pink-600/80 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Total 24h
              </button>
              <button
                type="button"
                onClick={() => setCenterDisplayMode('session')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                  centerDisplayMode === 'session'
                    ? 'bg-purple-600/80 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {activeSide && <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping shrink-0" />}
                <span>Sessão</span>
              </button>
            </div>

            {/* Main Big Digits */}
            {centerDisplayMode === '24h' ? (
              <div className="relative my-0.5 cursor-pointer" onClick={() => setCenterDisplayMode('session')} title="Toque para ver a sessão atual">
                <span className="text-[40px] sm:text-[44px] font-black tracking-tight text-white leading-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] font-mono">
                  {hoursInt.toString().padStart(2, '0')}h {minsInt.toString().padStart(2, '0')}m
                </span>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wider">
                    no peito / 24hrs
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative my-0.5 cursor-pointer" onClick={() => setCenterDisplayMode('24h')} title="Toque para ver o total das 24h">
                <span className="text-[44px] sm:text-[48px] font-black tracking-tight text-white leading-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] font-mono">
                  {formatTime(currentSessionSeconds)}
                </span>
                <span className="block text-[10px] text-purple-300 font-bold uppercase tracking-wider mt-1">
                  mamada atual
                </span>
              </div>
            )}

            {/* 24-Hour Accuracy Badge: Proporção Exata do dia */}
            <div className="mt-1 px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-400/30 text-pink-200 text-[10px] font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-pink-300" />
              <span>
                {progressPercent.toFixed(1)}% do dia ({totalHoursFloat.toFixed(1)}h / 24h)
              </span>
            </div>

            {/* Active Session Status & Side Breakdown */}
            <div className="mt-2 flex flex-col items-center">
              {activeSide ? (
                <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/25 border border-pink-400/50 text-[10px] font-extrabold text-pink-100 shadow-sm animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
                  <span>Mamando no {activeSide === 'left' ? 'Peito Esquerdo' : 'Peito Direito'}</span>
                </div>
              ) : currentSessionSeconds > 0 ? (
                <span className="text-[10.5px] font-semibold text-gray-300">
                  Mamada em pausa ({formatTime(currentSessionSeconds)})
                </span>
              ) : (
                <span className="text-[10px] text-gray-400">
                  Toque em um peito para mamar
                </span>
              )}

              {/* Side Breakdown tag */}
              <div className="flex items-center space-x-2 text-[10px] text-gray-300 mt-1">
                <span className={activeSide === 'left' ? 'text-pink-300 font-extrabold' : 'opacity-80'}>
                  Esq: {formatTime(leftSeconds)}
                </span>
                <span className="text-gray-500">·</span>
                <span className={activeSide === 'right' ? 'text-purple-300 font-extrabold' : 'opacity-80'}>
                  Dir: {formatTime(rightSeconds)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Finish & Save Session Button (appears when active or current session > 0) */}
        {currentSessionSeconds > 0 && (
          <div className="flex items-center space-x-2 mt-1">
            <button
              type="button"
              onClick={() => {
                const leftM = Math.max(0, Math.round(leftSeconds / 60));
                const rightM = Math.max(0, Math.round(rightSeconds / 60));
                onSaveSession(leftM, rightM);
              }}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 flex items-center space-x-1.5 active:scale-95 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Concluir e Salvar Mamada</span>
            </button>
            <button
              type="button"
              onClick={onResetTimers}
              title="Zerar cronômetro da mamada atual"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls: Peito Esquerdo, Peito Direito & Fórmula / Mamadeira */}
      <div className="relative z-20 pb-4 px-4 sm:px-6">
        <div className="grid grid-cols-3 gap-2.5 max-w-[420px] mx-auto relative">
          {/* Button 1: Peito Esquerdo com o timer */}
          <button
            type="button"
            onClick={() => onToggleSide('left')}
            className={`relative p-3 rounded-2xl flex flex-col items-center justify-between transition-all duration-200 active:scale-95 cursor-pointer border select-none overflow-hidden backdrop-blur-xl ${
              activeSide === 'left'
                ? 'bg-gradient-to-b from-pink-500/40 via-purple-600/35 to-pink-700/40 border-pink-400 ring-2 ring-pink-400/80 shadow-[0_0_22px_rgba(236,72,153,0.5)] text-white'
                : 'bg-[#1e1a34]/85 hover:bg-[#252042] border-white/15 text-gray-200 hover:border-pink-400/40 shadow-md'
            }`}
          >
            {/* Convex reflection highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl pointer-events-none" />

            <div className="flex items-center space-x-1 mb-1">
              {activeSide === 'left' ? (
                <Pause className="w-3.5 h-3.5 text-pink-300 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 text-pink-400/80" />
              )}
              <span className="text-[11px] font-black uppercase tracking-tight">Esq</span>
            </div>

            {/* Timer */}
            <span className="text-base font-extrabold font-mono text-white leading-tight">
              {formatTime(leftSeconds)}
            </span>

            {/* Status */}
            <span
              className={`text-[9.5px] font-semibold mt-1 px-1.5 py-0.5 rounded-full ${
                activeSide === 'left'
                  ? 'bg-pink-400/30 text-pink-200 border border-pink-300/40'
                  : 'text-gray-400'
              }`}
            >
              {activeSide === 'left' ? 'Mamando ●' : 'Toque p/ Iniciar'}
            </span>
          </button>

          {/* Button 2: Peito Direito com o timer */}
          <button
            type="button"
            onClick={() => onToggleSide('right')}
            className={`relative p-3 rounded-2xl flex flex-col items-center justify-between transition-all duration-200 active:scale-95 cursor-pointer border select-none overflow-hidden backdrop-blur-xl ${
              activeSide === 'right'
                ? 'bg-gradient-to-b from-purple-500/40 via-indigo-600/35 to-purple-700/40 border-purple-400 ring-2 ring-purple-400/80 shadow-[0_0_22px_rgba(168,85,247,0.5)] text-white'
                : 'bg-[#1e1a34]/85 hover:bg-[#252042] border-white/15 text-gray-200 hover:border-purple-400/40 shadow-md'
            }`}
          >
            {/* Convex reflection highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl pointer-events-none" />

            <div className="flex items-center space-x-1 mb-1">
              {activeSide === 'right' ? (
                <Pause className="w-3.5 h-3.5 text-purple-300 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 text-purple-400/80" />
              )}
              <span className="text-[11px] font-black uppercase tracking-tight">Dir</span>
            </div>

            {/* Timer */}
            <span className="text-base font-extrabold font-mono text-white leading-tight">
              {formatTime(rightSeconds)}
            </span>

            {/* Status */}
            <span
              className={`text-[9.5px] font-semibold mt-1 px-1.5 py-0.5 rounded-full ${
                activeSide === 'right'
                  ? 'bg-purple-400/30 text-purple-200 border border-purple-300/40'
                  : 'text-gray-400'
              }`}
            >
              {activeSide === 'right' ? 'Mamando ●' : 'Toque p/ Iniciar'}
            </span>
          </button>

          {/* Button 3: Fórmula / Mamadeira (opens popover directing to information screen) */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setIsFormulaPopoverOpen(!isFormulaPopoverOpen)}
              className={`w-full h-full relative p-3 rounded-2xl flex flex-col items-center justify-between transition-all duration-200 active:scale-95 cursor-pointer border select-none overflow-hidden backdrop-blur-xl ${
                isFormulaPopoverOpen
                  ? 'bg-gradient-to-b from-teal-500/40 via-emerald-600/35 to-teal-700/40 border-teal-300 ring-2 ring-teal-400/80 shadow-[0_0_22px_rgba(20,184,166,0.5)] text-white'
                  : 'bg-[#182338]/85 hover:bg-[#1d2d47] border-teal-500/30 text-teal-100 hover:border-teal-400/50 shadow-md'
              }`}
            >
              {/* Convex reflection highlight */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl pointer-events-none" />

              <div className="flex items-center space-x-1 mb-1">
                <span className="text-base">🍼</span>
                <span className="text-[11px] font-black uppercase tracking-tight text-teal-200">
                  Fórmula
                </span>
              </div>

              {/* Icon / Label */}
              <span className="text-xs font-bold text-white text-center leading-tight">
                Mamadeira
              </span>

              {/* Status prompt */}
              <span className="text-[9.5px] font-semibold mt-1 px-1.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-300/30">
                Inserir Dados ▾
              </span>
            </button>

            {/* Formula Popover directing to insert info screen / drawer */}
            <AnimatePresence>
              {isFormulaPopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-3 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-72 bg-[#121528] border border-teal-500/40 rounded-3xl p-3.5 shadow-2xl shadow-black/80 z-50 backdrop-blur-2xl text-white"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🍼</span>
                      <div>
                        <h4 className="text-xs font-extrabold text-white">Mamadeira / Fórmula</h4>
                        <p className="text-[10px] text-teal-200/80">Escolha o volume ou insira detalhes</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick ML Presets */}
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Volumes Rápidos:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[60, 90, 120, 150].map((ml) => (
                        <button
                          key={ml}
                          type="button"
                          onClick={() => {
                            onQuickSaveFormula(ml);
                            setIsFormulaPopoverOpen(false);
                          }}
                          className="py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/30 border border-teal-500/30 text-teal-200 hover:text-white text-xs font-extrabold transition active:scale-95 cursor-pointer"
                        >
                          {ml}ml
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct button to open full Formula Drawer / Info screen */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormulaPopoverOpen(false);
                      onOpenFormulaDrawer();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#0c0d16] font-black text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Inserir Informações Detalhadas</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

