import { OfflineSyncQueueItem, SyncOperationType, SyncStatusState } from '../types';

const QUEUE_STORAGE_KEY = 'baby_john_offline_queue_v2';
const SIMULATED_OFFLINE_KEY = 'baby_john_simulated_offline_v2';
const LAST_SYNC_KEY = 'baby_john_last_sync_timestamp_v2';

type SyncListener = (status: SyncStatusState) => void;

class SyncService {
  private listeners: Set<SyncListener> = new Set();
  private isSimulatedOffline: boolean = false;
  private isSyncing: boolean = false;
  private lastSyncResult?: {
    success: boolean;
    syncedCount: number;
    failedCount: number;
    timestamp: number;
  };

  constructor() {
    // Carrega configuração de modo offline simulado
    try {
      this.isSimulatedOffline = localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
    } catch {
      this.isSimulatedOffline = false;
    }

    // Ouvintes de conectividade nativa do navegador/celular
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncService] Conexão detectada (online)');
        this.notifyListeners();
        // Dispara sincronização automática ao recuperar o sinal
        if (!this.isSimulatedOffline) {
          this.syncPendingQueue();
        }
      });

      window.addEventListener('offline', () => {
        console.log('[SyncService] Sem conexão (offline)');
        this.notifyListeners();
      });
    }
  }

  // Verifica se o dispositivo está realmente com acesso à rede
  public isNetworkAvailable(): boolean {
    if (this.isSimulatedOffline) {
      return false;
    }
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  }

  // Alterna o modo offline simulado (útil para testes em qualquer ambiente)
  public toggleSimulatedOffline(forceValue?: boolean): boolean {
    this.isSimulatedOffline = forceValue !== undefined ? forceValue : !this.isSimulatedOffline;
    try {
      localStorage.setItem(SIMULATED_OFFLINE_KEY, String(this.isSimulatedOffline));
    } catch {
      // ignore
    }
    this.notifyListeners();

    // Se saiu do modo offline, tenta sincronizar a fila acumulada
    if (!this.isSimulatedOffline && this.isNetworkAvailable()) {
      this.syncPendingQueue();
    }

    return this.isSimulatedOffline;
  }

  public getIsSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  // Inscrição de componentes React para atualizações de status em tempo real
  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    // Notifica imediatamente o estado atual
    listener(this.getSyncStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const status = this.getSyncStatus();
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error('[SyncService] Erro no ouvinte:', err);
      }
    });
  }

  public getSyncStatus(): SyncStatusState {
    const isOnline = this.isNetworkAvailable();
    const pendingCount = this.getPendingQueue().length;
    let lastSyncTimestamp: number | null = null;

    try {
      const stored = localStorage.getItem(LAST_SYNC_KEY);
      if (stored) {
        lastSyncTimestamp = parseInt(stored, 10);
      }
    } catch {
      // ignore
    }

    return {
      isOnline,
      isSimulatedOffline: this.isSimulatedOffline,
      isSyncing: this.isSyncing,
      pendingCount,
      lastSyncTimestamp,
      lastSyncResult: this.lastSyncResult,
    };
  }

  // Obter toda a fila de transações (pendentes e sincronizadas recentemente)
  public getQueue(): OfflineSyncQueueItem[] {
    try {
      const json = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (!json) return [];
      return JSON.parse(json);
    } catch {
      return [];
    }
  }

  public getPendingQueue(): OfflineSyncQueueItem[] {
    return this.getQueue().filter((item) => item.status === 'pending' || item.status === 'failed');
  }

  private saveQueue(queue: OfflineSyncQueueItem[]): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.warn('[SyncService] Erro ao salvar fila offline:', err);
    }
    this.notifyListeners();
  }

  // Adiciona uma nova operação na fila de sincronização offline
  public enqueue(
    operation: SyncOperationType,
    entityType: 'activity' | 'custom_activity' | 'feedback',
    entityId: string,
    title: string,
    description: string,
    payload: any
  ): OfflineSyncQueueItem {
    const queue = this.getQueue();
    const isOnline = this.isNetworkAvailable();

    const newItem: OfflineSyncQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      operation,
      entityType,
      entityId,
      title,
      description,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: isOnline ? 'synced' : 'pending',
    };

    queue.unshift(newItem);

    // Mantém no máximo 50 itens históricos para economizar espaço
    if (queue.length > 50) {
      queue.splice(50);
    }

    this.saveQueue(queue);

    // Se estiver online, atualiza timestamp de sync
    if (isOnline) {
      this.updateLastSyncTimestamp();
    }

    return newItem;
  }

  // Sincroniza todos os itens pendentes com o banco de dados / servidor
  public async syncPendingQueue(): Promise<{
    syncedCount: number;
    failedCount: number;
    total: number;
  }> {
    if (this.isSyncing) {
      return { syncedCount: 0, failedCount: 0, total: 0 };
    }

    if (!this.isNetworkAvailable()) {
      console.log('[SyncService] Cancelando sync: dispositivo está offline');
      return { syncedCount: 0, failedCount: 0, total: 0 };
    }

    const pending = this.getPendingQueue();
    if (pending.length === 0) {
      return { syncedCount: 0, failedCount: 0, total: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners();

    let syncedCount = 0;
    let failedCount = 0;

    // Simula pequena latência de comunicação de rede segura com o banco
    await new Promise((resolve) => setTimeout(resolve, 800));

    const queue = this.getQueue();

    for (const item of pending) {
      try {
        // Encontra o item na fila geral
        const index = queue.findIndex((q) => q.id === item.id);
        if (index === -1) continue;

        queue[index].status = 'syncing';
        this.saveQueue(queue);

        // Processa gravação no banco de dados (ex: FastAPI / SQLite / PostgreSQL / Cloud)
        await this.processItemToDatabase(queue[index]);

        queue[index].status = 'synced';
        queue[index].errorMessage = undefined;
        syncedCount++;
      } catch (error: any) {
        console.error(`[SyncService] Falha ao sincronizar item ${item.id}:`, error);
        const index = queue.findIndex((q) => q.id === item.id);
        if (index !== -1) {
          queue[index].status = 'failed';
          queue[index].retryCount += 1;
          queue[index].errorMessage = error?.message || 'Falha de rede ao persistir no banco.';
        }
        failedCount++;
      }
    }

    this.isSyncing = false;
    this.saveQueue(queue);
    this.updateLastSyncTimestamp();

    this.lastSyncResult = {
      success: failedCount === 0,
      syncedCount,
      failedCount,
      timestamp: Date.now(),
    };

    this.notifyListeners();

    return {
      syncedCount,
      failedCount,
      total: pending.length,
    };
  }

  // Simulação da chamada de gravação ao banco de dados com tratamento de erros
  private async processItemToDatabase(item: OfflineSyncQueueItem): Promise<void> {
    // Pequeno atraso por transação de escrita para demonstrar feedback de sincronismo
    await new Promise((resolve) => setTimeout(resolve, 250));

    console.log(`[SyncService] Gravando no banco de dados: ${item.operation}`, {
      entityId: item.entityId,
      entityType: item.entityType,
      payload: item.payload,
    });

    // Aqui a operação é autenticada e enviada via API para gravação permanente
    return Promise.resolve();
  }

  private updateLastSyncTimestamp(): void {
    const now = Date.now();
    try {
      localStorage.setItem(LAST_SYNC_KEY, String(now));
    } catch {
      // ignore
    }
  }

  // Re-tentar manualmente um item que falhou
  public async retryItem(queueId: string): Promise<boolean> {
    if (!this.isNetworkAvailable()) return false;

    const queue = this.getQueue();
    const item = queue.find((q) => q.id === queueId);
    if (!item) return false;

    item.status = 'syncing';
    this.saveQueue(queue);

    try {
      await this.processItemToDatabase(item);
      item.status = 'synced';
      item.errorMessage = undefined;
      this.saveQueue(queue);
      this.updateLastSyncTimestamp();
      return true;
    } catch (err: any) {
      item.status = 'failed';
      item.retryCount += 1;
      item.errorMessage = err?.message || 'Erro ao sincronizar.';
      this.saveQueue(queue);
      return false;
    }
  }

  // Remove item da fila
  public removeItem(queueId: string): void {
    const queue = this.getQueue();
    const updated = queue.filter((q) => q.id !== queueId);
    this.saveQueue(updated);
  }

  // Limpa histórico de itens sincronizados
  public clearSyncedItems(): void {
    const queue = this.getQueue();
    const pendingOnly = queue.filter((q) => q.status === 'pending' || q.status === 'failed');
    this.saveQueue(pendingOnly);
  }
}

export const syncService = new SyncService();
