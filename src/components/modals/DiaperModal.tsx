import React, { useState } from 'react';
import { Calendar, Edit3, Baby, Sparkles, Check } from 'lucide-react';
import { Button, Selector, TextArea } from 'antd-mobile';
import { BaseModal } from './BaseModal';

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Fralda"
      subtitle="Hoje · Agora"
      headerIcon={
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Baby className="w-4 h-4 text-emerald-400" />
        </div>
      }
      footer={
        <Button
          block
          color="success"
          size="large"
          onClick={handleSave}
          className="font-bold text-sm rounded-xl cursor-pointer"
          style={{
            borderRadius: 'var(--app-button-radius)',
          }}
        >
          Registrar fralda
        </Button>
      }
    >
      {/* Activity Heading */}
      <section className="flex items-center gap-3.5 pt-1">
        <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white leading-tight">Fralda</h3>
          <p className="text-xs text-slate-400 font-medium">Como estava a fralda do bebê?</p>
        </div>
      </section>

      {/* Timestamp Card */}
      <section className="bg-slate-800/80 rounded-xl p-4 flex items-center justify-between border border-slate-700">
        <div className="flex items-center gap-3.5">
          <div className="text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] text-slate-400 leading-tight">Quando aconteceu</span>
            <span className="block text-sm font-semibold text-white mt-0.5">Hoje · Agora</span>
          </div>
        </div>
        <button type="button" aria-label="Editar data e hora" className="text-slate-400 hover:text-white p-1 cursor-pointer">
          <Edit3 className="w-4 h-4" />
        </button>
      </section>

      {/* Diaper Type via AntD Selector */}
      <section>
        <h4 className="text-sm font-bold text-white mb-2.5">Tipo de fralda</h4>
        <Selector
          options={[
            { label: '💧 Xixi', value: 'xixi' },
            { label: '✨ Cocô', value: 'coco' },
            { label: '⚡ Ambos', value: 'ambos' },
          ]}
          value={[diaperType]}
          onChange={(v) => {
            if (v.length > 0) setDiaperType(v[0] as 'xixi' | 'coco' | 'ambos');
          }}
          style={{
            '--color': 'var(--color-secondary)',
            '--checked-color': 'var(--color-success)',
            '--checked-text-color': '#ffffff',
            '--border-radius': 'var(--app-button-radius)',
            '--border': '1px solid var(--color-border)',
            '--padding': '12px 14px',
          }}
        />
      </section>

      {/* Stool Color (if Cocô or Ambos) */}
      {diaperType !== 'xixi' && (
        <section className="space-y-2">
          <h4 className="text-sm font-bold text-white">Cor das fezes (opcional)</h4>
          <div className="flex items-center space-x-3.5 overflow-x-auto py-1 no-scrollbar">
            {STOOL_COLORS.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => setStoolColor(col.id)}
                aria-label={col.name}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer relative ${
                  stoolColor === col.id ? 'ring-3 ring-white/80 ring-offset-2 ring-offset-slate-900' : ''
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

      {/* Observations & Consistency via AntD Selector and TextArea */}
      <section className="space-y-2.5">
        <label htmlFor="fralda-obs" className="block text-sm font-bold text-white">
          Observações (opcional)
        </label>
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
          <TextArea
            id="fralda-obs"
            value={notes}
            onChange={(val) => setNotes(val)}
            placeholder="Algum detalhe importante?"
            rows={2}
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{
              '--color': 'var(--color-text-primary)',
              '--placeholder-color': 'var(--color-text-muted)',
              '--font-size': '14px',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        {/* Consistency Options via AntD Selector */}
        {diaperType !== 'xixi' && (
          <section className="pt-1">
            <h4 className="text-xs font-semibold text-slate-300 mb-1.5">Consistência</h4>
            <Selector
              options={[
                { label: 'Normal', value: 'Normal' },
                { label: 'Ressecado', value: 'Ressecado' },
                { label: 'Líquido', value: 'Líquido' },
                { label: 'Com muco', value: 'Com muco' },
              ]}
              value={[consistency]}
              onChange={(v) => {
                if (v.length > 0) setConsistency(v[0] as any);
              }}
              style={{
                '--color': 'var(--color-secondary)',
                '--checked-color': 'var(--color-success)',
                '--checked-text-color': '#ffffff',
                '--border-radius': 'var(--app-button-radius)',
                '--border': '1px solid var(--color-border)',
                '--padding': '6px 10px',
              }}
            />
          </section>
        )}
      </section>
    </BaseModal>
  );
};
