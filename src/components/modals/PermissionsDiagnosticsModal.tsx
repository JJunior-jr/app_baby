import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Bell,
  Volume2,
  Smartphone,
  Calendar,
  Database,
  BatteryCharging,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Play,
  RotateCw,
} from 'lucide-react';
import {
  devicePermissionsService,
  PermissionStatusItem,
  DeviceDiagnostics,
} from '../../services/devicePermissions';

interface PermissionsDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalendarSync?: () => void;
}

export const PermissionsDiagnosticsModal: React.FC<PermissionsDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onOpenCalendarSync,
}) => {
  const [items, setItems] = useState<PermissionStatusItem[]>([]);
  const [diagnostics, setDiagnostics] = useState<DeviceDiagnostics | null>(null);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [showBatteryHelp, setShowBatteryHelp] = useState(false);

  const loadData = async () => {
    const list = await devicePermissionsService.checkPermissions();
    setItems(list);
    setDiagnostics(devicePermissionsService.getDeviceDiagnostics());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setTestFeedback(msg);
    setTimeout(() => setTestFeedback(null), 3000);
  };

  const handleRequestNotifications = async () => {
    const res = await devicePermissionsService.requestNotificationPermission();
    if (res === 'granted') {
      showToast('Notificações autorizadas com sucesso!');
    } else if (res === 'denied') {
      showToast('Notificações bloqueadas nas configurações do navegador/celular.');
    } else {
      showToast('Dispositivo não suporta notificações web diretas.');
    }
    loadData();
  };

  const handleTestSound = () => {
    devicePermissionsService.playTestAlertSound();
    showToast('Toque suave reproduzido!');
  };

  const handleTestVibration = () => {
    const ok = devicePermissionsService.triggerTestVibration();
    if (ok) {
      showToast('Vibração testada!');
    } else {
      showToast('Vibração não suportada ou desativada no sistema.');
    }
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
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
              }}
            >
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-tight flex items-center gap-1.5">
                <span>Permissões & Diagnóstico</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">
                  2026 Ready
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                Compatibilidade e saúde das notificações do aparelho
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

        {/* Toast feedback */}
        {testFeedback && (
          <div className="mx-5 mt-2.5 p-2 rounded-xl bg-purple-950/90 border border-purple-500/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 shrink-0" />
            <span>{testFeedback}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[64vh] no-scrollbar">
          {/* Quick overview alert */}
          <div
            className="p-3.5 rounded-2xl border text-xs space-y-1"
            style={{
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between text-white font-bold">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Dispositivo Móvel Diagnosticado</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/40 text-emerald-300 font-mono">
                {diagnostics?.isOnline ? 'Online 🟢' : 'Offline 🟡'}
              </span>
            </div>
            <p className="text-[10.5px] text-gray-300 leading-relaxed">
              O Baby John foi projetado para funcionar sem falhas tanto em celulares novos de 2026
              (telas flexíveis e proporções modernas) quanto em modelos clássicos.
            </p>
          </div>

          {/* SECTION 1: Permissões de Uso do Usuário */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                1. Permissões Habilitadas pelo Cuidador
              </h3>
              <span className="text-[10px] text-gray-400">Em tempo de uso</span>
            </div>

            {items
              .filter((i) => i.category === 'runtime')
              .map((item) => {
                const isGranted = item.status === 'granted' || item.status === 'supported';
                const isDenied = item.status === 'denied';

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs"
                    style={{
                      backgroundColor: 'var(--color-secondary)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5">
                        {item.id === 'notifications' && (
                          <Bell className="w-4 h-4 text-amber-300" />
                        )}
                        {item.id === 'audio' && <Volume2 className="w-4 h-4 text-cyan-300" />}
                        {item.id === 'vibration' && (
                          <Smartphone className="w-4 h-4 text-purple-300" />
                        )}
                        {item.id === 'calendar' && (
                          <Calendar className="w-4 h-4 text-emerald-300" />
                        )}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white truncate">{item.title}</span>
                          {isGranted ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                              Ativo
                            </span>
                          ) : isDenied ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 font-bold">
                              Bloqueado
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                              Pendente
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate">{item.description}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      {item.id === 'notifications' && item.status !== 'granted' && (
                        <button
                          type="button"
                          onClick={handleRequestNotifications}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          Habilitar
                        </button>
                      )}

                      {item.id === 'audio' && (
                        <button
                          type="button"
                          onClick={handleTestSound}
                          className="px-2.5 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/30 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Ouvir</span>
                        </button>
                      )}

                      {item.id === 'vibration' && (
                        <button
                          type="button"
                          onClick={handleTestVibration}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Vibrar</span>
                        </button>
                      )}

                      {item.id === 'calendar' && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onOpenCalendarSync) onOpenCalendarSync();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/30 font-bold text-[11px] transition cursor-pointer"
                        >
                          Acessar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* SECTION 2: Configurações Automáticas do App / Instalação */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                2. Recursos Ativos na Instalação
              </h3>
              <span className="text-[10px] text-gray-400">Automático</span>
            </div>

            {/* Offline Storage */}
            <div
              className="p-3 rounded-2xl border flex items-center justify-between text-xs"
              style={{
                backgroundColor: 'var(--color-secondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5">
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Armazenamento Offline Imediato</h4>
                  <p className="text-[10px] text-gray-400">
                    Dados salvos mesmo sem sinal no quarto
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                100% Pronto
              </span>
            </div>

            {/* Battery Saver Guidance */}
            <div
              className="p-3 rounded-2xl border text-xs space-y-2"
              style={{
                backgroundColor: 'var(--color-secondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5">
                    <BatteryCharging className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Ajuste de Bateria em Segundo Plano</h4>
                    <p className="text-[10px] text-gray-400">
                      Evita que Xiaomi, Samsung ou Motorola durmam os alarmes
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBatteryHelp(!showBatteryHelp)}
                  className="text-purple-300 hover:text-purple-200 text-[11px] font-bold underline cursor-pointer"
                >
                  {showBatteryHelp ? 'Ocultar' : 'Como Ajustar'}
                </button>
              </div>

              {showBatteryHelp && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10.5px] text-gray-300 space-y-1.5 animate-in fade-in">
                  <p className="font-semibold text-white">
                    Para garantir que o alarme toque mesmo com a tela bloqueada por horas:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-300">
                    <li>Vá em <strong>Configurações do Android</strong> &gt; <strong>Aplicativos</strong></li>
                    <li>Localize o <strong>Baby John</strong></li>
                    <li>Toque em <strong>Bateria</strong> e selecione <strong>"Sem Restrições"</strong></li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Device Telemetry info */}
          {diagnostics && (
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-[9.5px] text-gray-400 flex items-center justify-between">
              <span>Dimensões de Tela: {diagnostics.screenProportion}</span>
              <span>Modo PWA: {diagnostics.isPWA ? 'Sim (Tela Cheia)' : 'Navegador'}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer
          className="p-4 pt-3 pb-5 border-t border-white/5 flex items-center gap-2.5 shrink-0"
          style={{ backgroundColor: 'var(--color-dominant)' }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
            }}
            className="w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Entendido & Concluído</span>
          </button>
        </footer>
      </section>
    </div>
  );
};
