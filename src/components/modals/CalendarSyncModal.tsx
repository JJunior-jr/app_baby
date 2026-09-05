import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Bell,
  Clock,
  Download,
  Sparkles,
  Info,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  calendarSyncService,
  CalendarIntegrationSettings,
  CalendarProviderType,
  CalendarEventPayload,
} from '../../services/calendarSync';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<CalendarIntegrationSettings>(
    calendarSyncService.getSettings()
  );
  const [activeTab, setActiveTab] = useState<'providers' | 'events' | 'preferences'>('providers');
  const [selectedProvider, setSelectedProvider] = useState<CalendarProviderType>('google');
  const [googleEmail, setGoogleEmail] = useState('');
  const [microsoftEmail, setMicrosoftEmail] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Lista de eventos da rotina prontos para envio
  const [routineEvents, setRoutineEvents] = useState<CalendarEventPayload[]>([]);

  useEffect(() => {
    if (isOpen) {
      const current = calendarSyncService.getSettings();
      setSettings(current);
      setGoogleEmail(current.googleAccountEmail || '');
      setMicrosoftEmail(current.microsoftAccountEmail || '');
      setRoutineEvents(calendarSyncService.getDefaultRoutineEvents());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleProvider = (provider: CalendarProviderType) => {
    if (provider === 'google') {
      if (settings.googleConnected) {
        const updated = calendarSyncService.disconnectProvider('google');
        setSettings(updated);
        showToast('Google Calendar desconectado.');
      } else {
        const updated = calendarSyncService.connectProvider('google', googleEmail || 'minha-conta@gmail.com');
        setSettings(updated);
        showToast('Google Calendar conectado com sucesso!');
      }
    } else if (provider === 'microsoft') {
      if (settings.microsoftConnected) {
        const updated = calendarSyncService.disconnectProvider('microsoft');
        setSettings(updated);
        showToast('Microsoft Outlook desconectado.');
      } else {
        const updated = calendarSyncService.connectProvider('microsoft', microsoftEmail || 'minha-conta@outlook.com');
        setSettings(updated);
        showToast('Microsoft Outlook conectado com sucesso!');
      }
    } else if (provider === 'android') {
      if (settings.androidConnected) {
        const updated = calendarSyncService.disconnectProvider('android');
        setSettings(updated);
        showToast('Calendário nativo desconectado.');
      } else {
        const updated = calendarSyncService.connectProvider('android');
        setSettings(updated);
        showToast('Calendário do Android configurado!');
      }
    }
  };

  const handleExportAllToAndroid = () => {
    setIsExporting(true);
    try {
      calendarSyncService.exportToAndroidCalendar(routineEvents);
      const updated = calendarSyncService.getSettings();
      setSettings(updated);
      showToast('Arquivo .ics gerado! O Android abrirá seu calendário padrão.');
    } catch {
      showToast('Erro ao exportar eventos para o Android.');
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  const handleOpenSingleEvent = (event: CalendarEventPayload, provider: CalendarProviderType) => {
    if (provider === 'google') {
      const url = calendarSyncService.createGoogleCalendarUrl(event);
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast(`Abrindo "${event.title}" no Google Calendar...`);
    } else if (provider === 'microsoft') {
      const url = calendarSyncService.createMicrosoftOutlookUrl(event);
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast(`Abrindo "${event.title}" no Microsoft Outlook...`);
    } else if (provider === 'android') {
      calendarSyncService.exportToAndroidCalendar([event], `${event.id}.ics`);
      showToast(`Enviando "${event.title}" para o Calendário do Android...`);
    }
  };

  const handleToggleCategory = (categoryKey: keyof CalendarIntegrationSettings['syncCategories']) => {
    const updatedCategories = {
      ...settings.syncCategories,
      [categoryKey]: !settings.syncCategories[categoryKey],
    };
    const updated = calendarSyncService.saveSettings({ syncCategories: updatedCategories });
    setSettings(updated);
    showToast('Preferências de sincronização salvas!');
  };

  const handleSetReminderMinutes = (minutes: number) => {
    const updated = calendarSyncService.saveSettings({ reminderMinutesBefore: minutes });
    setSettings(updated);
    showToast(`Alarmes configurados para ${minutes === 0 ? 'a hora exata' : `${minutes} min antes`}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      {/* Click outside backdrop */}
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
        {/* Navigation Header */}
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
              <CalendarIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-tight flex items-center gap-1.5">
                <span>Integração de Calendário</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/40">
                  Celular
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                Google Agenda, Microsoft Outlook & Calendário do Celular
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

        {/* Tab Switcher */}
        <div className="px-5 pt-3 shrink-0">
          <div
            className="grid grid-cols-3 p-1 rounded-2xl border text-xs font-bold"
            style={{
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('providers')}
              style={
                activeTab === 'providers'
                  ? {
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accent-text)',
                    }
                  : undefined
              }
              className={`py-1.5 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer text-[11px] ${
                activeTab === 'providers' ? 'shadow' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Provedores</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              style={
                activeTab === 'events'
                  ? {
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accent-text)',
                    }
                  : undefined
              }
              className={`py-1.5 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer text-[11px] ${
                activeTab === 'events' ? 'shadow' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Rotina ({routineEvents.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              style={
                activeTab === 'preferences'
                  ? {
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accent-text)',
                    }
                  : undefined
              }
              className={`py-1.5 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer text-[11px] ${
                activeTab === 'preferences' ? 'shadow' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alarmes</span>
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="mx-5 mt-2.5 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[62vh] no-scrollbar">
          {activeTab === 'providers' && (
            <div className="space-y-3.5 animate-in fade-in">
              {/* Introduction Banner */}
              <div
                className="p-3.5 rounded-2xl border text-xs space-y-1.5"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center space-x-2 text-white font-bold">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Sincronize com a sua rotina no smartphone</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Receba alertas pontuais no seu relógio ou telefone para as janelas de sono,
                  mamadas, banho relaxante e consultas médicas.
                </p>
              </div>

              {/* PROVIDER 1: Google Calendar */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  settings.googleConnected
                    ? 'border-blue-500/60 bg-blue-950/20'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      {/* Google G / Calendar colored visual */}
                      <span className="text-sm font-black text-blue-600">G</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-white">Google Calendar</h3>
                        {settings.googleConnected && (
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold">
                            Conectado
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">Google Agenda no Android e Web</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleProvider('google')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      settings.googleConnected
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                    }`}
                  >
                    {settings.googleConnected ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5 text-gray-300">
                  <span className="text-[10px] text-gray-400">
                    Sincronização direta via Web Intent & Link Oficial
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenSingleEvent(routineEvents[0], 'google')}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>Testar no Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* PROVIDER 2: Microsoft Outlook / Office 365 */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  settings.microsoftConnected
                    ? 'border-cyan-500/60 bg-cyan-950/20'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0078d4] flex items-center justify-center shadow-sm">
                      <span className="text-xs font-black text-white">O</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-white">Microsoft Outlook</h3>
                        {settings.microsoftConnected && (
                          <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                            Conectado
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">Outlook, Hotmail & Office 365</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleProvider('microsoft')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      settings.microsoftConnected
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        : 'bg-[#0078d4] hover:bg-[#006cc1] text-white shadow'
                    }`}
                  >
                    {settings.microsoftConnected ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5 text-gray-300">
                  <span className="text-[10px] text-gray-400">
                    Deeplink com suporte a Outlook Desktop e Web
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenSingleEvent(routineEvents[0], 'microsoft')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>Testar no Outlook</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* PROVIDER 3: Android / Celular Nativo (.ICS) */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  settings.androidConnected
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
                      <Smartphone className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-white">
                          Calendário Nativo do Android / iOS
                        </h3>
                        {settings.androidConnected && (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                            Pronto
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Samsung Calendar, Xiaomi, Apple Calendar (.ics)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportAllToAndroid}
                    disabled={isExporting}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>{isExporting ? 'Exportando...' : 'Abrir no Celular'}</span>
                  </button>
                </div>

                <p className="text-[10.5px] text-gray-300 mb-2 leading-relaxed">
                  Exporta todos os horários da rotina com alarmes configurados para 15 min antes,
                  direto para o aplicativo de agenda nativo do seu smartphone.
                </p>

                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[10px] text-emerald-300">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Formato universal padrão RFC 5545 compatível com qualquer celular
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-gray-200">
                  Eventos da Rotina prontos para Envio
                </span>
                <button
                  type="button"
                  onClick={handleExportAllToAndroid}
                  className="text-emerald-400 hover:text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Sincronizar Todos (.ics)</span>
                </button>
              </div>

              {/* Lista dos eventos */}
              <div className="space-y-2">
                {routineEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-2xl border text-left flex flex-col justify-between gap-2"
                    style={{
                      backgroundColor: 'var(--color-secondary)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{ev.title}</span>
                        <span className="px-2 py-0.5 rounded-md bg-black/40 text-[10px] font-mono text-purple-300 border border-white/5">
                          {ev.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {ev.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{ev.description}</p>
                    </div>

                    {/* Botões rápidos por evento */}
                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleOpenSingleEvent(ev, 'google')}
                        className="px-2 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-[9.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Enviar para Google Calendar"
                      >
                        <span>Google</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenSingleEvent(ev, 'microsoft')}
                        className="px-2 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 text-[9.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Enviar para Microsoft Outlook"
                      >
                        <span>Outlook</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenSingleEvent(ev, 'android')}
                        className="px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-[9.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Abrir no Calendário do Android"
                      >
                        <span>Android (.ics)</span>
                        <Download className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              {/* Categorias para sincronizar */}
              <div
                className="p-3.5 rounded-2xl border space-y-2.5"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <span className="font-bold text-white block">
                  Quais itens da rotina você deseja na sua agenda?
                </span>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2 rounded-xl bg-black/30 cursor-pointer">
                    <span className="text-[11px] text-gray-200 flex items-center gap-2">
                      <span>😴</span>
                      <span>Janelas de Sono & Sonecas</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.syncCategories.sleep}
                      onChange={() => handleToggleCategory('sleep')}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-black/30 cursor-pointer">
                    <span className="text-[11px] text-gray-200 flex items-center gap-2">
                      <span>🍼</span>
                      <span>Mamadas & Horários de Refeição</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.syncCategories.feed}
                      onChange={() => handleToggleCategory('feed')}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-black/30 cursor-pointer">
                    <span className="text-[11px] text-gray-200 flex items-center gap-2">
                      <span>🛁</span>
                      <span>Ritual de Banho & Relaxamento</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.syncCategories.bath}
                      onChange={() => handleToggleCategory('bath')}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-black/30 cursor-pointer">
                    <span className="text-[11px] text-gray-200 flex items-center gap-2">
                      <span>🩺</span>
                      <span>Consultas Pediátricas & Vacinas</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.syncCategories.appointments}
                      onChange={() => handleToggleCategory('appointments')}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Alarme prévio no celular */}
              <div
                className="p-3.5 rounded-2xl border space-y-2.5"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Alarme prévio no celular:</span>
                  <span className="text-purple-300 font-bold">
                    {settings.reminderMinutesBefore === 0
                      ? 'No momento exato'
                      : `${settings.reminderMinutesBefore} minutos antes`}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {[0, 10, 15, 30].map((mins) => {
                    const isSelected = settings.reminderMinutesBefore === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => handleSetReminderMinutes(mins)}
                        className={`py-1.5 rounded-xl font-bold text-[10px] transition cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow'
                            : 'bg-black/30 text-gray-300 hover:bg-black/50 border border-white/5'
                        }`}
                      >
                        {mins === 0 ? 'Na hora' : `${mins}m antes`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer
          className="p-4 pt-3 pb-5 border-t border-white/5 flex items-center gap-2.5 shrink-0"
          style={{ backgroundColor: 'var(--color-dominant)' }}
        >
          <button
            type="button"
            onClick={handleExportAllToAndroid}
            disabled={isExporting}
            className="flex-1 py-3 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>Sincronizar no Calendário do Celular</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border)',
            }}
            className="px-4 py-3 rounded-2xl font-bold text-xs border hover:opacity-80 transition cursor-pointer"
          >
            Concluir
          </button>
        </footer>
      </section>
    </div>
  );
};
