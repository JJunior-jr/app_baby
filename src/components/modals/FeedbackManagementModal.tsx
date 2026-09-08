import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquareHeart,
  Star,
  Plus,
  ThumbsUp,
  Lightbulb,
  Sparkles,
  AlertCircle,
  Trash2,
  Filter,
  BarChart3,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { UserFeedbackItem, FeedbackTargetFeature } from '../../types';
import { feedbackService } from '../../services/feedback';

interface FeedbackManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewFeedback: () => void;
}

const FEATURE_LABELS: Record<FeedbackTargetFeature, string> = {
  geral: 'Geral',
  amamentacao: 'Amamentação',
  sono: 'Sono & Janelas',
  fralda: 'Fraldas',
  rotinas: 'Rotinas',
  calendario: 'Calendário',
  ia_insights: 'Insights IA',
  lembretes: 'Lembretes',
};

export const FeedbackManagementModal: React.FC<FeedbackManagementModalProps> = ({
  isOpen,
  onClose,
  onOpenNewFeedback,
}) => {
  const [feedbacks, setFeedbacks] = useState<UserFeedbackItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'elogio' | 'melhoria' | 'sugestao' | 'bug'>('todos');
  const [analytics, setAnalytics] = useState<{
    total: number;
    avgRating: string;
    categoryCounts: { elogio: number; melhoria: number; sugestao: number; bug: number };
  }>({
    total: 0,
    avgRating: '5.0',
    categoryCounts: { elogio: 0, melhoria: 0, sugestao: 0, bug: 0 },
  });

  const loadData = () => {
    const list = feedbackService.getAllFeedbacks();
    setFeedbacks(list);
    setAnalytics(feedbackService.getFeedbackAnalytics());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    feedbackService.deleteFeedback(id);
    loadData();
  };

  const filtered = selectedFilter === 'todos'
    ? feedbacks
    : feedbacks.filter((f) => f.category === selectedFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <section
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-[460px] landscape:max-w-xl rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-200 transition-colors max-h-[92vh]"
        style={{
          backgroundColor: 'var(--color-dominant)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <header
          className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/5 shrink-0"
          style={{ backgroundColor: 'var(--color-dominant)' }}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
              }}
            >
              <MessageSquareHeart className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-tight flex items-center gap-1.5">
                <span>Central de Opiniões & Sugestões</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                  {analytics.total} avaliaç{analytics.total === 1 ? 'ão' : 'ões'}
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                Dados coletados com base nas interações de uso na plataforma
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[68vh] no-scrollbar">
          {/* Analytics Summary Card */}
          <div
            className="p-3.5 rounded-2xl border space-y-2.5"
            style={{
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>Métricas de Satisfação (CSAT)</span>
              </span>
              <div className="flex items-center gap-1 text-amber-400 font-extrabold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{analytics.avgRating} / 5.0</span>
              </div>
            </div>

            {/* Quick counters grid */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-black/30 border border-white/5 text-center">
                <div className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-emerald-400" />
                  <span>Elogios</span>
                </div>
                <span className="text-sm font-bold text-white mt-0.5 block">{analytics.categoryCounts.elogio}</span>
              </div>

              <div className="p-2 rounded-xl bg-black/30 border border-white/5 text-center">
                <div className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-400" />
                  <span>Melhorias</span>
                </div>
                <span className="text-sm font-bold text-white mt-0.5 block">{analytics.categoryCounts.melhoria}</span>
              </div>

              <div className="p-2 rounded-xl bg-black/30 border border-white/5 text-center">
                <div className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-300" />
                  <span>Ideias</span>
                </div>
                <span className="text-sm font-bold text-white mt-0.5 block">{analytics.categoryCounts.sugestao}</span>
              </div>

              <div className="p-2 rounded-xl bg-black/30 border border-white/5 text-center">
                <div className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span>Bugs</span>
                </div>
                <span className="text-sm font-bold text-white mt-0.5 block">{analytics.categoryCounts.bug}</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'todos', label: 'Todas' },
              { id: 'elogio', label: 'Elogios' },
              { id: 'melhoria', label: 'Melhorias' },
              { id: 'sugestao', label: 'Sugestões' },
              { id: 'bug', label: 'Problemas' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-[#151728] text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Feedbacks List */}
          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                Nenhuma opinião encontrada para esta categoria.
              </div>
            ) : (
              filtered.map((item) => {
                const featureLabel = FEATURE_LABELS[item.targetFeature] || item.targetFeature;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border text-xs space-y-2 relative group"
                    style={{
                      backgroundColor: 'var(--color-secondary)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= item.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-700'
                              }`}
                            />
                          ))}
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider ${
                            item.category === 'elogio'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : item.category === 'melhoria'
                              ? 'bg-amber-500/20 text-amber-300'
                              : item.category === 'sugestao'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {item.category}
                        </span>

                        <span className="text-[10px] text-gray-400">
                          em <strong>{featureLabel}</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="opacity-60 hover:opacity-100 text-gray-400 hover:text-rose-400 transition cursor-pointer p-1"
                        title="Remover avaliação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11.5px] text-gray-200 leading-relaxed">
                      "{item.comment}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                      <span>Por {item.userName || 'Usuário'}</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {item.sessionDurationMinutes}min no app · {item.interactionCount} ações
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <footer
          className="p-4 pt-3 pb-5 border-t border-white/5 flex items-center gap-2.5 shrink-0"
          style={{ backgroundColor: 'var(--color-dominant)' }}
        >
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenNewFeedback();
            }}
            className="flex-1 py-3.5 rounded-2xl bg-[#1d2038] hover:bg-[#282c4d] active:scale-[0.99] text-purple-200 font-bold text-xs border border-purple-500/30 flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Enviar Minha Opinião Agora</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
            }}
            className="px-6 py-3.5 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center transition cursor-pointer active:scale-[0.99]"
          >
            <span>Concluído</span>
          </button>
        </footer>
      </section>
    </div>
  );
};
