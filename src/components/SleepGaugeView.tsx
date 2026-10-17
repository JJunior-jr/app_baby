import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  CloudRain,
  Volume2,
  VolumeX,
  Sparkles,
  List,
  Info,
  Clock,
  CheckCircle2,
  Play,
  Square,
  Lock,
  Music,
  BellRing,
  Settings2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { isDaytime, isDaytimeInBrazil, getBrazilTimeString } from '../services/brazilTime';
import {
  whiteNoiseService,
  WhiteNoiseTrack,
} from '../services/whiteNoiseAudio';
import { WhiteNoisePlaylistModal } from './modals/WhiteNoisePlaylistModal';

interface SleepGaugeViewProps {
  currentUser: UserProfile | null;
  isSleeping: boolean;
  sleepSeconds: number;
  onToggleSleep: () => void;
  onOpenSleepModal: () => void;
  onOpenDiaperModal: () => void;
  onOpenFormulaDrawer: () => void;
  onSwitchToCardsView: () => void;
  onSwitchToBreastfeedingGauge?: () => void;
  onSwitchToDiaperGauge?: () => void;
  onOpenNotificationCenter?: () => void;
  onAdjustSleepSeconds?: (deltaSeconds: number) => void;
}

// Generate deterministic stars for the night sky backdrop
const STARS = Array.from({ length: 42 }).map((_, i) => ({
  id: i,
  top: `${((i * 37 + 13) % 94) + 3}%`,
  left: `${((i * 47 + 29) % 94) + 3}%`,
  size: (i % 3 === 0 ? 2.5 : i % 2 === 0 ? 2 : 1.2),
  opacity: (i % 4 === 0 ? 0.85 : i % 3 === 0 ? 0.55 : 0.35),
  delay: (i % 5) * 0.7,
  duration: 2 + (i % 4),
}));

export const SleepGaugeView: React.FC<SleepGaugeViewProps> = ({
  currentUser,
  isSleeping,
  sleepSeconds,
  onToggleSleep,
  onOpenSleepModal,
  onOpenDiaperModal,
  onOpenFormulaDrawer,
  onSwitchToCardsView,
  onSwitchToBreastfeedingGauge,
  onSwitchToDiaperGauge,
  onOpenNotificationCenter,
  onAdjustSleepSeconds,
}) => {
  // Sleep time adjustment state
  const [isAdjustSleepOpen, setIsAdjustSleepOpen] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('');
  const adjustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (adjustRef.current && !adjustRef.current.contains(e.target as Node)) {
        setIsAdjustSleepOpen(false);
      }
    };
    if (isAdjustSleepOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAdjustSleepOpen]);

  // Current real-time clock for the big display or elapsed sleep mode (Brazil Time)
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(() => getBrazilTimeString());
  const [isDaytime, setIsDaytime] = useState<boolean>(() => isDaytimeInBrazil());

  // Display mode inside the gauge: 'clock' (showing e.g. 21:46) vs 'timer' (showing e.g. 02:15)
  const [displayMode, setDisplayMode] = useState<'clock' | 'timer'>('clock');
  
  // Soothing white noise playlist & ambient sound state
  const [isPlayingSound, setIsPlayingSound] = useState(() => whiteNoiseService.isPlaying());
  const [currentTrack, setCurrentTrack] = useState<WhiteNoiseTrack>(() =>
    whiteNoiseService.getCurrentTrack()
  );
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState<string | null>(null);

  // Sync with whiteNoiseService
  useEffect(() => {
    const handleSoundChange = () => {
      setIsPlayingSound(whiteNoiseService.isPlaying());
      setCurrentTrack(whiteNoiseService.getCurrentTrack());
    };
    const unsubscribe = whiteNoiseService.subscribe(handleSoundChange);
    handleSoundChange();
    return () => unsubscribe();
  }, []);

  // Update clock time and Brazil daytime status every 10 seconds
  useEffect(() => {
    const updateTime = () => {
      setCurrentTimeStr(getBrazilTimeString());
      setIsDaytime(isDaytimeInBrazil());
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Format sleep elapsed seconds into HH:MM or MM:SS
  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleOpenPlaylist = () => {
    setIsPlaylistOpen(true);
  };

  // Arc Gauge Geometry (270 degrees total sweep, open at bottom)
  // Center (160, 160), radius = 118
  // Start angle: 135° (bottom left) -> End angle: 405° / 45° (bottom right)
  const cx = 160;
  const cy = 160;
  const r = 118;
  const strokeWidth = 26;

  // Track arc path (from 135 deg to 45 deg clockwise = 270 deg)
  // cos(135) = -0.7071, sin(135) = 0.7071
  // x1 = 160 - 118 * 0.7071 = 76.56, y1 = 160 + 118 * 0.7071 = 243.44
  // x2 = 160 + 118 * 0.7071 = 243.44, y2 = 160 + 118 * 0.7071 = 243.44
  const startX = (cx - r * 0.7071).toFixed(2);
  const startY = (cy + r * 0.7071).toFixed(2);
  const endX = (cx + r * 0.7071).toFixed(2);
  const endY = (cy + r * 0.7071).toFixed(2);
  const trackPath = `M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`;

  // Arc length for 270 degrees = (270 / 360) * 2 * PI * r = 0.75 * 2 * 3.14159 * 118 ≈ 556
  const arcLength = 2 * Math.PI * r * 0.75;

  // Calculate progress percentage: if sleeping, maps up to 3 hours (10800s); if awake, maps elapsed awake
  const maxSeconds = 3 * 3600;
  const sleepProgressPercent = isSleeping
    ? Math.min(100, Math.max(8, (sleepSeconds / maxSeconds) * 100))
    : 15;
  const strokeDashoffset = arcLength - (arcLength * sleepProgressPercent) / 100;

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

      {/* Top Header Bar inside Gauge View (30% Secondary token) */}
      <div className="relative z-20 px-4 pt-2.5 flex items-center justify-end">
        {/* Right: Quick adjustment for sleep time & Lista switch */}
        <div className="flex items-center space-x-1.5 shrink-0 pt-0.5" ref={adjustRef}>
          <button
            type="button"
            onClick={() => setIsAdjustSleepOpen(!isAdjustSleepOpen)}
            title="Ajustar tempo de sono"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-gray-200 hover:text-white backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 transition active:scale-95 cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)]"
          >
            <Settings2 className="w-4 h-4 text-amber-300" />
          </button>
          <button
            type="button"
            onClick={onSwitchToCardsView}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-gray-200 hover:text-white backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 transition active:scale-95 cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)] shrink-0"
            title="Voltar para lista"
          >
            <List className="w-4 h-4 text-gray-200" />
          </button>

          {/* Popover to adjust sleep time */}
          <AnimatePresence>
            {isAdjustSleepOpen && onAdjustSleepSeconds && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-12 right-2 w-72 bg-[#12162a] border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl shadow-black/90 z-50 backdrop-blur-2xl text-white"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="text-xs font-bold text-amber-200">Ajustar Tempo de Sono</span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {Math.floor(sleepSeconds / 3600)}h {Math.floor((sleepSeconds % 3600) / 60)}m atuais
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 mb-2.5 leading-relaxed">
                  {isSleeping
                    ? 'Adicione ou subtraia tempo do sono em andamento:'
                    : 'Adicione ou subtraia tempo do último sono registrado:'}
                </p>

                {/* Quick Deltas */}
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onAdjustSleepSeconds(15 * 60);
                      setIsAdjustSleepOpen(false);
                    }}
                    className="py-1 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold text-amber-200 cursor-pointer"
                  >
                    +15 min
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAdjustSleepSeconds(30 * 60);
                      setIsAdjustSleepOpen(false);
                    }}
                    className="py-1 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold text-amber-200 cursor-pointer"
                  >
                    +30 min
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAdjustSleepSeconds(60 * 60);
                      setIsAdjustSleepOpen(false);
                    }}
                    className="py-1 px-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-[11px] font-bold text-indigo-200 cursor-pointer"
                  >
                    +1 hora
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAdjustSleepSeconds(-15 * 60);
                      setIsAdjustSleepOpen(false);
                    }}
                    className="py-1 px-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold text-gray-300 cursor-pointer"
                  >
                    -15 min
                  </button>
                </div>

                {/* Custom Minutes Input */}
                <div className="border-t border-white/10 pt-2.5">
                  <span className="text-[10px] font-bold text-amber-300 block mb-1.5">
                    Ou tempo personalizado (em minutos):
                  </span>
                  <div className="flex items-center gap-1.5 mb-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Ex: 45"
                      value={customMinutesInput}
                      onChange={(e) => setCustomMinutesInput(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <span className="text-[11px] text-gray-400 font-medium">min</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      disabled={!customMinutesInput || parseInt(customMinutesInput, 10) <= 0}
                      onClick={() => {
                        const mins = parseInt(customMinutesInput, 10);
                        if (!isNaN(mins) && mins > 0) {
                          onAdjustSleepSeconds(mins * 60);
                          setCustomMinutesInput('');
                          setIsAdjustSleepOpen(false);
                        }
                      }}
                      className="py-1 px-2 rounded-xl bg-amber-600/40 hover:bg-amber-600/60 disabled:opacity-40 border border-amber-400/50 text-[10.5px] font-bold text-white transition active:scale-95 cursor-pointer"
                    >
                      + Adicionar
                    </button>
                    <button
                      type="button"
                      disabled={!customMinutesInput || parseInt(customMinutesInput, 10) <= 0}
                      onClick={() => {
                        const mins = parseInt(customMinutesInput, 10);
                        if (!isNaN(mins) && mins > 0) {
                          onAdjustSleepSeconds(-mins * 60);
                          setCustomMinutesInput('');
                          setIsAdjustSleepOpen(false);
                        }
                      }}
                      className="py-1 px-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 border border-white/20 text-[10.5px] font-bold text-gray-300 transition active:scale-95 cursor-pointer"
                    >
                      - Subtrair
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sound Toast Feedback */}
      <AnimatePresence>
        {soundFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-xl bg-[#1f2340] border border-purple-400/40 text-[11px] text-purple-200 font-bold shadow-xl flex items-center space-x-1.5"
          >
            <span>{soundFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centerpiece: The Large Minimalist Circular Arc Gauge */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4">
        <div className="relative w-[300px] h-[300px] flex items-center justify-center">
          {/* SVG Arc Gauge */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-0"
            viewBox="0 0 320 320"
            fill="none"
          >
            <defs>
              {/* Linear Gradient for Gauge Track */}
              <linearGradient id="gaugeTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#25294a" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#1e223f" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#282d54" stopOpacity="0.7" />
              </linearGradient>

              {/* Glowing Gradient for Sleep Progress Arc */}
              <linearGradient id="gaugeProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isSleeping ? '#38bdf8' : '#eab308'} />
                <stop offset="50%" stopColor={isSleeping ? '#818cf8' : '#f59e0b'} />
                <stop offset="100%" stopColor={isSleeping ? '#c084fc' : '#fbbf24'} />
              </linearGradient>

              {/* Drop Shadow filter for progress line */}
              <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="4"
                  floodColor={isSleeping ? '#818cf8' : '#f59e0b'}
                  floodOpacity="0.55"
                />
              </filter>
            </defs>

            {/* Background Track Arc (The deep horseshoe arc in screenshot) */}
            <path
              d={trackPath}
              stroke="url(#gaugeTrackGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Subtle inner accent stroke for liquid glass edge */}
            <path
              d={trackPath}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Foreground Progress Arc */}
            <path
              d={trackPath}
              stroke="url(#gaugeProgressGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              filter="url(#gaugeGlow)"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Gauge Center Content (Exact typographic layout from screenshot) */}
          <div
            onClick={() => setDisplayMode(displayMode === 'clock' ? 'timer' : 'clock')}
            title="Toque para alternar entre relógio atual e tempo decorrido"
            className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-[230px] cursor-pointer group"
          >
            {/* Top Label: "Agora mesmo" or elapsed sleep label */}
            <span className="text-xs sm:text-sm font-medium text-gray-300 tracking-wide mb-1 group-hover:text-purple-300 transition">
              {isSleeping
                ? displayMode === 'clock'
                  ? isDaytime ? 'Soneca diurna' : 'Sono noturno'
                  : 'Tempo de sono'
                : 'Agora mesmo'}
            </span>

            {/* Big Main Digits: "21:46" or elapsed timer */}
            <div className="flex flex-col items-center justify-center my-0.5">
              <span className="text-[44px] sm:text-[48px] font-extrabold tracking-tight text-white leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] font-mono">
                {displayMode === 'clock' ? currentTimeStr : formatTimer(sleepSeconds)}
              </span>
              <span className="block text-[10px] text-purple-300 font-bold uppercase tracking-wider font-mono mt-1">
                {displayMode === 'clock' ? 'horário (BR)' : 'cronômetro'}
              </span>
            </div>

            {/* Subtitle Prompt: "Adicione a hora que John acordou para começar o seu dia!" */}
            <p className="text-[11.5px] sm:text-[12px] text-gray-300/90 font-normal leading-relaxed mt-2.5 mb-1.5">
              {isSleeping ? (
                <>
                  {babyName} está {isDaytime ? 'em uma soneca' : 'dormindo'} tranquilamente há{' '}
                  <strong className="text-white">{formatTimer(sleepSeconds)}</strong>.
                </>
              ) : (
                <>
                  Adicione a hora que <strong className="text-white">{babyName}</strong> acordou
                  para começar o seu dia!
                </>
              )}
            </p>

            {/* Center Icon: Sun ☀️ for day/soneca or Moon 🌙 for night/sono */}
            <div className="flex items-center justify-center mt-0.5">
              {isSleeping ? (
                <span
                  className="text-xl animate-pulse"
                  title={isDaytime ? 'Soneca diurna em andamento ☀️' : 'Sono noturno em andamento 🌙'}
                >
                  {isDaytime ? '☀️' : '🌙'}
                </span>
              ) : (
                <span
                  className="text-xl drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  title={isDaytime ? 'Acordado (Dia / Soneca ☀️)' : 'Acordado (Noite / Sono 🌙)'}
                >
                  {isDaytime ? '☀️' : '🌙'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Sleep Info Action - 3D Glass Button */}
        <button
          type="button"
          onClick={onOpenSleepModal}
          className="mt-1.5 px-3.5 py-1.5 rounded-xl backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 text-xs text-white flex items-center gap-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] active:scale-95 transition cursor-pointer hover:border-white/50"
        >
          <Info className="w-3.5 h-3.5 text-pink-300" />
          <span>
            {isSleeping
              ? isDaytime ? 'Detalhes da Soneca ☀️' : 'Detalhes do Sono 🌙'
              : 'Configurar Horário Manualmente'}
          </span>
        </button>
      </div>

      {/* Bottom Floating Quick Actions: 4 Circles matching the screenshot */}
      <div className="relative z-20 pb-4 px-6">
        <div className="flex items-center justify-center space-x-5 sm:space-x-6">
          {/* Action 1: Sun or Moon Button depending on Brazil time */}
          <button
            type="button"
            onClick={onToggleSleep}
            title={
              isSleeping
                ? 'Registrar que o bebê acordou'
                : isDaytime
                  ? 'Iniciar modo soneca diurna'
                  : 'Iniciar modo sono noturno'
            }
            className={`relative flex items-center justify-center w-13 h-13 rounded-full transition duration-200 active:scale-92 cursor-pointer backdrop-blur-[12px] ${
              !isSleeping
                ? isDaytime
                  ? 'bg-gradient-to-br from-amber-400/35 via-yellow-500/25 to-white/10 border-t border-l border-white/50 border-b border-r border-amber-300/30 ring-2 ring-amber-400/90 shadow-[0_0_24px_rgba(251,191,36,0.55),inset_0_1.5px_2px_rgba(255,255,255,0.5)] text-amber-200'
                  : 'bg-gradient-to-br from-indigo-500/35 via-purple-600/25 to-white/10 border-t border-l border-white/50 border-b border-r border-indigo-300/30 ring-2 ring-indigo-400/90 shadow-[0_0_24px_rgba(129,140,248,0.55),inset_0_1.5px_2px_rgba(255,255,255,0.5)] text-indigo-200'
                : 'bg-gradient-to-br from-cyan-400/35 via-teal-500/25 to-white/10 border-t border-l border-white/50 border-b border-r border-cyan-300/30 ring-2 ring-cyan-400/80 shadow-[0_0_24px_rgba(56,189,248,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.5)] text-cyan-200'
            }`}
          >
            {/* Sun or Moon icon */}
            <div className="flex flex-col items-center justify-center">
              {isDaytime ? (
                <>
                  <Sun className="w-6 h-6 stroke-[2.2] animate-spin-slow" />
                  <div className="w-5 h-0.5 bg-current rounded-full mt-0.5 opacity-80" />
                </>
              ) : (
                <>
                  <Moon className="w-6 h-6 stroke-[2.2]" />
                  <div className="w-5 h-0.5 bg-current rounded-full mt-0.5 opacity-80" />
                </>
              )}
            </div>
          </button>

          {/* Action 2: Cloud / White Noise / Rain Sounds Playlist */}
          <button
            type="button"
            onClick={handleOpenPlaylist}
            title={
              isPlayingSound
                ? `Tocando: ${currentTrack.name} (Toque para abrir playlist)`
                : 'Abrir Playlist de Ruídos Brancos para Dormir'
            }
            className={`relative flex items-center justify-center w-12 h-12 rounded-full transition duration-200 active:scale-92 cursor-pointer backdrop-blur-[12px] ${
              isPlayingSound
                ? 'bg-gradient-to-br from-rose-500/40 to-pink-600/25 border-t border-l border-white/50 border-b border-r border-rose-300/30 ring-2 ring-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.4)] text-rose-200'
                : 'bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 text-pink-300 hover:text-white shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.35)]'
            }`}
          >
            {isPlayingSound ? (
              <span className="text-xl animate-pulse">{currentTrack.emoji}</span>
            ) : (
              <CloudRain className="w-5 h-5 stroke-[2]" />
            )}
            {isPlayingSound && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-400 animate-ping" />
            )}
          </button>

          {/* Action 3: Diaper / Fralda */}
          <button
            type="button"
            onClick={onSwitchToDiaperGauge || onOpenDiaperModal}
            title="Abrir Medidor de Fralda"
            className="relative flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 text-purple-200 hover:text-white transition duration-200 active:scale-92 cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.35)]"
          >
            {/* Diaper shape emoji */}
            <span className="text-xl">🧷</span>
            {/* Small lock icon on top right just like in the screenshot */}
            <div className="absolute -top-1 -right-0.5 w-4 h-4 rounded-full bg-black/50 border border-white/30 flex items-center justify-center backdrop-blur-xs">
              <Lock className="w-2.5 h-2.5 text-gray-200" />
            </div>
          </button>

          {/* Action 4: Formula / Mamadeira (with small lock glyph matching screenshot) */}
          <button
            type="button"
            onClick={onOpenFormulaDrawer}
            title="Registrar Mamadeira"
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#241f35] border border-purple-500/20 text-teal-300 hover:text-white transition duration-200 active:scale-92 cursor-pointer shadow-md"
          >
            {/* Baby bottle emoji */}
            <span className="text-xl">🍼</span>
            {/* Small lock icon on top right just like in the screenshot */}
            <div className="absolute -top-1 -right-0.5 w-4 h-4 rounded-full bg-[#1b1c2e] border border-white/20 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-gray-300" />
            </div>
          </button>

          {/* Action 5: Alarm / Notifications */}
          {onOpenNotificationCenter && (
            <button
              type="button"
              onClick={onOpenNotificationCenter}
              title="Central de Notificações & Alarmes em Segundo Plano"
              className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#241f35] border border-purple-500/30 text-purple-300 hover:text-amber-300 transition duration-200 active:scale-92 cursor-pointer shadow-md"
            >
              <BellRing className="w-5 h-5 text-purple-300" />
            </button>
          )}
        </div>
      </div>

      {/* White Noise Playlist Modal */}
      <WhiteNoisePlaylistModal
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
      />
    </div>
  );
};
