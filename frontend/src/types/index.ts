export type ActivityType =
  | 'amamentacao'
  | 'sono'
  | 'fralda'
  | 'comeu'
  | 'remedio'
  | 'humor'
  | 'custom';

export type FeedingMode = 'peito' | 'formula';

export interface BreastfeedingDetails {
  mode: FeedingMode;
  leftMinutes?: number;
  rightMinutes?: number;
  formulaMl?: number;
  offeredMl?: number;
  leftoverMl?: number;
  consumedMl?: number;
  consumedPercentage?: number;
  milkType?: 'formula' | 'leite_materno';
  feeling?: string;
  notes?: string;
}

export interface SleepDetails {
  sleepType: 'noturno' | 'soneca';
  startTime: string;
  endTime?: string;
  isInProgress?: boolean;
  quality?: 'ruim' | 'regular' | 'bom' | 'excelente';
  notes?: string;
}

export interface DiaperDetails {
  diaperType: 'xixi' | 'coco' | 'ambos';
  stoolColor?: string;
  consistency?: 'Normal' | 'Ressecado' | 'Líquido' | 'Com muco';
  notes?: string;
}

export interface MealDetails {
  mealType: 'cafe' | 'almoco' | 'janta' | 'lanche';
  foodName?: string;
  description?: string;
  amount?: string;
  notes?: string;
}

export interface CustomActivityDetails {
  activityName: string;
  notes?: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle?: string;
  timestamp: string; // ISO string e.g. "2026-08-19T23:05:00"
  dateStr: string;   // "2026-08-19"
  timeStr: string;   // "23:05"
  period: 'Noite' | 'Tarde' | 'Manhã';
  isInProgress?: boolean;
  durationMinutes?: number;
  assignee?: string;
  details?: {
    breastfeeding?: BreastfeedingDetails;
    sleep?: SleepDetails;
    diaper?: DiaperDetails;
    meal?: MealDetails;
    custom?: CustomActivityDetails;
    formulaMl?: number;
    diaperType?: string;
    feeling?: string;
    notes?: string;
    [key: string]: any;
  };
}

export interface CustomActivityDefinition {
  id: string;
  name: string;
  type: 'time' | 'instant';
  icon: string;
  isDefault?: boolean;
  description?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  babyName: string;
  babyBirthDate: string;
  token?: string;
}

export interface DailySummary {
  totalSleepMinutes: number;
  breastfeedingSessions: number;
  diaperChanges: number;
}

export type FeedbackTargetFeature =
  | 'geral'
  | 'amamentacao'
  | 'sono'
  | 'fralda'
  | 'rotinas'
  | 'calendario'
  | 'ia_insights'
  | 'lembretes';

export interface UserFeedbackItem {
  id: string;
  rating: number; // 1 a 5 estrelas
  category: 'elogio' | 'melhoria' | 'bug' | 'sugestao';
  targetFeature: FeedbackTargetFeature;
  comment: string;
  sessionDurationMinutes: number;
  interactionCount: number;
  userName?: string;
  userEmail?: string;
  createdAt: string; // ISO string
}

export interface UserEngagementStats {
  firstAccessTimestamp: number;
  totalInteractionsCount: number;
  activityCreatedCount: number;
  calendarExportCount: number;
  remindersConfiguredCount: number;
  lastFeedbackPromptTimestamp?: number;
  hasDismissedRecentPrompt?: boolean;
}

export type SyncOperationType =
  | 'CREATE_ACTIVITY'
  | 'UPDATE_ACTIVITY'
  | 'DELETE_ACTIVITY'
  | 'CREATE_CUSTOM_ACTIVITY'
  | 'SUBMIT_FEEDBACK';

export interface OfflineSyncQueueItem {
  id: string;
  operation: SyncOperationType;
  entityId: string;
  entityType: 'activity' | 'custom_activity' | 'feedback';
  title: string;
  description: string;
  payload: any;
  createdAt: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  errorMessage?: string;
}

export interface SyncStatusState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTimestamp: number | null;
  lastSyncResult?: {
    success: boolean;
    syncedCount: number;
    failedCount: number;
    timestamp: number;
  };
}
