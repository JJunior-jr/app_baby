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
  Droplets,
  Milk,
  Baby,
} from 'lucide-react';
import { UserProfile } from '../types';
import { isDaytime, isDaytimeInBrazil, getBrazilTimeString } from '../services/brazilTime';
import {
  whiteNoiseService,
  WhiteNoiseTrack,
} from '../services/whiteNoiseAudio';
import { WhiteNoisePlaylistModal } from './modals/WhiteNoisePlaylistModal';
import { FloatingGaugeSelector, GaugeMode } from './FloatingGaugeSelector';

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
  gaugeSubView?: GaugeMode;
  onSelectGaugeMode?: (mode: GaugeMode) => void;
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
  gaugeSubView,
  onSelectGaugeMode,
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
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 min-h-0 px-4 mt-1 sm:mt-1">
        <div className="relative w-[260px] h-[260px] xs:w-[280px] xs:h-[280px] sm:w-[290px] sm:h-[290px] flex items-center justify-center">
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

          {/* Gauge Center Content: Clean and compact inside the ring */}
          <div
            onClick={() => setDisplayMode(displayMode === 'clock' ? 'timer' : 'clock')}
            title="Toque para alternar entre relógio atual e tempo decorrido"
            className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-[200px] cursor-pointer group"
          >
            {/* Top Label */}
            <span className="text-xs font-semibold text-gray-300 tracking-wide mb-0.5 group-hover:text-purple-300 transition">
              {isSleeping
                ? displayMode === 'clock'
                  ? isDaytime ? 'Soneca diurna' : 'Sono noturno'
                  : 'Tempo de sono'
                : 'Agora mesmo'}
            </span>

            {/* Big Main Digits */}
            <div className="flex flex-col items-center justify-center my-0.5">
              <span className="text-[40px] sm:text-[44px] font-black tracking-tight text-white leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] font-mono">
                {displayMode === 'clock' ? currentTimeStr : formatTimer(sleepSeconds)}
              </span>
              <span className="block text-[9.5px] text-purple-300 font-bold uppercase tracking-wider font-mono mt-1">
                {displayMode === 'clock' ? 'horário (BR)' : 'cronômetro'}
              </span>
            </div>

            {/* Center Icon */}
            <div className="flex items-center justify-center mt-1">
              {isSleeping ? (
                <div
                  className="animate-pulse"
                  title={isDaytime ? 'Soneca diurna em andamento' : 'Sono noturno em andamento'}
                >
                  {isDaytime ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              ) : (
                <div
                  title={isDaytime ? 'Acordado (Dia / Soneca)' : 'Acordado (Noite / Sono)'}
                >
                  {isDaytime ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtitle Prompt: Positioned OUTSIDE below the SVG ring */}
        <p className="text-xs text-gray-300/90 font-normal leading-relaxed text-center max-w-[280px] mt-2 z-20">
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

        {/* Detailed Sleep Info Action */}
        <button
          type="button"
          onClick={onOpenSleepModal}
          className="mt-1.5 px-3.5 py-1.5 rounded-xl bg-[#1e293b] border border-[#334155] text-xs text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer hover:border-slate-500"
        >
          <Info className="w-3.5 h-3.5 text-pink-300" />
          <span>
            {isSleeping
              ? isDaytime ? 'Detalhes da Soneca' : 'Detalhes do Sono'
              : 'Configurar Horário Manualmente'}
          </span>
        </button>
      </div>

      {/* Bottom Floating Quick Actions: 5 buttons with ideal UX spacing (12px mobile, 16px desktop) and 48x48px touch targets */}
      <div className="relative z-20 pb-3 sm:pb-4 px-4 sm:px-6 shrink-0 w-full">
        <div
          className="quick-actions-buttons-container flex items-center justify-center mx-auto"
          style={{ gap: 'var(--quick-actions-gap, 12px)' }}
        >
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
            className={`relative flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl transition duration-150 active:scale-95 cursor-pointer border shadow-sm ${
              !isSleeping
                ? isDaytime
                  ? 'bg-amber-600 hover:bg-amber-500 border-amber-400 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white'
                : 'bg-teal-600 hover:bg-teal-500 border-teal-400 text-white'
            }`}
          >
            {/* Sun or Moon icon */}
            <div className="flex flex-col items-center justify-center">
              {isDaytime ? (
                <Sun className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Moon className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
          </button>

          {/* Action 2: Breastfeeding / Peito */}
          <button
            type="button"
            onClick={onSwitchToBreastfeedingGauge}
            title="Ir para Medidor de Amamentação / Peito"
            className="relative flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-[#1e293b] hover:bg-slate-700/60 border border-[#334155] text-pink-300 hover:text-white transition duration-150 active:scale-95 cursor-pointer shadow-sm"
          >
            <Baby className="w-5 h-5 text-pink-300" />
          </button>

          {/* Action 3: Diaper / Fralda */}
          <button
            type="button"
            onClick={onSwitchToDiaperGauge || onOpenDiaperModal}
            title="Ir para Medidor de Fralda"
            className="relative flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-[#1e293b] hover:bg-slate-700/60 border border-[#334155] text-teal-300 hover:text-white transition duration-150 active:scale-95 cursor-pointer shadow-sm"
          >
            <Droplets className="w-5 h-5 text-teal-300" />
          </button>

          {/* Action 4: Formula / Mamadeira */}
          <button
            type="button"
            onClick={onOpenFormulaDrawer}
            title="Registrar Mamadeira"
            className="relative flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-[#1e293b] hover:bg-slate-700/60 border border-[#334155] text-cyan-300 hover:text-white transition duration-150 active:scale-95 cursor-pointer shadow-sm"
          >
            <Milk className="w-5 h-5 text-cyan-300" />
          </button>

          {/* Action 5: Cloud / White Noise / Rain Sounds Playlist */}
          <button
            type="button"
            onClick={handleOpenPlaylist}
            title={
              isPlayingSound
                ? `Tocando: ${currentTrack.name} (Toque para abrir playlist)`
                : 'Abrir Playlist de Ruídos Brancos para Dormir'
            }
            className={`relative flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl transition duration-150 active:scale-95 cursor-pointer border shadow-sm ${
              isPlayingSound
                ? 'bg-rose-700 text-white border-rose-500'
                : 'bg-[#1e293b] hover:bg-slate-700/60 border-[#334155] text-pink-300 hover:text-white'
            }`}
          >
            <CloudRain className="w-5 h-5 stroke-[2]" />
            {isPlayingSound && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
            )}
          </button>
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
