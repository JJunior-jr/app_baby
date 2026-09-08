import { UserFeedbackItem, UserEngagementStats, FeedbackTargetFeature } from '../types';

const STATS_KEY = 'baby_john_engagement_stats_v1';
const FEEDBACK_LIST_KEY = 'baby_john_user_feedbacks_v1';
const PROMPT_STATUS_KEY = 'baby_john_feedback_prompt_state_v1';

export interface FeedbackPromptTrigger {
  shouldShow: boolean;
  triggerReason: 'time_on_platform' | 'activity_milestone' | 'feature_interaction' | 'manual';
  suggestedFeature: FeedbackTargetFeature;
  headline: string;
  subheadline: string;
}

const DEFAULT_FEEDBACK_ITEMS: UserFeedbackItem[] = [
  {
    id: 'fb-initial-1',
    rating: 5,
    category: 'elogio',
    targetFeature: 'amamentacao',
    comment: 'O cronômetro com separação de lado esquerdo e direito me salvou nas madrugadas!',
    sessionDurationMinutes: 18,
    interactionCount: 9,
    userName: 'Mariana P.',
    userEmail: 'mariana.p@example.com',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'fb-initial-2',
    rating: 5,
    category: 'sugestao',
    targetFeature: 'calendario',
    comment: 'A sincronização com o Google Calendar e arquivo .ics para o Samsung facilitou muito dividir a rotina com meu marido.',
    sessionDurationMinutes: 34,
    interactionCount: 16,
    userName: 'Carlos S.',
    userEmail: 'carlos.silva@example.com',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

export const feedbackService = {
  // Obter ou inicializar as estatísticas de engajamento do usuário
  getEngagementStats(): UserEngagementStats {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }

    const initial: UserEngagementStats = {
      firstAccessTimestamp: Date.now() - (12 * 60 * 1000), // simula que já tem 12 min de uso na plataforma
      totalInteractionsCount: 6,
      activityCreatedCount: 3,
      calendarExportCount: 1,
      remindersConfiguredCount: 1,
    };
    this.saveEngagementStats(initial);
    return initial;
  },

  saveEngagementStats(stats: UserEngagementStats): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (err) {
      console.warn('Erro ao salvar estatísticas de engajamento:', err);
    }
  },

  // Incrementa uma interação genérica (navegação, abertura de modal, clique)
  recordInteraction(feature?: FeedbackTargetFeature): FeedbackPromptTrigger | null {
    const stats = this.getEngagementStats();
    stats.totalInteractionsCount += 1;
    this.saveEngagementStats(stats);

    return this.evaluatePromptTrigger(feature);
  },

  // Incrementa a contagem de atividades criadas (mamada, sono, fralda, etc.)
  recordActivityCreated(type: string): FeedbackPromptTrigger | null {
    const stats = this.getEngagementStats();
    stats.activityCreatedCount += 1;
    stats.totalInteractionsCount += 1;
    this.saveEngagementStats(stats);

    let targetFeature: FeedbackTargetFeature = 'geral';
    if (type === 'amamentacao') targetFeature = 'amamentacao';
    else if (type === 'sono') targetFeature = 'sono';
    else if (type === 'fralda') targetFeature = 'fralda';

    return this.evaluatePromptTrigger(targetFeature);
  },

  // Incrementa uso de calendário ou lembretes
  recordFeatureMilestone(feature: 'calendario' | 'lembretes'): FeedbackPromptTrigger | null {
    const stats = this.getEngagementStats();
    if (feature === 'calendario') stats.calendarExportCount += 1;
    if (feature === 'lembretes') stats.remindersConfiguredCount += 1;
    stats.totalInteractionsCount += 1;
    this.saveEngagementStats(stats);

    return this.evaluatePromptTrigger(feature);
  },

  // Avalia se de acordo com o tempo e interações, devemos convidar o usuário a avaliar
  evaluatePromptTrigger(targetFeature: FeedbackTargetFeature = 'geral'): FeedbackPromptTrigger {
    const stats = this.getEngagementStats();
    const now = Date.now();
    const minutesSinceFirstAccess = Math.floor((now - stats.firstAccessTimestamp) / (60 * 1000));

    // Se o usuário dispensou ou já avaliou recentemente nos últimos 15 minutos, não incomodar
    if (stats.lastFeedbackPromptTimestamp && (now - stats.lastFeedbackPromptTimestamp < 15 * 60 * 1000)) {
      return {
        shouldShow: false,
        triggerReason: 'time_on_platform',
        suggestedFeature: targetFeature,
        headline: '',
        subheadline: '',
      };
    }

    // Regra 1: Usuário após interagir com 5+ atividades
    if (stats.activityCreatedCount >= 5 && stats.activityCreatedCount % 5 === 0) {
      return {
        shouldShow: true,
        triggerReason: 'activity_milestone',
        suggestedFeature: targetFeature,
        headline: 'Como tem sido registrar as atividades do John?',
        subheadline: 'Você já registrou vários momentos hoje! Sua opinião nos ajuda a evoluir.',
      };
    }

    // Regra 2: Usuário com mais de 8 minutos navegando na plataforma e 8+ interações
    if (minutesSinceFirstAccess >= 8 && stats.totalInteractionsCount >= 8 && !stats.lastFeedbackPromptTimestamp) {
      return {
        shouldShow: true,
        triggerReason: 'time_on_platform',
        suggestedFeature: targetFeature,
        headline: 'O que você está achando do Baby John?',
        subheadline: 'Notamos que você está explorando o app. Conte-nos o que podemos melhorar!',
      };
    }

    // Regra 3: Se o usuário utilizou recursos avançados (como sincronização de agenda)
    if (targetFeature === 'calendario' && stats.calendarExportCount >= 1 && !stats.lastFeedbackPromptTimestamp) {
      return {
        shouldShow: true,
        triggerReason: 'feature_interaction',
        suggestedFeature: 'calendario',
        headline: 'A sincronização com a agenda funcionou bem no seu celular?',
        subheadline: 'Seu feedback sobre a integração de calendário é super importante.',
      };
    }

    return {
      shouldShow: false,
      triggerReason: 'time_on_platform',
      suggestedFeature: targetFeature,
      headline: '',
      subheadline: '',
    };
  },

  // Marca que o prompt foi exibido ou dispensado temporariamente
  snoozePrompt(): void {
    const stats = this.getEngagementStats();
    stats.lastFeedbackPromptTimestamp = Date.now();
    stats.hasDismissedRecentPrompt = true;
    this.saveEngagementStats(stats);
  },

  // Salvar uma avaliação/sugestão submetida pelo usuário
  saveFeedback(item: Omit<UserFeedbackItem, 'id' | 'createdAt' | 'sessionDurationMinutes' | 'interactionCount'>): UserFeedbackItem {
    const stats = this.getEngagementStats();
    const now = Date.now();
    const minutesSinceFirstAccess = Math.max(1, Math.floor((now - stats.firstAccessTimestamp) / (60 * 1000)));

    const newItem: UserFeedbackItem = {
      ...item,
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sessionDurationMinutes: minutesSinceFirstAccess,
      interactionCount: stats.totalInteractionsCount,
      createdAt: new Date().toISOString(),
    };

    const list = this.getAllFeedbacks();
    const updated = [newItem, ...list];

    try {
      localStorage.setItem(FEEDBACK_LIST_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Erro ao persistir feedback:', err);
    }

    // Atualiza stats
    stats.lastFeedbackPromptTimestamp = now;
    this.saveEngagementStats(stats);

    return newItem;
  },

  // Recupera todas as opiniões salvas
  getAllFeedbacks(): UserFeedbackItem[] {
    try {
      const stored = localStorage.getItem(FEEDBACK_LIST_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return DEFAULT_FEEDBACK_ITEMS;
  },

  // Excluir ou limpar feedbacks de teste
  deleteFeedback(id: string): void {
    const list = this.getAllFeedbacks();
    const updated = list.filter((i) => i.id !== id);
    try {
      localStorage.setItem(FEEDBACK_LIST_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  // Estatísticas consolidadas para melhorias do produto
  getFeedbackAnalytics() {
    const feedbacks = this.getAllFeedbacks();
    const total = feedbacks.length;
    const avgRating = total > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / total).toFixed(1)
      : '5.0';

    const categoryCounts = {
      elogio: feedbacks.filter((f) => f.category === 'elogio').length,
      melhoria: feedbacks.filter((f) => f.category === 'melhoria').length,
      sugestao: feedbacks.filter((f) => f.category === 'sugestao').length,
      bug: feedbacks.filter((f) => f.category === 'bug').length,
    };

    return {
      total,
      avgRating,
      categoryCounts,
    };
  },
};
