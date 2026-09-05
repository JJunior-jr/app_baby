import React from 'react';
import { Check, X, Moon, Baby, Utensils, Heart, Smile } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
}

interface FilterOption {
  id: string;
  name: string;
  iconBg: string;
  iconColor: string;
  iconType: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', name: 'Todas as Atividades', iconBg: '#393475', iconColor: '#c2b9fc', iconType: 'infinity' },
  { id: 'amamentacao', name: 'Amamentação', iconBg: '#441a34', iconColor: '#f44786', iconType: 'baby' },
  { id: 'sono', name: 'Sono', iconBg: '#16274e', iconColor: '#3b82f6', iconType: 'moon' },
  { id: 'fralda', name: 'Fralda', iconBg: '#442c12', iconColor: '#f59e0b', iconType: 'diaper' },
  { id: 'alimentacao', name: 'Alimentação', iconBg: '#452219', iconColor: '#ff6842', iconType: 'utensils' },
  { id: 'comeu', name: 'Comeu', iconBg: '#452219', iconColor: '#ff6842', iconType: 'utensils' },
  { id: 'remedio', name: 'Remédio', iconBg: '#143729', iconColor: '#10b981', iconType: 'med' },
  { id: 'humor', name: 'Humor', iconBg: '#3f3414', iconColor: '#eab308', iconType: 'smile' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  selectedFilter,
  onSelectFilter,
}) => {
  if (!isOpen) return null;

  const renderIcon = (type: string, color: string) => {
    switch (type) {
      case 'infinity':
        return (
          <svg className="w-5 h-5 stroke-[2.3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.273-8-5.096 0-5.096 8 0 8 5.14 0 7.178-8 12.273-8z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'baby':
        return <Baby className="w-5 h-5" />;
      case 'moon':
        return <Moon className="w-5 h-5 fill-current" />;
      case 'diaper':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 6h14a1 1 0 011 1v2c0 5-4.5 9-8 9s-8-4-8-9V7a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'utensils':
        return <Utensils className="w-5 h-5" />;
      case 'med':
        return <Heart className="w-5 h-5" />;
      case 'smile':
        return <Smile className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-xs transition-all">
      <div className="absolute inset-0" onClick={onClose} />

      <section
        aria-modal="true"
        role="dialog"
        className="relative w-full max-w-[430px] landscape:max-w-lg bg-[#181b30] rounded-t-[32px] pt-3 pb-8 px-5 shadow-[0_-10px_35px_rgba(0,0,0,0.85)] border-t border-slate-800/60 z-10 max-h-[85vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-5 duration-200"
      >
        {/* Drag Handle Indicator */}
        <div className="flex justify-center mb-3">
          <span className="w-10 h-1 bg-slate-600/60 rounded-full block" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-white text-[21px] font-bold tracking-tight">
            Filtrar por Atividade
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activities Filter List */}
        <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-0.5 no-scrollbar">
          {FILTER_OPTIONS.map((item, idx) => {
            const isSelected = selectedFilter === item.id;
            return (
              <React.Fragment key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectFilter(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all active:scale-[0.99] text-left ${
                    isSelected
                      ? 'bg-[#28264e]/90 border border-[#5b549e]/90'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                    >
                      {renderIcon(item.iconType, item.iconColor)}
                    </div>
                    <span
                      className={`text-[15px] ${
                        isSelected ? 'font-semibold text-[#c7befe]' : 'font-medium text-slate-100'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#9f8dfa] flex items-center justify-center mr-1 shadow-sm">
                      <Check className="w-3.5 h-3.5 text-[#181b30] stroke-[3]" />
                    </div>
                  )}
                </button>
                {idx === 0 && <div className="h-[1px] bg-slate-800/70 mx-1 my-1" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile bottom indicator */}
        <div className="w-full flex justify-center pt-5 pb-1">
          <div className="w-28 h-1 bg-slate-500/40 rounded-full" />
        </div>
      </section>
    </div>
  );
};
