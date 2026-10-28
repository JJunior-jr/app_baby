import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Cloud,
  CloudOff,
  Clock,
  Database,
  Smartphone,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { syncService } from '../../services/syncService';
import { OfflineSyncQueueItem, SyncStatusState } from '../../types';

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>(syncService.getSyncStatus());
  const [queue, setQueue] = useState<OfflineSyncQueueItem[]>(syncService.getQueue());
  const [activeTab, setActiveTab] = useState<'status' | 'history'>('status');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [isPlusUnlocked, setIsPlusUnlocked] = useState<boolean>(true); // Plus feature enabled by default or unlocked

  useEffect(() => {
    if (!isOpen) return;

    setSyncStatus(syncService.getSyncStatus());
    setQueue(syncService.getQueue());

    const unsubscribe = syncService.subscribe((newStatus) => {
      setSyncStatus(newStatus);
      setQueue(syncService.getQueue());
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSimulatedOffline = () => {
    const isNowOffline = syncService.toggleSimulatedOffline();
    if (isNowOffline) {
      setSyncFeedback('Modo offline ativado! Novas atividades são gravadas localmente e sincronizarão automaticamente ao reconectar.');
    } else {
      setSyncFeedback('Modo online ativado! Sincronização automática em segundo plano iniciada.');
    }
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const pendingItems = queue.filter((i) => i.status === 'pending' || i.status === 'failed' || i.status === 'syncing');
  const syncedItems = queue.filter((i) => i.status === 'synced');

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <section
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-[460px] landscape:max-w-xl rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-200 transition-colors max-h-[92vh]"
        style={{
          backgroundColor: '#0f172a',
          borderColor: '#334155',
        }}
      >
        {/* Header */}
        <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#334155] shrink-0 bg-[#0f172a]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                  Offline Plus · Auto-Sync
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-extrabold text-[9px] uppercase tracking-wider">
                  Plus Ativo
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Sincronização automática e inteligente em segundo plano
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#1e293b] hover:bg-[#334155] flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[70vh] no-scrollbar">
          {/* Feedback Banner */}
          {syncFeedback && (
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-xs text-blue-200 flex items-center space-x-2 animate-in fade-in">
              <Info className="w-4 h-4 text-blue-300 shrink-0" />
              <span className="leading-snug">{syncFeedback}</span>
            </div>
          )}

          {/* Premium Feature Card */}
          <div className="p-4 rounded-xl bg-[#1e293b] border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Como funciona o Offline Plus</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Automático
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              O <strong className="text-white">Offline Plus</strong> funciona totalmente em segundo plano. Quando você está sem internet ou Wi-Fi, seus registros (mamadas, fraldas, sono) são salvos de forma segura e criptografada no seu dispositivo. Assim que a rede é restabelecida, o app <strong className="text-purple-300">sincroniza sozinho com a nuvem</strong>, sem precisar de cliques manuais.
            </p>
          </div>

          {/* Real-time Connection Status Card */}
          <div className="p-4 rounded-xl bg-[#1e293b] border border-[#334155] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Status da Rede do Aparelho</span>
              </div>
              <span className="flex items-center space-x-1.5 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStatus.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className={syncStatus.isOnline ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                  {syncStatus.isOnline ? 'Conectado à Internet' : 'Sem Conexão (Offline)'}
                </span>
              </span>
            </div>

            {/* Test Simulation Toggle */}
            <div className="pt-2 border-t border-[#334155] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-200">Simular Modo Avião / Sem Wi-Fi</p>
                <p className="text-[10px] text-gray-400">Teste o funcionamento offline salvando registros sem rede</p>
              </div>
              <button
                type="button"
                onClick={handleToggleSimulatedOffline}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  syncStatus.isSimulatedOffline
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-[#0f172a] text-gray-300 border border-[#334155] hover:border-gray-400'
                }`}
              >
                {syncStatus.isSimulatedOffline ? 'Simulação Ativa (Offline)' : 'Modo Normal'}
              </button>
            </div>
          </div>

          {/* Queue Status */}
          <div className="p-4 rounded-xl bg-[#1e293b] border border-[#334155] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Fila de Sincronização Automática</span>
              <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/30">
                {pendingItems.length} pendentes · {syncedItems.length} sincronizados
              </span>
            </div>

            {pendingItems.length === 0 ? (
              <div className="py-4 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">Tudo Sincronizado!</p>
                <p className="text-[11px] text-gray-400">Todos os registros estão salvos na nuvem em tempo real.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                {pendingItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-xs">
                    <div>
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-gray-400">{item.description}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      Aguardando rede
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-5 py-3.5 bg-[#1e293b]/60 border-t border-[#334155] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dados protegidos e criptografados</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-xs py-2 px-4"
          >
            Entendido
          </button>
        </footer>
      </section>
    </div>
  );
};
