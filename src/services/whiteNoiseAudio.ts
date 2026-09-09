/**
 * White Noise & Ambient Sleep Sound Generator
 * Powered by Web Audio API for offline, seamless, zero-latency playback.
 */

export type WhiteNoiseId = 'rain' | 'white' | 'ocean' | 'womb' | 'fan' | 'breeze';

export interface WhiteNoiseTrack {
  id: WhiteNoiseId;
  name: string;
  emoji: string;
  tag: string;
  description: string;
  color: string;
  bgGradient: string;
  accentBorder: string;
}

export const WHITE_NOISE_TRACKS: WhiteNoiseTrack[] = [
  {
    id: 'rain',
    name: 'Chuva Suave',
    emoji: '🌧️',
    tag: 'Chuva Calmante',
    description: 'Gotas aconchegantes com filtragem relaxante para embalar o sono',
    color: 'text-sky-300',
    bgGradient: 'from-sky-500/20 to-blue-600/10',
    accentBorder: 'border-sky-500/40',
  },
  {
    id: 'white',
    name: 'Ruído Branco Puro',
    emoji: '💨',
    tag: 'Estático Clássico',
    description: 'Som contínuo uniforme que mascara ruídos repentinos da casa',
    color: 'text-violet-300',
    bgGradient: 'from-violet-500/20 to-purple-600/10',
    accentBorder: 'border-violet-500/40',
  },
  {
    id: 'ocean',
    name: 'Ondas do Mar',
    emoji: '🌊',
    tag: 'Fluxo Marítimo',
    description: 'Marés suaves que sobem e descem em ritmo calmante',
    color: 'text-teal-300',
    bgGradient: 'from-teal-500/20 to-emerald-600/10',
    accentBorder: 'border-teal-500/40',
  },
  {
    id: 'womb',
    name: 'Útero Materno',
    emoji: '🤰',
    tag: 'Aconchego Fetal',
    description: 'Som abafado e batimentos cardíacos que recriam a gestação',
    color: 'text-rose-300',
    bgGradient: 'from-rose-500/20 to-pink-600/10',
    accentBorder: 'border-rose-500/40',
  },
  {
    id: 'fan',
    name: 'Ventilador Noturno',
    emoji: '🌀',
    tag: 'Zumbido Constante',
    description: 'Frequência estável e monótona que ajuda a aprofundar o sono',
    color: 'text-cyan-300',
    bgGradient: 'from-cyan-500/20 to-blue-600/10',
    accentBorder: 'border-cyan-500/40',
  },
  {
    id: 'breeze',
    name: 'Vento Suave',
    emoji: '🍃',
    tag: 'Brisa Tranquila',
    description: 'Oscilação relaxante do vento soprando suavemente',
    color: 'text-emerald-300',
    bgGradient: 'from-emerald-500/20 to-teal-600/10',
    accentBorder: 'border-emerald-500/40',
  },
];

type SoundEventListener = () => void;

class WhiteNoiseService {
  private ctx: AudioContext | null = null;
  private currentTrackId: WhiteNoiseId = 'rain';
  private isCurrentlyPlaying: boolean = false;
  private volume: number = 0.7; // 0 to 1
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private timerMinutes: number | null = null;
  private timerTimeoutId: number | null = null;
  private timerEndsAt: number | null = null;
  private listeners: Set<SoundEventListener> = new Set();
  private silentAudio: HTMLAudioElement | null = null;

  constructor() {
    // Load saved preferences
    try {
      const savedVolume = localStorage.getItem('app_whitenoise_volume');
      if (savedVolume !== null) {
        const parsed = parseFloat(savedVolume);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }
      const savedTrack = localStorage.getItem('app_whitenoise_track') as WhiteNoiseId;
      if (savedTrack && WHITE_NOISE_TRACKS.some((t) => t.id === savedTrack)) {
        this.currentTrackId = savedTrack;
      }
    } catch {
      // Ignore local storage error
    }
  }

  public subscribe(listener: SoundEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public isPlaying(): boolean {
    return this.isCurrentlyPlaying;
  }

  public getCurrentTrack(): WhiteNoiseTrack {
    return (
      WHITE_NOISE_TRACKS.find((t) => t.id === this.currentTrackId) || WHITE_NOISE_TRACKS[0]
    );
  }

  public getCurrentTrackId(): WhiteNoiseId {
    return this.currentTrackId;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getTimerMinutes(): number | null {
    return this.timerMinutes;
  }

  public getRemainingTimerSeconds(): number | null {
    if (!this.timerEndsAt || !this.isCurrentlyPlaying) return null;
    const remaining = Math.ceil((this.timerEndsAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  }

  private initAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private stopCurrentAudioNodes() {
    this.activeNodes.forEach((item) => {
      if (typeof item === 'number') {
        window.clearInterval(item);
      } else {
        try {
          if ('stop' in item && typeof (item as AudioScheduledSourceNode).stop === 'function') {
            (item as AudioScheduledSourceNode).stop();
          }
          item.disconnect();
        } catch {
          // Node already stopped/disconnected
        }
      }
    });
    this.activeNodes = [];
  }

  public setVolume(newVolume: number) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    try {
      localStorage.setItem('app_whitenoise_volume', String(this.volume));
    } catch {
      // Ignore
    }
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.volume * 0.28, this.ctx.currentTime);
      } catch {
        // Ignore
      }
    }
    this.notify();
  }

  public setTimer(minutes: number | null) {
    this.timerMinutes = minutes;
    if (this.timerTimeoutId) {
      window.clearTimeout(this.timerTimeoutId);
      this.timerTimeoutId = null;
      this.timerEndsAt = null;
    }

    if (minutes !== null && minutes > 0 && this.isCurrentlyPlaying) {
      this.timerEndsAt = Date.now() + minutes * 60 * 1000;
      this.timerTimeoutId = window.setTimeout(() => {
        this.stop();
        this.timerTimeoutId = null;
        this.timerEndsAt = null;
      }, minutes * 60 * 1000);
    }
    this.notify();
  }

  public async play(trackId?: WhiteNoiseId) {
    const targetTrackId = trackId || this.currentTrackId;
    this.currentTrackId = targetTrackId;
    try {
      localStorage.setItem('app_whitenoise_track', targetTrackId);
    } catch {
      // Ignore
    }

    const ctx = this.initAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Stop existing nodes cleanly
    this.stopCurrentAudioNodes();

    // Create master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.28, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.masterGain = masterGain;

    // Synthesize target sound profile
    switch (targetTrackId) {
      case 'white':
        this.buildPureWhiteNoise(ctx, masterGain);
        break;
      case 'rain':
        this.buildRainSound(ctx, masterGain);
        break;
      case 'ocean':
        this.buildOceanWaves(ctx, masterGain);
        break;
      case 'womb':
        this.buildWombSound(ctx, masterGain);
        break;
      case 'fan':
        this.buildFanSound(ctx, masterGain);
        break;
      case 'breeze':
        this.buildBreezeSound(ctx, masterGain);
        break;
      default:
        this.buildRainSound(ctx, masterGain);
        break;
    }

    this.isCurrentlyPlaying = true;

    // Keep mobile audio alive when screen locks
    this.initSilentKeepAlive();
    // Update system lock screen player & controls
    this.updateMediaSession(this.getCurrentTrack(), true);

    // Start timer if set
    if (this.timerMinutes && this.timerMinutes > 0) {
      if (this.timerTimeoutId) window.clearTimeout(this.timerTimeoutId);
      this.timerEndsAt = Date.now() + this.timerMinutes * 60 * 1000;
      this.timerTimeoutId = window.setTimeout(() => {
        this.stop();
        this.timerTimeoutId = null;
        this.timerEndsAt = null;
      }, this.timerMinutes * 60 * 1000);
    }

    this.notify();
  }

  public stop() {
    this.pauseSilentKeepAlive();
    this.updateMediaSession(this.getCurrentTrack(), false);

    if (this.masterGain && this.ctx) {
      try {
        // Quick gentle 150ms fade out to avoid clicks
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      } catch {
        // Ignore
      }
    }

    window.setTimeout(() => {
      this.stopCurrentAudioNodes();
      this.isCurrentlyPlaying = false;
      if (this.timerTimeoutId) {
        window.clearTimeout(this.timerTimeoutId);
        this.timerTimeoutId = null;
        this.timerEndsAt = null;
      }
      this.notify();
    }, 160);
  }

  public playNextTrack() {
    const currentIndex = WHITE_NOISE_TRACKS.findIndex((t) => t.id === this.currentTrackId);
    const nextIndex = (currentIndex + 1) % WHITE_NOISE_TRACKS.length;
    this.play(WHITE_NOISE_TRACKS[nextIndex].id);
  }

  public playPreviousTrack() {
    const currentIndex = WHITE_NOISE_TRACKS.findIndex((t) => t.id === this.currentTrackId);
    const prevIndex = (currentIndex - 1 + WHITE_NOISE_TRACKS.length) % WHITE_NOISE_TRACKS.length;
    this.play(WHITE_NOISE_TRACKS[prevIndex].id);
  }

  public togglePlay(trackId?: WhiteNoiseId) {
    if (this.isCurrentlyPlaying) {
      if (trackId && trackId !== this.currentTrackId) {
        // Switch sound immediately
        this.play(trackId);
      } else {
        this.stop();
      }
    } else {
      this.play(trackId || this.currentTrackId);
    }
  }

  // --- MOBILE SECOND PLANE & LOCK SCREEN (Media Session API) ---

  private initSilentKeepAlive() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.silentAudio) {
        // Ultra-compact 1-second silent WAV loop
        const silentWavBase64 =
          'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        const audio = new Audio(silentWavBase64);
        audio.loop = true;
        audio.volume = 0.01;
        this.silentAudio = audio;
      }
      this.silentAudio.play().catch(() => {
        // Handled silently if autoplay restricted before gesture
      });
    } catch {
      // Ignore
    }
  }

  private pauseSilentKeepAlive() {
    if (this.silentAudio) {
      try {
        this.silentAudio.pause();
      } catch {
        // Ignore
      }
    }
  }

  private updateMediaSession(track: WhiteNoiseTrack, isPlaying: boolean) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      if (isPlaying) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `${track.emoji} ${track.name}`,
          artist: 'Baby John · Diário do Bebê',
          album: 'Ruídos Calmantes para Soneca & Sono',
          artwork: [
            { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
            { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
          ],
        });

        navigator.mediaSession.playbackState = 'playing';

        // Connect Android / iOS lock screen & bluetooth controls
        navigator.mediaSession.setActionHandler('play', () => {
          this.play();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          this.stop();
        });
        navigator.mediaSession.setActionHandler('stop', () => {
          this.stop();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          this.playPreviousTrack();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          this.playNextTrack();
        });
      } else {
        navigator.mediaSession.playbackState = 'paused';
      }
    } catch {
      // Some mobile browsers restrict certain MediaSession actions
    }
  }

  // --- AUDIO SYNTHESIS GENERATORS (Web Audio API) ---

  /**
   * Pure White Noise with soothing high-cut filter
   */
  private buildPureWhiteNoise(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.45;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Gentle lowpass to remove ear fatigue
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3200;

    source.connect(filter);
    filter.connect(destination);
    source.start(0);

    this.activeNodes.push(source, filter);
  }

  /**
   * Gentle Rain (Pink noise + low-mid resonance)
   */
  private buildRainSound(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 3 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.055;
      b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    filter.Q.value = 0.7;

    source.connect(filter);
    filter.connect(destination);
    source.start(0);

    this.activeNodes.push(source, filter);
  }

  /**
   * Ocean Waves (Deep Brown noise with slow LFO gain swells)
   */
  private buildOceanWaves(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 4 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.025 * white) / 1.025;
      lastOut = output[i];
      output[i] *= 1.2;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 650;

    // LFO for wave swelling
    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.5, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12; // 8.3-second wave period

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.38, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    source.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(destination);

    source.start(0);
    lfo.start(0);

    this.activeNodes.push(source, filter, waveGain, lfo, lfoGain);
  }

  /**
   * Maternal Womb (Deep filtered noise + gentle rhythmic heartbeat)
   */
  private buildWombSound(ctx: AudioContext, destination: AudioNode) {
    // 1. Amniotic fluid brown noise background
    const bufferSize = 3 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.015 * white) / 1.015;
      lastOut = output[i];
      output[i] *= 1.4;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const wombFilter = ctx.createBiquadFilter();
    wombFilter.type = 'lowpass';
    wombFilter.frequency.value = 240;

    source.connect(wombFilter);
    wombFilter.connect(destination);
    source.start(0);

    // 2. Maternal Heartbeat simulation (pulse every ~0.95s = ~63 BPM)
    const heartGain = ctx.createGain();
    heartGain.gain.setValueAtTime(0, ctx.currentTime);
    heartGain.connect(destination);

    const heartOsc = ctx.createOscillator();
    heartOsc.type = 'sine';
    heartOsc.frequency.setValueAtTime(58, ctx.currentTime);
    heartOsc.connect(heartGain);
    heartOsc.start(0);

    // Rhythmic double-beat pulse loop (lub-dub)
    const pulseInterval = window.setInterval(() => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      const now = this.ctx.currentTime;
      // Lub
      heartGain.gain.cancelScheduledValues(now);
      heartGain.gain.setValueAtTime(0.001, now);
      heartGain.gain.linearRampToValueAtTime(0.45, now + 0.05);
      heartGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      // Dub
      heartGain.gain.setValueAtTime(0.001, now + 0.22);
      heartGain.gain.linearRampToValueAtTime(0.32, now + 0.27);
      heartGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    }, 950);

    this.activeNodes.push(source, wombFilter, heartOsc, heartGain, pulseInterval);
  }

  /**
   * Fan Sound (Pink noise with band-peaking and subtle motor hum)
   */
  private buildFanSound(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.08;
      b1 = 0.98 * b1 + white * 0.12;
      b2 = 0.95 * b2 + white * 0.2;
      output[i] = (b0 + b1 + b2) * 0.18;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Cut harsh highs, boost low-mids for fan blades
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 680;

    // Subtle 60Hz mechanical motor hum
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.value = 60;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.05;

    humOsc.connect(humGain);
    humGain.connect(destination);
    humOsc.start(0);

    source.connect(filter);
    filter.connect(destination);
    source.start(0);

    this.activeNodes.push(source, filter, humOsc, humGain);
  }

  /**
   * Night Breeze (Soft wind with undulating bandpass frequency)
   */
  private buildBreezeSound(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 3 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 1.6;

    // LFO to oscillate the wind frequency
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.18; // ~5.5-second breeze cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    source.connect(filter);
    filter.connect(destination);

    source.start(0);
    lfo.start(0);

    this.activeNodes.push(source, filter, lfo, lfoGain);
  }
}

export const whiteNoiseService = new WhiteNoiseService();
