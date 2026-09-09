import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  BellRing,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Vibrate,
  Trash2,
  Plus,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  notificationService,
  ScheduledReminder,
  ReminderType,
} from '../../services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customMinutes, setCustomMinutes] = useState(45);
  const [customType, setCustomType] = useState<ReminderType>('soneca');
  const [testSent, setTestSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick');

  useEffect(() => {
    notificationService.init();
    const update = () => {
      setPermission(notificationService.getPermission());
      setReminders(notificationService.getReminders());
    };

    update();
    const unsub = notificationService.subscribe(update);
    const interval = window.setInterval(update, 1000); // Live countdown refresh

    return () => {
      unsub();
      window.clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermission(res);
  };

  const handleTestNotification = async () => {
    setTestSent(true);
    await notificationService.sendNotification(
      '👶 Teste de Alerta do Baby John',
      'As notificações locais com som e vibração estão funcionando com sucesso!',
      'custom'
    );
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleSchedulePreset = (
    type: ReminderType,
    title: string,
    message: string,
    minutes: number
  ) => {
    notificationService.scheduleReminder(type, title, message, minutes);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    notificationService.scheduleReminder(
      customType,
      customTitle.trim(),
      `Lembrete agendado: ${customTitle.trim()}`,
      customMinutes
    );
    setCustomTitle('');
    setActiveTab('quick');
  };

  const formatCountdown = (targetTimestamp: number) => {
    const diff = targetTimestamp - Date.now();
    if (diff <= 0) return 'Disparando agora...';
    const totalSecs = Math.floor(diff / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hours > 0) {
      return `em ${hours}h ${mins}min`;
    }
    if (mins > 0) {
      return `em ${mins}min ${secs}s`;
    }
    return `em ${secs}s`;
  };

  const getTypeIcon = (type: ReminderType) => {
    switch (type) {
      case 'soneca':
        return '💤';
      case 'mamada':
        return '🍼';
      case 'fralda':
        return '🧷';
      case 'remedio':
        return '💊';
      default:
        return '⏰';
    }
  };

  const pendingReminders = reminders.filter((r) => r.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#0c0d16] border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{ boxShadow: '0 0 50px -10px rgba(113, 88, 226, 0.3)' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-800/80 flex items-center justify-between bg-[#121324]/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <BellRing className="w-5 h-5 text-purple-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Notificações & Alarmes
              </h2>
              <p className="text-[11px] text-gray-400">
                Alertas em segundo plano com som suave e vibração
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar text-xs">
          {/* Permission Status Banner */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              permission === 'granted'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : permission === 'denied'
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2.5">
                {permission === 'granted' ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {permission === 'granted'
                      ? 'Notificações Habilitadas ✅'
                      : permission === 'denied'
                      ? 'Notificações Bloqueadas no Navegador'
                      : 'Permissão de Notificação Pendente'}
                  </h4>
                  <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
                    {permission === 'granted'
                      ? 'O celular tocará som suave e vibrará mesmo com o app em segundo plano.'
                      : permission === 'denied'
                      ? 'Desbloqueie nas configurações do site (cadeado da URL) para receber alertas.'
                      : 'Autorize o Baby John a enviar avisos de sono, mamada e remédio.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center space-x-2 pt-2 border-t border-white/10">
              {permission !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Permitir no Aparelho
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-[11px] flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-purple-300" />
                  <span>{testSent ? 'Enviando Alerta...' : 'Testar Notificação Agora'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Presets Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Atalhos Rápidos de Alarme</span>
              </span>
              <div className="flex items-center space-x-1 bg-white/5 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('quick')}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                    activeTab === 'quick' ? 'bg-purple-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Predefinidos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                    activeTab === 'custom' ? 'bg-purple-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Personalizado
                </button>
              </div>
            </div>

            {activeTab === 'quick' ? (
              <div className="grid grid-cols-2 gap-2.5">
                {/* Soneca 45min */}
                <button
                  type="button"
                  onClick={() =>
                    handleSchedulePreset(
                      'soneca',
                      '💤 Fim da Soneca do John',
                      'Tempo de sono atingiu 45 minutos. Verifique o bebê suavemente.',
                      45
                    )
                  }
                  className="p-3 rounded-2xl bg-[#15172b] border border-purple-500/20 hover:border-purple-400/50 flex flex-col text-left transition active:scale-95 cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base">💤</span>
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">
                      +45 min
                    </span>
                  </div>
                  <span className="font-bold text-white text-xs group-hover:text-purple-300 transition">
                    Fim de Soneca
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Janela padrão 45m</span>
                </button>

                {/* Soneca 1h 30m */}
                <button
                  type="button"
                  onClick={() =>
                    handleSchedulePreset(
                      'soneca',
                      '💤 Ciclo Completo de Sono',
                      'Tempo de sono atingiu 1 hora e meia. Ciclo profundo concluído.',
                      90
                    )
                  }
                  className="p-3 rounded-2xl bg-[#15172b] border border-purple-500/20 hover:border-purple-400/50 flex flex-col text-left transition active:scale-95 cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base">🌙</span>
                    <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                      +1h 30m
                    </span>
                  </div>
                  <span className="font-bold text-white text-xs group-hover:text-indigo-300 transition">
                    Soneca Longa
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Ciclo duplo 90m</span>
                </button>

                {/* Mamada 2h 30m */}
                <button
                  type="button"
                  onClick={() =>
                    handleSchedulePreset(
                      'mamada',
                      '🍼 Horário da Próxima Mamada',
                      'Já se passaram 2 horas e meia desde a última amamentação.',
                      150
                    )
                  }
                  className="p-3 rounded-2xl bg-[#15172b] border border-sky-500/20 hover:border-sky-400/50 flex flex-col text-left transition active:scale-95 cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base">🍼</span>
                    <span className="text-[10px] font-bold text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded">
                      +2h 30m
                    </span>
                  </div>
                  <span className="font-bold text-white text-xs group-hover:text-sky-300 transition">
                    Próxima Mamada
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Intervalo de leite</span>
                </button>

                {/* Fralda 2h */}
                <button
                  type="button"
                  onClick={() =>
                    handleSchedulePreset(
                      'fralda',
                      '🧷 Verificar Fralda do John',
                      'Momento de checar conforto e umidade da fraldinha.',
                      120
                    )
                  }
                  className="p-3 rounded-2xl bg-[#15172b] border border-amber-500/20 hover:border-amber-400/50 flex flex-col text-left transition active:scale-95 cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base">🧷</span>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                      +2 horas
                    </span>
                  </div>
                  <span className="font-bold text-white text-xs group-hover:text-amber-300 transition">
                    Troca de Fralda
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Checagem de higiene</span>
                </button>
              </div>
            ) : (
              /* Custom Form */
              <form onSubmit={handleCreateCustom} className="p-3.5 rounded-2xl bg-[#15172b] border border-purple-500/30 space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Título do Lembrete:
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ex: Banho relaxante, Vitamina D..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0d16] border border-gray-700 text-white text-xs focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                      Tempo: {customMinutes} min
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={240}
                      step={5}
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center space-x-1 pt-4">
                    {[15, 30, 60].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCustomMinutes(m)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                          customMinutes === m
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!customTitle.trim()}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-98 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agendar Alarme Personalizado</span>
                </button>
              </form>
            )}
          </div>

          {/* Active Scheduled Reminders */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Alarmes Ativos ({pendingReminders.length})</span>
              </span>
              {reminders.length > 0 && (
                <button
                  type="button"
                  onClick={() => notificationService.clearAllReminders()}
                  className="text-[10px] text-gray-400 hover:text-rose-400 transition"
                >
                  Limpar todos
                </button>
              )}
            </div>

            {pendingReminders.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#121324]/60 border border-gray-800 text-center text-gray-400">
                <p className="text-xs">Nenhum alarme ativo no momento.</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Toque em um dos botões acima para agendar o fim de sono ou mamada!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="p-3 rounded-2xl bg-[#15172b] border border-purple-500/20 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-lg">
                        {getTypeIcon(reminder.type)}
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs leading-tight">
                          {reminder.title}
                        </h5>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[11px] text-purple-300 font-bold">
                            {formatCountdown(reminder.targetTimestamp)}
                          </span>
                          <span className="text-[10px] text-gray-500">· Som & Vibração</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => notificationService.cancelReminder(reminder.id)}
                      title="Cancelar este alarme"
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800/80 bg-[#121324]/50 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Service Worker Ativo</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition active:scale-95 cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
