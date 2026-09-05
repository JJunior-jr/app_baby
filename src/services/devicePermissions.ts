// Diagnóstico e permissões no dispositivo móvel (Android 2026 e versões anteriores)

export interface PermissionStatusItem {
  id: 'notifications' | 'audio' | 'vibration' | 'calendar' | 'storage' | 'battery';
  title: string;
  category: 'runtime' | 'install';
  description: string;
  status: 'granted' | 'denied' | 'prompt' | 'supported' | 'unsupported';
  isCritical: boolean;
  actionLabel?: string;
}

export interface DeviceDiagnostics {
  isOnline: boolean;
  batteryOptimizedInfo: string;
  screenProportion: string;
  userAgent: string;
  isPWA: boolean;
}

export const devicePermissionsService = {
  // Verifica o status das permissões suportadas pela API do navegador / WebView
  async checkPermissions(): Promise<PermissionStatusItem[]> {
    const list: PermissionStatusItem[] = [];

    // 1. Notificações Push
    let notifStatus: 'granted' | 'denied' | 'prompt' | 'unsupported' = 'unsupported';
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') notifStatus = 'granted';
      else if (Notification.permission === 'denied') notifStatus = 'denied';
      else notifStatus = 'prompt';
    }
    list.push({
      id: 'notifications',
      category: 'runtime',
      title: 'Notificações de Alerta',
      description: 'Avisos sonoros na tela para janelas de sono, mamadas e remédios.',
      status: notifStatus,
      isCritical: true,
      actionLabel: notifStatus === 'granted' ? 'Habilitado' : 'Permitir Alertas',
    });

    // 2. Áudio / Sintetizador de Lembretes
    let audioStatus: 'supported' | 'unsupported' = 'unsupported';
    if (
      typeof window !== 'undefined' &&
      ('AudioContext' in window || (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext)
    ) {
      audioStatus = 'supported';
    }
    list.push({
      id: 'audio',
      category: 'runtime',
      title: 'Sons de Alarme & Toque Suave',
      description: 'Tons calmantes para acordar o cuidador sem sobressaltos.',
      status: audioStatus,
      isCritical: false,
      actionLabel: 'Testar Som',
    });

    // 3. Motor de Vibração Tátil
    let vibStatus: 'supported' | 'unsupported' = 'unsupported';
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      vibStatus = 'supported';
    }
    list.push({
      id: 'vibration',
      category: 'runtime',
      title: 'Vibração do Aparelho',
      description: 'Sinal tátil para alertas mesmo quando o celular estiver no silencioso.',
      status: vibStatus,
      isCritical: false,
      actionLabel: 'Testar Vibração',
    });

    // 4. Integração de Calendário (Google/Outlook/Android)
    list.push({
      id: 'calendar',
      category: 'runtime',
      title: 'Calendário do Celular (.ics & Web Intent)',
      description: 'Compatível com Google Calendar, Samsung Calendar e Outlook.',
      status: 'supported',
      isCritical: true,
      actionLabel: 'Configurar',
    });

    // 5. Armazenamento Offline Local
    let storageStatus: 'supported' | 'unsupported' = 'unsupported';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('__test_storage__', '1');
        localStorage.removeItem('__test_storage__');
        storageStatus = 'supported';
      }
    } catch {
      storageStatus = 'unsupported';
    }
    list.push({
      id: 'storage',
      category: 'install',
      title: 'Banco de Dados Offline',
      description: 'Gravação instantânea das mamadas sem depender de sinal de internet.',
      status: storageStatus,
      isCritical: true,
    });

    // 6. Otimização de Bateria em Segundo Plano
    list.push({
      id: 'battery',
      category: 'install',
      title: 'Segundo Plano (Doze Mode & Economia)',
      description: 'Dica para evitar que aparelhos fechem os alarmes da rotina.',
      status: 'supported',
      isCritical: false,
      actionLabel: 'Ver Como Ajustar',
    });

    return list;
  },

  // Dispara a requisição formal de Notificações do navegador / Android
  async requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const res = await Notification.requestPermission();
      return res;
    } catch {
      return 'denied';
    }
  },

  // Executa um bipe calmo via Web Audio API (compatível desde Android 5 até 2026)
  playTestAlertSound(): void {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Tom suave de sino/harpa (Frequências: 523.25Hz -> 659.25Hz -> 783.99Hz)
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (err) {
      console.warn('Falha ao reproduzir áudio de teste:', err);
    }
  },

  // Testa o vibrador do aparelho (pulso tátil suave)
  triggerTestVibration(): boolean {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        // Pulso curto: 150ms vibrando, 80ms pausa, 200ms vibrando
        return navigator.vibrate([150, 80, 200]);
      }
      return false;
    } catch {
      return false;
    }
  },

  // Retorna dados de diagnóstico da tela e dispositivo
  getDeviceDiagnostics(): DeviceDiagnostics {
    let isPWA = false;
    if (typeof window !== 'undefined') {
      isPWA =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    }

    const width = typeof window !== 'undefined' ? window.innerWidth : 360;
    const height = typeof window !== 'undefined' ? window.innerHeight : 640;
    const ratio = (height / width).toFixed(2);

    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      screenProportion: `${width}x${height}px (Ratio ~${ratio}:1)`,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconhecido',
      isPWA,
      batteryOptimizedInfo: 'Recomendado marcar "Sem restrições" para precisão em segundo plano',
    };
  },
};
