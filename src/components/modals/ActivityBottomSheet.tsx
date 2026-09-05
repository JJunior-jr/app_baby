import React from 'react';
import { Moon, Utensils, Baby, X } from 'lucide-react';
import { ActivityType } from '../../types';

interface ActivityBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectActivity: (type: ActivityType) => void;
}

export const ActivityBottomSheet: React.FC<ActivityBottomSheetProps> = ({
  isOpen,
  onClose,
  onSelectActivity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-xs transition-all">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Modal Container */}
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        role="dialog"
        className="relative w-full max-w-[430px] landscape:max-w-xl sm:max-w-md bg-[#151728]/95 backdrop-blur-2xl rounded-t-[36px] pt-3 pb-8 px-6 z-10 shadow-[0_-12px_45px_rgba(0,0,0,0.75)] border-t border-white/20 max-h-[85vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-5 duration-200"
      >
        {/* Drag handle indicator */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4"></div>

        {/* Modal Header */}
        <div className="relative text-center mb-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-0 top-0 p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-extrabold text-white tracking-tight" id="modal-title">
            Registrar atividade
          </h2>
          <p className="text-sm text-[#9ca3af] mt-1 font-normal">
            Selecione o tipo de atividade
          </p>
        </div>

        {/* 2x2 Activity Tiles Grid - Soft Frosted Glass */}
        <div className="grid grid-cols-2 gap-3.5 mb-3" data-purpose="activity-options-grid">
          {/* Card 1: Sono */}
          <button
            type="button"
            onClick={() => {
              onSelectActivity('sono');
            }}
            className="flex flex-col justify-between items-start h-[126px] p-4 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-yellow-600/10 backdrop-blur-xl border border-amber-300/30 hover:border-amber-300/50 active:scale-[0.98] transition-all text-left group shadow-[0_4px_24px_rgba(245,158,11,0.12)]"
          >
            <div className="text-amber-300 group-hover:scale-105 transition-transform">
              <Moon className="w-8 h-8 fill-current drop-shadow-sm" />
            </div>
            <span className="text-base font-bold text-amber-200 tracking-tight">
              Sono
            </span>
          </button>

          {/* Card 2: Amamentação */}
          <button
            type="button"
            onClick={() => {
              onSelectActivity('amamentacao');
            }}
            className="flex flex-col justify-between items-start h-[126px] p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-indigo-500/10 backdrop-blur-xl border border-purple-300/30 hover:border-purple-300/50 active:scale-[0.98] transition-all text-left group shadow-[0_4px_24px_rgba(139,92,246,0.12)]"
          >
            <div className="text-purple-300 group-hover:scale-105 transition-transform">
              <Baby className="w-8 h-8 drop-shadow-sm" />
            </div>
            <span className="text-base font-bold text-purple-200 tracking-tight">
              Amamentação
            </span>
          </button>

          {/* Card 3: Fralda */}
          <button
            type="button"
            onClick={() => {
              onSelectActivity('fralda');
            }}
            className="flex flex-col justify-between items-start h-[126px] p-4 rounded-2xl bg-gradient-to-br from-teal-400/20 via-emerald-400/15 to-cyan-500/10 backdrop-blur-xl border border-teal-300/30 hover:border-teal-300/50 active:scale-[0.98] transition-all text-left group shadow-[0_4px_24px_rgba(20,184,166,0.12)]"
          >
            <div className="text-teal-300 group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 drop-shadow-sm" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                <circle cx="9" cy="6" r="2.2"></circle>
                <path d="M6 11h6v4H6z"></path>
                <path d="M4 19h16"></path>
                <path d="M15 15h4v-3"></path>
                <path d="M9 15v4"></path>
                <path d="M12 11V9a2 2 0 0 0-2-2H8"></path>
              </svg>
            </div>
            <span className="text-base font-bold text-teal-200 tracking-tight">
              Fralda
            </span>
          </button>

          {/* Card 4: Comeu */}
          <button
            type="button"
            onClick={() => {
              onSelectActivity('comeu');
            }}
            className="flex flex-col justify-between items-start h-[126px] p-4 rounded-2xl bg-gradient-to-br from-rose-400/20 via-pink-500/15 to-orange-400/10 backdrop-blur-xl border border-rose-300/30 hover:border-rose-300/50 active:scale-[0.98] transition-all text-left group shadow-[0_4px_24px_rgba(244,63,94,0.12)]"
          >
            <div className="text-rose-300 group-hover:scale-105 transition-transform">
              <Utensils className="w-8 h-8 drop-shadow-sm" />
            </div>
            <span className="text-base font-bold text-rose-200 tracking-tight">
              Comeu
            </span>
          </button>
        </div>

        {/* Mobile home indicator bar */}
        <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-6"></div>
      </section>
    </div>
  );
};
