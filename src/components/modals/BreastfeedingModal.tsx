import React, { useState, useEffect } from 'react';
import { X, Heart, Droplets, Clock, ArrowLeftRight, Baby, Play, Pause, Plus, Minus, Sparkles } from 'lucide-react';
import { FeedingMode } from '../../types';

interface BreastfeedingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    mode: FeedingMode;
    leftMinutes?: number;
    rightMinutes?: number;
    formulaMl?: number;
    offeredMl?: number;
    leftoverMl?: number;
    consumedMl?: number;
    consumedPercentage?: number;
    milkType?: 'formula' | 'leite_materno';
    feeling?: string;
    notes?: string;
  }) => void;
}

const FORMULA_PRESETS = [30, 60, 90, 120, 150, 180, 210, 240];
const LEFTOVER_PRESETS = [0, 10, 20, 30, 40, 50, 60];

export const BreastfeedingModal: React.FC<BreastfeedingModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [mode, setMode] = useState<FeedingMode>('peito');
  const [leftMinutes, setLeftMinutes] = useState<number>(0);
  const [rightMinutes, setRightMinutes] = useState<number>(0);
  const [offeredMl, setOfferedMl] = useState<number>(150);
  const [leftoverMl, setLeftoverMl] = useState<number>(0);
  const [milkType, setMilkType] = useState<'formula' | 'leite_materno'>('formula');
  const [feeling, setFeeling] = useState<string>('Amamentação tranquila');
  const [notes, setNotes] = useState<string>('');

  // Live timer for active side
  const [activeSide, setActiveSide] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeSide === 'left') {
      interval = setInterval(() => {
        setLeftMinutes((prev) => prev + 1);
      }, 1000);
    } else if (activeSide === 'right') {
      interval = setInterval(() => {
        setRightMinutes((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSide]);

  if (!isOpen) return null;

  const totalMinutes = Math.max(1, leftMinutes + rightMinutes);
  const safeLeftover = Math.min(offeredMl, Math.max(0, leftoverMl));
  const consumedMl = Math.max(0, offeredMl - safeLeftover);
  const consumedPercentage = offeredMl > 0 ? Math.round((consumedMl / offeredMl) * 100) : 0;

  const handleSave = () => {
    onSave({
      mode,
      leftMinutes: mode === 'peito' ? Math.max(1, leftMinutes) : undefined,
      rightMinutes: mode === 'peito' ? Math.max(0, rightMinutes) : undefined,
      formulaMl: mode === 'formula' ? consumedMl : undefined,
      offeredMl: mode === 'formula' ? offeredMl : undefined,
      leftoverMl: mode === 'formula' ? safeLeftover : undefined,
      consumedMl: mode === 'formula' ? consumedMl : undefined,
      consumedPercentage: mode === 'formula' ? consumedPercentage : undefined,
      milkType: mode === 'formula' ? milkType : undefined,
      feeling,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-[430px] landscape:max-w-lg h-auto max-h-[90vh] flex flex-col justify-between overflow-y-auto shadow-2xl border transition-colors animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--color-dominant)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--app-card-radius)',
        }}
      >
        
        {/* Navigation Header */}
        <header className="relative px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 -ml-1 text-gray-300 hover:text-white transition rounded-xl hover:bg-white/5"
          >
            <X className="w-6 h-6 stroke-[2.2]" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-gray-100">Registrar Amamentação</h1>
            <p className="text-xs text-[#878ca5] mt-0.5">Hoje · Agora</p>
          </div>
          <div className="w-6 h-6 text-xl">🤱</div>
        </header>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {/* Activity Heading */}
          <section className="flex items-center space-x-3.5 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-[#232042] border border-purple-500/20 flex items-center justify-center text-[#8e79fd]">
              <Baby className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white leading-tight">Amamentação</h2>
              <p className="text-xs text-[#80839e] mt-0.5">Como foi a nutrição do John?</p>
            </div>
          </section>

          {/* Mode Selector Tabs (Peito vs Fórmula) */}
          <section className="grid grid-cols-2 p-1 bg-[#17192b]/80 border border-[#292b45]/60 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('peito')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-sm transition ${
                mode === 'peito'
                  ? 'bg-[#7158e2] text-white shadow-md'
                  : 'text-[#8e79fd]/80 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${mode === 'peito' ? 'fill-white' : 'fill-[#7158e2]'}`} />
              <span>Peito (Timer)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('formula')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-sm transition ${
                mode === 'formula'
                  ? 'bg-[#7158e2] text-white shadow-md'
                  : 'text-[#8e79fd]/80 hover:text-white'
              }`}
            >
              <Droplets className={`w-4 h-4 ${mode === 'formula' ? 'fill-white' : ''}`} />
              <span>Mamadeira / Fórmula</span>
            </button>
          </section>

          {/* If Mode === 'peito': Circular Timers with Live Counting and Shaded Active State */}
          {mode === 'peito' ? (
            <>
              <section className="pt-1 space-y-3">
                <div className="flex justify-between items-center px-4">
                  <span className="text-xs font-bold text-[#8e79fd] tracking-wide">Lado Esquerdo</span>
                  <span className="text-xs font-bold text-[#8e79fd] tracking-wide">Lado Direito</span>
                </div>

                <div className="flex justify-between items-center px-2">
                  {/* Left Circle & Timer Button */}
                  <button
                    type="button"
                    onClick={() => setActiveSide(activeSide === 'left' ? null : 'left')}
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                      activeSide === 'left'
                        ? 'bg-gradient-to-br from-[#7158e2] to-[#9a7ffc] text-white ring-4 ring-purple-300 shadow-xl shadow-purple-900/60 scale-105 animate-pulse'
                        : 'bg-[#17192b] border-2 border-[#433c75]/90 text-gray-200 hover:border-purple-500'
                    }`}
                  >
                    <span className="text-3xl font-black font-mono tracking-tight">{leftMinutes}</span>
                    <span className="text-[11px] font-bold opacity-80 mt-0.5">
                      {activeSide === 'left' ? 'Amamentando ●' : 'min (tocar)'}
                    </span>
                  </button>

                  {/* Switch side arrow */}
                  <button
                    type="button"
                    onClick={() => {
                      const temp = leftMinutes;
                      setLeftMinutes(rightMinutes);
                      setRightMinutes(temp);
                    }}
                    title="Alternar minutos de lado"
                    className="text-[#878ca5] hover:text-[#8e79fd] transition p-2"
                  >
                    <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  {/* Right Circle & Timer Button */}
                  <button
                    type="button"
                    onClick={() => setActiveSide(activeSide === 'right' ? null : 'right')}
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                      activeSide === 'right'
                        ? 'bg-gradient-to-br from-[#7158e2] to-[#9a7ffc] text-white ring-4 ring-purple-300 shadow-xl shadow-purple-900/60 scale-105 animate-pulse'
                        : 'bg-[#17192b] border-2 border-[#433c75]/90 text-gray-200 hover:border-purple-500'
                    }`}
                  >
                    <span className="text-3xl font-black font-mono tracking-tight">{rightMinutes}</span>
                    <span className="text-[11px] font-bold opacity-80 mt-0.5">
                      {activeSide === 'right' ? 'Amamentando ●' : 'min (tocar)'}
                    </span>
                  </button>
                </div>

                {/* Counter Adjustment Buttons - and + */}
                <div className="flex justify-between items-center px-4 sm:px-6">
                  {/* Left Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setLeftMinutes((prev) => Math.max(0, prev - 1))}
                      className="w-8 h-8 rounded-xl bg-[#1b1c31] border border-[#292b45] flex items-center justify-center text-[#8e79fd] hover:bg-[#7158e2] hover:text-white transition active:scale-95"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeftMinutes((prev) => prev + 1)}
                      className="w-8 h-8 rounded-xl bg-[#1b1c31] border border-[#292b45] flex items-center justify-center text-[#8e79fd] hover:bg-[#7158e2] hover:text-white transition active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setRightMinutes((prev) => Math.max(0, prev - 1))}
                      className="w-8 h-8 rounded-xl bg-[#1b1c31] border border-[#292b45] flex items-center justify-center text-[#8e79fd] hover:bg-[#7158e2] hover:text-white transition active:scale-95"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setRightMinutes((prev) => prev + 1)}
                      className="w-8 h-8 rounded-xl bg-[#1b1c31] border border-[#292b45] flex items-center justify-center text-[#8e79fd] hover:bg-[#7158e2] hover:text-white transition active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </section>

              {/* Total Duration Card */}
              <section className="bg-[#17192b]/80 border border-[#292b45] rounded-2xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-[#7158e2]" />
                  <span className="text-sm font-semibold text-gray-200">Tempo Total</span>
                </div>
                <span className="text-base font-black text-white tracking-tight">{leftMinutes + rightMinutes} min</span>
              </section>
            </>
          ) : (
            /* Mode === 'formula': Mamadeira com Ofertado e Sobra */
            <section className="space-y-3.5 pt-1">
              {/* Milk Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#171a2d] rounded-2xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => setMilkType('formula')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    milkType === 'formula'
                      ? 'bg-[#7158e2] text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Fórmula infantil</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMilkType('leite_materno')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    milkType === 'leite_materno'
                      ? 'bg-[#7158e2] text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🤱</span>
                  <span>Leite materno</span>
                </button>
              </div>

              {/* SECTION 1: Quanto você ofertou */}
              <div className="bg-[#14172a] rounded-2xl border border-[#2b2f52] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-200">
                    1. Quanto você ofertou?
                  </label>
                  <span className="text-xs font-bold text-white font-mono bg-purple-900/50 px-2 py-0.5 rounded-lg border border-purple-500/30">
                    {offeredMl} ml
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#191d35] rounded-xl p-2.5">
                  <button
                    type="button"
                    onClick={() => setOfferedMl((prev) => Math.max(10, prev - 10))}
                    className="w-8 h-8 rounded-lg bg-[#232747] text-purple-300 flex items-center justify-center active:scale-95 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <span className="text-2xl font-black text-white font-mono">{offeredMl}</span>
                    <span className="text-xs font-bold text-purple-300 ml-1">ml</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOfferedMl((prev) => prev + 10)}
                    className="w-8 h-8 rounded-lg bg-[#232747] text-purple-300 flex items-center justify-center active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {FORMULA_PRESETS.map((vol) => (
                    <button
                      key={`modal-offered-${vol}`}
                      type="button"
                      onClick={() => setOfferedMl(vol)}
                      className={`py-1 rounded-lg text-xs font-bold transition ${
                        offeredMl === vol
                          ? 'bg-[#7158e2] text-white'
                          : 'bg-[#1b1e36] text-gray-300 hover:bg-[#232847]'
                      }`}
                    >
                      {vol}ml
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Quanto sobrou na mamadeira */}
              <div className="bg-[#14172a] rounded-2xl border border-teal-500/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-200">
                    2. Quanto sobrou na mamadeira?
                  </label>
                  <span className="text-xs font-bold text-white font-mono bg-teal-900/50 px-2 py-0.5 rounded-lg border border-teal-500/30">
                    {safeLeftover} ml
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#191d35] rounded-xl p-2.5">
                  <button
                    type="button"
                    onClick={() => setLeftoverMl((prev) => Math.max(0, prev - 5))}
                    className="w-8 h-8 rounded-lg bg-[#1a2d3b] text-teal-300 flex items-center justify-center active:scale-95 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <span className="text-2xl font-black text-white font-mono">{safeLeftover}</span>
                    <span className="text-xs font-bold text-teal-300 ml-1">ml</span>
                    <span className="block text-[9.5px] text-gray-400">
                      {safeLeftover === 0 ? 'Tomou tudo!' : 'sobra'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLeftoverMl((prev) => Math.min(offeredMl, prev + 5))}
                    className="w-8 h-8 rounded-lg bg-[#1a2d3b] text-teal-300 flex items-center justify-center active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {LEFTOVER_PRESETS.map((vol) => (
                    <button
                      key={`modal-leftover-${vol}`}
                      type="button"
                      onClick={() => setLeftoverMl(vol)}
                      className={`py-1 rounded-lg text-xs font-bold transition ${
                        safeLeftover === vol
                          ? 'bg-teal-600 text-white'
                          : 'bg-[#1b1e36] text-gray-300 hover:bg-[#232847]'
                      }`}
                    >
                      {vol === 0 ? '0 (Tudo)' : `${vol}ml`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Calculation Summary */}
              <div className="bg-gradient-to-r from-[#1e1938] via-[#1a2238] to-[#12222a] border border-purple-500/40 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🍼 Ingerido pelo bebê:</span>
                    <span className="text-purple-300 font-extrabold text-sm font-mono">{consumedMl} ml</span>
                    <span className="text-purple-200 text-xs">({consumedPercentage}%)</span>
                  </span>
                  {safeLeftover === 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      100%
                    </span>
                  )}
                </div>

                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, consumedPercentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>Ofertado: <b className="text-gray-200">{offeredMl}ml</b></span>
                  <span>Sobrou: <b className="text-gray-200">{safeLeftover}ml</b></span>
                  <span>Bebido: <b className="text-emerald-300">{consumedMl}ml</b></span>
                </div>
              </div>
            </section>
          )}

          {/* Observations and Feelings */}
          <section className="space-y-2.5 pt-1">
            <h3 className="text-sm font-semibold text-gray-200">Observações (opcional)</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Como foi a amamentação?"
              rows={2}
              className="w-full bg-[#181a2b] border border-[#272a44] rounded-2xl px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-[#7158e2] transition resize-none"
            />

            {/* Feelings Pills */}
            <div className="flex flex-wrap gap-2 pt-0.5">
              {[
                { emoji: '❤️', label: 'Amamentação tranquila' },
                { emoji: '😵', label: 'Distraída' },
                { emoji: '😢', label: 'Com dor' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setFeeling(item.label)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    feeling === item.label
                      ? 'bg-[#7158e2] text-white border border-[#9b87f5]'
                      : 'bg-[#17192b] border border-[#292b45] text-gray-200 hover:border-[#433c75]'
                  }`}
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom CTA Button (10% Accent token) */}
        <footer
          className="p-5 pt-2 pb-5 border-t transition-colors"
          style={{
            backgroundColor: 'var(--color-dominant)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-4 font-black text-sm tracking-wide shadow-lg flex items-center justify-center transition active:scale-[0.99] cursor-pointer"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              borderRadius: 'var(--app-card-radius)',
            }}
          >
            {mode === 'peito'
              ? `Salvar Amamentação (${leftMinutes + rightMinutes} min)`
              : `Registrar Mamadeira (${consumedMl}ml bebidos - ${consumedPercentage}%)`}
          </button>
        </footer>

      </div>
    </div>
  );
};
