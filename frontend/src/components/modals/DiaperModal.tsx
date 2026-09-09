import React, { useState } from 'react';
import { X, Calendar, Edit3, Droplets, Check } from 'lucide-react';

interface DiaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    diaperType: 'xixi' | 'coco' | 'ambos';
    stoolColor?: string;
    consistency?: 'Normal' | 'Ressecado' | 'Líquido' | 'Com muco';
    notes?: string;
  }) => void;
}

const STOOL_COLORS = [
  { id: '#d69917', name: 'Mostarda' },
  { id: '#759827', name: 'Verde oliva' },
  { id: '#5f381c', name: 'Castanho escuro' },
  { id: '#cfb18b', name: 'Bege claro' },
  { id: '#991712', name: 'Vermelho' },
];

export const DiaperModal: React.FC<DiaperModalProps> = ({ isOpen, onClose, onSave }) => {
  const [diaperType, setDiaperType] = useState<'xixi' | 'coco' | 'ambos'>('ambos');
  const [stoolColor, setStoolColor] = useState<string>('#d69917');
  const [consistency, setConsistency] = useState<'Normal' | 'Ressecado' | 'Líquido' | 'Com muco'>('Normal');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      diaperType,
      stoolColor: diaperType !== 'xixi' ? stoolColor : undefined,
      consistency: diaperType !== 'xixi' ? consistency : undefined,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[430px] landscape:max-w-lg h-auto max-h-[90vh] bg-[#0d0f19] rounded-3xl flex flex-col justify-between overflow-y-auto shadow-2xl border border-gray-800 animate-in zoom-in-95 duration-200">
        
        {/* Navigation Header */}
        <header className="relative px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 -ml-1 text-gray-300 hover:text-white transition rounded-xl hover:bg-white/5"
          >
            <X className="w-6 h-6 stroke-[2.2]" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-white">Registrar Fralda</h1>
            <p className="text-xs text-gray-400 mt-0.5">Hoje · Agora</p>
          </div>
          <div className="w-6 h-6 text-xl">👶</div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar">
          {/* Activity Heading */}
          <section className="flex items-center gap-3.5 pt-1">
            <div className="w-13 h-13 min-w-[50px] min-h-[50px] rounded-2xl bg-[#142922] border border-[#1b3d32]/60 flex items-center justify-center text-[#2ac289]">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M7 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-3 8v9a1 1 0 1 0 2 0v-7h3v7a1 1 0 1 0 2 0v-9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1zm8.5 0h8a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1zm5.5 3c-1.1 0-2-.9-2-2h-2c0 2.21 1.79 4 4 4s4-1.79 4-4h-2c0 1.1-.9 2-2 2z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">Fralda</h2>
              <p className="text-xs text-gray-400 font-medium">Como estava a fralda do John?</p>
            </div>
          </section>

          {/* Timestamp Card */}
          <section className="bg-[#1a1d2e] rounded-2xl p-4 flex items-center justify-between border border-[#23273c]">
            <div className="flex items-center gap-3.5">
              <div className="text-[#2ac289]">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[11px] text-gray-400 leading-tight">Quando aconteceu</span>
                <span className="block text-sm font-semibold text-white mt-0.5">19 de ago. · 23:10</span>
              </div>
            </div>
            <button type="button" aria-label="Editar data e hora" className="text-gray-500 hover:text-gray-300 p-1">
              <Edit3 className="w-4 h-4" />
            </button>
          </section>

          {/* Diaper Type Section */}
          <section>
            <h3 className="text-sm font-bold text-white mb-2.5">Tipo de fralda</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Option 1: Xixi */}
              <button
                type="button"
                onClick={() => setDiaperType('xixi')}
                className={`h-26 sm:h-28 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  diaperType === 'xixi'
                    ? 'bg-[#121c22] border-2 border-[#2ac289] shadow-sm'
                    : 'bg-[#1b1e2f] border border-transparent hover:bg-[#202438]'
                }`}
              >
                <div className="mb-2">
                  <Droplets className="w-7 h-7 text-[#34b3f5] fill-current" />
                </div>
                <span className={`text-xs font-bold ${diaperType === 'xixi' ? 'text-[#2ac289]' : 'text-gray-300'}`}>
                  Xixi
                </span>
              </button>

              {/* Option 2: Cocô */}
              <button
                type="button"
                onClick={() => setDiaperType('coco')}
                className={`h-26 sm:h-28 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  diaperType === 'coco'
                    ? 'bg-[#121c22] border-2 border-[#2ac289] shadow-sm'
                    : 'bg-[#1b1e2f] border border-transparent hover:bg-[#202438]'
                }`}
              >
                <div className="mb-1 text-2xl select-none">💩</div>
                <span className={`text-xs font-bold ${diaperType === 'coco' ? 'text-[#2ac289]' : 'text-gray-300'}`}>
                  Cocô
                </span>
              </button>

              {/* Option 3: Ambos */}
              <button
                type="button"
                onClick={() => setDiaperType('ambos')}
                className={`h-26 sm:h-28 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  diaperType === 'ambos'
                    ? 'bg-[#121c22] border-2 border-[#2ac289] shadow-[0_0_12px_rgba(46,197,133,0.18)]'
                    : 'bg-[#1b1e2f] border border-transparent hover:bg-[#202438]'
                }`}
              >
                <div className="mb-2 w-7 h-7 rounded-full bg-[#1678cd] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  ∞
                </div>
                <span className={`text-xs font-bold ${diaperType === 'ambos' ? 'text-[#2ac289]' : 'text-gray-300'}`}>
                  Ambos
                </span>
              </button>
            </div>
          </section>

          {/* Stool Color (if Cocô or Ambos) */}
          {diaperType !== 'xixi' && (
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-white">Cor das fezes (opcional)</h3>
              <div className="flex items-center space-x-3.5 overflow-x-auto py-1 no-scrollbar">
                {STOOL_COLORS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setStoolColor(col.id)}
                    aria-label={col.name}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95 relative ${
                      stoolColor === col.id ? 'ring-3 ring-white/80 ring-offset-2 ring-offset-[#0d0f19]' : ''
                    }`}
                    style={{ backgroundColor: col.id }}
                  >
                    {stoolColor === col.id && (
                      <Check className="w-5 h-5 text-white stroke-[2.5]" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Observations & Consistency */}
          <section className="space-y-2.5">
            <label htmlFor="fralda-obs" className="block text-sm font-bold text-white">
              Observações (opcional)
            </label>
            <div className="bg-[#1a1d2e] rounded-2xl p-3.5 border border-[#23273c]">
              <textarea
                id="fralda-obs"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Algum detalhe importante?"
                rows={3}
                className="w-full bg-transparent border-0 p-0 text-white text-sm placeholder-gray-500 resize-none focus:outline-none"
              />
            </div>

            {/* Consistency Chips (if Cocô or Ambos) */}
            {diaperType !== 'xixi' && (
              <div className="flex items-center space-x-2 pt-1 overflow-x-auto no-scrollbar">
                {(['Normal', 'Ressecado', 'Líquido', 'Com muco'] as const).map((cons) => (
                  <button
                    key={cons}
                    type="button"
                    onClick={() => setConsistency(cons)}
                    className={`px-3.5 py-1.8 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      consistency === cons
                        ? 'bg-[#2ac289] text-[#0d1c16] font-bold'
                        : 'bg-[#1a1d2e] text-gray-300 border border-[#23273c] hover:border-gray-500'
                    }`}
                  >
                    {cons}
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Fixed Bottom Action Button */}
        <footer className="p-5 pt-2 pb-6 bg-[#0d0f19] border-t border-white/5">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-4 bg-[#2ac289] hover:bg-[#25b37e] active:scale-[0.99] text-[#0d1c16] font-bold text-base rounded-2xl transition shadow-lg shadow-[#2ac289]/15 flex items-center justify-center"
          >
            Registrar fralda
          </button>
        </footer>

      </div>
    </div>
  );
};
