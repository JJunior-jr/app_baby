import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Save,
  Clock,
  Calendar,
  User,
  Moon,
  Baby,
  Shirt,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { ActivityItem, ActivityType } from '../../types';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityItem | null;
  onSave: (id: string, updates: Partial<ActivityItem>) => void;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave,
}) => {
  if (!isOpen || !activity) return null;

  const [title, setTitle] = useState(activity.title || '');
  const [subtitle, setSubtitle] = useState(activity.subtitle || '');
  const [dateStr, setDateStr] = useState(activity.dateStr || '2026-08-19');
  const [timeStr, setTimeStr] = useState(activity.timeStr || '12:00');
  const [period, setPeriod] = useState<'Manhã' | 'Tarde' | 'Noite'>(
    activity.period || 'Noite'
  );
  const [assignee, setAssignee] = useState(activity.assignee || 'Papai');
  const [isInProgress, setIsInProgress] = useState(!!activity.isInProgress);

  // Type specific details state
  const [notes, setNotes] = useState(
    activity.details?.notes ||
    activity.details?.sleep?.notes ||
    activity.details?.breastfeeding?.notes ||
    activity.details?.diaper?.notes ||
    activity.details?.meal?.notes ||
    ''
  );

  const [formulaMl, setFormulaMl] = useState<number>(
    activity.details?.breastfeeding?.consumedMl ??
    activity.details?.breastfeeding?.formulaMl ??
    activity.details?.formulaMl ??
    120
  );

  const [durationMinutes, setDurationMinutes] = useState<number>(
    activity.durationMinutes ?? 45
  );

  const [diaperType, setDiaperType] = useState<'xixi' | 'coco' | 'ambos'>(
    (activity.details?.diaper?.diaperType as any) ??
    (activity.details?.diaperType as any) ??
    'ambos'
  );

  const [mealType, setMealType] = useState<'cafe' | 'almoco' | 'janta' | 'lanche'>(
    (activity.details?.meal?.mealType as any) ?? 'janta'
  );

  // Synchronize state whenever activity changes
  useEffect(() => {
    if (activity) {
      setTitle(activity.title || '');
      setSubtitle(activity.subtitle || '');
      setDateStr(activity.dateStr || '2026-08-19');
      setTimeStr(activity.timeStr || '12:00');
      setPeriod(activity.period || 'Noite');
      setAssignee(activity.assignee || 'Papai');
      setIsInProgress(!!activity.isInProgress);
      setDurationMinutes(activity.durationMinutes ?? 45);
      setFormulaMl(
        activity.details?.breastfeeding?.consumedMl ??
        activity.details?.breastfeeding?.formulaMl ??
        activity.details?.formulaMl ??
        120
      );
      setDiaperType(
        (activity.details?.diaper?.diaperType as any) ??
        (activity.details?.diaperType as any) ??
        'ambos'
      );
      setMealType((activity.details?.meal?.mealType as any) ?? 'janta');
      setNotes(
        activity.details?.notes ||
        activity.details?.sleep?.notes ||
        activity.details?.breastfeeding?.notes ||
        activity.details?.diaper?.notes ||
        activity.details?.meal?.notes ||
        ''
      );
    }
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedDetails = {
      ...(activity.details || {}),
      notes,
    };

    if (activity.type === 'amamentacao') {
      updatedDetails.formulaMl = formulaMl;
      if (updatedDetails.breastfeeding) {
        updatedDetails.breastfeeding = {
          ...updatedDetails.breastfeeding,
          consumedMl: formulaMl,
          formulaMl,
          notes,
        };
      }
    } else if (activity.type === 'sono') {
      if (updatedDetails.sleep) {
        updatedDetails.sleep = {
          ...updatedDetails.sleep,
          isInProgress,
          notes,
        };
      }
    } else if (activity.type === 'fralda') {
      updatedDetails.diaperType = diaperType;
      if (updatedDetails.diaper) {
        updatedDetails.diaper = {
          ...updatedDetails.diaper,
          diaperType,
          notes,
        };
      }
    } else if (activity.type === 'comeu') {
      if (updatedDetails.meal) {
        updatedDetails.meal = {
          ...updatedDetails.meal,
          mealType,
          notes,
        };
      }
    }

    onSave(activity.id, {
      title,
      subtitle,
      dateStr,
      timeStr,
      period,
      assignee,
      isInProgress,
      durationMinutes: activity.type === 'sono' ? durationMinutes : activity.durationMinutes,
      details: updatedDetails,
    });

    onClose();
  };

  const renderTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'sono':
        return <Moon className="w-5 h-5 text-amber-400" />;
      case 'amamentacao':
        return <Baby className="w-5 h-5 text-purple-300" />;
      case 'fralda':
        return <Shirt className="w-5 h-5 text-teal-300" />;
      case 'comeu':
        return <Utensils className="w-5 h-5 text-rose-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <section
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-[440px] landscape:max-w-xl bg-[#131526] rounded-3xl p-5 shadow-2xl border border-purple-500/20 max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <header className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1d2038] border border-white/10 flex items-center justify-center">
              {renderTypeIcon(activity.type)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                  Editar Atividade
                </h2>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  {activity.type}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Ajuste os dados e horários do registro
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de edição"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
              Título da atividade
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-[#1b1f3b] border border-[#2b3052] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
              Subtítulo / Descrição rápida
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: 120ml bebidos, peito esquerdo..."
              className="w-full bg-[#1b1f3b] border border-[#2b3052] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-300" />
                <span>Data</span>
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                required
                className="w-full bg-[#1b1f3b] border border-[#2b3052] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-300" />
                <span>Horário</span>
              </label>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                required
                className="w-full bg-[#1b1f3b] border border-[#2b3052] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Period & Assignee */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                Período
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full bg-[#1b1f3b] border border-[#2b3052] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                <option value="Manhã">Manhã (☀️)</option>
                <option value="Tarde">Tarde (🌅)</option>
                <option value="Noite">Noite (🌙)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-purple-300" />
                <span>Responsável</span>
              </label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Papai, Mamãe..."
                className="w-full bg-[#1b1f3b] border border-[#2b3052] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Type Specific Fields */}
          {activity.type === 'amamentacao' && (
            <div className="bg-[#181b33] p-3 rounded-2xl border border-purple-500/20 space-y-2">
              <span className="text-xs font-bold text-purple-200 block">
                Detalhes de Alimentação
              </span>
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-300 font-medium">Quantidade (ml):</label>
                <input
                  type="number"
                  value={formulaMl}
                  onChange={(e) => setFormulaMl(Number(e.target.value))}
                  min={0}
                  max={500}
                  step={5}
                  className="w-24 bg-[#111322] border border-[#2d3257] rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {activity.type === 'sono' && (
            <div className="bg-[#181b33] p-3 rounded-2xl border border-amber-500/20 space-y-2.5">
              <span className="text-xs font-bold text-amber-200 block">
                Detalhes do Sono
              </span>
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-300 font-medium">Duração (minutos):</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  min={1}
                  max={720}
                  className="w-24 bg-[#111322] border border-[#2d3257] rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isInProgress}
                  onChange={(e) => setIsInProgress(e.target.checked)}
                  className="rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                />
                <span>Bebê ainda dormindo (Em andamento)</span>
              </label>
            </div>
          )}

          {activity.type === 'fralda' && (
            <div className="bg-[#181b33] p-3 rounded-2xl border border-teal-500/20 space-y-2">
              <span className="text-xs font-bold text-teal-200 block">
                Tipo de Fralda
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['xixi', 'coco', 'ambos'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDiaperType(t)}
                    className={`py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                      diaperType === t
                        ? 'bg-teal-500 text-[#09171b] shadow-sm'
                        : 'bg-[#111322] text-gray-300 border border-[#2d3257]'
                    }`}
                  >
                    {t === 'ambos' ? 'Xixi + Cocô' : t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
              Observações / Notas
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Teve cólica leve, dormiu tranquilo..."
              className="w-full bg-[#1b1f3b] border border-[#2b3052] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400 no-scrollbar"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-[#1d2038] hover:bg-[#252a4a] text-gray-300 font-bold text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#9a7ffc] to-[#7b5cf8] hover:from-[#8d6ff8] hover:to-[#6d4be6] text-[#0f0c22] font-extrabold text-xs shadow-lg shadow-purple-900/40 transition active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Salvar alterações</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
