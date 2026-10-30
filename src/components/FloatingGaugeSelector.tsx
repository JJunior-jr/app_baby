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
      className="inline-flex items-center rounded-xl p-0.5 bg-[#1e293b]/90 backdrop-blur-md border border-[#334155] shadow-md select-none shrink-0"
      style={{ height: '32px' }}
    >
      {/* Segmented Option Buttons: Sono/Soneca, Peito, Fralda */}
      <div className="flex items-center gap-0.5">
        {/* Sono / Soneca */}
        <button
          type="button"
          onClick={() => onSelectMode('sono')}
          className={`px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
            currentMode === 'sono'
              ? 'text-white font-bold shadow-xs'
              : 'font-medium text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          style={
            currentMode === 'sono'
              ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-text)' }
              : undefined
          }
          title={isDay ? 'Visão Soneca (Dia)' : 'Visão Sono (Noite)'}
        >
          {isDay ? (
            <Sun className="w-3 h-3 text-amber-300" />
          ) : (
            <Moon className="w-3 h-3 text-blue-300" />
          )}
          <span>{isDay ? 'Soneca' : 'Sono'}</span>
        </button>

        {/* Peito */}
        <button
          type="button"
          onClick={() => onSelectMode('amamentacao')}
          className={`px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
            currentMode === 'amamentacao'
              ? 'text-white font-bold shadow-xs'
              : 'font-medium text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          style={
            currentMode === 'amamentacao'
              ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-text)' }
              : undefined
          }
          title="Visão Peito"
        >
          <Baby className="w-3 h-3 text-rose-300" />
          <span>Peito</span>
        </button>

        {/* Fralda */}
        <button
          type="button"
          onClick={() => onSelectMode('fralda')}
          className={`px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
            currentMode === 'fralda'
              ? 'text-white font-bold shadow-xs'
              : 'font-medium text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          style={
            currentMode === 'fralda'
              ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-text)' }
              : undefined
          }
          title="Visão Fralda"
        >
          <Droplets className="w-3 h-3 text-teal-300" />
          <span>Fralda</span>
        </button>
      </div>
    </div>
  );
};
