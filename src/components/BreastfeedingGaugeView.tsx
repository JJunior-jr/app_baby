import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Baby,
  Play,
  Check,
  Milk,
  Heart,
  Clock,
  List,
  ChevronRight,
  Info,
  Sliders,
  Sparkles,
  Plus,
  Minus,
  Settings2,
  Sun,
  Moon,
  Droplets,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UserProfile } from '../types';
import { isDaytimeInBrazil } from '../services/brazilTime';
import { FloatingGaugeSelector, GaugeMode } from './FloatingGaugeSelector';

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
  onQuickSaveFormula: (ml: number, leftoverMl?: number) => void;
  onSwitchToCardsView: () => void;
  onSwitchToSleepGauge: () => void;
  onSwitchToDiaperGauge?: () => void;
  gaugeSubView?: GaugeMode;
  onSelectGaugeMode?: (mode: GaugeMode) => void;
  isSleeping?: boolean;
  onToggleSleep?: () => void;
  onOpenDiaperModal?: () => void;
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

const QUICK_FORMULA_OFFERED = [60, 90, 120, 150, 180, 210];
const QUICK_FORMULA_LEFTOVER = [0, 10, 20, 30, 40, 50];

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
  onSwitchToDiaperGauge,
  gaugeSubView,
  onSelectGaugeMode,
  isSleeping = false,
  onToggleSleep,
  onOpenDiaperModal,
}) => {
  // Daytime state for Brazil timezone (updates every 10 seconds)
  const [isDaytime, setIsDaytime] = useState<boolean>(() => isDaytimeInBrazil());

  useEffect(() => {
    const updateTime = () => setIsDaytime(isDaytimeInBrazil());
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Popover state for formula / bottle
  const [isFormulaPopoverOpen, setIsFormulaPopoverOpen] = useState(false);
  const [quickOffered, setQuickOffered] = useState<number>(120);
  const [quickLeftover, setQuickLeftover] = useState<number>(0);
  const [isAdjust24hOpen, setIsAdjust24hOpen] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('');
  const [centerDisplayMode, setCenterDisplayMode] = useState<'24h' | 'session'>('24h');
  const [isControlsExpanded, setIsControlsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('babyjohn_nursing_controls_expanded');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleControlsExpanded = () => {
    setIsControlsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('babyjohn_nursing_controls_expanded', String(next));
      } catch {}
      return next;
    });
  };

  // Automatically expand controls when an active nursing session starts
  useEffect(() => {
    if (activeSide) {
      setIsControlsExpanded(true);
    }
  }, [activeSide]);

  const popoverRef = useRef<HTMLDivElement>(null);
  const adjustRef = useRef<HTMLDivElement>(null);

  const handleApplyCustomMinutes = (multiplier: 1 | -1) => {
    const mins = parseInt(customMinutesInput, 10);
    if (isNaN(mins) || mins <= 0) return;
    if (onAdjust24hNursingSeconds) {
      onAdjust24hNursingSeconds(mins * 60 * multiplier);
    }
    setCustomMinutesInput('');
    setIsAdjust24hOpen(false);
  };

  const handleSetExactTotalMinutes = () => {
    const mins = parseInt(customMinutesInput, 10);
    if (isNaN(mins) || mins < 0) return;
    const targetSeconds = mins * 60;
    const diff = targetSeconds - total24hNursingSeconds;
    if (onAdjust24hNursingSeconds) {
      onAdjust24hNursingSeconds(diff);
    }
    setCustomMinutesInput('');
    setIsAdjust24hOpen(false);
  };

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
      {/* Background Deep Cosmic Gradient (60% Dominant token) */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-300"
        style={{
          background: 'radial-gradient(ellipse at top, var(--color-secondary) 0%, var(--color-dominant) 100%)',
        }}
      />

      {/* Gentle Radial Atmosphere Glow behind Gauge */}
      <div
        className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />

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



      {/* Centerpiece: The Circular 24-Hour Arc Gauge */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 min-h-0 px-3 py-1">
        {/* Display Mode Toggle: Positioned OUTSIDE above the gauge SVG */}
        <div
          className={`flex items-center space-x-1 bg-[#0f172a]/90 backdrop-blur-md rounded-xl border border-[#334155] shadow-xs shrink-0 z-20 transition-all duration-200 ${
            isControlsExpanded ? 'mb-1 p-0.5' : 'mb-2 p-1'
          }`}
        >
          <button
            type="button"
            onClick={() => setCenterDisplayMode('24h')}
            className={`px-3 py-1 rounded-lg text-[10.5px] font-extrabold transition cursor-pointer ${
              centerDisplayMode === '24h'
                ? 'bg-pink-600/90 text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Total 24h
          </button>
          <button
            type="button"
            onClick={() => setCenterDisplayMode('session')}
            className={`px-3 py-1 rounded-lg text-[10.5px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
              centerDisplayMode === 'session'
                ? 'bg-purple-600/90 text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {activeSide && <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping shrink-0" />}
            <span>Sessão</span>
          </button>
        </div>

        {/* SVG Arc Gauge Wrapper */}
        <div
          className={`relative flex items-center justify-center shrink-0 transition-all duration-300 ease-out ${
            isControlsExpanded
              ? 'w-[195px] h-[195px] xs:w-[215px] xs:h-[215px] sm:w-[235px] sm:h-[235px]'
              : 'w-[250px] h-[250px] xs:w-[270px] xs:h-[270px] sm:w-[285px] sm:h-[285px]'
          }`}
        >
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
            <circle cx="76.6" cy="243.4" r="2.5" fill="#f472b6" opacity="0.6" />
            <circle cx="56.0" cy="180.0" r="1.5" fill="#ffffff" opacity="0.3" />
            <circle cx="51.0" cy="114.8" r="2.5" fill="#c084fc" opacity="0.6" />
            <circle cx="98.0" cy="62.0" r="1.5" fill="#ffffff" opacity="0.3" />
            <circle cx="160.0" cy="42.0" r="3" fill="#818cf8" opacity="0.7" />
            <circle cx="222.0" cy="62.0" r="1.5" fill="#ffffff" opacity="0.3" />
            <circle cx="269.0" cy="114.8" r="2.5" fill="#c084fc" opacity="0.6" />
            <circle cx="264.0" cy="180.0" r="1.5" fill="#ffffff" opacity="0.3" />
            <circle cx="243.4" cy="243.4" r="2.5" fill="#f472b6" opacity="0.6" />

            {/* Foreground Progress Arc */}
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

            {/* Scale Numbers around the Arc */}
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

          {/* Gauge Center Content: Compact & essential only to fit comfortably inside the ring */}
          <div
            className={`relative z-10 flex flex-col items-center justify-center text-center px-2 transition-all duration-300 ${
              isControlsExpanded ? 'max-w-[150px]' : 'max-w-[190px]'
            }`}
          >
            {centerDisplayMode === '24h' ? (
              <div
                className="relative cursor-pointer flex flex-col items-center"
                onClick={() => setCenterDisplayMode('session')}
                title="Toque para ver a sessão atual"
              >
                <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wider mb-0.5">
                  no peito (24h)
                </span>
                <span
                  className={`font-black tracking-tight text-white leading-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] font-mono transition-all duration-300 ${
                    isControlsExpanded
                      ? 'text-[28px] xs:text-[32px]'
                      : 'text-[36px] sm:text-[40px]'
                  }`}
                >
                  {hoursInt.toString().padStart(2, '0')}h {minsInt.toString().padStart(2, '0')}m
                </span>
                <span className="text-[9.5px] text-gray-300/80 font-medium mt-0.5">
                  {progressPercent.toFixed(1)}% do dia
                </span>
              </div>
            ) : (
              <div
                className="relative cursor-pointer flex flex-col items-center"
                onClick={() => setCenterDisplayMode('24h')}
                title="Toque para ver o total das 24h"
              >
                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-0.5">
                  mamada atual
                </span>
                <span
                  className={`font-black tracking-tight text-white leading-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] font-mono transition-all duration-300 ${
                    isControlsExpanded
                      ? 'text-[30px] xs:text-[34px]'
                      : 'text-[38px] sm:text-[42px]'
                  }`}
                >
                  {formatTime(currentSessionSeconds)}
                </span>
                {activeSide && (
                  <span className="text-[9.5px] text-pink-300 font-bold mt-0.5 animate-pulse">
                    Peito {activeSide === 'left' ? 'Esquerdo' : 'Direito'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Details & Prompts: Positioned OUTSIDE below the gauge SVG */}
        <div
          className={`flex flex-col items-center shrink-0 z-20 transition-all duration-300 ${
            isControlsExpanded ? 'mt-1 mb-0.5' : 'mt-2.5 mb-1.5'
          }`}
        >
          {activeSide ? (
            <div
              className={`flex items-center space-x-1.5 text-xs font-bold text-pink-300 animate-pulse bg-pink-950/40 px-3 ${
                isControlsExpanded ? 'py-0.5 text-[11px]' : 'py-1 text-xs'
              } rounded-full border border-pink-500/30`}
            >
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              <span>Mamando no {activeSide === 'left' ? 'Peito Esquerdo' : 'Peito Direito'}</span>
            </div>
          ) : currentSessionSeconds > 0 ? (
            <span
              className={`font-semibold text-gray-200 bg-slate-800/80 px-3 ${
                isControlsExpanded ? 'py-0.5 text-[11px]' : 'py-1 text-xs'
              } rounded-full border border-slate-700`}
            >
              Mamada em pausa ({formatTime(currentSessionSeconds)})
            </span>
          ) : (
            <span
              className={`font-medium text-gray-300 bg-slate-800/60 px-3 ${
                isControlsExpanded ? 'py-0.5 text-[11px]' : 'py-1 text-xs'
              } rounded-full border border-slate-700/60`}
            >
              Toque em um peito para mamar
            </span>
          )}

          {/* Side Breakdown tag */}
          <div
            className={`flex items-center space-x-2 text-[11px] text-gray-300 font-medium ${
              isControlsExpanded ? 'mt-0.5' : 'mt-1.5'
            }`}
          >
            <span className={activeSide === 'left' ? 'text-pink-300 font-extrabold' : 'opacity-85'}>
              Esq: {formatTime(leftSeconds)}
            </span>
            <span className="text-gray-500">·</span>
            <span className={activeSide === 'right' ? 'text-purple-300 font-extrabold' : 'opacity-85'}>
              Dir: {formatTime(rightSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Controls: Peito Esquerdo, Peito Direito & Fórmula (Retrátil & Expansível) */}
      <div className="relative z-20 pb-1.5 pt-0.5 px-3 sm:px-6 flex flex-col items-center justify-center shrink-0 w-full">
        <AnimatePresence mode="wait">
          {!isControlsExpanded ? (
            /* Retracted / Collapsed Dynamic Bar */
            <motion.div
              key="controls-collapsed"
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-[420px] mx-auto flex items-center justify-center py-0.5"
            >
              <button
                type="button"
                onClick={toggleControlsExpanded}
                className="group flex items-center justify-center space-x-2 py-1.5 px-4 rounded-full bg-[#1e293b]/95 hover:bg-slate-700/80 border border-[#334155] text-xs font-semibold text-slate-200 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm select-none"
                title="Expandir botões de amamentação e fórmula"
              >
                <span className={`w-2 h-2 rounded-full ${activeSide ? 'bg-pink-400 animate-ping' : 'bg-pink-400'}`} />
                <Baby className="w-3.5 h-3.5 text-pink-300 group-hover:scale-110 transition-transform" />
                <span>
                  {activeSide
                    ? `Mamando no ${activeSide === 'left' ? 'Esquerdo' : 'Direito'} (${formatTime(activeSide === 'left' ? leftSeconds : rightSeconds)})`
                    : 'Controles de Mamada'}
                </span>
                <span className="text-[10px] text-gray-400 group-hover:text-gray-300 font-normal">
                  · Expandir
                </span>
                <ChevronUp className="w-3.5 h-3.5 text-pink-300 group-hover:translate-y-[-1px] transition-transform" />
              </button>
            </motion.div>
          ) : (
            /* Expanded Full Controls with Header and Retract Trigger */
            <motion.div
              key="controls-expanded"
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`w-full max-w-[420px] mx-auto flex flex-col items-center ${
                isFormulaPopoverOpen ? 'overflow-visible' : 'overflow-hidden'
              }`}
            >
              {/* Header bar with Retrair button */}
              <div className="flex items-center justify-between w-full mb-1 px-1 select-none">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    Controles de Mamada
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleControlsExpanded}
                  className="flex items-center space-x-1 px-2 py-0.5 rounded-md hover:bg-slate-800/80 border border-transparent hover:border-slate-700 text-[10px] font-medium text-slate-400 hover:text-slate-200 transition active:scale-95 cursor-pointer"
                  title="Retrair controles para liberar espaço"
                >
                  <span>Retrair</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full mx-auto items-stretch relative">
                {/* Button 1: Peito Esquerdo com o timer */}
                <button
                  type="button"
                  onClick={() => onToggleSide('left')}
                  className={`px-1 py-1.5 h-[74px] rounded-xl flex flex-col items-center justify-between text-center transition-all duration-150 active:scale-95 cursor-pointer border select-none overflow-hidden ${
                    activeSide === 'left'
                      ? 'bg-pink-700 text-white border-pink-500 shadow-md ring-2 ring-pink-400/50'
                      : 'bg-[#1e293b] hover:bg-slate-700/60 border-[#334155] text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center w-full text-center shrink-0">
                    {activeSide === 'left' ? (
                      <Check className="w-3.5 h-3.5 text-pink-200 stroke-[3]" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-pink-400 -scale-x-100" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-tight leading-tight mt-0.5">
                      Esquerda
                    </span>
                  </div>

                  {/* Timer */}
                  <span className="text-sm font-bold font-mono text-white leading-none w-full text-center my-0.5">
                    {formatTime(leftSeconds)}
                  </span>

                  {/* Status */}
                  <span
                    className={`text-[8.5px] sm:text-[9px] font-medium transition-colors w-full text-center whitespace-nowrap leading-tight tracking-tight ${
                      activeSide === 'left'
                        ? 'text-pink-200 font-bold'
                        : 'text-gray-400'
                    }`}
                  >
                    {activeSide === 'left' ? 'Toque p/ Concluir ●' : 'Toque p/ Iniciar'}
                  </span>
                </button>

                {/* Button 2: Peito Direito com o timer */}
                <button
                  type="button"
                  onClick={() => onToggleSide('right')}
                  className={`px-1 py-1.5 h-[74px] rounded-xl flex flex-col items-center justify-between text-center transition-all duration-150 active:scale-95 cursor-pointer border select-none overflow-hidden ${
                    activeSide === 'right'
                      ? 'bg-purple-700 text-white border-purple-500 shadow-md ring-2 ring-purple-400/50'
                      : 'bg-[#1e293b] hover:bg-slate-700/60 border-[#334155] text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center w-full text-center shrink-0">
                    {activeSide === 'right' ? (
                      <Check className="w-3.5 h-3.5 text-purple-200 stroke-[3]" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-tight leading-tight mt-0.5">
                      Direita
                    </span>
                  </div>

                  {/* Timer */}
                  <span className="text-sm font-bold font-mono text-white leading-none w-full text-center my-0.5">
                    {formatTime(rightSeconds)}
                  </span>

                  {/* Status */}
                  <span
                    className={`text-[8.5px] sm:text-[9px] font-medium transition-colors w-full text-center whitespace-nowrap leading-tight tracking-tight ${
                      activeSide === 'right'
                        ? 'text-purple-200 font-bold'
                        : 'text-gray-400'
                    }`}
                  >
                    {activeSide === 'right' ? 'Toque p/ Concluir ●' : 'Toque p/ Iniciar'}
                  </span>
                </button>

                {/* Button 3: Fórmula */}
                <div className="relative w-full h-[74px]" ref={popoverRef}>
                  <button
                    type="button"
                    onClick={() => setIsFormulaPopoverOpen(!isFormulaPopoverOpen)}
                    className={`w-full h-full px-1 py-1.5 rounded-xl flex flex-col items-center justify-between text-center transition-all duration-150 active:scale-95 cursor-pointer border select-none overflow-hidden ${
                      isFormulaPopoverOpen
                        ? 'bg-teal-700 text-white border-teal-500 shadow-md'
                        : 'bg-[#1e293b] hover:bg-slate-700/60 border-[#334155] text-teal-200 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center w-full text-center shrink-0">
                      <Milk className="w-3.5 h-3.5 text-teal-300" />
                      <span className="text-[10px] font-bold uppercase tracking-tight text-teal-300 leading-tight mt-0.5">
                        Fórmula
                      </span>
                    </div>

                    {/* Status prompt */}
                    <span className="text-[8.5px] sm:text-[9px] font-medium text-teal-300 w-full text-center whitespace-nowrap leading-tight tracking-tight">
                      Inserir Dados ▾
                    </span>
                  </button>

                  {/* Formula Popover */}
                  <AnimatePresence>
                    {isFormulaPopoverOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-3 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-72 bg-[#1e293b] border border-[#334155] rounded-xl p-3.5 shadow-xl z-50 text-white"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                          <div className="flex items-center space-x-2">
                            <Milk className="w-4 h-4 text-teal-400" />
                            <div>
                              <h4 className="text-xs font-bold text-white">Mamadeira / Fórmula</h4>
                              <p className="text-[10px] text-teal-200/80">Escolha o volume ou insira detalhes</p>
                            </div>
                          </div>
                        </div>

                        {/* 2 Vertical Columns: Ofertado & Sobrou */}
                        <div className="grid grid-cols-2 gap-2 mb-2.5">
                          {/* Column 1: Ofertado */}
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-1 px-0.5">
                              <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">
                                Ofertado:
                              </span>
                              <span className="text-[11px] font-mono font-extrabold text-white">
                                {quickOffered}ml
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              {QUICK_FORMULA_OFFERED.map((ml) => {
                                const isSelected = quickOffered === ml;
                                return (
                                  <button
                                    key={`offered-${ml}`}
                                    type="button"
                                    onClick={() => setQuickOffered(ml)}
                                    className={`py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-between border active:scale-95 cursor-pointer ${
                                      isSelected
                                        ? 'bg-teal-500 border-teal-400 text-[#0c0d16] font-black shadow-xs'
                                        : 'bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/25 text-teal-200'
                                    }`}
                                  >
                                    <span>{ml} ml</span>
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Column 2: Sobrou */}
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-1 px-0.5">
                              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                                Sobrou:
                              </span>
                              <span className="text-[11px] font-mono font-extrabold text-white">
                                {quickLeftover}ml
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              {QUICK_FORMULA_LEFTOVER.map((ml) => {
                                const isSelected = quickLeftover === ml;
                                return (
                                  <button
                                    key={`leftover-${ml}`}
                                    type="button"
                                    onClick={() => setQuickLeftover(ml)}
                                    className={`py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-between border active:scale-95 cursor-pointer ${
                                      isSelected
                                        ? 'bg-amber-400 border-amber-300 text-[#0c0d16] font-black shadow-xs'
                                        : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/25 text-amber-200'
                                    }`}
                                  >
                                    <span>{ml === 0 ? '0 ml (tudo)' : `${ml} ml`}</span>
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Quick Save button with net consumed amount */}
                        <button
                          type="button"
                          onClick={() => {
                            onQuickSaveFormula(quickOffered, quickLeftover);
                            setIsFormulaPopoverOpen(false);
                          }}
                          className="w-full py-2 px-3 mb-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#0c0d16] font-black text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>
                            Salvar {Math.max(0, quickOffered - quickLeftover)}ml tomados
                            {quickLeftover > 0 ? ` (${quickOffered} - ${quickLeftover}ml)` : ''}
                          </span>
                        </button>

                        {/* Diminished button to open full Formula Drawer / Detailed info */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormulaPopoverOpen(false);
                            onOpenFormulaDrawer();
                          }}
                          className="w-full py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-semibold flex items-center justify-center space-x-1.5 border border-white/10 active:scale-95 transition cursor-pointer"
                        >
                          <Sliders className="w-3 h-3 text-teal-300" />
                          <span>Inserir informações detalhadas</span>
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Floating Quick Actions: 3 buttons with ideal UX spacing (12px mobile, 16px desktop) and 48x48px touch targets */}
      <div className="relative z-20 pb-3 sm:pb-4 px-4 sm:px-6 shrink-0 w-full">
        <div
          className="quick-actions-buttons-container flex items-center justify-center mx-auto"
          style={{ gap: 'var(--quick-actions-gap, 12px)' }}
        >
          {/* Action 1: Sun or Moon Button navigating to Sleep gauge */}
          <button
            type="button"
            onClick={onSwitchToSleepGauge}
            title={
              isSleeping
                ? 'Ir para Medidor de Sono (Em andamento)'
                : isDaytime
                  ? 'Ir para Medidor de Soneca'
                  : 'Ir para Medidor de Sono'
            }
            className={`relative flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl transition duration-150 active:scale-95 cursor-pointer border shadow-sm ${
              !isSleeping
                ? isDaytime
                  ? 'bg-amber-600 hover:bg-amber-500 border-amber-400 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white'
                : 'bg-teal-600 hover:bg-teal-500 border-teal-400 text-white'
            }`}
          >
            <div className="flex flex-col items-center justify-center">
              {isDaytime ? (
                <Sun className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Moon className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            {isSleeping && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
            )}
          </button>

          {/* Action 2: Diaper / Fralda */}
          <button
            type="button"
            onClick={onSwitchToDiaperGauge || onOpenDiaperModal}
            title="Ir para Medidor de Fralda"
            className="relative flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-[#1e293b] hover:bg-slate-700/60 border border-[#334155] text-teal-300 hover:text-white transition duration-150 active:scale-95 cursor-pointer shadow-sm"
          >
            <Droplets className="w-5 h-5 text-teal-300" />
          </button>

          {/* Action 3: Formula / Mamadeira */}
          <button
            type="button"
            onClick={onOpenFormulaDrawer}
            title="Registrar Mamadeira"
            className="relative flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-[#1e293b] hover:bg-slate-700/60 border border-[#334155] text-cyan-300 hover:text-white transition duration-150 active:scale-95 cursor-pointer shadow-sm"
          >
            <Milk className="w-5 h-5 text-cyan-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

