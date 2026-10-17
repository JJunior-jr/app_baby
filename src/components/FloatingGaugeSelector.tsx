import React, { useState, useEffect } from 'react';
import { isDaytime } from '../services/brazilTime';

export type GaugeMode = 'sono' | 'amamentacao' | 'fralda';

interface FloatingGaugeSelectorProps {
  currentMode: GaugeMode;
  onSelectMode: (mode: GaugeMode) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const FloatingGaugeSelector: React.FC<FloatingGaugeSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  const [isDay, setIsDay] = useState(() => isDaytime());

  useEffect(() => {
    const update = () => setIsDay(isDaytime());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute top-2.5 left-4 z-30 flex items-center rounded-2xl p-1 backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] select-none overflow-hidden"
      style={{ height: '38px' }}
    >
      {/* Specular Diagonal Reflection Sheen */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-t-2xl pointer-events-none" />
      <div className="glass-reflection-line" />

      {/* Fixed Segmented Option Buttons: Sono/Soneca, Peito, Fralda */}
      <div className="flex items-center gap-1 relative z-10">
        {/* Sono / Soneca (dynamic Sun ☀️ or Moon 🌙 based on day/night) */}
        <button
          type="button"
          onClick={() => onSelectMode('sono')}
          className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            currentMode === 'sono'
              ? 'bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 text-white font-extrabold shadow-md border border-white/35'
              : 'font-bold text-gray-300 hover:text-white hover:bg-white/10'
          }`}
          title={isDay ? 'Visão Soneca (Dia ☀️)' : 'Visão Sono (Noite 🌙)'}
        >
          <span className="text-xs">{isDay ? '☀️' : '🌙'}</span>
          <span>{isDay ? 'Soneca' : 'Sono'}</span>
        </button>

        {/* Peito */}
        <button
          type="button"
          onClick={() => onSelectMode('amamentacao')}
          className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            currentMode === 'amamentacao'
              ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-extrabold shadow-md border border-white/35'
              : 'font-bold text-gray-300 hover:text-pink-300 hover:bg-white/10'
          }`}
          title="Visão Peito"
        >
          <span className="text-xs">🤱</span>
          <span>Peito</span>
        </button>

        {/* Fralda */}
        <button
          type="button"
          onClick={() => onSelectMode('fralda')}
          className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            currentMode === 'fralda'
              ? 'bg-gradient-to-r from-teal-500 via-emerald-600 to-indigo-600 text-white font-extrabold shadow-md border border-white/35'
              : 'font-bold text-gray-300 hover:text-teal-300 hover:bg-white/10'
          }`}
          title="Visão Fralda"
        >
          <span className="text-xs">🧷</span>
          <span>Fralda</span>
        </button>
      </div>
    </div>
  );
};
