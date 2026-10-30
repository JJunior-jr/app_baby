import React, { useState, useEffect } from 'react';
import { Heart, Droplets, Clock, ArrowLeftRight, Baby, Plus, Minus, Sparkles } from 'lucide-react';
import { Button, TextArea, Selector } from 'antd-mobile';
import { FeedingMode } from '../../types';
import { BaseModal } from './BaseModal';

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Amamentação"
      subtitle="Hoje · Agora"
      headerIcon="🤱"
      footer={
        <Button
          block
          color="primary"
          size="large"
          onClick={handleSave}
          className="font-black text-sm tracking-wide shadow-lg cursor-pointer"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
            borderRadius: 'var(--app-card-radius)',
            border: 'none',
          }}
        >
          {mode === 'peito'
            ? `Salvar Amamentação (${leftMinutes + rightMinutes} min)`
            : `Registrar Mamadeira (${consumedMl}ml bebidos - ${consumedPercentage}%)`}
        </Button>
      }
    >
      {/* Activity Heading */}
      <section className="flex items-center space-x-3.5 pt-1">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-purple-400">
          <Baby className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white leading-tight">Amamentação</h3>
          <p className="text-xs text-slate-400 mt-0.5">Como foi a nutrição do John?</p>
        </div>
      </section>

      {/* Mode Selector via AntD Selector */}
      <section>
        <Selector
          options={[
            { label: 'Peito (Timer)', value: 'peito' },
            { label: 'Mamadeira / Fórmula', value: 'formula' },
          ]}
          value={[mode]}
          onChange={(v) => {
            if (v.length > 0) setMode(v[0] as FeedingMode);
          }}
          style={{
            '--color': 'var(--color-secondary)',
            '--checked-color': 'var(--color-accent)',
            '--checked-text-color': 'var(--color-accent-text)',
            '--border-radius': 'var(--app-button-radius)',
            '--border': '1px solid var(--color-border)',
            '--padding': '8px 12px',
          }}
        />
      </section>

      {/* Mode === 'peito': Circular Timers */}
      {mode === 'peito' ? (
        <>
          <section className="pt-1 space-y-3">
            <div className="flex justify-between items-center px-4">
              <span className="text-xs font-bold text-purple-300 tracking-wide">Lado Esquerdo</span>
              <span className="text-xs font-bold text-purple-300 tracking-wide">Lado Direito</span>
            </div>

            <div className="flex justify-between items-center px-2">
              {/* Left Circle & Timer Button */}
              <button
                type="button"
                onClick={() => setActiveSide(activeSide === 'left' ? null : 'left')}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                  activeSide === 'left'
                    ? 'bg-purple-600 text-white ring-4 ring-purple-300 shadow-xl scale-105 animate-pulse'
                    : 'bg-slate-800 border-2 border-slate-700 text-gray-200 hover:border-purple-500'
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
                className="text-slate-400 hover:text-purple-300 transition p-2 cursor-pointer"
              >
                <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
              </button>

              {/* Right Circle & Timer Button */}
              <button
                type="button"
                onClick={() => setActiveSide(activeSide === 'right' ? null : 'right')}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                  activeSide === 'right'
                    ? 'bg-purple-600 text-white ring-4 ring-purple-300 shadow-xl scale-105 animate-pulse'
                    : 'bg-slate-800 border-2 border-slate-700 text-gray-200 hover:border-purple-500'
                }`}
              >
                <span className="text-3xl font-black font-mono tracking-tight">{rightMinutes}</span>
                <span className="text-[11px] font-bold opacity-80 mt-0.5">
                  {activeSide === 'right' ? 'Amamentando ●' : 'min (tocar)'}
                </span>
              </button>
            </div>

            {/* AntD Buttons for Counter Adjustment */}
            <div className="flex justify-between items-center px-4 sm:px-6">
              <div className="flex items-center space-x-2">
                <Button
                  size="small"
                  onClick={() => setLeftMinutes((prev) => Math.max(0, prev - 1))}
                  className="rounded-xl bg-slate-800 border-slate-700 text-purple-300 hover:bg-purple-600 cursor-pointer"
                >
                  -
                </Button>
                <Button
                  size="small"
                  onClick={() => setLeftMinutes((prev) => prev + 1)}
                  className="rounded-xl bg-slate-800 border-slate-700 text-purple-300 hover:bg-purple-600 cursor-pointer"
                >
                  +
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="small"
                  onClick={() => setRightMinutes((prev) => Math.max(0, prev - 1))}
                  className="rounded-xl bg-slate-800 border-slate-700 text-purple-300 hover:bg-purple-600 cursor-pointer"
                >
                  -
                </Button>
                <Button
                  size="small"
                  onClick={() => setRightMinutes((prev) => prev + 1)}
                  className="rounded-xl bg-slate-800 border-slate-700 text-purple-300 hover:bg-purple-600 cursor-pointer"
                >
                  +
                </Button>
              </div>
            </div>
          </section>

          {/* Total Duration Card */}
          <section className="bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-gray-200">Tempo Total</span>
            </div>
            <span className="text-base font-black text-white tracking-tight">{leftMinutes + rightMinutes} min</span>
          </section>
        </>
      ) : (
        /* Mode === 'formula': Mamadeira */
        <section className="space-y-3.5 pt-1">
          {/* Milk Type Selector */}
          <Selector
            options={[
              { label: 'Fórmula infantil', value: 'formula' },
              { label: 'Leite materno', value: 'leite_materno' },
            ]}
            value={[milkType]}
            onChange={(v) => {
              if (v.length > 0) setMilkType(v[0] as 'formula' | 'leite_materno');
            }}
            style={{
              '--color': 'var(--color-secondary)',
              '--checked-color': 'var(--color-accent)',
              '--checked-text-color': 'var(--color-accent-text)',
              '--border-radius': 'var(--app-button-radius)',
              '--border': '1px solid var(--color-border)',
            }}
          />

          {/* SECTION 1: Quanto você ofertou */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-700/80 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-200">
                1. Quanto você ofertou?
              </label>
              <span className="text-xs font-bold text-white font-mono bg-purple-900/50 px-2 py-0.5 rounded-lg border border-purple-500/30">
                {offeredMl} ml
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 rounded-xl p-2.5">
              <Button
                size="small"
                onClick={() => setOfferedMl((prev) => Math.max(10, prev - 10))}
                className="bg-slate-700 text-purple-300 border-none cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <span className="text-2xl font-black text-white font-mono">{offeredMl}</span>
                <span className="text-xs font-bold text-purple-300 ml-1">ml</span>
              </div>
              <Button
                size="small"
                onClick={() => setOfferedMl((prev) => prev + 10)}
                className="bg-slate-700 text-purple-300 border-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {FORMULA_PRESETS.map((vol) => (
                <button
                  key={`modal-offered-${vol}`}
                  type="button"
                  onClick={() => setOfferedMl(vol)}
                  className={`py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    offeredMl === vol
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {vol}ml
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: Quanto sobrou na mamadeira */}
          <div className="bg-slate-900/90 rounded-2xl border border-teal-500/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-teal-200">
                2. Quanto sobrou na mamadeira?
              </label>
              <span className="text-xs font-bold text-white font-mono bg-teal-900/50 px-2 py-0.5 rounded-lg border border-teal-500/30">
                {safeLeftover} ml
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 rounded-xl p-2.5">
              <Button
                size="small"
                onClick={() => setLeftoverMl((prev) => Math.max(0, prev - 5))}
                className="bg-slate-700 text-teal-300 border-none cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <span className="text-2xl font-black text-white font-mono">{safeLeftover}</span>
                <span className="text-xs font-bold text-teal-300 ml-1">ml</span>
                <span className="block text-[9.5px] text-gray-400">
                  {safeLeftover === 0 ? 'Tomou tudo!' : 'sobra'}
                </span>
              </div>
              <Button
                size="small"
                onClick={() => setLeftoverMl((prev) => Math.min(offeredMl, prev + 5))}
                className="bg-slate-700 text-teal-300 border-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {LEFTOVER_PRESETS.map((vol) => (
                <button
                  key={`modal-leftover-${vol}`}
                  type="button"
                  onClick={() => setLeftoverMl(vol)}
                  className={`py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    safeLeftover === vol
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {vol === 0 ? '0 (Tudo)' : `${vol}ml`}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Calculation Summary */}
          <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-3 space-y-2">
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
                className="h-full bg-purple-500 transition-all duration-300"
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

      {/* Observations via AntD TextArea */}
      <section className="space-y-2.5 pt-1">
        <h4 className="text-sm font-semibold text-gray-200">Observações (opcional)</h4>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2">
          <TextArea
            value={notes}
            onChange={(val) => setNotes(val)}
            placeholder="Como foi a amamentação?"
            rows={2}
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{
              '--color': 'var(--color-text-primary)',
              '--placeholder-color': 'var(--color-text-muted)',
              '--font-size': '14px',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        {/* Feelings Selector via AntD Selector */}
        <Selector
          options={[
            { label: '❤️ Tranquila', value: 'Amamentação tranquila' },
            { label: '😵 Distraída', value: 'Distraída' },
            { label: '😢 Com dor', value: 'Com dor' },
          ]}
          value={[feeling]}
          onChange={(v) => {
            if (v.length > 0) setFeeling(v[0]);
          }}
          style={{
            '--color': 'var(--color-secondary)',
            '--checked-color': 'var(--color-accent)',
            '--checked-text-color': 'var(--color-accent-text)',
            '--border-radius': 'var(--app-button-radius)',
            '--border': '1px solid var(--color-border)',
            '--padding': '6px 10px',
          }}
        />
      </section>
    </BaseModal>
  );
};
