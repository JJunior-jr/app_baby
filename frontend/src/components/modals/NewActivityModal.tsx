import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Touchpad,
  Pencil,
  Baby,
  Utensils,
  Droplets,
  Moon,
  Shield,
  Car,
  Heart,
  Smile,
  Target,
  Sparkles,
  Home,
  Check,
  Package,
} from 'lucide-react';
import { CustomActivityDefinition } from '../../types';

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (def: Omit<CustomActivityDefinition, 'id'>) => void;
}

const AVAILABLE_ICONS = [
  { id: 'baby', icon: Baby },
  { id: 'utensils', icon: Utensils },
  { id: 'droplets', icon: Droplets },
  { id: 'moon', icon: Moon },
  { id: 'shield', icon: Shield },
  { id: 'car', icon: Car },
  { id: 'smile', icon: Smile },
  { id: 'target', icon: Target },
  { id: 'heart', icon: Heart },
  { id: 'sparkles', icon: Sparkles },
  { id: 'home', icon: Home },
  { id: 'package', icon: Package },
];

export const NewActivityModal: React.FC<NewActivityModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'time' | 'instant'>('time');
  const [selectedIcon, setSelectedIcon] = useState('smile');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      type,
      icon: selectedIcon,
      isDefault: false,
      description: type === 'time' ? 'Atividade com tempo' : 'Atividade instantânea',
    });
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[430px] landscape:max-w-lg h-auto max-h-[90vh] bg-[#0c0d16] rounded-3xl flex flex-col justify-between overflow-y-auto shadow-2xl border border-gray-800 animate-in zoom-in-95 duration-200">
        
        {/* Navigation Header */}
        <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Voltar"
            className="p-1.5 -ml-1 text-gray-300 hover:text-white transition active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-lg font-bold text-white tracking-tight">Nova Atividade</h1>
          <div className="w-6 h-6" />
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 no-scrollbar">
          {/* Baby Selector */}
          <section className="space-y-2.5">
            <h3 className="text-sm font-semibold text-gray-300">Para qual bebê?</h3>
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full bg-[#1e233d] border-2 border-[#9a7ffc] flex items-center justify-center text-white shadow-md">
                <span className="text-xl">👶</span>
              </div>
              <div>
                <span className="text-base font-bold text-white block">John</span>
                <span className="text-xs text-gray-400">4 meses</span>
              </div>
            </div>
          </section>

          {/* Activity Name with Floating Label */}
          <section className="pt-1">
            <div className="relative bg-[#151728] rounded-2xl border-2 border-[#9a7ffc]/80 p-3.5 flex items-center space-x-3 shadow-[0_0_15px_rgba(154,127,252,0.15)]">
              <label className="absolute -top-2.5 left-4 bg-[#0c0d16] px-2 text-[11px] font-medium text-[#9a7ffc] tracking-tight">
                Nome da Atividade
              </label>
              <Pencil className="w-4 h-4 text-[#9a7ffc] shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Brincadeira no Tapete"
                className="w-full bg-transparent text-white text-base tracking-wide focus:outline-none placeholder-gray-500"
              />
            </div>
          </section>

          {/* Record Type (Com Tempo vs Instantânea) */}
          <section className="space-y-2.5">
            <h3 className="text-sm font-semibold text-gray-300">Tipo de Registro</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Com Tempo */}
              <button
                type="button"
                onClick={() => setType('time')}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                  type === 'time'
                    ? 'bg-[#1e1d3d] border-2 border-[#9a7ffc] text-white shadow-md'
                    : 'bg-[#151728] border border-[#23263e] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Clock className={`w-7 h-7 mb-2 ${type === 'time' ? 'text-[#9a7ffc]' : 'text-gray-400'}`} />
                <span className="text-sm font-bold text-white">Com Tempo</span>
                <span className="text-[11px] text-gray-400 mt-0.5">Início/Fim</span>
              </button>

              {/* Instantânea */}
              <button
                type="button"
                onClick={() => setType('instant')}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                  type === 'instant'
                    ? 'bg-[#1e1d3d] border-2 border-[#9a7ffc] text-white shadow-md'
                    : 'bg-[#151728] border border-[#23263e] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Touchpad className={`w-7 h-7 mb-2 ${type === 'instant' ? 'text-[#9a7ffc]' : 'text-gray-400'}`} />
                <span className="text-sm font-bold text-white">Instantânea</span>
                <span className="text-[11px] text-gray-400 mt-0.5">Único Clique</span>
              </button>
            </div>
          </section>

          {/* Choose Icon Grid */}
          <section className="space-y-2.5">
            <h3 className="text-sm font-semibold text-gray-300">Escolha um Ícone</h3>
            <div className="grid grid-cols-6 sm:grid-cols-6 gap-2.5">
              {AVAILABLE_ICONS.map(({ id, icon: IconComp }) => {
                const isSelected = selectedIcon === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedIcon(id)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#9a7ffc] text-[#131127] scale-105 shadow-md shadow-purple-900/40'
                        : 'bg-[#151728] border border-[#23263e] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <IconComp className="w-5 h-5 stroke-[2]" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Bottom CTA Button */}
        <footer className="p-5 pt-2 pb-6 bg-[#0c0d16] border-t border-white/5">
          <button
            type="button"
            disabled={!name.trim()}
            onClick={handleCreate}
            className={`w-full py-4 rounded-2xl font-extrabold text-base transition flex items-center justify-center space-x-2 ${
              name.trim()
                ? 'bg-[#9a7ffc] hover:bg-[#886cf2] text-[#131127] shadow-lg shadow-purple-900/30 active:scale-[0.99]'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Criar Atividade</span>
          </button>
        </footer>

      </div>
    </div>
  );
};
