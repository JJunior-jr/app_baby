import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar,
  Filter,
  Plus,
  Moon,
  Baby,
  Utensils,
  Shirt,
  MoreVertical,
  BarChart2,
  Trash2,
  Edit3,
  Sparkles,
  Droplets,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { ActivityItem, DailySummary } from '../types';
import { CalendarModal } from './modals/CalendarModal';
import { EditActivityModal } from './modals/EditActivityModal';
import { DiaryTopSummary } from './DiaryTopSummary';

interface DiaryScreenProps {
  activities: ActivityItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedFilter: string;
  onSelectFilter?: (filter: string) => void;
  onOpenFilterModal: () => void;
  onOpenActivitySheet: () => void;
  onDeleteActivity: (id: string) => void;
  onUpdateActivity?: (id: string, updates: Partial<ActivityItem>) => void;
  dailySummary: DailySummary;
  onOpenCalendarSync?: () => void;
}

export const DiaryScreen: React.FC<DiaryScreenProps> = ({
  activities,
  selectedDate,
  onSelectDate,
  selectedFilter,
  onSelectFilter,
  onOpenFilterModal,
  onOpenActivitySheet,
  onDeleteActivity,
  onUpdateActivity,
  dailySummary,
  onOpenCalendarSync,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedDayRef = useRef<HTMLButtonElement | null>(null);

  // Generate continuous list of days for current month (or centered around selected date)
  const daysList = useMemo(() => {
    const parsed = new Date(selectedDate + 'T12:00:00');
    const year = isNaN(parsed.getTime()) ? 2026 : parsed.getFullYear();
    const month = isNaN(parsed.getTime()) ? 7 : parsed.getMonth(); // 7 = August

    const totalDays = new Date(year, month + 1, 0).getDate();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const list = [];

    for (let d = 1; d <= totalDays; d++) {
      const dStr = String(d).padStart(2, '0');
      const mStr = String(month + 1).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      const dateObj = new Date(year, month, d, 12);
      const dayName = dayNames[dateObj.getDay()];
      list.push({ day: dayName, num: d, dateStr });
    }
    return list;
  }, [selectedDate]);

  // Compute activity counts by date for dot indicators
  const activityCountByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach((act) => {
      if (act.dateStr) {
        counts[act.dateStr] = (counts[act.dateStr] || 0) + 1;
      }
    });
    return counts;
  }, [activities]);

  // Auto-scroll selected day into view with smooth momentum
  useEffect(() => {
    if (selectedDayRef.current) {
      selectedDayRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedDate]);

  // Format selected date for display label
  const formattedDateLabel = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        const m = parseInt(parts[1], 10);
        const monthShortNames = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        const dateObj = new Date(parseInt(parts[0], 10), m - 1, d, 12);
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const dayName = dayNames[dateObj.getDay()];
        return `${dayName}, ${d} ${monthShortNames[m - 1]}`;
      }
    } catch {
      // fallback
    }
    return selectedDate;
  }, [selectedDate]);

  // Toggle filter by clicking summary icons
  const handleToggleFilter = (filterType: string) => {
    const nextFilter = selectedFilter === filterType ? 'all' : filterType;
    if (onSelectFilter) {
      onSelectFilter(nextFilter);
    }
  };

  // Filter activities based on date and filter
  const filteredActivities = activities.filter((act) => {
    const matchesDate = act.dateStr === selectedDate;
    if (!matchesDate) return false;
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'amamentacao') return act.type === 'amamentacao';
    if (selectedFilter === 'sono') return act.type === 'sono';
    if (selectedFilter === 'fralda') return act.type === 'fralda';
    if (selectedFilter === 'comeu' || selectedFilter === 'alimentacao') return act.type === 'comeu';
    return true;
  });

  // Group activities by period
  const periods = ['Noite', 'Tarde', 'Manhã'] as const;

  const renderIcon = (type: string, isCustom = false) => {
    switch (type) {
      case 'sono':
        return <Moon className="w-4 h-4 text-amber-400 fill-current" />;
      case 'amamentacao':
        return <Baby className="w-4 h-4 text-[#9b87f5]" />;
      case 'fralda':
        return <Shirt className="w-4 h-4 text-teal-300" />;
      case 'comeu':
        return <Utensils className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-300" />;
    }
  };

  const getFilterLabel = () => {
    switch (selectedFilter) {
      case 'amamentacao':
        return 'Amamentação';
      case 'sono':
        return 'Sono';
      case 'fralda':
        return 'Fralda';
      case 'comeu':
      case 'alimentacao':
        return 'Alimentação';
      case 'remedio':
        return 'Remédio';
      case 'humor':
        return 'Humor';
      default:
        return 'Todas as atividades';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      
      {/* Top Filter Pills Bar */}
      <section className="px-4.5 pt-2 pb-2 flex items-center space-x-2 shrink-0 overflow-x-auto no-scrollbar">
        {/* Filter button */}
        <button
          type="button"
          onClick={onOpenFilterModal}
          className={`flex items-center space-x-1.5 px-3.5 py-1.8 rounded-full text-xs font-semibold transition shrink-0 ${
            selectedFilter !== 'all' ? 'shadow-sm' : 'text-gray-200 hover:border-purple-400/50'
          }`}
          style={
            selectedFilter !== 'all'
              ? {
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                }
              : {
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: 'var(--color-border)',
                }
          }
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{getFilterLabel()}</span>
        </button>

        {/* Date scope button - opens calendar */}
        <button
          type="button"
          onClick={() => setIsCalendarModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-1.8 rounded-full border text-xs font-semibold text-gray-200 shrink-0 hover:border-purple-400/50 transition cursor-pointer"
          style={{
            backgroundColor: 'var(--color-secondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span>{formattedDateLabel}</span>
        </button>
      </section>

      {/* Week Day Strip Selector - Swipeable & Floating */}
      <section
        className="px-3.5 py-2.5 flex items-center shrink-0 border-b backdrop-blur-lg gap-2 transition-colors"
        style={{
          backgroundColor: 'var(--color-dominant)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Open Calendar Month Picker Button */}
        <button
          type="button"
          onClick={() => setIsCalendarModalOpen(true)}
          aria-label="Abrir calendário completo"
          title="Ver calendário do mês"
          className="w-11 h-16 rounded-2xl border flex flex-col items-center justify-center text-purple-300 hover:text-white shrink-0 transition-all duration-300 hover:-translate-y-1 active:scale-92 group cursor-pointer"
          style={{
            backgroundColor: 'var(--color-secondary)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--app-card-radius)',
          }}
        >
          <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-[8.5px] font-extrabold text-purple-300 mt-1 uppercase tracking-tighter">
            Mês
          </span>
        </button>

        {/* Scrollable / Swipeable Floating Days Strip */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto no-scrollbar scroll-smooth flex items-center space-x-2 py-1 px-1 touch-pan-x snap-x"
        >
          {daysList.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            const hasActivities = (activityCountByDate[d.dateStr] || 0) > 0;
            const isToday = d.dateStr === '2026-08-19';

            return (
              <button
                key={d.dateStr}
                ref={isSelected ? selectedDayRef : null}
                type="button"
                onClick={() => onSelectDate(d.dateStr)}
                className={`relative shrink-0 w-12 h-16 flex flex-col items-center justify-between py-2 px-1 transition-all duration-300 ease-out snap-center cursor-pointer select-none overflow-hidden ${
                  isSelected
                    ? 'font-black scale-105 -translate-y-1 shadow-lg ring-2 ring-purple-300/80'
                    : 'text-gray-400 hover:text-white border hover:-translate-y-1 active:scale-92'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-secondary)',
                  color: isSelected ? 'var(--color-accent-text)' : undefined,
                  borderColor: isSelected ? 'transparent' : 'var(--color-border)',
                  borderRadius: 'var(--app-card-radius)',
                }}
              >
                {/* Floating specular top highlight for liquid glass reflection */}
                <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

                {/* Day name */}
                <span
                  className={`text-[9.5px] uppercase tracking-wider relative z-10 ${
                    isSelected ? 'font-black text-[#0f0c22]' : 'font-semibold text-gray-400'
                  }`}
                >
                  {d.day}
                </span>

                {/* Day number */}
                <span
                  className={`text-base tracking-tight relative z-10 leading-none ${
                    isSelected
                      ? 'font-black text-[#0f0c22]'
                      : isToday
                      ? 'font-extrabold text-purple-200'
                      : 'font-extrabold text-gray-200'
                  }`}
                >
                  {d.num}
                </span>

                {/* Activity & Today Indicators */}
                <div className="flex items-center gap-1 relative z-10 h-2">
                  {isSelected ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f0c22]" />
                  ) : hasActivities ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.7)]" />
                  ) : isToday ? (
                    <span className="w-1 h-1 rounded-full bg-purple-300/60" />
                  ) : (
                    <span className="w-1 h-1 opacity-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Area: Timeline OR Empty State */}
      <div className="flex-1 overflow-y-auto px-4.5 pt-3 pb-32 no-scrollbar">
        {/* Top Summary: Ofertado/Consumido, Sono/Acordado, e Resumo Dinâmico em Tempo Real */}
        <DiaryTopSummary
          activities={activities}
          selectedDate={selectedDate}
          dailySummary={dailySummary}
        />

        {filteredActivities.length === 0 ? (
          /* Empty State matching Image 17 */
          <div className="flex flex-col items-center justify-center pt-10 px-4 text-center">
            {/* 3D-styled Badge/Illustration container */}
            <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#2d255c]/50 to-[#47348e]/20 blur-xl"></div>
              <div className="relative w-36 h-36 rounded-3xl bg-[#1a1d33] border border-[#3b366a]/70 flex flex-col items-center justify-center p-4 shadow-2xl">
                <span className="text-4xl mb-2">📋</span>
                <div className="flex items-center space-x-1 text-amber-300">
                  <span>⭐</span>
                  <span className="text-xs font-extrabold tracking-wider text-purple-200">BABY JOHN DIÁRIO</span>
                  <span>⭐</span>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight mb-1.5">
              A história de John começa aqui
            </h2>
            <p className="text-xs text-[#878ca5] max-w-xs leading-relaxed mb-6 font-normal">
              Faça o primeiro registro e ele aparece aqui na hora.
            </p>

            <button
              type="button"
              onClick={onOpenActivitySheet}
              className="px-6 py-3.5 rounded-2xl bg-[#9a7ffc] hover:bg-[#886cf2] text-[#131127] font-extrabold text-sm shadow-lg shadow-purple-900/30 active:scale-95 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Registrar agora</span>
            </button>
          </div>
        ) : (
          /* Timeline matching Image 1 & 23 */
          <div className="space-y-5">
            {periods.map((period) => {
              const periodActivities = filteredActivities.filter((a) => a.period === period);
              if (periodActivities.length === 0) return null;

              return (
                <section key={period} className="space-y-3">
                  {/* Period Header */}
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                      {period} {period === 'Noite' ? '🌙' : period === 'Tarde' ? '🌅' : '☀️'}
                    </span>
                    <div className="flex-1 h-[1px] bg-gray-800/80"></div>
                  </div>

                  {/* Vertical Timeline Track */}
                  <div className="relative pl-6 space-y-3 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#52449a] before:via-[#362f63] before:to-transparent">
                    {periodActivities.map((act) => (
                      <div key={act.id} className="relative">
                        {/* Timeline Node Bullet */}
                        <div
                          className={`absolute -left-6 top-3.5 w-3 h-3 rounded-full border-2 border-[#0c0d16] ${
                            act.type === 'sono'
                              ? 'bg-amber-400'
                              : act.type === 'amamentacao'
                              ? 'bg-[#9b87f5]'
                              : act.type === 'fralda'
                              ? 'bg-teal-400'
                              : act.type === 'comeu'
                              ? 'bg-rose-400'
                              : 'bg-purple-400'
                          }`}
                        />

                        {/* Card Container */}
                        <div
                          className={`p-3.5 border transition relative ${
                            act.type === 'fralda'
                              ? 'border-dashed border-teal-500/40'
                              : act.isInProgress
                              ? 'border-[#7663e8]/70 shadow-[0_0_12px_rgba(118,99,232,0.15)]'
                              : ''
                          }`}
                          style={{
                            backgroundColor: 'var(--color-secondary)',
                            borderColor: act.type === 'fralda' || act.isInProgress ? undefined : 'var(--color-border)',
                            borderRadius: 'var(--app-card-radius)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            {/* Title & Icon */}
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[#1f2238] flex items-center justify-center">
                                {renderIcon(act.type)}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                                    {act.title}
                                  </h3>
                                  {act.isInProgress && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9.5px] font-extrabold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                      Em andamento
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-[11px] text-gray-400 mt-0.5">
                                  <span>{act.timeStr}</span>
                                  {act.subtitle && (
                                    <>
                                      <span>·</span>
                                      <span className="text-purple-300">{act.subtitle}</span>
                                    </>
                                  )}
                                  {act.assignee && (
                                    <>
                                      <span>·</span>
                                      <span className="text-gray-400">{act.assignee}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 3-Dots Action Menu */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setActiveMenuId(activeMenuId === act.id ? null : act.id)}
                                aria-label="Mais opções"
                                className="p-1.5 text-gray-400 hover:text-white rounded-lg transition hover:bg-white/5 active:scale-95 cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuId === act.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setActiveMenuId(null)}
                                  />
                                  <div className="absolute right-0 top-7 w-36 bg-[#181a30]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 py-1.5 z-30 animate-in fade-in-50 zoom-in-95 duration-150">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingActivity(act);
                                        setIsEditModalOpen(true);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-200 hover:text-white hover:bg-purple-600/30 flex items-center space-x-2 transition cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-purple-300" />
                                      <span>Editar</span>
                                    </button>
                                    <div className="h-[1px] bg-white/5 my-1" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onDeleteActivity(act.id);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center space-x-2 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Excluir</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Extra Details preview if present */}
                          {act.details && (
                            <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[11px] text-gray-300">
                              {act.details.feeling && (
                                <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-purple-200">
                                  {act.details.feeling}
                                </span>
                              )}
                              {act.details.breastfeeding?.consumedMl != null ? (
                                <span className="px-2 py-0.5 rounded-md bg-blue-950/70 border border-blue-500/40 text-blue-200 font-bold flex items-center gap-1">
                                  🍼 {act.details.breastfeeding.consumedMl}ml bebidos ({act.details.breastfeeding.consumedPercentage}%)
                                </span>
                              ) : act.details.formulaMl ? (
                                <span className="px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-800/40 text-blue-200">
                                  🍼 {act.details.formulaMl}ml
                                </span>
                              ) : null}

                              {act.details.breastfeeding?.offeredMl != null && (
                                <span className="px-2 py-0.5 rounded-md bg-[#191d34] border border-[#2b3052] text-gray-300 text-[10.5px]">
                                  Ofertado: {act.details.breastfeeding.offeredMl}ml · Sobrou: {act.details.breastfeeding.leftoverMl ?? 0}ml
                                </span>
                              )}
                              {act.details.diaperType && (
                                <span className="px-2 py-0.5 rounded-md bg-teal-950/60 border border-teal-800/40 text-teal-200">
                                  Tipo: {act.details.diaperType}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Docked Day Summary Pill Bar with Clickable Filter Icons */}
      <section className="shrink-0 px-3 pt-1.5 pb-1 z-20 bg-gradient-to-t from-[#080913] via-[#080913]/95 to-transparent">
        {selectedFilter !== 'all' && (
          <div className="mb-1.5 flex items-center justify-between px-3 py-1 bg-[#1c1f38]/95 border border-purple-500/40 rounded-xl text-xs shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <span className="text-purple-200 flex items-center gap-1 font-medium text-[11px]">
              <span>🔍 Filtrando:</span>
              <strong className="text-white font-bold">{getFilterLabel()}</strong>
            </span>
            <button
              type="button"
              onClick={() => handleToggleFilter(selectedFilter)}
              className="text-[10.5px] font-bold text-purple-300 hover:text-white bg-purple-900/50 hover:bg-purple-800 px-2 py-0.5 rounded-lg transition cursor-pointer"
            >
              ✕ Limpar filtro
            </button>
          </div>
        )}

        <div className="bg-[#15172b]/95 backdrop-blur-md border border-[#2c3050] rounded-2xl p-2 shadow-2xl flex items-center justify-between gap-1.5">
          {/* 3 Clickable Filter Buttons for the Day Summary */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {/* Sono Total (Clicável para filtrar) */}
            <button
              type="button"
              onClick={() => handleToggleFilter('sono')}
              title={selectedFilter === 'sono' ? 'Remover filtro de sono' : 'Filtrar histórico por sono'}
              className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 border transition active:scale-95 ${
                selectedFilter === 'sono'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 shadow-md'
                  : 'bg-[#1d213b]/80 border-[#2b304f] text-gray-300 hover:bg-[#252a4a]'
              }`}
            >
              <Moon className={`w-3.5 h-3.5 shrink-0 ${selectedFilter === 'sono' ? 'fill-amber-300 text-amber-300' : 'text-amber-400'}`} />
              <div className="flex flex-col text-left min-w-0 leading-tight">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate">
                  Sono
                </span>
                <span className="text-[11px] font-extrabold text-white truncate">
                  {Math.floor(dailySummary.totalSleepMinutes / 60)}h{dailySummary.totalSleepMinutes % 60}m
                </span>
              </div>
            </button>

            {/* Amamentação / Mamadas (Clicável para filtrar) */}
            <button
              type="button"
              onClick={() => handleToggleFilter('amamentacao')}
              title={selectedFilter === 'amamentacao' ? 'Remover filtro de amamentação' : 'Filtrar histórico por mamadas'}
              className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 border transition active:scale-95 ${
                selectedFilter === 'amamentacao'
                  ? 'bg-purple-500/25 border-purple-400 text-purple-200 ring-2 ring-purple-400/40 shadow-md'
                  : 'bg-[#1d213b]/80 border-[#2b304f] text-gray-300 hover:bg-[#252a4a]'
              }`}
            >
              <Baby className={`w-3.5 h-3.5 shrink-0 ${selectedFilter === 'amamentacao' ? 'text-purple-300' : 'text-[#a38dfc]'}`} />
              <div className="flex flex-col text-left min-w-0 leading-tight">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate">
                  Mamadas
                </span>
                <span className="text-[11px] font-extrabold text-white truncate">
                  {dailySummary.breastfeedingSessions}x
                </span>
              </div>
            </button>

            {/* Fraldas (Clicável para filtrar) */}
            <button
              type="button"
              onClick={() => handleToggleFilter('fralda')}
              title={selectedFilter === 'fralda' ? 'Remover filtro de fraldas' : 'Filtrar histórico por fraldas'}
              className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 border transition active:scale-95 ${
                selectedFilter === 'fralda'
                  ? 'bg-teal-500/25 border-teal-400 text-teal-200 ring-2 ring-teal-400/40 shadow-md'
                  : 'bg-[#1d213b]/80 border-[#2b304f] text-gray-300 hover:bg-[#252a4a]'
              }`}
            >
              <Shirt className={`w-3.5 h-3.5 shrink-0 ${selectedFilter === 'fralda' ? 'text-teal-200' : 'text-teal-400'}`} />
              <div className="flex flex-col text-left min-w-0 leading-tight">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate">
                  Fraldas
                </span>
                <span className="text-[11px] font-extrabold text-white truncate">
                  {dailySummary.diaperChanges}x
                </span>
              </div>
            </button>
          </div>

          {/* Plus action button */}
          <button
            type="button"
            onClick={onOpenActivitySheet}
            aria-label="Registrar nova atividade"
            className="w-10 h-10 rounded-xl bg-[#9a7ffc] hover:bg-[#886cf2] text-[#131127] flex items-center justify-center shadow-lg shadow-purple-900/40 active:scale-95 transition shrink-0 ml-0.5 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.8]" />
          </button>
        </div>
      </section>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        activities={activities}
        onOpenCalendarSync={onOpenCalendarSync}
      />

      {/* Edit Activity Modal */}
      <EditActivityModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingActivity(null);
        }}
        activity={editingActivity}
        onSave={(id, updates) => {
          if (onUpdateActivity) {
            onUpdateActivity(id, updates);
          }
        }}
      />
    </div>
  );
};
