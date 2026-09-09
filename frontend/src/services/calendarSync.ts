// Serviço de Integração com Calendários Externos (Google Calendar, Microsoft Outlook, Android/iOS Nativo)

export type CalendarProviderType = 'google' | 'microsoft' | 'android';

export interface CalendarIntegrationSettings {
  googleConnected: boolean;
  googleAccountEmail?: string;
  microsoftConnected: boolean;
  microsoftAccountEmail?: string;
  androidConnected: boolean;
  syncCategories: {
    sleep: boolean;
    feed: boolean;
    diaper: boolean;
    bath: boolean;
    appointments: boolean;
  };
  reminderMinutesBefore: number; // 0, 10, 15, 30, 60
  autoSyncRoutine: boolean;
  lastSyncedAt?: string;
}

export interface CalendarEventPayload {
  id: string;
  title: string;
  description: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  allDay?: boolean;
  recurrenceRule?: string; // e.g. "FREQ=DAILY"
  category: 'sleep' | 'feed' | 'diaper' | 'bath' | 'appointments';
}

const STORAGE_KEY = 'baby_john_calendar_sync_settings_v1';

const DEFAULT_SETTINGS: CalendarIntegrationSettings = {
  googleConnected: false,
  googleAccountEmail: '',
  microsoftConnected: false,
  microsoftAccountEmail: '',
  androidConnected: false,
  syncCategories: {
    sleep: true,
    feed: true,
    diaper: false,
    bath: true,
    appointments: true,
  },
  reminderMinutesBefore: 15,
  autoSyncRoutine: true,
};

// Formata data para o formato aceito pelo Google Calendar (UTC YYYYMMDDTHHmmssZ)
function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Formata data para o formato ISO simples do Outlook
function formatOutlookDate(date: Date): string {
  return date.toISOString();
}

// Formata data para o formato padrão iCalendar RFC 5545
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export const calendarSyncService = {
  getSettings(): CalendarIntegrationSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings: Partial<CalendarIntegrationSettings>): CalendarIntegrationSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  connectProvider(
    provider: CalendarProviderType,
    accountEmail?: string
  ): CalendarIntegrationSettings {
    const update: Partial<CalendarIntegrationSettings> = {};
    if (provider === 'google') {
      update.googleConnected = true;
      if (accountEmail) update.googleAccountEmail = accountEmail;
    } else if (provider === 'microsoft') {
      update.microsoftConnected = true;
      if (accountEmail) update.microsoftAccountEmail = accountEmail;
    } else if (provider === 'android') {
      update.androidConnected = true;
    }
    update.lastSyncedAt = new Date().toISOString();
    return this.saveSettings(update);
  },

  disconnectProvider(provider: CalendarProviderType): CalendarIntegrationSettings {
    const update: Partial<CalendarIntegrationSettings> = {};
    if (provider === 'google') {
      update.googleConnected = false;
      update.googleAccountEmail = '';
    } else if (provider === 'microsoft') {
      update.microsoftConnected = false;
      update.microsoftAccountEmail = '';
    } else if (provider === 'android') {
      update.androidConnected = false;
    }
    return this.saveSettings(update);
  },

  // Gera o link oficial do Google Calendar (Web Intent)
  createGoogleCalendarUrl(event: CalendarEventPayload): string {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: `${event.description}\n\nAgendado via Baby John - Diário do Bebê`,
      dates: `${formatGoogleDate(event.startTime)}/${formatGoogleDate(event.endTime)}`,
    });

    if (event.location) {
      params.append('location', event.location);
    }
    if (event.recurrenceRule) {
      params.append('recur', `RRULE:${event.recurrenceRule}`);
    }

    return `${baseUrl}?${params.toString()}`;
  },

  // Gera o link oficial do Microsoft Outlook Live / 365
  createMicrosoftOutlookUrl(event: CalendarEventPayload): string {
    const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.title,
      body: `${event.description}\n\nAgendado via Baby John - Diário do Bebê`,
      startdt: formatOutlookDate(event.startTime),
      enddt: formatOutlookDate(event.endTime),
    });

    if (event.location) {
      params.append('location', event.location);
    }

    return `${baseUrl}?${params.toString()}`;
  },

  // Gera o conteúdo do arquivo iCalendar (.ics) RFC 5545 compatível com Android, iOS, Samsung Calendar e Mac
  generateICSContent(events: CalendarEventPayload[], calendarTitle = 'Rotina Baby John'): string {
    const now = formatICSDate(new Date());

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Baby John//Diario e Rotina do Bebe//PT-BR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${calendarTitle}`,
      'X-WR-TIMEZONE:America/Sao_Paulo',
    ];

    events.forEach((ev) => {
      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:baby-john-${ev.id}-${Date.now()}@babyjohn.app`);
      icsLines.push(`DTSTAMP:${now}`);
      icsLines.push(`DTSTART:${formatICSDate(ev.startTime)}`);
      icsLines.push(`DTEND:${formatICSDate(ev.endTime)}`);
      icsLines.push(`SUMMARY:${ev.title.replace(/\n/g, ' ')}`);
      icsLines.push(
        `DESCRIPTION:${ev.description.replace(/\n/g, '\\n')} - Gerado pelo app Baby John`
      );
      if (ev.location) {
        icsLines.push(`LOCATION:${ev.location.replace(/\n/g, ' ')}`);
      }
      if (ev.recurrenceRule) {
        icsLines.push(`RRULE:${ev.recurrenceRule}`);
      }

      // Alarme de notificação no celular
      icsLines.push('BEGIN:VALARM');
      icsLines.push('ACTION:DISPLAY');
      icsLines.push(`DESCRIPTION:Lembrete: ${ev.title}`);
      icsLines.push('TRIGGER:-PT15M'); // 15 minutos antes
      icsLines.push('END:VALARM');

      icsLines.push('END:VEVENT');
    });

    icsLines.push('END:VCALENDAR');
    return icsLines.join('\r\n');
  },

  // Baixa ou aciona o arquivo .ics para abrir direto no aplicativo de calendário do Android ou iPhone
  exportToAndroidCalendar(events: CalendarEventPayload[], filename = 'rotina_bebe_john.ics'): void {
    const icsData = this.generateICSContent(events);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.saveSettings({
      androidConnected: true,
      lastSyncedAt: new Date().toISOString(),
    });
  },

  // Retorna eventos predefinidos da rotina diária e acompanhamento do bebê
  getDefaultRoutineEvents(baseDate = new Date()): CalendarEventPayload[] {
    const y = baseDate.getFullYear();
    const m = baseDate.getMonth();
    const d = baseDate.getDate();

    const makeTime = (hour: number, minute: number): Date => {
      const date = new Date(y, m, d, hour, minute, 0);
      return date;
    };

    return [
      {
        id: 'ev-sleep-morning',
        title: '😴 Soneca Matinal (Janela de Sono Baby John)',
        description:
          'Janela de sono da manhã. Manter ambiente calmo com ruído branco e pouca luz.',
        location: 'Quarto do Bebê',
        startTime: makeTime(9, 0),
        endTime: makeTime(10, 30),
        recurrenceRule: 'FREQ=DAILY',
        category: 'sleep',
      },
      {
        id: 'ev-feed-lunch',
        title: '🥣 Almoço & Papinha Nutritiva',
        description: 'Refeição principal e hidratação. Introdução alimentar fase 1.',
        location: 'Cadeirão de Alimentação',
        startTime: makeTime(12, 0),
        endTime: makeTime(12, 45),
        recurrenceRule: 'FREQ=DAILY',
        category: 'feed',
      },
      {
        id: 'ev-sleep-afternoon',
        title: '🌙 Soneca da Tarde',
        description: 'Segunda soneca do dia para evitar estresse e exaustão ao entardecer.',
        location: 'Berço',
        startTime: makeTime(13, 30),
        endTime: makeTime(15, 0),
        recurrenceRule: 'FREQ=DAILY',
        category: 'sleep',
      },
      {
        id: 'ev-bath-relax',
        title: '🛁 Banho Morno & Massagem Relaxante',
        description: 'Ritual pré-sono: banho morno com água a 36°C-37°C e massagem de relaxamento.',
        location: 'Banheira do Bebê',
        startTime: makeTime(19, 0),
        endTime: makeTime(19, 30),
        recurrenceRule: 'FREQ=DAILY',
        category: 'bath',
      },
      {
        id: 'ev-sleep-night',
        title: '⭐ Hora de Dormir (Sono Noturno)',
        description: 'Colocar o bebê no berço sonolento, mas ainda acordado.',
        location: 'Berço do Bebê',
        startTime: makeTime(20, 30),
        endTime: makeTime(21, 0),
        recurrenceRule: 'FREQ=DAILY',
        category: 'sleep',
      },
      {
        id: 'ev-pediatrician',
        title: '🩺 Consulta Pediátrica Mensal',
        description:
          'Acompanhamento de peso, altura, desenvolvimento psicomotor e conferência da caderneta de vacinas.',
        location: 'Clínica de Pediatria',
        startTime: makeTime(14, 0),
        endTime: makeTime(15, 0),
        category: 'appointments',
      },
    ];
  },
};
