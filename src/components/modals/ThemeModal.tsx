import React from 'react';
import { X, Palette, Type, Box } from 'lucide-react';
import { ThemeSelector } from '../ThemeSelector';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: 'colors' | 'typography' | 'shapes';
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  section,
}) => {
  if (!isOpen) return null;

  const getHeaderInfo = () => {
    switch (section) {
      case 'colors':
        return {
          title: 'Aparência · Cores 60/30/10',
          subtitle: 'Paletas de cores e distribuição harmônica',
          icon: Palette,
          color: 'text-purple-300',
        };
      case 'typography':
        return {
          title: 'Aparência · Tipografia',
          subtitle: 'Escolha a família de fontes do aplicativo',
          icon: Type,
          color: 'text-blue-300',
        };
      case 'shapes':
        return {
          title: 'Aparência · Formas & Brilho',
          subtitle: 'Ajuste o arredondamento dos cantos e brilho',
          icon: Box,
          color: 'text-amber-300',
        };
      default:
        return {
          title: 'Aparência',
          subtitle: 'Personalize a estética do aplicativo',
          icon: Palette,
          color: 'text-purple-300',
        };
    }
  };

  const header = getHeaderInfo();
  const Icon = header.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[480px] bg-[#0f172a] rounded-t-[32px] sm:rounded-3xl pt-3 pb-6 px-5 z-10 shadow-2xl border-t sm:border border-[#334155] max-h-[90vh] flex flex-col no-scrollbar animate-in slide-in-from-bottom-6 duration-200 text-white">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-3 shrink-0 sm:hidden" />

        {/* Clean Header */}
        <header className="flex items-center justify-between pb-3 mb-3 border-b border-[#334155] shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center ${header.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight">
                {header.title}
              </h2>
              <p className="text-[11px] text-gray-300 mt-0.5">{header.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600/50 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Content Body without redundant header tabs */}
        <div className="flex-1 overflow-y-auto no-scrollbar pr-0.5 space-y-4">
          <ThemeSelector
            initialTab={section}
            hideHeaderTabs={true}
          />
        </div>
      </div>
    </div>
  );
};
