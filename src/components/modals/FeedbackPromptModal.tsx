import React, { useState } from 'react';
import {
  Star,
  MessageSquareHeart,
  X,
  Sparkles,
  Send,
  ThumbsUp,
  Lightbulb,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { FeedbackTargetFeature, UserFeedbackItem } from '../../types';
import { feedbackService, FeedbackPromptTrigger } from '../../services/feedback';

interface FeedbackPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerContext?: FeedbackPromptTrigger | null;
  userName?: string;
  userEmail?: string;
  onFeedbackSubmitted?: (item: UserFeedbackItem) => void;
}

const FEATURE_LABELS: Record<FeedbackTargetFeature, string> = {
  geral: 'Experiência Geral do App',
  amamentacao: 'Amamentação & Mamadeiras',
  sono: 'Cronômetro & Janelas de Sono',
  fralda: 'Registro de Fraldas',
  rotinas: 'Agendamentos da Rotina',
  calendario: 'Sincronização de Calendário (.ics / Google)',
  ia_insights: 'Insights de Desenvolvimento',
  lembretes: 'Lembretes e Notificações',
};

export const FeedbackPromptModal: React.FC<FeedbackPromptModalProps> = ({
  isOpen,
  onClose,
  triggerContext,
  userName = 'Papai/Mamãe',
  userEmail = '',
  onFeedbackSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<'elogio' | 'melhoria' | 'sugestao' | 'bug'>('melhoria');
  const [targetFeature, setTargetFeature] = useState<FeedbackTargetFeature>(
    triggerContext?.suggestedFeature || 'geral'
  );
  const [comment, setComment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() && rating === 0) return;

    const newItem = feedbackService.saveFeedback({
      rating,
      category,
      targetFeature,
      comment: comment.trim() || (rating >= 4 ? 'Excelente experiência!' : 'Sugestão registrada.'),
      userName,
      userEmail,
    });

    if (onFeedbackSubmitted) {
      onFeedbackSubmitted(newItem);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setComment('');
      onClose();
    }, 1700);
  };

  const handleSnooze = () => {
    feedbackService.snoozePrompt();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0" onClick={handleSnooze} />

      <section
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-[440px] landscape:max-w-lg rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-200 transition-colors max-h-[92vh]"
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
                <span>Avaliar Experiência</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">
                  Melhorias Contínuas
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                Sua opinião orienta os próximos passos do Baby John
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSnooze}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
            aria-label="Dispensar"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-white">Obrigado pelo seu feedback!</h3>
            <p className="text-xs text-gray-300 max-w-xs leading-relaxed">
              Registramos sua contribuição com sucesso. Nossa equipe usa esses dados para priorizar as
              melhorias no app.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 max-h-[66vh] no-scrollbar">
            {/* Dynamic context trigger banner */}
            {triggerContext?.headline && (
              <div
                className="p-3.5 rounded-2xl border text-xs space-y-1 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/20"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center space-x-1.5 text-purple-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{triggerContext.headline}</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-snug">
                  {triggerContext.subheadline}
                </p>
              </div>
            )}

            {/* Rating Stars */}
            <div className="space-y-1.5 text-center py-1">
              <label className="text-xs font-bold text-gray-200 block">
                Como você avalia o app até aqui?
              </label>
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1.5 transition active:scale-125 cursor-pointer"
                      aria-label={`${star} estrelas`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400">
                {rating === 5 && 'Adorando! Prático e intuitivo ❤️'}
                {rating === 4 && 'Muito bom, com pequenos ajustes 👍'}
                {rating === 3 && 'Razoável, precisa de melhorias ⚖️'}
                {rating === 2 && 'Com dificuldades de uso ⚠️'}
                {rating === 1 && 'Insatisfeito com a experiência ❌'}
              </p>
            </div>

            {/* Feedback Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-200 block">Tipo de Opinião</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'elogio', label: 'Elogio', icon: ThumbsUp, color: 'text-emerald-400' },
                  { id: 'melhoria', label: 'Melhoria', icon: Lightbulb, color: 'text-amber-400' },
                  { id: 'sugestao', label: 'Sugestão', icon: Sparkles, color: 'text-purple-300' },
                  { id: 'bug', label: 'Problema', icon: AlertCircle, color: 'text-rose-400' },
                ].map((item) => {
                  const isSelected = category === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id as any)}
                      className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600/30 border-purple-500 text-white shadow-xs'
                          : 'bg-[#151728] border-gray-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Feature Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-200 block">Funcionalidade Relacionada</label>
              <select
                value={targetFeature}
                onChange={(e) => setTargetFeature(e.target.value as FeedbackTargetFeature)}
                className="w-full px-3 py-2 rounded-xl bg-[#151728] border border-gray-800 text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
              >
                {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Textarea comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-200 block">
                O que você gostaria de nos dizer?
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte com detalhes o que funcionou bem ou o que poderíamos aprimorar para facilitar seu dia a dia..."
                rows={3}
                className="w-full p-3 rounded-2xl bg-[#151728] border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSnooze}
                className="flex-1 py-3 rounded-2xl bg-[#17192d] hover:bg-[#20233f] text-gray-300 font-bold text-xs border border-white/5 transition cursor-pointer"
              >
                Lembrar Mais Tarde
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                }}
                className="flex-1 py-3 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Opinião</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};
