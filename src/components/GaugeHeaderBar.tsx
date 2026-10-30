import React from 'react';
import { List } from 'lucide-react';
import { FloatingGaugeSelector, GaugeMode } from './FloatingGaugeSelector';

interface GaugeHeaderBarProps {
  currentMode: GaugeMode;
  onSelectMode: (mode: GaugeMode) => void;
  onSwitchToCardsView: () => void;
  onAdjustSleepSeconds?: (deltaSeconds: number) => void;
  sleepSeconds?: number;
  isSleeping?: boolean;
  onAdjust24hNursingSeconds?: (addedSeconds: number) => void;
  total24hNursingSeconds?: number;
  onAdjustLastDiaperChange?: (minutesAgo: number) => void;
  lastDiaperTimeStr?: string;
}

export const GaugeHeaderBar: React.FC<GaugeHeaderBarProps> = ({
  currentMode,
  onSelectMode,
  onSwitchToCardsView,
}) => {
  return (
    <header className="relative z-30 shrink-0 px-3 sm:px-4 pt-2.5 pb-2 flex items-center justify-between gap-2 bg-[#0c0d1c]/80 backdrop-blur-md border-b border-white/5 select-none">
      {/* Left: Unified Segmented Mode Selector [Soneca | Peito | Fralda] */}
      <FloatingGaugeSelector
        currentMode={currentMode}
        onSelectMode={(mode) => {
          onSelectMode(mode);
        }}
      />

      {/* Right: Sleek Control Actions */}
      <div className="flex items-center space-x-1.5 shrink-0">
        {/* Button: Master Switch Button to List View */}
        <button
          type="button"
          onClick={onSwitchToCardsView}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-slate-200 hover:text-white bg-[#1e293b]/90 border border-[#334155] hover:bg-slate-700/70 transition active:scale-95 cursor-pointer shadow-xs shrink-0"
          title="Alternar para visão em lista"
        >
          <List className="w-4 h-4 text-gray-200" />
        </button>
      </div>
    </header>
  );
};
