import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Baby,
  Utensils,
  Shirt,
  Moon,
  Target,
  Smile,
  Bell,
  BellRing,
  Clock,
  Check,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { CustomActivityDefinition } from '../../types';
import {
  remindersService,
  ActivityReminderConfig,
  ReminderIntervalPreset,
  formatMinutesHuman,
  getIntervalMinutes,
} from '../../services/reminders';

interface ManageActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: CustomActivityDefinition[];
  onDeleteActivity: (id: string) => void;
  onOpenNewActivity: () => void;
  onRemindersUpdated?: () => void;
}

export const ManageActivitiesModal: React.FC<ManageActivitiesModalProps> = ({
  isOpen,
  onClose,
  activities,
  onDeleteActivity,
  onOpenNewActivity,
  onRemindersUpdated,
}) => {
  const [reminders, setReminders] = useState<Record<string, ActivityReminderConfig>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Sync reminders from storage on open
  useEffect(() => {
    if (isOpen) {
      const stored = remindersService.getAll();
      setReminders(stored);
      // If none expanded yet, auto-expand the first enabled one or default to Amamentação
      const activeKeys = Object.keys(stored).filter((k) => stored[k]?.enabled);
      if (activeKeys.length > 0) {
        setExpandedId(activeKeys[0]);
      } else {
        setExpandedId('def-1');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const renderIcon = (name: string, icon: string) => {
    if (name.includes('Amamentação') || icon === 'baby') return <Baby className="w-5 h-5 text-indigo-300" />;
    if (name.includes('Comeu') || icon === 'utensils') return <Utensils className="w-5 h-5 text-purple-300" />;
    if (name.includes('Fralda') || icon === 'shirt') return <Shirt className="w-5 h-5 text-teal-300" />;
    if (name.includes('Sono') || icon === 'moon') return <Moon className="w-5 h-5 text-indigo-300" />;
    if (name.includes('Tommy') || icon === 'target') return <Target className="w-5 h-5 text-purple-300" />;
    return <Smile className="w-5 h-5 text-purple-300" />;
  };

  const getOrCreateReminder = (act: CustomActivityDefinition): ActivityReminderConfig => {
    if (reminders[act.id]) {
      return reminders[act.id];
    }
    // Default fallback
    return {
      activityId: act.id,
      activityName: act.name,
      enabled: false,
      intervalType: '3h',
      customMinutes: 180,
      recommendedHours: 3,
      objectiveExplanation: 'Lembrete automático para manter a rotina estruturada e previsível para o bebê.',
    };
  };

  const handleToggle = (act: CustomActivityDefinition) => {
    const current = getOrCreateReminder(act);
    const nextEnabled = !current.enabled;
    const updated: ActivityReminderConfig = {
      ...current,
      enabled: nextEnabled,
    };

    const newMap = { ...reminders, [act.id]: updated };
    setReminders(newMap);
    remindersService.save(updated);
    if (onRemindersUpdated) onRemindersUpdated();

    if (nextEnabled) {
      setExpandedId(act.id);
      const minutes = getIntervalMinutes(updated.intervalType, updated.customMinutes);
      showToast(`🔔 Lembrete de ${act.name} ativado a cada ${formatMinutesHuman(minutes)}!`);
    } else {
      showToast(`🔕 Lembrete de ${act.name} desativado`);
    }
  };

  const handleIntervalChange = (act: CustomActivityDefinition, intervalType: ReminderIntervalPreset) => {
    const current = getOrCreateReminder(act);
    const updated: ActivityReminderConfig = {
      ...current,
      intervalType,
    };

    const newMap = { ...reminders, [act.id]: updated };
    setReminders(newMap);
    remindersService.save(updated);
    if (onRemindersUpdated) onRemindersUpdated();

    const minutes = getIntervalMinutes(intervalType, updated.customMinutes);
    showToast(`⏱️ Intervalo de ${act.name} definido para ${formatMinutesHuman(minutes)}`);
  };

  const handleCustomMinutesChange = (act: CustomActivityDefinition, minutes: number) => {
    const safeMinutes = Math.max(5, Math.min(1440, minutes)); // Between 5 min and 24 hours
    const current = getOrCreateReminder(act);
    const updated: ActivityReminderConfig = {
      ...current,
      intervalType: 'custom',
      customMinutes: safeMinutes,
    };

    const newMap = { ...reminders, [act.id]: updated };
    setReminders(newMap);
    remindersService.save(updated);
    if (onRemindersUpdated) onRemindersUpdated();
  };

  const handleTestAlert = (act: CustomActivityDefinition) => {
    const config = getOrCreateReminder(act);
    const minutes = getIntervalMinutes(config.intervalType, config.customMinutes);
    showToast(`🔔 [Alerta Teste]: Hora da ${act.name}! Intervalo configurado: a cada ${formatMinutesHuman(minutes)}.`);
    
    // Audio feedback if supported
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio context might be restricted before interaction, fail silently
    }
  };

  const intervalPresets: { label: string; value: ReminderIntervalPreset; hours: number }[] = [
    { label: '2h', value: '2h', hours: 2 },
    { label: '3h', value: '3h', hours: 3 },
    { label: '4h', value: '4h', hours: 4 },
    { label: '6h', value: '6h', hours: 6 },
    { label: '8h', value: '8h', hours: 8 },
  ];

  const activeRemindersCount = (Object.values(reminders) as ActivityReminderConfig[]).filter(
    (r) => r.enabled
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[440px] landscape:max-w-xl h-auto max-h-[90vh] bg-[#0c0d16] rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl border border-gray-800 animate-in zoom-in-95 duration-200">
        
        {/* Navigation Header */}
        <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#0c0d16]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Voltar"
            className="p-1.5 -ml-1 text-gray-300 hover:text-white transition active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Atividades & Lembretes</span>
              {activeRemindersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-purple-600/40 border border-purple-500/50 text-purple-200 text-[10px] font-extrabold">
                  {activeRemindersCount} ativo{activeRemindersCount > 1 ? 's' : ''}
                </span>
              )}
            </h1>
            <span className="text-[10px] text-gray-400">Notificações automáticas em intervalos regulares</span>
          </div>

          <div className="w-6 h-6" />
        </header>

        {/* In-Modal Toast Feedback */}
        {feedbackToast && (
          <div className="absolute top-16 left-4 right-4 z-30 p-2.5 rounded-xl bg-gradient-to-r from-[#5a43c7] to-[#7158e2] text-white text-xs font-semibold shadow-xl border border-purple-300/40 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="flex-1 pr-2">{feedbackToast}</span>
            <Check className="w-4 h-4 text-emerald-300 shrink-0" />
          </div>
        )}

        {/* Informative Guidance Banner: O que é e qual o objetivo */}
        <div className="px-5 pt-3 shrink-0">
          <div className="bg-[#151728] border border-purple-500/20 rounded-2xl p-3 flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-[11px] text-gray-300 leading-relaxed">
              <span className="font-bold text-white">Lembretes automáticos: </span>
              Ative o toggle nas atividades para receber alertas nos intervalos recomendados. Isso ajuda a acompanhar a rotina e não perder horários cruciais.
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3.5 no-scrollbar">
          {activities.map((act) => {
            const reminderConfig = getOrCreateReminder(act);
            const isEnabled = reminderConfig.enabled;
            const isExpanded = expandedId === act.id;
            const currentMinutes = getIntervalMinutes(reminderConfig.intervalType, reminderConfig.customMinutes);

            return (
              <div
                key={act.id}
                className={`bg-[#151728] rounded-2xl transition-all duration-200 shadow-sm border overflow-hidden ${
                  isEnabled
                    ? 'border-purple-500/40 shadow-purple-950/20'
                    : 'border-[#23263e]'
                }`}
              >
                {/* Main Activity Header Row */}
                <div className="p-3.5 flex items-center justify-between gap-2.5">
                  {/* Left info with min-w-0 so text truncation doesn't push the toggle out */}
                  <div
                    className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0 select-none"
                    onClick={() => setExpandedId(isExpanded ? null : act.id)}
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                      isEnabled ? 'bg-[#2b224c] border border-purple-500/30' : 'bg-[#1f233a]'
                    }`}>
                      {renderIcon(act.name, act.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-sm font-bold text-white tracking-tight truncate" title={act.name}>
                          {act.name}
                        </h3>
                        {act.isDefault ? (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#5271ff]/20 text-[#6f88ff] border border-[#5271ff]/30 shrink-0">
                            PADRÃO
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 shrink-0">
                            PERSONALIZADA
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs min-w-0">
                        {isEnabled ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 truncate">
                            <BellRing className="w-3 h-3 shrink-0" />
                            <span className="truncate">A cada {formatMinutesHuman(currentMinutes)}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal truncate">
                            Notificações desligadas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Delete (if custom) + Toggle Switch (always shrink-0 and securely within rectangle) */}
                  <div className="flex items-center space-x-2 shrink-0 ml-1">
                    {!act.isDefault && (
                      <button
                        type="button"
                        onClick={() => onDeleteActivity(act.id)}
                        title="Excluir atividade"
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
                      </button>
                    )}

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      onClick={() => handleToggle(act)}
                      title={isEnabled ? 'Desativar lembretes' : 'Ativar lembretes'}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-[#7158e2]' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Section: Visible when toggle is ON or expanded */}
                {isEnabled && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5 space-y-3">
                    
                    {/* Header of Interval Section */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-bold text-purple-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>Intervalo da Notificação:</span>
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        Repetir a cada
                      </span>
                    </div>

                    {/* Preset Interval Buttons: 2h, 3h, 4h, 6h, 8h, Personalizado */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {intervalPresets.map((preset) => {
                        const isSelected = reminderConfig.intervalType === preset.value;
                        const isRecommended = reminderConfig.recommendedHours === preset.hours;

                        return (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => handleIntervalChange(act, preset.value)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center border relative ${
                              isSelected
                                ? 'bg-[#7158e2] text-white border-purple-400 shadow-md shadow-purple-950/40'
                                : 'bg-[#1b1e33] text-gray-300 border-[#2b304c] hover:border-purple-400/50 hover:bg-[#20243d]'
                            }`}
                          >
                            <span className="text-xs">{preset.label}</span>
                            {isRecommended && (
                              <span className={`text-[8.5px] font-extrabold tracking-tight ${
                                isSelected ? 'text-amber-200' : 'text-amber-400'
                              }`}>
                                ★ Recomendado
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {/* Custom Button */}
                      <button
                        type="button"
                        onClick={() => handleIntervalChange(act, 'custom')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center border ${
                          reminderConfig.intervalType === 'custom'
                            ? 'bg-[#7158e2] text-white border-purple-400 shadow-md shadow-purple-950/40'
                            : 'bg-[#1b1e33] text-gray-300 border-[#2b304c] hover:border-purple-400/50 hover:bg-[#20243d]'
                        }`}
                      >
                        <span>Personalizado</span>
                        <span className="text-[8.5px] opacity-80">Definir min</span>
                      </button>
                    </div>

                    {/* Custom Minutes Input Section */}
                    {reminderConfig.intervalType === 'custom' && (
                      <div className="bg-[#121422] border border-purple-500/30 rounded-xl p-3 space-y-2.5 animate-in fade-in-50 duration-150">
                        <div className="flex items-center justify-between text-xs">
                          <label htmlFor={`custom-min-${act.id}`} className="font-bold text-purple-200">
                            Tempo em minutos:
                          </label>
                          <span className="text-[10px] text-gray-400">
                            Ex: 60 min = 1h, 120 min = 2h
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            id={`custom-min-${act.id}`}
                            type="number"
                            min="5"
                            max="1440"
                            step="5"
                            value={reminderConfig.customMinutes || 60}
                            onChange={(e) => handleCustomMinutesChange(act, parseInt(e.target.value, 10) || 0)}
                            className="w-24 px-3 py-2 rounded-lg bg-[#1a1d30] border border-purple-500/40 text-white text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          <span className="text-xs text-gray-300 font-semibold">minutos</span>
                          
                          {/* Live hours conversion chip */}
                          <div className="flex-1 text-right">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-purple-900/50 border border-purple-500/40 text-purple-200 text-xs font-bold">
                              = {formatMinutesHuman(reminderConfig.customMinutes || 60)}
                            </span>
                          </div>
                        </div>

                        {/* Quick increment buttons */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-gray-400">Ajuste rápido:</span>
                          {[
                            { label: '-15m', diff: -15 },
                            { label: '+15m', diff: 15 },
                            { label: '+30m', diff: 30 },
                            { label: '+60m (1h)', diff: 60 },
                          ].map((step) => (
                            <button
                              key={step.label}
                              type="button"
                              onClick={() => handleCustomMinutesChange(act, (reminderConfig.customMinutes || 60) + step.diff)}
                              className="px-2 py-1 rounded-md bg-[#1f233a] border border-[#2d3252] text-[10px] font-bold text-gray-300 hover:text-white hover:bg-[#282d4a] transition"
                            >
                              {step.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pediatric Objective / Purpose Callout */}
                    <div className="bg-[#121422]/70 border border-white/5 rounded-xl p-2.5 flex items-start space-x-2">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-[10.5px] text-gray-300 leading-snug">
                        <span className="font-bold text-amber-300">Objetivo da notificação: </span>
                        {reminderConfig.objectiveExplanation ||
                          'Garante acompanhamento regular dos horários e mantém a rotina previsível para a criança.'}
                      </div>
                    </div>

                    {/* Test Notification Button */}
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleTestAlert(act)}
                        className="px-3 py-1.5 rounded-xl bg-[#20243d] hover:bg-[#2b3052] border border-[#353b66] text-purple-300 text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Testar notificação de {act.name}</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Actions: + Nova Atividade & Fechar */}
        <footer className="p-4 pt-3 pb-5 bg-[#0c0d16] border-t border-white/5 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenNewActivity}
            className="flex-1 py-3.5 rounded-2xl bg-[#1b1e33] hover:bg-[#252945] active:scale-[0.99] text-purple-200 font-bold text-sm border border-purple-500/30 flex items-center justify-center space-x-2 transition shadow"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Atividade</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-[#7158e2] hover:bg-[#6047cf] active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-purple-900/30 flex items-center justify-center space-x-2 transition"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Salvar & Fechar</span>
          </button>
        </footer>

      </div>
    </div>
  );
};
