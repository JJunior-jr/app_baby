import React, { useState } from 'react';
import { X, Utensils } from 'lucide-react';

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    mealType: 'cafe' | 'almoco' | 'janta' | 'lanche';
    foodName?: string;
    amount?: string;
    notes?: string;
  }) => void;
}

export const MealModal: React.FC<MealModalProps> = ({ isOpen, onClose, onSave }) => {
  const [mealType, setMealType] = useState<'cafe' | 'almoco' | 'janta' | 'lanche'>('janta');
  const [foodName, setFoodName] = useState<string>('Papinha de legumes e frango');
  const [amount, setAmount] = useState<string>('120g');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      mealType,
      foodName,
      amount,
      notes,
    });
    onClose();
  };

  const mealLabels: Record<string, string> = {
    cafe: 'Café',
    almoco: 'Almoço',
    janta: 'Janta',
    lanche: 'Lanche',
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
            <h1 className="text-base font-bold text-white">Registrar Alimentação</h1>
            <p className="text-xs text-gray-400 mt-0.5">Hoje · Agora</p>
          </div>
          <div className="w-6 h-6 text-xl">🥣</div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4.5 no-scrollbar">
          {/* Heading */}
          <section className="flex items-center gap-3.5 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-[#341d27] border border-[#5a2c3d]/50 flex items-center justify-center text-[#f87171]">
              <Utensils className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">Comeu</h2>
              <p className="text-xs text-gray-400 font-medium">O que o John comeu hoje?</p>
            </div>
          </section>

          {/* Meal Type selector */}
          <section>
            <h3 className="text-sm font-bold text-white mb-2.5">Refeição</h3>
            <div className="grid grid-cols-4 gap-2">
              {(['cafe', 'almoco', 'janta', 'lanche'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealType(type)}
                  className={`py-3 rounded-2xl text-xs font-bold transition ${
                    mealType === type
                      ? 'bg-[#f87171] text-white shadow-md'
                      : 'bg-[#1a1d2e] text-gray-300 border border-[#23273c] hover:border-gray-500'
                  }`}
                >
                  {mealLabels[type]}
                </button>
              ))}
            </div>
          </section>

          {/* Food description */}
          <section className="space-y-1.5">
            <label className="text-sm font-bold text-white">Alimento / Prato</label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Ex: Papinha de legumes"
              className="w-full bg-[#181a2b] border border-[#272a44] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#f87171]"
            />
          </section>

          {/* Amount */}
          <section className="space-y-1.5">
            <label className="text-sm font-bold text-white">Quantidade</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 120g ou 1 porção"
              className="w-full bg-[#181a2b] border border-[#272a44] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#f87171]"
            />
          </section>

          {/* Notes */}
          <section className="space-y-2">
            <label className="text-sm font-bold text-white">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Como foi a aceitação do alimento?"
              rows={3}
              className="w-full bg-[#181a2b] border border-[#272a44] rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f87171] resize-none"
            />
          </section>
        </div>

        {/* Footer button */}
        <footer className="p-5 pt-2 pb-6 bg-[#0d0f19] border-t border-white/5">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-4 bg-[#f87171] hover:bg-[#e06363] active:scale-[0.99] text-white font-bold text-base rounded-2xl transition shadow-lg shadow-[#f87171]/20 flex items-center justify-center"
          >
            Registrar refeição
          </button>
        </footer>

      </div>
    </div>
  );
};
