import React, { useState, useEffect } from 'react';
import { Sun, Moon, Baby, Droplets } from 'lucide-react';
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
      className="absolute top-2.5 left-4 z-30 flex items-center rounded-xl p-1 bg-[#1e293b] border border-[#334155] shadow-md select-none"
      style={{ height: '38px' }}
    >
      {/* Segmented Option Buttons: Sono/Soneca, Peito, Fralda */}
      <div className="flex items-center gap-1">
        {/* Sono / Soneca */}
        <button
          type="button"
          onClick={() => onSelectMode('sono')}
          className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            currentMode === 'sono'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'font-medium text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          title={isDay ? 'Visão Soneca (Dia)' : 'Visão Sono (Noite)'}
        >
          {isDay ? (
            <Sun className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-blue-300" />
          )}
          <span>{isDay ? 'Soneca' : 'Sono'}</span>
        </button>

        {/* Peito */}
        <button
          type="button"
          onClick={() => onSelectMode('amamentacao')}
          className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            currentMode === 'amamentacao'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'font-medium text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          title="Visão Peito"
        >
          <Baby className="w-3.5 h-3.5 text-rose-300" />
          <span>Peito</span>
        </button>

        {/* Fralda */}
        <button
          type="button"
          onClick={() => onSelectMode('fralda')}
          className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            currentMode === 'fralda'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'font-medium text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          title="Visão Fralda"
        >
          <Droplets className="w-3.5 h-3.5 text-teal-300" />
          <span>Fralda</span>
        </button>
      </div>
    </div>
  );
};
