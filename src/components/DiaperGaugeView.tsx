import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplets,
  Sparkles,
  Check,
  RotateCcw,
  Settings2,
  List,
  Clock,
  ShieldCheck,
  ChevronDown,
  Info,
  Edit3,
} from 'lucide-react';
import { UserProfile, ActivityItem } from '../types';

interface DiaperGaugeViewProps {
  currentUser: UserProfile | null;
  activities?: ActivityItem[];
  onQuickSaveDiaper: (type: 'xixi' | 'coco' | 'ambos', notes?: string) => void;
  onOpenDiaperModal: () => void;
  onSwitchToCardsView: () => void;
  onSwitchToSleepGauge: () => void;
  onSwitchToBreastfeedingGauge: () => void;
}

// Background twinkling stars
const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  top: `${(i * 17) % 94}%`,
  left: `${(i * 29) % 96}%`,
  size: (i % 3) + 1.2,
  opacity: 0.2 + ((i % 5) * 0.15),
  delay: (i % 6) * 0.4,
  duration: 2.2 + (i % 4),
}));

// Max recommended diaper interval: 4 hours (14,400 seconds)
const MAX_INTERVAL_SECONDS = 4 * 3600;

export const DiaperGaugeView: React.FC<DiaperGaugeViewProps> = ({
  currentUser,
  activities = [],
  onQuickSaveDiaper,
  onOpenDiaperModal,
  onSwitchToCardsView,
  onSwitchToSleepGauge,
  onSwitchToBreastfeedingGauge,
}) => {
  // State for popovers
  const [isOptionsPopoverOpen, setIsOptionsPopoverOpen] = useState(false);
  const [isAdjustPopoverOpen, setIsAdjustPopoverOpen] = useState(false);
  const [customMinutesAgo, setCustomMinutesAgo] = useState('');
  const [centerDisplayMode, setCenterDisplayMode] = useState<'interval' | 'daily'>('interval');
  const [hasAppliedCream, setHasAppliedCream] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const adjustRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOptionsPopoverOpen(false);
      }
      if (adjustRef.current && !adjustRef.current.contains(e.target as Node)) {
        setIsAdjustPopoverOpen(false);
      }
    };
    if (isOptionsPopoverOpen || isAdjustPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOptionsPopoverOpen, isAdjustPopoverOpen]);

  // Find the last diaper change from activities or localStorage
  const findLastDiaperTime = (): { timestamp: number; type: 'xixi' | 'coco' | 'ambos' } => {
    const now = Date.now();
    let latestTime = 0;
    let latestType: 'xixi' | 'coco' | 'ambos' = 'xixi';

    if (activities && activities.length > 0) {
      for (const act of activities) {
        if (act.type === 'fralda') {
          const t = act.timestamp ? new Date(act.timestamp).getTime() : 0;
          if (t > latestTime && t <= now) {
            latestTime = t;
            const dt = act.details?.diaperType;
            if (dt === 'coco' || act.title.toLowerCase().includes('cocô')) {
              latestType = 'coco';
            } else if (dt === 'ambos' || act.title.toLowerCase().includes('xixi + cocô')) {
              latestType = 'ambos';
            } else {
              latestType = 'xixi';
            }
          }
        }
      }
    }

    try {
      const saved = localStorage.getItem('babyjohn_last_diaper_timestamp');
      if (saved) {
        const savedTime = parseInt(saved, 10);
        if (!isNaN(savedTime) && savedTime > latestTime && savedTime <= now) {
          latestTime = savedTime;
          const savedType = (localStorage.getItem('babyjohn_last_diaper_type') as any) || 'xixi';
          latestType = savedType;
        }
      }
    } catch {}

    // Fallback if no diaper yet: assume changed 1h 20m ago for realistic presentation
    if (latestTime === 0) {
      latestTime = now - (80 * 60 * 1000);
      try {
        localStorage.setItem('babyjohn_last_diaper_timestamp', String(latestTime));
      } catch {}
    }

    return { timestamp: latestTime, type: latestType };
  };

  const [lastDiaperInfo, setLastDiaperInfo] = useState(() => findLastDiaperTime());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const now = Date.now();
    return Math.max(0, Math.floor((now - lastDiaperInfo.timestamp) / 1000));
  });

  // Calculate 24-hour diaper counts from activities
  const calculate24hDiaperCounts = () => {
    let xixiCount = 0;
    let cocoCount = 0;
    let ambosCount = 0;
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (activities && activities.length > 0) {
      for (const act of activities) {
        if (act.type === 'fralda') {
          const actTime = act.timestamp ? new Date(act.timestamp).getTime() : 0;
          const isRecent = actTime > 0 ? (now - actTime >= 0 && now - actTime <= oneDayMs) : true;
          if (!isRecent) continue;

          const title = act.title.toLowerCase();
          const dt = act.details?.diaperType;

          if (dt === 'ambos' || title.includes('xixi + cocô') || title.includes('ambos')) {
            ambosCount++;
          } else if (dt === 'coco' || title.includes('cocô')) {
            cocoCount++;
          } else {
            xixiCount++;
          }
        }
      }
    }

    // Default baseline if empty (4 xixi, 2 cocô = 6 trocas)
    const total = xixiCount + cocoCount + ambosCount;
    if (total === 0) {
      return { xixi: 4, coco: 2, ambos: 0, total: 6 };
    }

    return {
      xixi: xixiCount,
      coco: cocoCount,
      ambos: ambosCount,
      total: total,
    };
  };

  const [counts24h, setCounts24h] = useState(() => calculate24hDiaperCounts());

  // Update counts when activities update
  useEffect(() => {
    setCounts24h(calculate24hDiaperCounts());
    const info = findLastDiaperTime();
    setLastDiaperInfo(info);
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - info.timestamp) / 1000)));
  }, [activities]);

  // Live timer tick every second for real-time responsiveness
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Perform quick diaper change
  const handleQuickChange = (type: 'xixi' | 'coco' | 'ambos') => {
    const now = Date.now();
    try {
      localStorage.setItem('babyjohn_last_diaper_timestamp', String(now));
      localStorage.setItem('babyjohn_last_diaper_type', type);
    } catch {}

    setLastDiaperInfo({ timestamp: now, type });
    setElapsedSeconds(0);

    const notes = hasAppliedCream ? 'Pomada antiassaduras aplicada 🧴' : undefined;
    onQuickSaveDiaper(type, notes);

    setCounts24h((prev) => {
      const next = { ...prev };
      if (type === 'xixi') next.xixi++;
      else if (type === 'coco') next.coco++;
      else next.ambos++;
      next.total++;
      return next;
    });

    const label = type === 'xixi' ? 'Xixi 💧' : type === 'coco' ? 'Cocô 💩' : 'Xixi + Cocô 🧷';
    showToast(`Fralda trocada com sucesso (${label})!`);
  };

  // Manual adjustment for when last change was made
  const handleAdjustLastChange = (minutesAgo: number) => {
    const adjustedTime = Date.now() - (minutesAgo * 60 * 1000);
    try {
      localStorage.setItem('babyjohn_last_diaper_timestamp', String(adjustedTime));
    } catch {}
    setLastDiaperInfo((prev) => ({ ...prev, timestamp: adjustedTime }));
    setElapsedSeconds(minutesAgo * 60);
    setIsAdjustPopoverOpen(false);
    showToast(minutesAgo === 0 ? 'Fralda marcada como trocada agora!' : `Ajustado para ${minutesAgo}m atrás`);
  };

  // Format elapsed time (HH:MM or MM:SS)
  const formatElapsedTime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
    }
    return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Breakdown for center display
  const hours = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);

  // Interval Health Status:
  // < 2h: Clean & Fresh 🟢
  // 2h - 3h: Check Diaper 🟡
  // 3h - 4h: Recommended Change 🟠
  // > 4h: Urgent Change Required 🔴
  const getStatus = () => {
    if (elapsedSeconds < 2 * 3600) {
      return {
        label: 'Fralda Limpa & Seca',
        badge: 'Confortável',
        textColor: 'text-emerald-300',
        borderColor: 'border-emerald-500/40',
        bgColor: 'bg-emerald-500/15',
        glowColor: 'rgba(16, 185, 129, 0.5)',
        gradStart: '#10b981',
        gradEnd: '#06b6d4',
      };
    }
    if (elapsedSeconds < 3 * 3600) {
      return {
        label: 'Hora de Verificar',
        badge: 'Checar Umidade',
        textColor: 'text-amber-300',
        borderColor: 'border-amber-500/40',
        bgColor: 'bg-amber-500/15',
        glowColor: 'rgba(245, 158, 11, 0.5)',
        gradStart: '#06b6d4',
        gradEnd: '#f59e0b',
      };
    }
    if (elapsedSeconds < 4 * 3600) {
      return {
        label: 'Troca Recomendada',
        badge: 'Intervalo Ideal',
        textColor: 'text-orange-300',
        borderColor: 'border-orange-500/40',
        bgColor: 'bg-orange-500/15',
        glowColor: 'rgba(249, 115, 22, 0.6)',
        gradStart: '#f59e0b',
        gradEnd: '#f97316',
      };
    }
    return {
      label: 'Trocar Imediatamente',
      badge: 'Evitar Assaduras',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/50',
      bgColor: 'bg-rose-500/20',
      glowColor: 'rgba(244, 63, 94, 0.7)',
      gradStart: '#f97316',
      gradEnd: '#f43f5e',
    };
  };

  const status = getStatus();

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

  // Percentage on 4-hour scale (capped at 100%)
  const progressPercent = Math.min(100, Math.max(elapsedSeconds > 0 ? 1.5 : 0, (elapsedSeconds / MAX_INTERVAL_SECONDS) * 100));
  const strokeDashoffset = arcLength - (arcLength * progressPercent) / 100;

  // Format last change time string (e.g. "15:40")
  const lastTimeStr = new Date(lastDiaperInfo.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none overflow-hidden bg-[#0a0d18] text-white">
      {/* Background Deep Cosmic Gradient with Emerald / Teal hint */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b171f] via-[#091018] to-[#06080e] pointer-events-none" />

      {/* Gentle Radial Atmosphere Glow behind Gauge in soft Mint / Cyan */}
      <div
        className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-3xl pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: status.glowColor, opacity: 0.15 }}
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

      {/* Top Header Bar inside Gauge View */}
      <div className="relative z-20 px-4 pt-2 flex items-center justify-between">
        {/* Balanced left spacer replacing the deprecated cards button */}
        <div className="w-14 hidden sm:block pointer-events-none" aria-hidden="true" />

        {/* Center: Gauge Selector (Sono vs Amamentação vs Fralda) */}
        <div className="flex items-center space-x-1 bg-[#0f1724]/90 border border-white/10 rounded-full p-1 shadow-lg backdrop-blur-md">
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
            onClick={onSwitchToBreastfeedingGauge}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-400 hover:text-pink-300 transition flex items-center gap-1 cursor-pointer"
          >
            <span>🤱</span>
            <span>Peito</span>
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 text-white border border-teal-400/40 shadow-xs flex items-center gap-1 cursor-default"
          >
            <span>🧷</span>
            <span>Fralda</span>
          </button>
        </div>

        {/* Right: Quick adjustment for last diaper & Lista switch */}
        <div className="flex items-center space-x-1.5" ref={adjustRef}>
          <button
            type="button"
            onClick={() => setIsAdjustPopoverOpen(!isAdjustPopoverOpen)}
            title="Ajustar horário da última troca"
            className="p-2 rounded-full text-xs font-bold text-gray-300 hover:text-white bg-[#141b29]/80 border border-white/10 hover:border-teal-500/40 transition active:scale-95 cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-teal-300" />
          </button>
          <button
            type="button"
            onClick={onSwitchToCardsView}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-300 hover:text-white bg-[#141b29]/80 border border-white/10 flex items-center gap-1 cursor-pointer"
            title="Ver como Lista"
          >
            <List className="w-3 h-3" />
            <span>Lista</span>
          </button>

          {/* Popover to adjust last change time */}
          <AnimatePresence>
            {isAdjustPopoverOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-12 right-2 w-72 bg-[#0d1624] border border-teal-500/40 rounded-2xl p-3.5 shadow-2xl shadow-black/90 z-50 backdrop-blur-2xl text-white"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="text-xs font-bold text-teal-200">Ajustar Última Troca</span>
                  <span className="text-[10px] text-gray-400">Registrada às {lastTimeStr}</span>
                </div>
                <p className="text-[10px] text-gray-300 mb-2.5 leading-relaxed">
                  Defina quando foi a última troca para atualizar o indicador de intervalo:
                </p>
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => handleAdjustLastChange(0)}
                    className="py-1 px-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-[11px] font-bold text-teal-200 cursor-pointer"
                  >
                    Agora mesmo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustLastChange(30)}
                    className="py-1 px-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-[11px] font-bold text-teal-200 cursor-pointer"
                  >
                    30 min atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustLastChange(60)}
                    className="py-1 px-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-[11px] font-bold text-cyan-200 cursor-pointer"
                  >
                    1 hora atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustLastChange(120)}
                    className="py-1 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold text-amber-200 cursor-pointer"
                  >
                    2 horas atrás
                  </button>
                </div>

                {/* Opção personalizada de tempo solicitado pelo usuário */}
                <div className="border-t border-white/10 pt-2.5">
                  <span className="text-[10px] font-bold text-teal-300 block mb-1.5">
                    Ou tempo personalizado (minutos atrás):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      placeholder="Ex: 45"
                      value={customMinutesAgo}
                      onChange={(e) => setCustomMinutesAgo(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 font-mono"
                    />
                    <button
                      type="button"
                      disabled={!customMinutesAgo || parseInt(customMinutesAgo, 10) < 0}
                      onClick={() => {
                        const mins = parseInt(customMinutesAgo, 10);
                        if (!isNaN(mins) && mins >= 0) {
                          handleAdjustLastChange(mins);
                          setCustomMinutesAgo('');
                        }
                      }}
                      className="py-1 px-3 rounded-xl bg-teal-600/40 hover:bg-teal-600/60 disabled:opacity-40 border border-teal-400/50 text-[11px] font-bold text-teal-200 cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast feedback */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-[#0d2222] border border-teal-400 text-[11px] text-teal-200 font-bold shadow-xl flex items-center space-x-1.5"
          >
            <span>{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centerpiece: Circular Arc Gauge */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-3">
        <div className="relative w-[310px] h-[310px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
          {/* SVG Arc Gauge with 0h to 4h scale markers */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320" fill="none">
            <defs>
              {/* Linear Gradient for Track */}
              <linearGradient id="diaperTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Dynamic Gradient for Diaper Progress Arc */}
              <linearGradient id="diaperProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={status.gradStart} />
                <stop offset="100%" stopColor={status.gradEnd} />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="diaperGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Track Arc representing 4h interval */}
            <path
              d={trackPath}
              stroke="url(#diaperTrackGrad)"
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

            {/* Scale Tick dots along track (0h, 1h, 2h, 3h, 4h) */}
            {/* 0h tick dot */}
            <circle cx="76.6" cy="243.4" r="2.5" fill="#10b981" opacity="0.8" />
            {/* 1h tick dot */}
            <circle cx="51.0" cy="114.8" r="2.5" fill="#06b6d4" opacity="0.8" />
            {/* 2h tick dot (top center) */}
            <circle cx="160.0" cy="42.0" r="3.5" fill="#f59e0b" opacity="0.9" />
            {/* 3h tick dot */}
            <circle cx="269.0" cy="114.8" r="2.5" fill="#f97316" opacity="0.8" />
            {/* 4h tick dot */}
            <circle cx="243.4" cy="243.4" r="2.5" fill="#f43f5e" opacity="0.8" />

            {/* Foreground Progress Arc */}
            <path
              d={trackPath}
              stroke="url(#diaperProgressGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              filter="url(#diaperGlow)"
              className="transition-all duration-700 ease-out"
            />

            {/* Scale Numbers around the Arc */}
            <text x="58" y="268" fill="#10b981" fontSize="10" fontWeight="800" textAnchor="middle" opacity="0.9">
              0h
            </text>
            <text x="24" y="112" fill="#06b6d4" fontSize="10" fontWeight="700" textAnchor="middle" opacity="0.85">
              1h
            </text>
            <text x="160" y="22" fill="#f59e0b" fontSize="11" fontWeight="800" textAnchor="middle" opacity="0.95">
              2h (Checar)
            </text>
            <text x="296" y="112" fill="#f97316" fontSize="10" fontWeight="700" textAnchor="middle" opacity="0.85">
              3h
            </text>
            <text x="262" y="268" fill="#f43f5e" fontSize="10" fontWeight="800" textAnchor="middle" opacity="0.9">
              4h+
            </text>
          </svg>

          {/* Gauge Center Content - properly sized & lifted to prevent any overlap with arc ends */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-3 max-w-[190px] -translate-y-2">
            {/* Display Mode Pill: Toggle between Interval and Daily Total */}
            <div className="flex items-center space-x-1 mb-1 bg-black/50 p-0.5 rounded-full border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setCenterDisplayMode('interval')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition cursor-pointer ${
                  centerDisplayMode === 'interval'
                    ? 'bg-teal-600/80 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Última Troca
              </button>
              <button
                type="button"
                onClick={() => setCenterDisplayMode('daily')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition cursor-pointer ${
                  centerDisplayMode === 'daily'
                    ? 'bg-emerald-600/80 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Total 24h
              </button>
            </div>

            {/* Main Big Digits */}
            {centerDisplayMode === 'interval' ? (
              <div
                className="relative my-0.5 cursor-pointer"
                onClick={() => setCenterDisplayMode('daily')}
                title="Toque para ver o total do dia"
              >
                <span className="text-[38px] sm:text-[42px] font-black tracking-tight text-white leading-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] font-mono">
                  {hours.toString().padStart(2, '0')}h {mins.toString().padStart(2, '0')}m
                </span>
                <div className="flex items-center justify-center space-x-1 mt-0.5">
                  <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">
                    desde a última troca
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="relative my-0.5 cursor-pointer"
                onClick={() => setCenterDisplayMode('interval')}
                title="Toque para ver o tempo decorrido"
              >
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-[40px] sm:text-[44px] font-black tracking-tight text-white leading-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] font-mono">
                    {counts24h.total}
                  </span>
                  <span className="text-base font-bold text-teal-200">
                    fraldas
                  </span>
                </div>
                <span className="block text-[10px] text-emerald-300 font-bold uppercase tracking-wider mt-0.5">
                  nas últimas 24 horas
                </span>
              </div>
            )}

            {/* Pediatric Health Status Badge */}
            <div
              className={`mt-1 px-2.5 py-0.5 rounded-full border text-[9.5px] font-extrabold flex items-center gap-1 shadow-xs ${status.bgColor} ${status.borderColor} ${status.textColor}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
              <span>{status.label}</span>
            </div>

            {/* Secondary Compact Details - strictly compact and non-breaking */}
            {centerDisplayMode === 'interval' ? (
              <span className="text-[9.5px] text-gray-300 mt-1 whitespace-nowrap">
                Última às <strong className="text-white">{lastTimeStr}</strong> · {lastDiaperInfo.type === 'xixi' ? '💧 Xixi' : lastDiaperInfo.type === 'coco' ? '💩 Cocô' : '🧷 Ambos'}
              </span>
            ) : (
              <div className="mt-1 flex items-center justify-center space-x-1.5 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10 text-[10px] font-bold whitespace-nowrap shadow-xs">
                <span className="text-cyan-300">💧 {counts24h.xixi}</span>
                <span className="text-white/20">·</span>
                <span className="text-amber-300">💩 {counts24h.coco}</span>
                {counts24h.ambos > 0 && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-emerald-300">🧷 {counts24h.ambos}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Banner & Stats outside the gauge arc (where there is full horizontal width) */}
        <div className="mt-1 flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-[#0f1926]/90 px-3.5 py-1 rounded-full border border-teal-500/25 shadow-sm text-gray-200">
            <span className="text-cyan-300 font-bold text-xs whitespace-nowrap">💧 {counts24h.xixi} Xixi</span>
            <span className="text-gray-500">·</span>
            <span className="text-amber-300 font-bold text-xs whitespace-nowrap">💩 {counts24h.coco} Cocô</span>
            {counts24h.ambos > 0 && (
              <>
                <span className="text-gray-500">·</span>
                <span className="text-emerald-300 font-bold text-xs whitespace-nowrap">🧷 {counts24h.ambos} Ambos</span>
              </>
            )}
            <span className="text-gray-500">·</span>
            <span className="text-teal-300 font-semibold text-[10px] whitespace-nowrap">Meta: 6-8/dia</span>
          </div>
        </div>


      </div>

      {/* Bottom Controls: 3 Liquid Glass Action Buttons (Xixi, Cocô, Detalhes/Ambos) */}
      <div className="relative z-20 pb-4 px-4 sm:px-6">
        <div className="grid grid-cols-3 gap-2.5 max-w-[420px] mx-auto relative">
          {/* Button 1: Xixi (Urina) */}
          <button
            type="button"
            onClick={() => handleQuickChange('xixi')}
            className="relative p-3 rounded-2xl flex flex-col items-center justify-between transition-all duration-200 active:scale-95 cursor-pointer border select-none overflow-hidden backdrop-blur-xl bg-gradient-to-b from-[#132839]/90 via-[#0e202f] to-[#0a1824] border-cyan-500/30 hover:border-cyan-400/60 shadow-lg text-cyan-100 group"
          >
            {/* Convex reflection highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none" />

            <div className="flex items-center space-x-1 mb-1">
              <Droplets className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-tight text-cyan-200">
                Xixi
              </span>
            </div>

            {/* Quick Count */}
            <span className="text-base font-extrabold font-mono text-white leading-tight">
              {counts24h.xixi} hoje
            </span>

            {/* Prompt */}
            <span className="text-[9.5px] font-semibold mt-1 px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/30">
              1 toque p/ registrar
            </span>
          </button>

          {/* Button 2: Cocô (Evacuação) */}
          <button
            type="button"
            onClick={() => handleQuickChange('coco')}
            className="relative p-3 rounded-2xl flex flex-col items-center justify-between transition-all duration-200 active:scale-95 cursor-pointer border select-none overflow-hidden backdrop-blur-xl bg-gradient-to-b from-[#2e2315]/90 via-[#241a0e] to-[#1a1208] border-amber-500/35 hover:border-amber-400/60 shadow-lg text-amber-100 group"
          >
            {/* Convex reflection highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none" />

            <div className="flex items-center space-x-1 mb-1">
              <span className="text-sm group-hover:scale-110 transition-transform">💩</span>
              <span className="text-[11px] font-black uppercase tracking-tight text-amber-200">
                Cocô
              </span>
            </div>

            {/* Quick Count */}
            <span className="text-base font-extrabold font-mono text-white leading-tight">
              {counts24h.coco} hoje
            </span>

            {/* Prompt */}
            <span className="text-[9.5px] font-semibold mt-1 px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
              1 toque p/ registrar
            </span>
          </button>

          {/* Button 3: Ambos & Detalhes com Popover */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setIsOptionsPopoverOpen(!isOptionsPopoverOpen)}
              className={`w-full h-full relative p-3 rounded-2xl flex flex-col items-center justify-between transition-all duration-200 active:scale-95 cursor-pointer border select-none overflow-hidden backdrop-blur-xl ${
                isOptionsPopoverOpen
                  ? 'bg-gradient-to-b from-teal-500/40 via-emerald-600/35 to-teal-700/40 border-teal-300 ring-2 ring-teal-400/80 shadow-[0_0_22px_rgba(20,184,166,0.5)] text-white'
                  : 'bg-[#152422]/90 hover:bg-[#1a2e2b] border-teal-500/35 text-teal-100 hover:border-teal-400/60 shadow-lg'
              }`}
            >
              {/* Convex reflection highlight */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none" />

              <div className="flex items-center space-x-1 mb-1">
                <span className="text-sm">🧷</span>
                <span className="text-[11px] font-black uppercase tracking-tight text-teal-200">
                  Ambos
                </span>
              </div>

              {/* Label */}
              <span className="text-xs font-bold text-white text-center leading-tight">
                Xixi + Cocô
              </span>

              {/* Status prompt */}
              <span className="text-[9.5px] font-semibold mt-1 px-1.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-300/30 flex items-center gap-0.5">
                Opções <ChevronDown className="w-2.5 h-2.5" />
              </span>
            </button>

            {/* Options Popover */}
            <AnimatePresence>
              {isOptionsPopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-3 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-72 bg-[#0c1622] border border-teal-500/40 rounded-3xl p-3.5 shadow-2xl shadow-black/90 z-50 backdrop-blur-2xl text-white"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🧷</span>
                      <div>
                        <h4 className="text-xs font-extrabold text-white">Opções da Troca</h4>
                        <p className="text-[10px] text-teal-200/80">Ações rápidas e detalhes</p>
                      </div>
                    </div>
                  </div>

                  {/* Option 1: Quick Both (Xixi + Cocô) */}
                  <button
                    type="button"
                    onClick={() => {
                      handleQuickChange('ambos');
                      setIsOptionsPopoverOpen(false);
                    }}
                    className="w-full mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-teal-600/30 to-emerald-600/30 hover:from-teal-600/40 hover:to-emerald-600/40 border border-teal-400/40 text-left flex items-center justify-between transition cursor-pointer active:scale-98"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-base">💧💩</span>
                      <div>
                        <span className="text-xs font-bold text-white block">Registrar Ambos</span>
                        <span className="text-[10px] text-teal-300/80">Xixi e cocô juntos</span>
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-teal-300" />
                  </button>

                  {/* Option 2: Anti-rash cream toggle */}
                  <div className="mb-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🧴</span>
                      <div>
                        <span className="text-xs font-semibold text-gray-200 block">
                          Pomada antiassaduras
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {hasAppliedCream ? 'Marcada como aplicada' : 'Marcar proteção na pele'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasAppliedCream(!hasAppliedCream)}
                      className={`w-9 h-5 rounded-full p-0.5 transition cursor-pointer ${
                        hasAppliedCream ? 'bg-teal-500' : 'bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          hasAppliedCream ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Option 3: Complete Details Modal (DiaperModal) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsPopoverOpen(false);
                      onOpenDiaperModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-gray-200 hover:text-white flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-teal-300" />
                    <span>Detalhar Cor, Consistência e Notas</span>
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
