/**
 * Serviço de Notificações Locais e Alertas em Segundo Plano (PWA & Service Worker)
 * Suporta permissão nativa, vibração, bipe sonoro suave e agendamento de lembretes da rotina.
 */

import { devicePermissionsService } from './devicePermissions';

export type ReminderType = 'soneca' | 'mamada' | 'fralda' | 'remedio' | 'custom';

export interface ScheduledReminder {
  id: string;
  type: ReminderType;
  title: string;
  message: string;
  targetTimestamp: number;
  createdAt: number;
  status: 'pending' | 'triggered' | 'cancelled';
}

type NotificationSubscriber = () => void;

const STORAGE_KEY = 'app_scheduled_reminders_v1';

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private reminders: ScheduledReminder[] = [];
  private checkIntervalId: number | null = null;
  private subscribers: Set<NotificationSubscriber> = new Set();
  private isInitialized = false;

  constructor() {
    this.loadReminders();
  }

  public async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Registra o Service Worker para suporte a notificações na tela de bloqueio
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        this.swRegistration = reg;
        console.log('Service Worker registrado com sucesso:', reg.scope);
      } catch (err) {
        console.warn('Falha ao registrar Service Worker:', err);
      }
    }

    // Inicia verificação periódica de alarmes e lembretes pendentes
    this.startCheckLoop();
  }

  public subscribe(listener: NotificationSubscriber): () => void {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  private notify() {
    this.subscribers.forEach((l) => l());
  }

  public getPermission(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const result = await Notification.requestPermission();
      this.notify();
      return result;
    } catch {
      return 'denied';
    }
  }

  /**
   * Envia uma notificação local instantânea (com som e vibração tátil)
   */
  public async sendNotification(title: string, body: string, type: ReminderType = 'custom') {
    // 1. Toca som e vibração no aparelho
    devicePermissionsService.playTestAlertSound();
    devicePermissionsService.triggerTestVibration();

    const options = {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `babyjohn-${type}-${Date.now()}`,
      vibrate: [250, 100, 250, 100, 350],
      data: {
        url: '/',
        type,
        timestamp: Date.now(),
      },
    } as NotificationOptions & { vibrate?: number[] };

    // 2. Dispara pelo Service Worker se disponível (melhor integração mobile)
    if (this.swRegistration && 'showNotification' in this.swRegistration) {
      try {
        await this.swRegistration.showNotification(title, options);
        return true;
      } catch (err) {
        console.warn('Falha no showNotification do Service Worker, tentando fallback:', err);
      }
    }

    // 3. Fallback para Notification API padrão
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, options);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      } catch (err) {
        console.warn('Falha no construtor de Notificação:', err);
      }
    }

    return false;
  }

  /**
   * Agenda um lembrete local para disparar daqui a N minutos
   */
  public scheduleReminder(
    type: ReminderType,
    title: string,
    message: string,
    minutesFromNow: number
  ): ScheduledReminder {
    const targetTimestamp = Date.now() + Math.max(0.1, minutesFromNow) * 60 * 1000;
    const reminder: ScheduledReminder = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      title,
      message,
      targetTimestamp,
      createdAt: Date.now(),
      status: 'pending',
    };

    this.reminders.unshift(reminder);
    this.saveReminders();
    this.notify();
    return reminder;
  }

  public cancelReminder(id: string) {
    this.reminders = this.reminders.map((r) =>
      r.id === id ? { ...r, status: 'cancelled' } : r
    );
    this.saveReminders();
    this.notify();
  }

  public deleteReminder(id: string) {
    this.reminders = this.reminders.filter((r) => r.id !== id);
    this.saveReminders();
    this.notify();
  }

  public clearAllReminders() {
    this.reminders = [];
    this.saveReminders();
    this.notify();
  }

  public getReminders(): ScheduledReminder[] {
    return [...this.reminders];
  }

  public getPendingReminders(): ScheduledReminder[] {
    return this.reminders.filter((r) => r.status === 'pending');
  }

  public getPendingCount(): number {
    return this.reminders.filter((r) => r.status === 'pending').length;
  }

  private loadReminders() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.reminders = JSON.parse(data);
      }
    } catch {
      this.reminders = [];
    }
  }

  private saveReminders() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reminders));
    } catch {
      // Ignora erro de cota
    }
  }

  private startCheckLoop() {
    if (this.checkIntervalId) return;

    this.checkIntervalId = window.setInterval(() => {
      const now = Date.now();
      let hasChanges = false;

      this.reminders.forEach((r) => {
        if (r.status === 'pending' && r.targetTimestamp <= now) {
          r.status = 'triggered';
          hasChanges = true;
          // Dispara notificação com som e vibração
          this.sendNotification(r.title, r.message, r.type);
        }
      });

      if (hasChanges) {
        this.saveReminders();
        this.notify();
      }
    }, 4000); // Checa a cada 4 segundos
  }
}

export const notificationService = new NotificationService();
