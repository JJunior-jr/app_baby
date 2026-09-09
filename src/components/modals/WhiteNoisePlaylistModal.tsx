import React, { useEffect, useState } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Clock,
  Sparkles,
  Info,
  SkipBack,
  SkipForward,
  Smartphone,
} from 'lucide-react';
import {
  whiteNoiseService,
  WHITE_NOISE_TRACKS,
  WhiteNoiseId,
  WhiteNoiseTrack,
} from '../../services/whiteNoiseAudio';

interface WhiteNoisePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIMER_OPTIONS = [
  { label: 'Contínuo', minutes: null },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
];

export const WhiteNoisePlaylistModal: React.FC<WhiteNoisePlaylistModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => whiteNoiseService.isPlaying());
  const [currentTrack, setCurrentTrack] = useState<WhiteNoiseTrack>(() =>
    whiteNoiseService.getCurrentTrack()
  );
  const [volume, setVolume] = useState<number>(() => whiteNoiseService.getVolume());
  const [timerMinutes, setTimerMinutes] = useState<number | null>(() =>
    whiteNoiseService.getTimerMinutes()
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() =>
    whiteNoiseService.getRemainingTimerSeconds()
  );

  // Sync state with audio engine
  useEffect(() => {
    const updateState = () => {
      setIsPlaying(whiteNoiseService.isPlaying());
      setCurrentTrack(whiteNoiseService.getCurrentTrack());
      setVolume(whiteNoiseService.getVolume());
      setTimerMinutes(whiteNoiseService.getTimerMinutes());
      setRemainingSeconds(whiteNoiseService.getRemainingTimerSeconds());
    };

    const unsubscribe = whiteNoiseService.subscribe(updateState);
    updateState();

    const interval = setInterval(() => {
      setRemainingSeconds(whiteNoiseService.getRemainingTimerSeconds());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePlay = (trackId?: WhiteNoiseId) => {
    whiteNoiseService.togglePlay(trackId);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    whiteNoiseService.setVolume(val);
  };

  const handleSelectTimer = (minutes: number | null) => {
    whiteNoiseService.setTimer(minutes);
  };

  const formatRemainingTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm transition-all p-0 sm:p-4">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Bottom Sheet / Modal Card */}
      <section
        aria-labelledby="whitenoise-playlist-title"
        aria-modal="true"
        role="dialog"
        className="relative w-full max-w-[480px] bg-[#131526] rounded-t-[32px] sm:rounded-3xl pt-3 pb-6 px-5 z-10 shadow-2xl border-t sm:border border-purple-500/25 max-h-[92vh] flex flex-col no-scrollbar animate-in slide-in-from-bottom-6 duration-200"
      >
        {/* Drag handle on mobile */}
        <div className="w-12 h-1.5 bg-[#2d314f] rounded-full mx-auto mb-2.5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/30 flex items-center justify-center text-xl text-rose-300 shadow-inner">
              <span>🌧️</span>
              {isPlaying && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
              )}
            </div>
            <div>
              <h2
                id="whitenoise-playlist-title"
                className="text-base font-bold text-white tracking-tight flex items-center gap-1.5"
              >
                <span>Playlist de Ruído Branco</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-[11px] text-gray-400 font-medium">
                Escolha o som calmante ideal para o bebê dormir
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Fechar playlist"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Active Sound Bar & Quick Controls */}
        <div className="mt-3.5 p-3 rounded-2xl bg-[#1b1e36] border border-purple-500/20 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <span className="text-2xl shrink-0">{currentTrack.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">
                    {currentTrack.name}
                  </span>
                  {isPlaying && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold tracking-wider uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Tocando
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-gray-400 truncate">
                  {currentTrack.tag}
                </p>
              </div>
            </div>

            {/* Player controls */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => whiteNoiseService.playPreviousTrack()}
                title="Som anterior"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleTogglePlay()}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition active:scale-95 cursor-pointer shadow-md ${
                  isPlaying
                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/25'
                    : 'bg-gradient-to-r from-teal-400 to-emerald-400 text-[#0c0d16] hover:from-teal-300 hover:to-emerald-300 shadow-teal-500/20'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Ouvir</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => whiteNoiseService.playNextTrack()}
                title="Próximo som"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Volume Slider & Timer Controls */}
          <div className="mt-3 pt-2.5 border-t border-white/5 space-y-2.5">
            {/* Background playback status chip */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#121424] border border-purple-500/20 text-[10.5px]">
              <div className="flex items-center space-x-1.5 text-purple-300">
                <Smartphone className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                <span className="font-semibold">Segundo plano & Tela de bloqueio ativo</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.5 rounded">
                Media Session
              </span>
            </div>
            {/* Volume */}
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => whiteNoiseService.setVolume(volume > 0 ? 0 : 0.7)}
                className="text-gray-400 hover:text-white transition cursor-pointer"
                title={volume === 0 ? 'Ativar som' : 'Silenciar'}
              >
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4 text-gray-300" />
                ) : (
                  <Volume2 className="w-4 h-4 text-purple-300" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1.5 bg-[#2b2d4b] rounded-lg appearance-none cursor-pointer accent-purple-400"
                aria-label="Volume do ruído branco"
              />
              <span className="text-[11px] font-mono text-gray-400 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Timer Pills */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              <div className="flex items-center space-x-1 text-gray-400 text-[10.5px]">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>Timer:</span>
                {remainingSeconds !== null && (
                  <span className="text-amber-300 font-mono font-bold">
                    ({formatRemainingTime(remainingSeconds)})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {TIMER_OPTIONS.map((opt) => {
                  const isSelected = timerMinutes === opt.minutes;
                  return (
                    <button
                      key={`timer-${opt.label}`}
                      type="button"
                      onClick={() => handleSelectTimer(opt.minutes)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-amber-400 text-[#0c0d16] font-extrabold shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Track Playlist (6 options) */}
        <div className="mt-3 flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5 max-h-[46vh]">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Escolha uma Opção ({WHITE_NOISE_TRACKS.length} sons):
            </span>
            <span className="text-[10px] text-purple-300">Toque para trocar</span>
          </div>

          {WHITE_NOISE_TRACKS.map((track) => {
            const isSelected = currentTrack.id === track.id;
            const isCurrentPlaying = isSelected && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => handleTogglePlay(track.id)}
                className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 active:scale-[0.98] ${
                  isSelected
                    ? `bg-gradient-to-r ${track.bgGradient} ${track.accentBorder} shadow-lg ring-1 ring-purple-400/40`
                    : 'bg-[#181a2f]/70 hover:bg-[#1f223d] border-white/5 text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Emoji Avatar */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 border transition-all ${
                      isSelected
                        ? 'bg-white/15 border-white/30 shadow-md scale-105'
                        : 'bg-[#222542] border-white/10'
                    }`}
                  >
                    <span>{track.emoji}</span>
                  </div>

                  {/* Track Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-xs font-bold leading-tight truncate ${
                          isSelected ? 'text-white' : 'text-gray-200'
                        }`}
                      >
                        {track.name}
                      </h3>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {track.tag}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-gray-400 mt-0.5 leading-snug line-clamp-1">
                      {track.description}
                    </p>
                  </div>
                </div>

                {/* Right Action / Visualizer */}
                <div className="flex items-center space-x-2 shrink-0">
                  {isCurrentPlaying ? (
                    <div className="flex items-end space-x-0.5 h-4 px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40">
                      <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse [animation-delay:150ms]" />
                      <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:300ms]" />
                    </div>
                  ) : isSelected ? (
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
                      <Play className="w-3 h-3 fill-current translate-x-0.5" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-400">
                      <Play className="w-3 h-3 fill-current translate-x-0.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Helpful Note */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center space-x-2 text-gray-400 text-[10.5px]">
          <Info className="w-3.5 h-3.5 text-purple-300 shrink-0" />
          <p className="leading-tight">
            O som continua tocando mesmo fechando esta janela enquanto o aplicativo estiver aberto.
          </p>
        </div>
      </section>
    </div>
  );
};
