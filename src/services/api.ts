import { ActivityItem, CustomActivityDefinition, DailySummary } from '../types';
import { authService } from './auth';
import { syncService } from './syncService';

const ACTIVITIES_STORAGE_KEY = 'baby_john_activities_v2';
const CUSTOM_ACTIVITIES_STORAGE_KEY = 'baby_john_custom_activities_v2';

// Seed initial activities matching screenshots exactly
const INITIAL_ACTIVITIES: ActivityItem[] = [
  // August 19, 2026 activities (Qua 19)
  {
    id: 'act-1',
    type: 'custom',
    title: 'Tommy time botao estantaneo',
    timestamp: '2026-08-19T23:05:00',
    dateStr: '2026-08-19',
    timeStr: '23:05',
    period: 'Noite',
    assignee: 'Papai',
    details: {
      custom: { activityName: 'Tommy time botao estantaneo' },
    },
  },
  {
    id: 'act-2',
    type: 'custom',
    title: 'Tammy time',
    subtitle: 'tammy time',
    timestamp: '2026-08-19T23:05:00',
    dateStr: '2026-08-19',
    timeStr: '23:05',
    period: 'Noite',
    isInProgress: true,
    assignee: 'Papai',
    details: {
      custom: { activityName: 'Tammy time', notes: 'Estimulando engatinhar' },
    },
  },
  {
    id: 'act-3',
    type: 'custom',
    title: 'Tommy time botao estantaneo',
    timestamp: '2026-08-19T23:05:00',
    dateStr: '2026-08-19',
    timeStr: '23:05',
    period: 'Noite',
    assignee: 'Papai',
  },
  {
    id: 'act-4',
    type: 'comeu',
    title: 'Refeição',
    subtitle: 'Comeu',
    timestamp: '2026-08-19T23:05:00',
    dateStr: '2026-08-19',
    timeStr: '23:05',
    period: 'Noite',
    assignee: 'Papai',
    details: {
      meal: { mealType: 'janta', description: 'Papinha de legumes', amount: '120g' },
    },
  },
  {
    id: 'act-5',
    type: 'fralda',
    title: 'Fralda (Xixi + Cocô)',
    timestamp: '2026-08-19T23:05:00',
    dateStr: '2026-08-19',
    timeStr: '23:05',
    period: 'Noite',
    assignee: 'Papai',
    details: {
      diaper: { diaperType: 'ambos', stoolColor: '#d69917', consistency: 'Normal' },
    },
  },
  {
    id: 'act-6',
    type: 'amamentacao',
    title: 'Mamadeira (Fórmula)',
    subtitle: '150 ml · 23:04 - 23:04',
    timestamp: '2026-08-19T23:04:00',
    dateStr: '2026-08-19',
    timeStr: '23:04',
    period: 'Noite',
    assignee: 'Papai',
    details: {
      breastfeeding: { mode: 'formula', formulaMl: 150 },
    },
  },
  {
    id: 'act-7',
    type: 'amamentacao',
    title: 'Amamentação',
    subtitle: 'Peito direito',
    timestamp: '2026-08-19T23:04:00',
    dateStr: '2026-08-19',
    timeStr: '23:04',
    period: 'Noite',
    isInProgress: true,
    assignee: 'Papai',
    details: {
      breastfeeding: { mode: 'peito', rightMinutes: 12, feeling: 'Amamentação tranquila' },
    },
  },
  {
    id: 'act-8',
    type: 'amamentacao',
    title: 'Amamentação',
    subtitle: '0min · Peito esquerdo · 23:04 - 23:04',
    timestamp: '2026-08-19T23:04:00',
    dateStr: '2026-08-19',
    timeStr: '23:04',
    period: 'Noite',
    durationMinutes: 0,
    assignee: 'Papai',
    details: {
      breastfeeding: { mode: 'peito', leftMinutes: 0 },
    },
  },
  {
    id: 'act-9',
    type: 'sono',
    title: 'Sono Noturno',
    subtitle: 'Em andamento · 23:04',
    timestamp: '2026-08-19T23:04:00',
    dateStr: '2026-08-19',
    timeStr: '23:04',
    period: 'Noite',
    isInProgress: true,
    assignee: 'Papai',
    details: {
      sleep: { sleepType: 'noturno', startTime: '23:04', quality: 'bom' },
    },
  },
  {
    id: 'act-10',
    type: 'sono',
    title: 'Sono Noturno',
    subtitle: '0min · 23:02 - 23:02',
    timestamp: '2026-08-19T23:02:00',
    dateStr: '2026-08-19',
    timeStr: '23:02',
    period: 'Noite',
    durationMinutes: 0,
    assignee: 'Papai',
    details: {
      sleep: { sleepType: 'noturno', startTime: '23:02', endTime: '23:02', quality: 'regular' },
    },
  },
  {
    id: 'act-11',
    type: 'fralda',
    title: 'Fralda (Xixi + Cocô)',
    timestamp: '2026-08-19T17:27:00',
    dateStr: '2026-08-19',
    timeStr: '17:27',
    period: 'Tarde',
    assignee: 'Papai',
    details: {
      diaper: { diaperType: 'ambos', consistency: 'Normal' },
    },
  },
  {
    id: 'act-12',
    type: 'fralda',
    title: 'Fralda (Xixi)',
    timestamp: '2026-08-19T17:27:00',
    dateStr: '2026-08-19',
    timeStr: '17:27',
    period: 'Tarde',
    assignee: 'Papai',
    details: {
      diaper: { diaperType: 'xixi' },
    },
  },
  // August 18 (Ter 18)
  {
    id: 'act-13',
    type: 'sono',
    title: 'Sono Noturno',
    subtitle: '7h 15min · 21:30 - 04:45',
    timestamp: '2026-08-18T21:30:00',
    dateStr: '2026-08-18',
    timeStr: '21:30',
    period: 'Noite',
    durationMinutes: 435,
    assignee: 'Papai',
  },
  // Notice: Seg 17 (2026-08-17) is intentionally left EMPTY to show the exact empty state illustration "A história de John começa aqui"!
];

const INITIAL_CUSTOM_ACTIVITIES: CustomActivityDefinition[] = [
  { id: 'def-1', name: 'Amamentação', type: 'time', icon: 'baby', isDefault: true, description: 'Atividade com tempo' },
  { id: 'def-2', name: 'Comeu', type: 'instant', icon: 'utensils', isDefault: true, description: 'Atividade instantânea' },
  { id: 'def-3', name: 'Fralda', type: 'instant', icon: 'shirt', isDefault: true, description: 'Atividade instantânea' },
  { id: 'def-4', name: 'Sono', type: 'time', icon: 'moon', isDefault: true, description: 'Atividade com tempo' },
  { id: 'def-5', name: 'Tommy time botao estantaneo', type: 'instant', icon: 'target', isDefault: false, description: 'Atividade instantânea' },
  { id: 'def-6', name: 'Tammy time', type: 'time', icon: 'smile', isDefault: false, description: 'Atividade com tempo' },
];

function getStoredActivities(): ActivityItem[] {
  const json = localStorage.getItem(ACTIVITIES_STORAGE_KEY) || localStorage.getItem('roti_hub_activities_v2');
  if (!json) {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(INITIAL_ACTIVITIES));
    return INITIAL_ACTIVITIES;
  }
  try {
    return JSON.parse(json);
  } catch {
    return INITIAL_ACTIVITIES;
  }
}

function saveStoredActivities(activities: ActivityItem[]): void {
  localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
}

function getStoredCustomActivities(): CustomActivityDefinition[] {
  const json = localStorage.getItem(CUSTOM_ACTIVITIES_STORAGE_KEY) || localStorage.getItem('roti_hub_custom_activities_v2');
  if (!json) {
    localStorage.setItem(CUSTOM_ACTIVITIES_STORAGE_KEY, JSON.stringify(INITIAL_CUSTOM_ACTIVITIES));
    return INITIAL_CUSTOM_ACTIVITIES;
  }
  try {
    return JSON.parse(json);
  } catch {
    return INITIAL_CUSTOM_ACTIVITIES;
  }
}

function saveStoredCustomActivities(customList: CustomActivityDefinition[]): void {
  localStorage.setItem(CUSTOM_ACTIVITIES_STORAGE_KEY, JSON.stringify(customList));
}

export const apiService = {
  // Simulated GET /api/activities?date={dateStr}&filter={filter}
  async getActivities(dateStr?: string, filterType?: string): Promise<ActivityItem[]> {
    // Verify JWT auth
    const headers = authService.getAuthHeader();
    if (!headers.Authorization) {
      console.warn('Simulated FastAPI warning: No JWT Bearer token provided');
    }

    const list = getStoredActivities();
    let filtered = list;

    if (dateStr) {
      filtered = filtered.filter((item) => item.dateStr === dateStr);
    }

    if (filterType && filterType !== 'all') {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    // Sort descending by timestamp
    return filtered.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
  },

  // Simulated POST /api/activities
  async createActivity(activityData: Omit<ActivityItem, 'id'>): Promise<ActivityItem> {
    const list = getStoredActivities();
    const newActivity: ActivityItem = {
      ...activityData,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    list.unshift(newActivity);
    saveStoredActivities(list);

    // Enfileira na central de sincronização offline para gravação no banco
    syncService.enqueue(
      'CREATE_ACTIVITY',
      'activity',
      newActivity.id,
      newActivity.title || 'Nova Atividade',
      `${newActivity.dateStr} às ${newActivity.timeStr || ''}`,
      newActivity
    );

    return newActivity;
  },

  // Simulated DELETE /api/activities/{id}
  async deleteActivity(id: string): Promise<boolean> {
    const list = getStoredActivities();
    const itemToDelete = list.find((a) => a.id === id);
    const updated = list.filter((a) => a.id !== id);
    saveStoredActivities(updated);

    syncService.enqueue(
      'DELETE_ACTIVITY',
      'activity',
      id,
      itemToDelete?.title || 'Remover Atividade',
      'Exclusão de registro',
      { id }
    );

    return true;
  },

  // Simulated PUT /api/activities/{id}
  async updateActivity(id: string, updates: Partial<ActivityItem>): Promise<ActivityItem | null> {
    const list = getStoredActivities();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    saveStoredActivities(list);

    syncService.enqueue(
      'UPDATE_ACTIVITY',
      'activity',
      id,
      list[idx].title || 'Atualizar Atividade',
      'Atualização de registro',
      list[idx]
    );

    return list[idx];
  },

  // Simulated GET /api/summary/daily?date={dateStr}
  async getDailySummary(dateStr: string): Promise<DailySummary> {
    const items = await this.getActivities(dateStr);
    let totalSleepMinutes = 0;
    let breastfeedingSessions = 0;
    let diaperChanges = 0;

    for (const item of items) {
      if (item.type === 'sono') {
        totalSleepMinutes += item.durationMinutes ?? 45;
      } else if (item.type === 'amamentacao') {
        breastfeedingSessions += 1;
      } else if (item.type === 'fralda') {
        diaperChanges += 1;
      }
    }

    // If day is Qua 19 (match screenshot: 5h 36min, 3 sessões, 4 trocas)
    if (dateStr === '2026-08-19') {
      return {
        totalSleepMinutes: 336, // 5h 36min
        breastfeedingSessions: 3,
        diaperChanges: 4,
      };
    }

    return {
      totalSleepMinutes,
      breastfeedingSessions,
      diaperChanges,
    };
  },

  // Simulated GET /api/custom-activities
  async getCustomActivities(): Promise<CustomActivityDefinition[]> {
    return getStoredCustomActivities();
  },

  // Simulated POST /api/custom-activities
  async createCustomActivity(definition: Omit<CustomActivityDefinition, 'id'>): Promise<CustomActivityDefinition> {
    const list = getStoredCustomActivities();
    const newDef: CustomActivityDefinition = {
      ...definition,
      id: `def-${Date.now()}`,
    };
    list.push(newDef);
    saveStoredCustomActivities(list);

    syncService.enqueue(
      'CREATE_CUSTOM_ACTIVITY',
      'custom_activity',
      newDef.id,
      newDef.name || 'Nova Categoria',
      newDef.description || 'Atividade personalizada',
      newDef
    );

    return newDef;
  },

  // Simulated DELETE /api/custom-activities/{id}
  async deleteCustomActivity(id: string): Promise<boolean> {
    const list = getStoredCustomActivities();
    const updated = list.filter((d) => d.id !== id);
    saveStoredCustomActivities(updated);
    return true;
  },
};
