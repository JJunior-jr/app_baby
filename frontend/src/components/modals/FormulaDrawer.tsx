import React, { useState } from 'react';
import { X, Check, Droplets, Plus, Minus, Sparkles, AlertCircle } from 'lucide-react';

export interface FormulaConfirmData {
  offeredMl: number;
  leftoverMl: number;
  consumedMl: number;
  consumedPercentage: number;
  milkType: 'formula' | 'leite_materno';
  notes?: string;
}

interface FormulaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: FormulaConfirmData | number, notes?: string) => void;
}

const PRESET_OFFERED = [30, 60, 90, 120, 150, 180, 210, 240];
const PRESET_LEFTOVER = [0, 10, 20, 30, 40, 50, 60];

export const FormulaDrawer: React.FC<FormulaDrawerProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [offeredMl, setOfferedMl] = useState<number>(150);
  const [leftoverMl, setLeftoverMl] = useState<number>(0);
  const [milkType, setMilkType] = useState<'formula' | 'leite_materno'>('formula');
  const [customNote, setCustomNote] = useState<string>('');

  if (!isOpen) return null;

  // Real-time calculation of consumed and percentage
  const safeLeftover = Math.min(offeredMl, Math.max(0, leftoverMl));
  const consumedMl = Math.max(0, offeredMl - safeLeftover);
  const consumedPercentage = offeredMl > 0 ? Math.round((consumedMl / offeredMl) * 100) : 0;

  const handleConfirm = () => {
    const payload: FormulaConfirmData = {
      offeredMl,
      leftoverMl: safeLeftover,
      consumedMl,
      consumedPercentage,
      milkType,
      notes: customNote.trim() || undefined,
    };
    onConfirm(payload, customNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-xs transition-all">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Card */}
      <section
        aria-labelledby="formula-drawer-title"
        aria-modal="true"
        role="dialog"
        className="relative w-full max-w-[440px] landscape:max-w-2xl bg-[#141729] rounded-t-[32px] pt-3 pb-6 px-5 z-10 shadow-2xl border-t border-purple-500/20 max-h-[88vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-6 duration-200"
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-[#2d314f] rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#292452] border border-purple-500/30 flex items-center justify-center text-xl text-purple-300">
              🍼
            </div>
            <div>
              <h2 id="formula-drawer-title" className="text-base font-bold text-white tracking-tight">
                Mamadeira & Quantidade
              </h2>
              <p className="text-xs text-[#8c91af]">Registre o volume ofertado e o que sobrou</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar drawer"
            className="p-1.5 text-gray-400 hover:text-white transition rounded-xl bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Milk Type Toggle */}
        <div className="grid grid-cols-2 gap-2 mt-3.5 p-1 bg-[#1a1d33] rounded-2xl border border-gray-800">
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
            <span>Leite materno (ordenhado)</span>
          </button>
        </div>

        {/* SECTION 1: Quanto eu ofertei */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
              <span>1. Quanto você ofertou?</span>
              <span className="text-[10px] text-gray-400 font-normal">(ofertado)</span>
            </label>
            <span className="text-xs font-bold text-white font-mono bg-purple-900/40 px-2 py-0.5 rounded-lg border border-purple-500/30">
              {offeredMl} ml
            </span>
          </div>

          {/* Counter with - / + buttons */}
          <div className="bg-[#181b31] border border-purple-500/30 rounded-2xl p-3 flex items-center justify-between shadow-inner">
            <button
              type="button"
              onClick={() => setOfferedMl((prev) => Math.max(10, prev - 10))}
              className="w-9 h-9 rounded-xl bg-[#232747] hover:bg-[#2e335d] text-purple-300 flex items-center justify-center transition active:scale-95 border border-purple-500/20"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                {offeredMl}
              </span>
              <span className="text-xs font-bold text-purple-300 ml-1.5 uppercase">ml</span>
              <span className="block text-[10px] text-gray-400">volume preparado</span>
            </div>

            <button
              type="button"
              onClick={() => setOfferedMl((prev) => prev + 10)}
              className="w-9 h-9 rounded-xl bg-[#232747] hover:bg-[#2e335d] text-purple-300 flex items-center justify-center transition active:scale-95 border border-purple-500/20"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick preset buttons for offered */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {PRESET_OFFERED.map((vol) => {
              const isSelected = offeredMl === vol;
              return (
                <button
                  key={`offered-${vol}`}
                  type="button"
                  onClick={() => setOfferedMl(vol)}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#7158e2] to-[#9a7ffc] text-white shadow-md shadow-purple-900/40 ring-2 ring-purple-400'
                      : 'bg-[#1b1e36] text-gray-300 hover:bg-[#232847] border border-gray-800'
                  }`}
                >
                  <span className="text-xs font-extrabold">{vol}</span>
                  <span className="text-[9px] opacity-75">ml</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Quanto sobrou na mamadeira (Mesmo padrão!) */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-teal-200 flex items-center gap-1.5">
              <span>2. Quanto sobrou na mamadeira?</span>
              <span className="text-[10px] text-gray-400 font-normal">(sobra)</span>
            </label>
            <span className="text-xs font-bold text-white font-mono bg-teal-900/40 px-2 py-0.5 rounded-lg border border-teal-500/30">
              {safeLeftover} ml
            </span>
          </div>

          {/* Counter with - / + buttons (mesmo padrão) */}
          <div className="bg-[#181b31] border border-teal-500/30 rounded-2xl p-3 flex items-center justify-between shadow-inner">
            <button
              type="button"
              onClick={() => setLeftoverMl((prev) => Math.max(0, prev - 5))}
              className="w-9 h-9 rounded-xl bg-[#1d2b38] hover:bg-[#23384a] text-teal-300 flex items-center justify-center transition active:scale-95 border border-teal-500/20"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                {safeLeftover}
              </span>
              <span className="text-xs font-bold text-teal-300 ml-1.5 uppercase">ml</span>
              <span className="block text-[10px] text-gray-400">
                {safeLeftover === 0 ? 'Nada sobrou (tomou tudo!)' : 'restante descartado / guardado'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLeftoverMl((prev) => Math.min(offeredMl, prev + 5))}
              className="w-9 h-9 rounded-xl bg-[#1d2b38] hover:bg-[#23384a] text-teal-300 flex items-center justify-center transition active:scale-95 border border-teal-500/20"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick preset buttons for leftover */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {PRESET_LEFTOVER.map((vol) => {
              const isSelected = safeLeftover === vol;
              return (
                <button
                  key={`leftover-${vol}`}
                  type="button"
                  onClick={() => setLeftoverMl(vol)}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-gradient-to-br from-teal-600 to-teal-400 text-white shadow-md shadow-teal-900/40 ring-2 ring-teal-300'
                      : 'bg-[#1b1e36] text-gray-300 hover:bg-[#232847] border border-gray-800'
                  }`}
                >
                  <span className="text-xs font-extrabold">{vol === 0 ? '0 (Tudo)' : `${vol}ml`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Live Calculation Summary Card */}
        <div className="mt-4 bg-gradient-to-r from-[#1f1a3d] via-[#1a233d] to-[#12232c] border border-purple-500/40 rounded-2xl p-3.5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-sm">
                🍼
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">
                  Total consumido pelo bebê
                </span>
                <span className="text-base font-extrabold text-white">
                  {consumedMl} ml <span className="text-purple-300 text-sm font-bold">({consumedPercentage}%)</span>
                </span>
              </div>
            </div>

            {safeLeftover === 0 ? (
              <span className="px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                100% Ingerido
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold">
                Sobrou {safeLeftover} ml
              </span>
            )}
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                consumedPercentage >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : consumedPercentage >= 50
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-400'
                  : 'bg-gradient-to-r from-amber-500 to-rose-400'
              }`}
              style={{ width: `${Math.min(100, consumedPercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
            <span>Ofertado: <b className="text-gray-200">{offeredMl} ml</b></span>
            <span>Sobrou: <b className="text-gray-200">{safeLeftover} ml</b></span>
            <span>Bebido: <b className="text-emerald-300">{consumedMl} ml</b></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-2xl bg-[#1b1d33] border border-gray-800 text-xs font-bold text-gray-300 hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#7158e2] to-[#9a7ffc] hover:opacity-95 text-[#0d0f1e] text-xs font-black flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/40 active:scale-98 transition"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Salvar {consumedMl}ml ({consumedPercentage}%)</span>
          </button>
        </div>
      </section>
    </div>
  );
};
