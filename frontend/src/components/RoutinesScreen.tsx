import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Bell,
  BellOff,
  Plus,
  Sun,
  Sunset,
  Moon,
  Baby,
  Utensils,
  Shirt,
  Sparkles,
  Calendar,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  MessageSquareHeart,
  Cloud,
} from 'lucide-react';

interface RoutinesScreenProps {
  onOpenCalendarSync?: () => void;
  onOpenDiagnostics?: () => void;
  onOpenFeedback?: () => void;
  onOpenOfflineSync?: () => void;
}

interface RoutineSchedule {
  id: string;
  time: string;
  title: string;
  category: 'sleep' | 'feed' | 'diaper' | 'bath' | 'play';
  period: 'Manhã' | 'Tarde' | 'Noite';
  completed: boolean;
  notify: boolean;
  notes?: string;
}

const INITIAL_ROUTINES: RoutineSchedule[] = [
  {
    id: 'r1',
    time: '07:00',
    title: 'Despertar & Troca matinal',
    category: 'diaper',
    period: 'Manhã',
    completed: true,
    notify: true,
    notes: 'Verificar temperatura e trocar fralda da noite',
  },
  {
    id: 'r2',
    time: '07:30',
    title: 'Primeira amamentação / Fórmula',
    category: 'feed',
    period: 'Manhã',
    completed: true,
    notify: true,
    notes: '150ml de fórmula ou 15min cada lado',
  },
  {
    id: 'r3',
    time: '09:00',
    title: 'Soneca matinal (Janela de sono)',
    category: 'sleep',
    period: 'Manhã',
    completed: true,
    notify: true,
    notes: 'Ambiente com ruído branco suave',
  },
  {
    id: 'r4',
    time: '12:00',
    title: 'Almoço: Papinha de legumes',
    category: 'feed',
    period: 'Tarde',
    completed: true,
    notify: true,
    notes: 'Introdução alimentar fase 1',
  },
  {
    id: 'r5',
    time: '13:30',
    title: 'Soneca da tarde',
    category: 'sleep',
    period: 'Tarde',
    completed: false,
    notify: true,
    notes: 'Duração estimada: 1h 30m',
  },
  {
    id: 'r6',
    time: '16:30',
    title: 'Banho morno & Estimulação',
    category: 'bath',
    period: 'Tarde',
    completed: false,
    notify: false,
    notes: 'Tommy time de 10 minutos',
  },
  {
    id: 'r7',
    time: '19:30',
    title: 'Janta & Ritual do sono',
    category: 'feed',
    period: 'Noite',
    completed: false,
    notify: true,
    notes: 'Diminuir luzes e falar baixo',
  },
  {
    id: 'r8',
    time: '21:00',
    title: 'Sono noturno contínuo',
    category: 'sleep',
    period: 'Noite',
    completed: false,
    notify: true,
    notes: 'Berço seguro e temperatura de 22°C',
  },
];

export const RoutinesScreen: React.FC<RoutinesScreenProps> = ({
  onOpenCalendarSync,
  onOpenDiagnostics,
  onOpenFeedback,
  onOpenOfflineSync,
}) => {
  const [routines, setRoutines] = useState<RoutineSchedule[]>(INITIAL_ROUTINES);
  const [filterPeriod, setFilterPeriod] = useState<string>('todos');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('15:00');
  const [newCategory, setNewCategory] = useState<'sleep' | 'feed' | 'diaper' | 'bath' | 'play'>('feed');

  const toggleComplete = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const toggleNotify = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, notify: !r.notify } : r))
    );
  };

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const hour = parseInt(newTime.split(':')[0], 10);
    const period = hour < 12 ? 'Manhã' : hour < 18 ? 'Tarde' : 'Noite';

    const newRoutine: RoutineSchedule = {
      id: `r-${Date.now()}`,
      time: newTime,
      title: newTitle.trim(),
      category: newCategory,
      period,
      completed: false,
      notify: true,
    };

    setRoutines((prev) => [...prev, newRoutine].sort((a, b) => a.time.localeCompare(b.time)));
    setNewTitle('');
    setIsAdding(false);
  };

  const completedCount = routines.filter((r) => r.completed).length;
  const progressPercent = Math.round((completedCount / routines.length) * 100);

  const displayedRoutines = routines.filter((r) => {
    if (filterPeriod === 'todos') return true;
    return r.period.toLowerCase() === filterPeriod;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep':
        return <Moon className="w-4 h-4 text-amber-400" />;
      case 'feed':
        return <Utensils className="w-4 h-4 text-rose-400" />;
      case 'diaper':
        return <Shirt className="w-4 h-4 text-teal-400" />;
      case 'bath':
        return <Sparkles className="w-4 h-4 text-blue-400" />;
      default:
        return <Baby className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4.5 pt-2 pb-6 space-y-4 no-scrollbar">
      
      {/* Screen Header */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
            Agendamentos Diários
          </h1>
          <p className="text-xs text-[#8c91af] mt-0.5">
            Rotina planejada para o desenvolvimento do John
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenOfflineSync && (
            <button
              type="button"
              onClick={onOpenOfflineSync}
              title="Sincronização Offline e Nuvem"
              className="p-2 rounded-xl bg-[#1e2238] hover:bg-[#2a2f4d] text-blue-300 border border-blue-500/20 flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <Cloud className="w-4 h-4" />
            </button>
          )}

          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              title="Opiniões e Sugestões da Rotina"
              className="p-2 rounded-xl bg-[#1e2238] hover:bg-[#2a2f4d] text-purple-300 border border-purple-500/20 flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <MessageSquareHeart className="w-4 h-4" />
            </button>
          )}

          {onOpenDiagnostics && (
            <button
              type="button"
              onClick={onOpenDiagnostics}
              title="Diagnóstico e Permissões do Celular"
              className="p-2 rounded-xl bg-[#1e2238] hover:bg-[#2a2f4d] text-purple-300 border border-purple-500/20 flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#9a7ffc] hover:bg-[#886cf2] text-[#131127] text-xs font-bold shadow-md shadow-purple-900/30 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </header>

      {/* Daily Progress Banner */}
      <section className="bg-[#151728] border border-[#262a44] rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-200">
          <span className="flex items-center gap-1.5 text-purple-300">
            <Clock className="w-4 h-4" />
            <span>Progresso da Rotina Diária</span>
          </span>
          <span className="text-emerald-400 font-extrabold">{progressPercent}% Concluído</span>
        </div>

        {/* Bar */}
        <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
          <span>{completedCount} de {routines.length} agendamentos finalizados</span>
          <span>Hoje, 19 de Agosto</span>
        </div>
      </section>

      {/* Calendar Integration Promo Banner */}
      {onOpenCalendarSync && (
        <section className="bg-gradient-to-r from-[#171b36] via-[#1c1d3c] to-[#142633] border border-purple-500/25 hover:border-purple-500/40 rounded-2xl p-3.5 shadow-sm transition-all flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white">Sincronizar com seu Celular</h3>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                  Novo
                </span>
              </div>
              <p className="text-[10px] text-gray-300 mt-0.5 leading-snug">
                Google Agenda • Microsoft Outlook • Calendário do Android
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCalendarSync}
            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow-md shadow-purple-900/30 transition cursor-pointer"
          >
            <span>Conectar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* Filter Tabs */}
      <section className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'todos', label: 'Todos os Horários' },
          { id: 'manhã', label: 'Manhã', icon: Sun },
          { id: 'tarde', label: 'Tarde', icon: Sunset },
          { id: 'noite', label: 'Noite', icon: Moon },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterPeriod(tab.id)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.8 rounded-full text-xs font-semibold transition shrink-0 ${
              filterPeriod === tab.id
                ? 'bg-[#7158e2] text-white shadow-sm'
                : 'bg-[#181a2d] border border-[#272a44] text-gray-300 hover:text-white'
            }`}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </section>

      {/* Form: Add new schedule */}
      {isAdding && (
        <form onSubmit={handleAddRoutine} className="bg-[#181b30] border border-purple-500/40 rounded-2xl p-4 space-y-3 animate-in fade-in-50">
          <h3 className="text-sm font-bold text-white">Criar Novo Horário</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Horário</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-[#121422] border border-gray-700 rounded-xl p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Categoria</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-[#121422] border border-gray-700 rounded-xl p-2 text-xs text-white"
              >
                <option value="feed">Alimentação</option>
                <option value="sleep">Sono</option>
                <option value="diaper">Fralda</option>
                <option value="bath">Banho</option>
                <option value="play">Brincadeira</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Título da Atividade</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: Passeio ao ar livre"
              className="w-full bg-[#121422] border border-gray-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-[#9a7ffc] hover:bg-[#886cf2] text-[#131127] text-xs font-bold"
            >
              Salvar Agendamento
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-xs text-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Routine Cards List */}
      <section className="space-y-2.5">
        {displayedRoutines.map((routine) => (
          <div
            key={routine.id}
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              routine.completed
                ? 'bg-[#131726]/70 border-emerald-900/40 opacity-75'
                : 'bg-[#151728] border-[#252842] shadow-sm'
            }`}
          >
            {/* Left: Checkbox + Time + Info */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => toggleComplete(routine.id)}
                title={routine.completed ? 'Marcar como pendente' : 'Marcar como concluído'}
                className="transition active:scale-90"
              >
                {routine.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950/60" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-500 hover:border-[#9a7ffc]" />
                )}
              </button>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-purple-300 font-mono tracking-tight">
                    {routine.time}
                  </span>
                  <span className={`text-sm font-bold ${routine.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {routine.title}
                  </span>
                </div>
                {routine.notes && (
                  <p className="text-[11px] text-gray-400 mt-0.5 max-w-[240px] truncate">
                    {routine.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Category badge + Calendar sync + Alarm toggle */}
            <div className="flex items-center space-x-1.5">
              {onOpenCalendarSync && (
                <button
                  type="button"
                  onClick={onOpenCalendarSync}
                  title="Sincronizar este horário com o calendário do celular (Google/Outlook/Android)"
                  className="w-8 h-8 rounded-xl bg-[#1e2238] hover:bg-[#292d4b] text-purple-300 flex items-center justify-center transition cursor-pointer active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="w-8 h-8 rounded-xl bg-[#1e2238] flex items-center justify-center">
                {getCategoryIcon(routine.category)}
              </div>

              <button
                type="button"
                onClick={() => toggleNotify(routine.id)}
                title={routine.notify ? 'Alarme ativado' : 'Alarme desativado'}
                className="p-1 text-gray-400 hover:text-amber-400 transition cursor-pointer"
              >
                {routine.notify ? (
                  <Bell className="w-4 h-4 text-amber-400" />
                ) : (
                  <BellOff className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
};
