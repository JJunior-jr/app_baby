import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  CloudOff,
  Clock,
  Database,
  Smartphone,
  ShieldCheck,
  ArrowUpRight,
  Info,
  Trash2,
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
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Atualiza dados na abertura
    setSyncStatus(syncService.getSyncStatus());
    setQueue(syncService.getQueue());

    // Inscreve-se nas mudanças de sincronização em tempo real
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
      setSyncFeedback('Modo offline ativado! Novas atividades serão gravadas apenas no aparelho.');
    } else {
      setSyncFeedback('Modo online restaurado! Sincronização automática iniciada...');
    }
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleSyncNow = async () => {
    if (!syncStatus.isOnline) {
      setSyncFeedback('Não é possível sincronizar: dispositivo sem conexão com a internet.');
      setTimeout(() => setSyncFeedback(null), 3000);
      return;
    }

    try {
      const result = await syncService.syncPendingQueue();
      if (result.total > 0) {
        setSyncFeedback(`Sucesso! ${result.syncedCount} ite${result.syncedCount === 1 ? 'm foi' : 'ns foram'} gravados no banco de dados.`);
      } else {
        setSyncFeedback('Tudo atualizado! Nenhum registro pendente para sincronizar.');
      }
      if (onSyncComplete) onSyncComplete();
    } catch {
      setSyncFeedback('Ocorreu um erro durante a sincronização com o servidor.');
    } finally {
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  const handleRetryItem = async (id: string) => {
    const success = await syncService.retryItem(id);
    if (success) {
      setSyncFeedback('Item gravado com sucesso no banco de dados!');
      if (onSyncComplete) onSyncComplete();
    } else {
      setSyncFeedback('Falha ao gravar item. Verifique sua conexão.');
    }
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleClearSynced = () => {
    syncService.clearSyncedItems();
    setQueue(syncService.getQueue());
  };

  const pendingItems = queue.filter((i) => i.status === 'pending' || i.status === 'failed' || i.status === 'syncing');
  const syncedItems = queue.filter((i) => i.status === 'synced');

  const formatTimeAgo = (timestamp: number | null) => {
    if (!timestamp) return 'Nunca sincronizado';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Agora há pouco';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    return `Há ${diffHours}h`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <section
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-[460px] landscape:max-w-xl rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-200 transition-colors max-h-[92vh]"
        style={{
          backgroundColor: 'var(--color-dominant)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <header
          className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/5 shrink-0"
          style={{ backgroundColor: 'var(--color-dominant)' }}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-colors ${
                syncStatus.isOnline
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {syncStatus.isOnline ? (
                <Wifi className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <WifiOff className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-tight flex items-center gap-1.5">
                <span>Modo Offline & Sincronização</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                    syncStatus.isOnline
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {syncStatus.isOnline ? 'Online (Nuvem)' : 'Modo Offline'}
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                Garantia de funcionamento sem Wi-Fi ou dados móveis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[68vh] no-scrollbar">
          {/* Toast / Feedback Banner */}
          {syncFeedback && (
            <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-500/40 text-xs text-purple-200 flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
              <Info className="w-4 h-4 text-purple-300 shrink-0" />
              <span className="leading-snug">{syncFeedback}</span>
            </div>
          )}

          {/* Network Connection & Simulation Switch Card */}
          <div
            className="p-4 rounded-2xl border space-y-3"
            style={{
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-bold text-white">Status da Conexão do Aparelho</span>
              </div>
              <span className="flex items-center space-x-1 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStatus.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className={syncStatus.isOnline ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                  {syncStatus.isOnline ? 'Internet Ativa' : 'Sem Conexão'}
                </span>
              </span>
            </div>

            {/* Offline Simulator Switch */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                  <span>Simular Desconexão (Modo Avião)</span>
                  {syncStatus.isSimulatedOffline && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                      Ativo
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Útil para testar o salvamento das mamadas sem Wi-Fi/4G
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleSimulatedOffline}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  syncStatus.isSimulatedOffline ? 'bg-amber-500' : 'bg-gray-700'
                }`}
                aria-pressed={syncStatus.isSimulatedOffline}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    syncStatus.isSimulatedOffline ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Database & Sync Status KPI Card */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              className="p-3.5 rounded-2xl border text-center space-y-1"
              style={{
                backgroundColor: 'var(--color-secondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-center space-x-1.5 text-gray-400 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Itens Pendentes</span>
              </div>
              <div className="text-xl font-extrabold text-white">
                {pendingItems.length}
              </div>
              <p className="text-[9.5px] text-gray-400">
                {pendingItems.length > 0
                  ? 'Salvos no aparelho aguardando banco'
                  : 'Tudo gravado no banco'}
              </p>
            </div>

            <div
              className="p-3.5 rounded-2xl border text-center space-y-1"
              style={{
                backgroundColor: 'var(--color-secondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-center space-x-1.5 text-gray-400 text-[11px]">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Último Sync</span>
              </div>
              <div className="text-sm font-bold text-white pt-1">
                {formatTimeAgo(syncStatus.lastSyncTimestamp)}
              </div>
              <p className="text-[9.5px] text-emerald-300 font-medium">
                Banco Remoto Sincronizado
              </p>
            </div>
          </div>

          {/* Sync Action Button */}
          <div>
            <button
              type="button"
              disabled={syncStatus.isSyncing || (!syncStatus.isOnline && pendingItems.length > 0)}
              onClick={handleSyncNow}
              style={{
                backgroundColor: syncStatus.isOnline ? 'var(--color-accent)' : '#23263b',
                color: syncStatus.isOnline ? 'var(--color-accent-text)' : '#9ca3af',
              }}
              className="w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`}
              />
              <span>
                {syncStatus.isSyncing
                  ? 'Gravando Dados no Banco...'
                  : !syncStatus.isOnline
                  ? 'Conecte-se à internet para gravar no banco'
                  : pendingItems.length > 0
                  ? `Gravar ${pendingItems.length} Itens Pendentes no Banco`
                  : 'Sincronizar com Banco Agora'}
              </span>
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-1.5">
              ⚡ A sincronização também ocorre automaticamente em segundo plano ao voltar a ter sinal.
            </p>
          </div>

          {/* Tab Selector: Pendentes vs Histórico */}
          <div className="flex items-center space-x-2 border-b border-white/5 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`text-xs font-bold pb-2 transition relative cursor-pointer ${
                activeTab === 'pending'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Fila Offline Pendente ({pendingItems.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`text-xs font-bold pb-2 transition relative cursor-pointer ${
                activeTab === 'history'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Histórico Sincronizado ({syncedItems.length})
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {activeTab === 'pending' ? (
              pendingItems.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-white">Nenhum registro pendente!</p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    Todas as mamadas, fraldas, sonos e rotinas já estão 100% salvas e gravadas no
                    banco de dados.
                  </p>
                </div>
              ) : (
                pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border text-xs space-y-1.5"
                    style={{
                      backgroundColor: 'var(--color-secondary)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.status === 'syncing' ? 'Gravando...' : 'Pendente no Celular'}
                        </span>
                        <span className="font-bold text-white">{item.title}</span>
                      </div>

                      {item.status === 'failed' && (
                        <button
                          type="button"
                          onClick={() => handleRetryItem(item.id)}
                          className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] font-bold hover:bg-rose-500/30 transition cursor-pointer"
                        >
                          Tentar de novo
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-300">{item.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                      <span>Registrado offline: {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-amber-400 flex items-center gap-1">
                        <CloudOff className="w-3 h-3" />
                        Aguardando rede
                      </span>
                    </div>
                  </div>
                ))
              )
            ) : (
              syncedItems.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  Nenhum histórico recente disponível.
                </div>
              ) : (
                <>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleClearSynced}
                      className="text-[10.5px] text-gray-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Limpar registros sincronizados</span>
                    </button>
                  </div>
                  {syncedItems.slice(0, 15).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl border text-xs space-y-1 opacity-80 hover:opacity-100 transition"
                      style={{
                        backgroundColor: 'var(--color-secondary)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold text-white">{item.title}</span>
                        </div>
                        <span className="text-[9.5px] text-emerald-300 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">
                          Gravado no Banco
                        </span>
                      </div>
                      <p className="text-[10.5px] text-gray-400">{item.description}</p>
                    </div>
                  ))}
                </>
              )
            )}
          </div>

          {/* Educational Explainer Banner */}
          <div
            className="p-3.5 rounded-2xl border text-xs space-y-2 bg-gradient-to-r from-blue-950/30 via-purple-950/20 to-blue-950/30"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center space-x-1.5 text-blue-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Como funciona a segurança offline?</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              1. <strong>Registro Instantâneo</strong>: Mesmo sem Wi-Fi ou sinal de operadora, você pode registrar todas as mamadas, remédios, trocas de fralda e sonos. O aplicativo nunca trava ou bloqueia a gravação.
            </p>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              2. <strong>Persistência Local Segura</strong>: Tudo é armazenado no armazenamento seguro do navegador/celular imediatamente.
            </p>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              3. <strong>Sincronização Automática com o Banco</strong>: Assim que o dispositivo restabelecer conexão (seja no Wi-Fi de casa ou no 4G/5G), o Baby John grava tudo no banco na ordem cronológica correta.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="p-4 pt-3 pb-5 border-t border-white/5 flex items-center justify-between shrink-0"
          style={{ backgroundColor: 'var(--color-dominant)' }}
        >
          <div className="text-[10px] text-gray-400">
            {syncStatus.isOnline ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Cloud className="w-3.5 h-3.5" />
                Conectado ao Banco Remoto
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <CloudOff className="w-3.5 h-3.5" />
                Armazenando Localmente
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
            }}
            className="px-6 py-3 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center transition cursor-pointer active:scale-95"
          >
            <span>Fechar</span>
          </button>
        </footer>
      </section>
    </div>
  );
};
