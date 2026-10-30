import React, { useState, useRef, useEffect } from 'react';
import { Settings2, List, Clock, Sparkles } from 'lucide-react';
import { FloatingGaugeSelector, GaugeMode } from './FloatingGaugeSelector';
import { motion, AnimatePresence } from 'motion/react';

interface GaugeHeaderBarProps {
  currentMode: GaugeMode;
  onSelectMode: (mode: GaugeMode) => void;
  onSwitchToCardsView: () => void;

  // Sleep adjustment
  onAdjustSleepSeconds?: (deltaSeconds: number) => void;
  sleepSeconds?: number;
  isSleeping?: boolean;

  // Nursing adjustment
  onAdjust24hNursingSeconds?: (addedSeconds: number) => void;
  total24hNursingSeconds?: number;

  // Diaper adjustment
  onAdjustLastDiaperChange?: (minutesAgo: number) => void;
  lastDiaperTimeStr?: string;
}

export const GaugeHeaderBar: React.FC<GaugeHeaderBarProps> = ({
  currentMode,
  onSelectMode,
  onSwitchToCardsView,
  onAdjustSleepSeconds,
  sleepSeconds = 0,
  isSleeping = false,
  onAdjust24hNursingSeconds,
  total24hNursingSeconds = 0,
  onAdjustLastDiaperChange,
  lastDiaperTimeStr = '',
}) => {
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const adjustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (adjustRef.current && !adjustRef.current.contains(e.target as Node)) {
        setIsAdjustOpen(false);
      }
    };
    if (isAdjustOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAdjustOpen]);

  const getAdjustLabel = () => {
    switch (currentMode) {
      case 'sono':
        return 'Ajustar';
      case 'amamentacao':
        return 'Ajustar 24h';
      case 'fralda':
        return 'Ajustar Troca';
    }
  };

  const getAdjustTitle = () => {
    switch (currentMode) {
      case 'sono':
        return 'Ajustar Tempo de Sono';
      case 'amamentacao':
        return 'Ajustar Total 24h (Peito)';
      case 'fralda':
        return 'Ajustar Última Troca';
    }
  };

  const hoursNursing = Math.floor(total24hNursingSeconds / 3600);
  const minsNursing = Math.floor((total24hNursingSeconds % 3600) / 60);

  return (
    <header className="relative z-30 shrink-0 px-3 sm:px-4 pt-2.5 pb-2 flex items-center justify-between gap-2 bg-[#0c0d1c]/80 backdrop-blur-md border-b border-white/5 select-none">
      {/* Left: Unified Segmented Mode Selector [Soneca | Peito | Fralda] */}
      <FloatingGaugeSelector
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setIsAdjustOpen(false);
          setCustomInput('');
          onSelectMode(mode);
        }}
      />

      {/* Right: Sleek Control Actions */}
      <div className="flex items-center space-x-1.5 shrink-0" ref={adjustRef}>
        {/* Button 1: Efficient Adjust / Configure Button */}
        <button
          type="button"
          onClick={() => setIsAdjustOpen(!isAdjustOpen)}
          title={getAdjustTitle()}
          className={`h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition active:scale-95 cursor-pointer border shadow-xs ${
            isAdjustOpen
              ? 'bg-purple-600 text-white border-purple-400'
              : 'bg-[#1e293b]/90 hover:bg-slate-700/70 border-[#334155] text-slate-200 hover:text-white'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5 text-purple-300" />
          <span className="text-[11px]">{getAdjustLabel()}</span>
        </button>

        {/* Button 2: Master Switch Button to List View */}
        <button
          type="button"
          onClick={onSwitchToCardsView}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-slate-200 hover:text-white bg-[#1e293b]/90 border border-[#334155] hover:bg-slate-700/70 transition active:scale-95 cursor-pointer shadow-xs shrink-0"
          title="Alternar para visão em lista"
        >
          <List className="w-4 h-4 text-gray-200" />
        </button>

        {/* Unified Adjust Popover attached directly to the Adjust Button */}
        <AnimatePresence>
          {isAdjustOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-11 right-2 w-72 bg-[#1e293b] border border-[#334155] rounded-2xl p-3.5 shadow-2xl z-50 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <span className="text-xs font-bold text-purple-200 flex items-center gap-1">
                  <Settings2 className="w-3.5 h-3.5 text-purple-300" />
                  <span>{getAdjustTitle()}</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {currentMode === 'sono' && `${Math.floor(sleepSeconds / 3600)}h ${Math.floor((sleepSeconds % 3600) / 60)}m`}
                  {currentMode === 'amamentacao' && `${hoursNursing}h ${minsNursing}m`}
                  {currentMode === 'fralda' && (lastDiaperTimeStr ? `às ${lastDiaperTimeStr}` : 'Agora')}
                </span>
              </div>

              {/* SONECA MODE ADJUST */}
              {currentMode === 'sono' && onAdjustSleepSeconds && (
                <div className="space-y-2.5">
                  <p className="text-[10px] text-gray-300 leading-relaxed">
                    {isSleeping
                      ? 'Ajuste o tempo do sono em andamento:'
                      : 'Ajuste o tempo do último sono registrado:'}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onAdjustSleepSeconds(15 * 60);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold text-amber-200 cursor-pointer"
                    >
                      +15 min
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAdjustSleepSeconds(30 * 60);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold text-amber-200 cursor-pointer"
                    >
                      +30 min
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAdjustSleepSeconds(60 * 60);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-[11px] font-bold text-indigo-200 cursor-pointer"
                    >
                      +1 hora
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAdjustSleepSeconds(-15 * 60);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold text-gray-300 cursor-pointer"
                    >
                      -15 min
                    </button>
                  </div>

                  <div className="border-t border-white/10 pt-2">
                    <span className="text-[10px] font-bold text-amber-300 block mb-1">
                      Ou minutos personalizados:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        placeholder="Ex: 45"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <button
                        type="button"
                        disabled={!customInput || parseInt(customInput, 10) <= 0}
                        onClick={() => {
                          const mins = parseInt(customInput, 10);
                          if (!isNaN(mins) && mins > 0) {
                            onAdjustSleepSeconds(mins * 60);
                            setCustomInput('');
                            setIsAdjustOpen(false);
                          }
                        }}
                        className="py-1 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-[10.5px] font-bold text-white transition cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PEITO MODE ADJUST */}
              {currentMode === 'amamentacao' && onAdjust24hNursingSeconds && (
                <div className="space-y-2.5">
                  <p className="text-[10px] text-gray-300 leading-relaxed">
                    Ajuste o acumulado de amamentação das últimas 24h:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onAdjust24hNursingSeconds(15 * 60);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-[11px] font-bold text-pink-200 cursor-pointer"
                    >
                      +15 min
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAdjust24hNursingSeconds(30 * 60);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-[11px] font-bold text-pink-200 cursor-pointer"
                    >
                      +30 min
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAdjust24hNursingSeconds(60 * 60);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-[11px] font-bold text-purple-200 cursor-pointer"
                    >
                      +1 hora
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAdjust24hNursingSeconds(-15 * 60);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold text-gray-300 cursor-pointer"
                    >
                      -15 min
                    </button>
                  </div>

                  <div className="border-t border-white/10 pt-2">
                    <span className="text-[10px] font-bold text-pink-300 block mb-1">
                      Ou minutos personalizados:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        placeholder="Ex: 20"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 font-mono"
                      />
                      <button
                        type="button"
                        disabled={!customInput || parseInt(customInput, 10) <= 0}
                        onClick={() => {
                          const mins = parseInt(customInput, 10);
                          if (!isNaN(mins) && mins > 0) {
                            onAdjust24hNursingSeconds(mins * 60);
                            setCustomInput('');
                            setIsAdjustOpen(false);
                          }
                        }}
                        className="py-1 px-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-[10.5px] font-bold text-white transition cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FRALDA MODE ADJUST */}
              {currentMode === 'fralda' && onAdjustLastDiaperChange && (
                <div className="space-y-2.5">
                  <p className="text-[10px] text-gray-300 leading-relaxed">
                    Marque quando ocorreu a última troca de fralda:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onAdjustLastDiaperChange(0);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-[11px] font-bold text-teal-200 cursor-pointer"
                    >
                      Agora mesmo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAdjustLastDiaperChange(15);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-[11px] font-bold text-teal-200 cursor-pointer"
                    >
                      15 min atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAdjustLastDiaperChange(30);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-[11px] font-bold text-teal-200 cursor-pointer"
                    >
                      30 min atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAdjustLastDiaperChange(60);
                        setIsAdjustOpen(false);
                      }}
                      className="py-1 px-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-[11px] font-bold text-teal-200 cursor-pointer"
                    >
                      1 hora atrás
                    </button>
                  </div>

                  <div className="border-t border-white/10 pt-2">
                    <span className="text-[10px] font-bold text-teal-300 block mb-1">
                      Ou minutos atrás personalizados:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        placeholder="Ex: 45"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 font-mono"
                      />
                      <button
                        type="button"
                        disabled={!customInput || parseInt(customInput, 10) < 0}
                        onClick={() => {
                          const mins = parseInt(customInput, 10);
                          if (!isNaN(mins) && mins >= 0) {
                            onAdjustLastDiaperChange(mins);
                            setCustomInput('');
                            setIsAdjustOpen(false);
                          }
                        }}
                        className="py-1 px-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-[10.5px] font-bold text-white transition cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
