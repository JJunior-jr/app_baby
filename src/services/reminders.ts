export type ReminderIntervalPreset = '2h' | '3h' | '4h' | '6h' | '8h' | 'custom';

export interface ActivityReminderConfig {
  activityId: string;
  activityName: string;
  enabled: boolean;
  intervalType: ReminderIntervalPreset;
  customMinutes: number; // in minutes (e.g. 60 = 1h, 120 = 2h)
  recommendedHours: number;
  objectiveExplanation: string;
  lastNotifiedAt?: string;
}

const REMINDERS_STORAGE_KEY = 'baby_john_activity_reminders_v1';

export const DEFAULT_ACTIVITY_REMINDERS: Record<string, ActivityReminderConfig> = {
  'def-1': {
    activityId: 'def-1',
    activityName: 'Amamentação',
    enabled: true,
    intervalType: '3h',
    customMinutes: 180,
    recommendedHours: 3,
    objectiveExplanation: 'Garante nutrição regular e ganho de peso saudável conforme recomendação pediátrica (a cada 2h a 3h).',
  },
  'def-4': {
    activityId: 'def-4',
    activityName: 'Sono',
    enabled: true,
    intervalType: '2h',
    customMinutes: 120,
    recommendedHours: 2,
    objectiveExplanation: 'Monitora a "janela de vigília" para evitar que o bebê fique exausto e tenha picos de cortisol/choro.',
  },
  'def-3': {
    activityId: 'def-3',
    activityName: 'Fralda',
    enabled: false,
    intervalType: '3h',
    customMinutes: 180,
    recommendedHours: 3,
    objectiveExplanation: 'Lembrete preventivo para checar a fralda a cada 3h, evitando assaduras e desconforto.',
  },
  'def-2': {
    activityId: 'def-2',
    activityName: 'Comeu',
    enabled: false,
    intervalType: '4h',
    customMinutes: 240,
    recommendedHours: 4,
    objectiveExplanation: 'Mantém horários estruturados para refeições principais e lanchinhos ao longo do dia.',
  },
  'def-5': {
    activityId: 'def-5',
    activityName: 'Tommy time botao estantaneo',
    enabled: false,
    intervalType: '4h',
    customMinutes: 240,
    recommendedHours: 4,
    objectiveExplanation: 'Estimula o tempo de bruços para fortalecer o pescoço, costas e membros do bebê.',
  },
  'def-6': {
    activityId: 'def-6',
    activityName: 'Tammy time',
    enabled: false,
    intervalType: 'custom',
    customMinutes: 120,
    recommendedHours: 2,
    objectiveExplanation: 'Exercícios guiados e estímulo motor no tapetinho em horários de vigília ativa.',
  },
};

/**
 * Converts a string preset like '2h' into minutes, or customMinutes if 'custom'
 */
export function getIntervalMinutes(intervalType: ReminderIntervalPreset, customMinutes: number): number {
  switch (intervalType) {
    case '2h': return 120;
    case '3h': return 180;
    case '4h': return 240;
    case '6h': return 360;
    case '8h': return 480;
    case 'custom': return Math.max(5, customMinutes || 60);
  }
}

/**
 * Formats minutes into human-readable hours and minutes:
 * 60 min -> "1h"
 * 90 min -> "1h 30min"
 * 120 min -> "2h"
 */
export function formatMinutesHuman(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) {
    return `${hours}h (${totalMinutes} min)`;
  }
  return `${hours}h ${mins}min (${totalMinutes} min)`;
}

export const remindersService = {
  getAll(): Record<string, ActivityReminderConfig> {
    try {
      const stored = localStorage.getItem(REMINDERS_STORAGE_KEY) || localStorage.getItem('roti_hub_activity_reminders_v1');
      if (!stored) {
        localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(DEFAULT_ACTIVITY_REMINDERS));
        return DEFAULT_ACTIVITY_REMINDERS;
      }
      return { ...DEFAULT_ACTIVITY_REMINDERS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_ACTIVITY_REMINDERS;
    }
  },

  get(activityId: string): ActivityReminderConfig | undefined {
    const all = this.getAll();
    return all[activityId];
  },

  save(config: ActivityReminderConfig): void {
    const all = this.getAll();
    all[config.activityId] = config;
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(all));
  },

  saveAll(configs: Record<string, ActivityReminderConfig>): void {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(configs));
  },

  getActiveCount(): number {
    const all = this.getAll();
    return (Object.values(all) as ActivityReminderConfig[]).filter((c) => c.enabled).length;
  },
};
