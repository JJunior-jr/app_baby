import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { ActivityItem } from '../../types';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (dateStr: string) => void;
  activities: ActivityItem[];
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEK_DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  activities,
}) => {
  if (!isOpen) return null;

  // Parse currently selected date or default to 2026-08-19
  const initialDate = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date('2026-08-19T12:00:00');
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth() ?? 7); // 0-indexed, 7 is August

  // Count activities per dateStr
  const activityCountByDate: Record<string, number> = {};
  activities.forEach((act) => {
    if (act.dateStr) {
      activityCountByDate[act.dateStr] = (activityCountByDate[act.dateStr] || 0) + 1;
    }
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: Array<{
    dayNum: number;
    dateStr: string;
    isCurrentMonth: boolean;
    activityCount: number;
  }> = [];

  // Previous month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const mStr = String(prevMonthIdx + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${prevYear}-${mStr}-${dStr}`;
    calendarDays.push({
      dayNum: day,
      dateStr,
      isCurrentMonth: false,
      activityCount: activityCountByDate[dateStr] || 0,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${mStr}-${dStr}`;
    calendarDays.push({
      dayNum: day,
      dateStr,
      isCurrentMonth: true,
      activityCount: activityCountByDate[dateStr] || 0,
    });
  }

  // Next month padding days to complete grid rows
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= (remainingCells >= 7 ? remainingCells % 7 || 7 : remainingCells); day++) {
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const mStr = String(nextMonthIdx + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${nextYear}-${mStr}-${dStr}`;
    calendarDays.push({
      dayNum: day,
      dateStr,
      isCurrentMonth: false,
      activityCount: activityCountByDate[dateStr] || 0,
    });
  }

  const handleSelect = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  const handleSelectPreset = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <section
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-[420px] landscape:max-w-lg bg-[#121424] rounded-3xl p-5 shadow-2xl border border-purple-500/20 max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200"
      >
        {/* Header with Title and Close */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                Selecionar Data
              </h2>
              <p className="text-[11px] text-gray-400">
                Navegue pelos dias para ver o histórico
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar calendário"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Shortcuts */}
        <div className="flex items-center gap-1.5 py-3">
          <button
            type="button"
            onClick={() => handleSelectPreset('2026-08-19')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedDate === '2026-08-19'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#1a1d33] text-gray-300 hover:bg-[#222744]'
            }`}
          >
            Hoje (19 Ago)
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('2026-08-18')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedDate === '2026-08-18'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#1a1d33] text-gray-300 hover:bg-[#222744]'
            }`}
          >
            Ontem (18 Ago)
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('2026-08-17')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedDate === '2026-08-17'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#1a1d33] text-gray-300 hover:bg-[#222744]'
            }`}
          >
            Segunda (17 Ago)
          </button>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center justify-between bg-[#191c33] rounded-2xl px-3 py-2 border border-white/5 mb-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Mês anterior"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-extrabold text-white tracking-wide">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Próximo mês"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {WEEK_DAY_LABELS.map((w) => (
            <span key={w} className="text-[10px] font-bold text-gray-400 py-1 uppercase">
              {w}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarDays.map((item, idx) => {
            const isSelected = item.dateStr === selectedDate;
            const isToday = item.dateStr === '2026-08-19';

            return (
              <button
                key={`${item.dateStr}-${idx}`}
                type="button"
                onClick={() => handleSelect(item.dateStr)}
                className={`relative h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#9a7ffc] to-[#7b5cf8] text-[#110e24] font-extrabold scale-105 shadow-md shadow-purple-900/50 ring-2 ring-purple-300'
                    : item.isCurrentMonth
                    ? 'text-gray-200 hover:bg-[#1f2342] hover:text-white active:scale-95'
                    : 'text-gray-600 hover:text-gray-400 hover:bg-[#181b30]'
                } ${isToday && !isSelected ? 'border border-purple-500/50 font-bold text-purple-200' : ''}`}
              >
                <span className="text-xs leading-none">{item.dayNum}</span>

                {/* Activity badge or dot */}
                {item.activityCount > 0 && (
                  <div className="flex items-center gap-0.5 mt-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected
                          ? 'bg-[#110e24]'
                          : item.activityCount > 3
                          ? 'bg-amber-400 shadow-xs'
                          : 'bg-purple-400'
                      }`}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Dias com registros</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full border border-purple-400"></span>
            <span>Hoje</span>
          </div>
        </div>
      </section>
    </div>
  );
};
