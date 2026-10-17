import React, { useState } from 'react';
import { X, Calendar, Edit3, Droplets, Check, Baby, Sparkles, Layers } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[430px] landscape:max-w-lg h-auto max-h-[90vh] bg-[#0f172a] rounded-xl flex flex-col justify-between overflow-y-auto shadow-2xl border border-[#334155] animate-in zoom-in-95 duration-200">
        
        {/* Navigation Header */}
        <header className="relative px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#334155]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 -ml-1 text-gray-300 hover:text-white transition rounded-xl hover:bg-[#1e293b]"
          >
            <X className="w-6 h-6 stroke-[2.2]" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-white">Registrar Fralda</h1>
            <p className="text-xs text-gray-400 mt-0.5">Hoje · Agora</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#1e293b] border border-[#334155] flex items-center justify-center">
            <Baby className="w-4 h-4 text-emerald-400" />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar">
          {/* Activity Heading */}
          <section className="flex items-center gap-3.5 pt-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white leading-tight">Fralda</h2>
              <p className="text-xs text-gray-400 font-medium">Como estava a fralda do bebê?</p>
            </div>
          </section>

          {/* Timestamp Card */}
          <section className="bg-[#1e293b] rounded-xl p-4 flex items-center justify-between border border-[#334155]">
            <div className="flex items-center gap-3.5">
              <div className="text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] text-gray-400 leading-tight">Quando aconteceu</span>
                <span className="block text-sm font-semibold text-white mt-0.5">19 de ago. · 23:10</span>
              </div>
            </div>
            <button type="button" aria-label="Editar data e hora" className="text-gray-400 hover:text-white p-1">
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
                className={`h-24 rounded-xl flex flex-col items-center justify-center transition-all ${
                  diaperType === 'xixi'
                    ? 'bg-cyan-950/40 border-2 border-cyan-400'
                    : 'bg-[#1e293b] border border-[#334155] hover:bg-[#334155]'
                }`}
              >
                <div className="mb-2">
                  <Droplets className="w-6 h-6 text-cyan-400 fill-current" />
                </div>
                <span className={`text-xs font-bold ${diaperType === 'xixi' ? 'text-cyan-300' : 'text-gray-300'}`}>
                  Xixi
                </span>
              </button>

              {/* Option 2: Cocô */}
              <button
                type="button"
                onClick={() => setDiaperType('coco')}
                className={`h-24 rounded-xl flex flex-col items-center justify-center transition-all ${
                  diaperType === 'coco'
                    ? 'bg-amber-950/40 border-2 border-amber-400'
                    : 'bg-[#1e293b] border border-[#334155] hover:bg-[#334155]'
                }`}
              >
                <div className="mb-2">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <span className={`text-xs font-bold ${diaperType === 'coco' ? 'text-amber-300' : 'text-gray-300'}`}>
                  Cocô
                </span>
              </button>

              {/* Option 3: Ambos */}
              <button
                type="button"
                onClick={() => setDiaperType('ambos')}
                className={`h-24 rounded-xl flex flex-col items-center justify-center transition-all ${
                  diaperType === 'ambos'
                    ? 'bg-emerald-950/40 border-2 border-emerald-400'
                    : 'bg-[#1e293b] border border-[#334155] hover:bg-[#334155]'
                }`}
              >
                <div className="mb-2">
                  <Layers className="w-6 h-6 text-emerald-400" />
                </div>
                <span className={`text-xs font-bold ${diaperType === 'ambos' ? 'text-emerald-300' : 'text-gray-300'}`}>
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
            <div className="bg-[#1e293b] rounded-xl p-3.5 border border-[#334155]">
              <textarea
                id="fralda-obs"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Algum detalhe importante?"
                rows={3}
                className="w-full bg-transparent border-0 p-0 text-white text-sm placeholder-gray-400 resize-none focus:outline-none"
              />
            </div>

            {/* Consistency Options (if Cocô or Ambos) */}
            {diaperType !== 'xixi' && (
              <div className="flex items-center space-x-2 pt-1 overflow-x-auto no-scrollbar">
                {(['Normal', 'Ressecado', 'Líquido', 'Com muco'] as const).map((cons) => (
                  <button
                    key={cons}
                    type="button"
                    onClick={() => setConsistency(cons)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      consistency === cons
                        ? 'bg-emerald-500 text-white font-bold'
                        : 'bg-[#1e293b] text-gray-300 border border-[#334155] hover:border-gray-400'
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
        <footer className="p-5 pt-3 pb-5 bg-[#0f172a] border-t border-[#334155]">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition flex items-center justify-center shadow-sm"
          >
            Registrar fralda
          </button>
        </footer>

      </div>
    </div>
  );
};
