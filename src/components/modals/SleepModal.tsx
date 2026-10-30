import React, { useState, useEffect } from 'react';
import { Sun, ArrowRight, CheckCircle2 } from 'lucide-react';
import { isDaytimeInBrazil, getBrazilTimeString } from '../../services/brazilTime';
import { whiteNoiseService, WhiteNoiseTrack } from '../../services/whiteNoiseAudio';
import { WhiteNoisePlaylistModal } from './WhiteNoisePlaylistModal';
import { BaseModal } from './BaseModal';

interface SleepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    sleepType: 'noturno' | 'soneca';
    startTime: string;
    endTime?: string;
    isInProgress: boolean;
    quality: 'ruim' | 'regular' | 'bom' | 'excelente';
    notes?: string;
  }) => void;
}

export const SleepModal: React.FC<SleepModalProps> = ({ isOpen, onClose, onSave }) => {
  const [sleepType, setSleepType] = useState<'noturno' | 'soneca'>(() =>
    isDaytimeInBrazil() ? 'soneca' : 'noturno'
  );
  const [startTime] = useState(() => getBrazilTimeString());
  const [endTime] = useState('23:08');
  const [isInProgress, setIsInProgress] = useState<boolean>(true);
  const [isRegisteredGreen, setIsRegisteredGreen] = useState<boolean>(false);
  const [quality, setQuality] = useState<'ruim' | 'regular' | 'bom' | 'excelente'>('bom');
  const [notes, setNotes] = useState<string>('');
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isPlayingWhiteNoise, setIsPlayingWhiteNoise] = useState(() => whiteNoiseService.isPlaying());
  const [currentTrack, setCurrentTrack] = useState<WhiteNoiseTrack>(() =>
    whiteNoiseService.getCurrentTrack()
  );

  useEffect(() => {
    const handleSoundState = () => {
      setIsPlayingWhiteNoise(whiteNoiseService.isPlaying());
      setCurrentTrack(whiteNoiseService.getCurrentTrack());
    };
    const unsub = whiteNoiseService.subscribe(handleSoundState);
    handleSoundState();
    return () => unsub();
  }, [isOpen]);

  const handleSave = () => {
    setIsRegisteredGreen(true);
    setTimeout(() => {
      onSave({
        sleepType,
        startTime,
        endTime: isInProgress ? undefined : endTime,
        isInProgress,
        quality,
        notes,
      });
      onClose();
    }, 450);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center justify-center gap-1.5">
          <span>{sleepType === 'soneca' ? 'Registrar Soneca' : 'Registrar Sono'}</span>
          <span>{sleepType === 'soneca' ? '☀️' : '🌙'}</span>
        </span>
      }
      subtitle={`Hoje · ${startTime}`}
      headerIcon={sleepType === 'soneca' ? '☀️' : '🌙'}
      footer={
        <button
          type="button"
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] cursor-pointer ${
            isRegisteredGreen || isInProgress
              ? 'bg-[#16a34a] text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50'
              : 'bg-[#eab308] hover:bg-[#f59e0b] text-[#1c1917] shadow-amber-500/20'
          }`}
        >
          {isRegisteredGreen || isInProgress ? (
            <>
              <CheckCircle2 className="w-5 h-5 fill-current text-white animate-in zoom-in-75" />
              <span>
                Registrado como {sleepType === 'soneca' ? 'Soneca' : 'Sono'} em Andamento{' '}
                {sleepType === 'soneca' ? '☀️' : '🌙'}
              </span>
            </>
          ) : (
            <>
              <span>{sleepType === 'soneca' ? '☀️' : '🌙'}</span>
              <span>Registrar {sleepType === 'soneca' ? 'Soneca Finalizada' : 'Sono Finalizado'}</span>
            </>
          )}
        </button>
      }
    >
      {/* Section Header with Dynamic Emoji */}
      <section className="flex items-center gap-3.5 pt-1">
        <div className="w-12 h-12 rounded-2xl bg-[#232029] border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
          {sleepType === 'soneca' ? '☀️' : '🌙'}
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{sleepType === 'soneca' ? 'Soneca' : 'Sono'}</span>
            <span className="text-lg">{sleepType === 'soneca' ? '☀️' : '🌙'}</span>
          </h3>
          <p className="text-xs text-gray-400 font-medium">
            {isInProgress
              ? `Início d${sleepType === 'soneca' ? 'a soneca' : 'o sono'} registrado (em andamento)`
              : 'Registrar período de descanso do John'}
          </p>
        </div>
      </section>

      {/* Toggle Selector: Sono Noturno vs Soneca */}
      <section className="bg-[#181b2e] p-1.5 rounded-2xl flex items-center border border-[#272b47]/60">
        <button
          type="button"
          onClick={() => setSleepType('noturno')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            sleepType === 'noturno'
              ? 'bg-[#eab308] text-[#1c1917] shadow-sm font-black'
              : 'text-[#eab308] hover:bg-white/5'
          }`}
        >
          <span>🌙</span>
          <span>Sono noturno</span>
        </button>

        <button
          type="button"
          onClick={() => setSleepType('soneca')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            sleepType === 'soneca'
              ? 'bg-[#eab308] text-[#1c1917] shadow-sm font-black'
              : 'text-[#eab308] hover:bg-white/5'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Soneca</span>
        </button>
      </section>

      {/* Time Cards: Início -> Fim */}
      <section className="flex items-center gap-3">
        <div className="flex-1 bg-[#181b2e] rounded-2xl p-4 border border-[#272b47]/70">
          <span className="text-[11px] font-semibold text-gray-400 block mb-1">Início</span>
          <div className="text-2xl font-extrabold text-white tracking-tight leading-none mb-1 font-mono">
            {startTime}
          </div>
          <span className="text-xs font-medium text-gray-400">Hoje</span>
        </div>

        <div className="text-gray-400 flex items-center justify-center px-1">
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </div>

        <div className={`flex-1 bg-[#181b2e] rounded-2xl p-4 border border-[#272b47]/70 ${isInProgress ? 'opacity-50' : ''}`}>
          <span className="text-[11px] font-semibold text-gray-400 block mb-1">Fim</span>
          <div className="text-2xl font-extrabold text-white tracking-tight leading-none mb-1 font-mono">
            {isInProgress ? 'Dormindo...' : endTime}
          </div>
          <span className="text-xs font-medium text-gray-400">{isInProgress ? 'Em andamento' : 'Hoje'}</span>
        </div>
      </section>

      {/* Em andamento Switch Toggle */}
      <section className="bg-[#181b2e] rounded-2xl px-5 py-3.5 flex items-center justify-between border border-[#272b47]/70">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-200">Em andamento (dormindo agora)</span>
          <span>🌙</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isInProgress}
          onClick={() => setIsInProgress(!isInProgress)}
          className={`w-12 h-6 rounded-full p-0.5 border flex items-center transition-colors cursor-pointer ${
            isInProgress ? 'bg-emerald-500 border-emerald-400' : 'bg-[#0f111d] border-gray-400/60'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
              isInProgress ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </section>

      {/* Qualidade do sono */}
      <section>
        <h4 className="text-sm font-bold text-white mb-2.5 tracking-wide">Qualidade do sono</h4>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'ruim', label: 'Ruim', emoji: '😔' },
            { id: 'regular', label: 'Regular', emoji: '😐' },
            { id: 'bom', label: 'Bom', emoji: '😊' },
            { id: 'excelente', label: 'Excelente', emoji: '😃' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setQuality(item.id as any)}
              className={`bg-[#181b2e] rounded-2xl py-3 px-1 flex flex-col items-center justify-center border transition-all active:scale-95 cursor-pointer ${
                quality === item.id
                  ? 'border-[#eab308] bg-[#22211f]'
                  : 'border-[#272b47]/60 hover:border-amber-500/50'
              }`}
            >
              <span className="text-2xl mb-1">{item.emoji}</span>
              <span className={`text-[11px] font-medium ${quality === item.id ? 'text-[#eab308] font-bold' : 'text-gray-300'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Ruído Branco & Playlist */}
      <section>
        <div
          onClick={() => setIsPlaylistModalOpen(true)}
          className="p-3.5 rounded-2xl bg-[#181b2e] border border-purple-500/25 flex items-center justify-between cursor-pointer hover:border-purple-400/50 transition active:scale-[0.99]"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl">
              {isPlayingWhiteNoise ? currentTrack.emoji : '🌧️'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">Ruído Branco & Playlist</span>
                {isPlayingWhiteNoise && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    Tocando
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                {isPlayingWhiteNoise
                  ? `${currentTrack.name} · Toque para alterar ou pausar`
                  : 'Escolha entre 6 ruídos calmantes para o sono'}
              </p>
            </div>
          </div>
          <span className="text-xs text-purple-300 font-semibold px-2.5 py-1 rounded-lg bg-white/5">
            {isPlayingWhiteNoise ? 'Ajustar' : 'Escolher'}
          </span>
        </div>
      </section>

      {/* Observações */}
      <section className="space-y-2">
        <h4 className="text-sm font-bold text-white tracking-wide">Observações (opcional)</h4>
        <div className="w-full bg-[#181b2e] rounded-2xl border border-[#272b47]/70 p-3.5 min-h-[80px]">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Como foi o sono do John?"
            rows={2}
            className="w-full h-full bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none resize-none"
          />
        </div>
      </section>

      {/* White Noise Playlist Modal */}
      <WhiteNoisePlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
      />
    </BaseModal>
  );
};
