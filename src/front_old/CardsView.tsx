import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Baby, Sparkles } from 'lucide-react';

/**
 * ARCHIVED: Visão dos Cards (Grid 2x2)
 * Salvo em front_old/CardsView.tsx para preservação do código anterior.
 * Desabilitado da interface ativa conforme solicitação do usuário.
 */

export interface CardsViewProps {
  isSleeping: boolean;
  sleepAnimation: boolean;
  sleepSeconds: number;
  handleSleepClick: () => void;
  formatSleepTime: (sec: number) => string;
  activeBreastSide: 'left' | 'right' | null;
  nursingSeconds: number;
  formatNursingTime: (sec: number) => string;
  handleBreastSideClick: (side: 'left' | 'right') => void;
  onOpenBreastfeedingModal: () => void;
  setIsFormulaDrawerOpen: (open: boolean) => void;
  onOpenDiaperModal: () => void;
  handleDiaperQuickLog: (type: 'xixi' | 'coco') => void;
  onOpenMealModal: () => void;
  onSwitchToGauge?: () => void;
}

export const CardsView: React.FC<CardsViewProps> = ({
  isSleeping,
  sleepAnimation,
  sleepSeconds,
  handleSleepClick,
  formatSleepTime,
  activeBreastSide,
  nursingSeconds,
  formatNursingTime,
  handleBreastSideClick,
  onOpenBreastfeedingModal,
  setIsFormulaDrawerOpen,
  onOpenDiaperModal,
  handleDiaperQuickLog,
  onOpenMealModal,
  onSwitchToGauge,
}) => {
  return (
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
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/35 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
        <div className={`absolute -bottom-2 inset-x-4 h-5 rounded-full blur-md pointer-events-none ${isSleeping ? 'bg-emerald-400/30' : 'bg-amber-400/30'}`} />

        {sleepAnimation ? (
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
          <>
            <div className="flex items-center justify-between w-full relative z-10">
              <span className="text-base font-extrabold tracking-tight text-white drop-shadow-xs">
                Dormiu
              </span>
              {onSwitchToGauge && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwitchToGauge();
                  }}
                  className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-[10px] font-bold text-amber-100 hover:text-white flex items-center gap-1 transition shadow-xs"
                >
                  <span>⭕</span>
                  <span>Gauge</span>
                </button>
              )}
            </div>

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
                  Iniciar
                </span>
              )}
            </div>

            <div className="flex items-center justify-between w-full text-[10.5px] font-medium text-amber-100/90 relative z-10">
              <span>{isSleeping ? `Soneca · ${formatSleepTime(sleepSeconds)}` : 'Toque p/ registrar'}</span>
              <span className="font-bold underline text-white">
                {isSleeping ? 'Acordou?' : 'Dormir'}
              </span>
            </div>
          </>
        )}
      </motion.button>

      {/* Card 2: Amamentação (Liquid Gel Roxo / Orquídea) */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: 'spring', stiffness: 450, damping: 20 }}
        className={`h-36 rounded-3xl p-3.5 bg-gradient-to-br from-purple-400/25 via-violet-500/18 to-indigo-500/18 backdrop-blur-2xl text-purple-100 flex flex-col justify-between shadow-[0_12px_32px_rgba(147,51,234,0.18),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.25)] border relative overflow-hidden select-none group cursor-pointer ${
          activeBreastSide ? 'border-purple-300/80 ring-2 ring-purple-400/50' : 'border-purple-300/40 hover:border-purple-300/60'
        }`}
        onClick={onOpenBreastfeedingModal}
      >
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/35 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
        <div className="absolute -bottom-2 inset-x-4 h-5 bg-purple-400/30 rounded-full blur-md pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-1.5">
            <span className="text-base font-extrabold tracking-tight text-white">Peito</span>
            {activeBreastSide && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {onSwitchToGauge && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSwitchToGauge();
                }}
                className="px-1.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-[9.5px] font-bold text-purple-200 hover:text-white flex items-center gap-0.5 transition"
              >
                <span>⭕</span>
                <span>Gauge</span>
              </button>
            )}
            <Baby className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform duration-200" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 my-auto relative z-10" onClick={(e) => e.stopPropagation()}>
          <motion.button
            type="button"
            onClick={() => handleBreastSideClick('left')}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            className={`px-2 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1 backdrop-blur-md relative overflow-hidden ${
              activeBreastSide === 'left'
                ? 'bg-white/95 text-[#131127] shadow-[0_4px_12px_rgba(255,255,255,0.4)] ring-2 ring-white scale-105'
                : 'bg-white/15 hover:bg-white/25 text-purple-100 border border-white/25'
            }`}
          >
            <span>← E</span>
            {activeBreastSide === 'left' && (
              <span className="font-mono font-black text-purple-900 bg-purple-200 px-1 rounded text-[10px]">
                {formatNursingTime(nursingSeconds)}
              </span>
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => handleBreastSideClick('right')}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            className={`px-2 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1 backdrop-blur-md relative overflow-hidden ${
              activeBreastSide === 'right'
                ? 'bg-white/95 text-[#131127] shadow-[0_4px_12px_rgba(255,255,255,0.4)] ring-2 ring-white scale-105'
                : 'bg-white/15 hover:bg-white/25 text-purple-100 border border-white/25'
            }`}
          >
            <span>D →</span>
            {activeBreastSide === 'right' && (
              <span className="font-mono font-black text-purple-900 bg-purple-200 px-1 rounded text-[10px]">
                {formatNursingTime(nursingSeconds)}
              </span>
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setIsFormulaDrawerOpen(true)}
            whileTap={{ scale: 0.88 }}
            className="p-1 rounded-xl bg-white/15 hover:bg-white/25 text-[11px] font-bold text-purple-100 border border-white/25"
            title="Escolher fórmula"
          >
            🍼
          </motion.button>
        </div>

        <div className="flex items-center justify-between w-full text-[10.5px] text-purple-200/90 font-medium relative z-10">
          <span>{activeBreastSide ? 'Mamando agora...' : 'Esq. há 23h'}</span>
          <span className="font-bold underline text-white">Detalhes</span>
        </div>
      </motion.div>

      {/* Card 3: Fralda (Liquid Gel Água-Marinha / Ciano) */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: 'spring', stiffness: 450, damping: 20 }}
        className="h-36 rounded-3xl p-3.5 bg-gradient-to-br from-cyan-400/25 via-teal-500/18 to-emerald-500/18 backdrop-blur-2xl text-cyan-100 flex flex-col justify-between shadow-[0_12px_32px_rgba(6,182,212,0.18),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.25)] border border-cyan-300/40 hover:border-cyan-300/60 relative overflow-hidden select-none group cursor-pointer"
        onClick={onOpenDiaperModal}
      >
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/35 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
        <div className="absolute -bottom-2 inset-x-4 h-5 bg-cyan-400/30 rounded-full blur-md pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-base font-extrabold tracking-tight text-white">Fralda</span>
          <span className="text-xl group-hover:scale-110 transition-transform duration-200">🧷</span>
        </div>

        <div className="flex items-center justify-center space-x-2 my-auto relative z-10" onClick={(e) => e.stopPropagation()}>
          <motion.button
            type="button"
            onClick={() => handleDiaperQuickLog('xixi')}
            whileTap={{ scale: 0.88 }}
            className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-bold text-white shadow-xs"
          >
            💧 Xixi
          </motion.button>
          <motion.button
            type="button"
            onClick={() => handleDiaperQuickLog('coco')}
            whileTap={{ scale: 0.88 }}
            className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-bold text-white shadow-xs"
          >
            💩 Cocô
          </motion.button>
        </div>

        <div className="flex items-center justify-between w-full text-[10.5px] text-cyan-200/90 font-medium relative z-10">
          <span>Xixi há 1h 39m</span>
          <span className="font-bold underline text-white">Trocar</span>
        </div>
      </motion.div>

      {/* Card 4: Refeição (Liquid Gel Coral / Pêssego) */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: 'spring', stiffness: 450, damping: 20 }}
        className="h-36 rounded-3xl p-3.5 bg-gradient-to-br from-rose-400/25 via-pink-500/18 to-orange-400/18 backdrop-blur-2xl text-rose-100 flex flex-col justify-between shadow-[0_12px_32px_rgba(244,63,94,0.18),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.25)] border border-rose-300/40 hover:border-rose-300/60 cursor-pointer relative overflow-hidden select-none group"
        onClick={onOpenMealModal}
      >
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/35 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
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
  );
};
