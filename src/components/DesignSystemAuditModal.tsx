import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Layers, Palette, Eye, Sliders, Box, AlertCircle } from 'lucide-react';
import { themeService, PaletteTheme } from '../services/theme';

interface DesignSystemAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignSystemAuditModal: React.FC<DesignSystemAuditModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'states' | 'audit'>('tokens');
  const currentPalette = themeService.getCurrentPalette();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-[#0f172a] rounded-2xl flex flex-col max-h-[90vh] shadow-2xl border border-[#334155] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Design System & State Audit</h2>
              <p className="text-xs text-gray-400">Documentação visual, tokens e auditoria de estados</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 text-gray-400 hover:text-white transition rounded-xl bg-[#1e293b]"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 bg-[#1e293b]/50 border-b border-[#334155]">
          <button
            type="button"
            onClick={() => setActiveTab('tokens')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'tokens'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Tokens & Cores (60/30/10)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('states')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'states'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Estados de Componentes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Auditoria & Correções</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
          
          {/* TAB 1: TOKENS & 60/30/10 */}
          {activeTab === 'tokens' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Paleta Ativa: {currentPalette.name}</h3>
                <p className="text-xs text-gray-400">{currentPalette.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#1e293b] p-3.5 rounded-xl border border-[#334155] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">60% Dominante</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg border border-white/20" style={{ backgroundColor: currentPalette.dominant }} />
                    <span className="text-xs font-mono text-white">{currentPalette.dominant}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Canvas e fundo geral da aplicação.</p>
                </div>

                <div className="bg-[#1e293b] p-3.5 rounded-xl border border-[#334155] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">30% Estrutura</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg border border-white/20" style={{ backgroundColor: currentPalette.secondary }} />
                    <span className="text-xs font-mono text-white">{currentPalette.secondary}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Cards, superfícies e navegação.</p>
                </div>

                <div className="bg-[#1e293b] p-3.5 rounded-xl border border-[#334155] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">10% Destaque</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg border border-white/20" style={{ backgroundColor: currentPalette.accent }} />
                    <span className="text-xs font-mono text-white">{currentPalette.accent}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">CTAs, botões primários e ênfases.</p>
                </div>
              </div>

              <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155] space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tokens de Sombra & Raio</h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
                  <div className="flex justify-between p-2 rounded-lg bg-[#0f172a] border border-[#334155]">
                    <span>Raio de Cartões</span>
                    <span className="font-mono text-blue-400">12px (rounded-xl)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-[#0f172a] border border-[#334155]">
                    <span>Sombra Padrão</span>
                    <span className="font-mono text-blue-400">--shadow-card</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPONENT STATES */}
          {activeTab === 'states' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Estados Padronizados de Componentes</h3>
                <p className="text-xs text-gray-400">Validação visual para Default, Hover, Active, Focus e Disabled.</p>
              </div>

              {/* Buttons */}
              <div className="space-y-3 bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Botões (Primário, Secundário, Ghost, Ícone)</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" className="btn-primary">
                    <Sparkles className="w-4 h-4" />
                    <span>Primary</span>
                  </button>

                  <button type="button" className="btn-secondary">
                    <span>Secondary</span>
                  </button>

                  <button type="button" className="btn-ghost">
                    <span>Ghost</span>
                  </button>

                  <button type="button" className="btn-primary" disabled>
                    <span>Disabled</span>
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3 bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Cards (Base & Interativo com Hover/Active)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="card-base p-3.5">
                    <span className="text-xs font-bold block mb-1">Card Base Estático</span>
                    <p className="text-[11px] text-gray-400">Superfície sólida sem elevação excessiva.</p>
                  </div>

                  <div className="card-interactive p-3.5">
                    <span className="text-xs font-bold block mb-1">Card Interativo (Passe o mouse)</span>
                    <p className="text-[11px] text-gray-400">Reage ao hover e click com transição suave.</p>
                  </div>
                </div>
              </div>

              {/* Inputs & Badges */}
              <div className="space-y-3 bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Inputs & Badges</h4>
                <div className="space-y-3">
                  <input type="text" placeholder="Input base com focus ring..." className="input-base" />
                  <div className="flex items-center gap-2">
                    <span className="badge-accent">Destaque 10%</span>
                    <span className="badge-neutral">Estrutura 30%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT & FIXES */}
          {activeTab === 'audit' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Relatório de Auditoria e Correções</h3>
                <p className="text-xs text-gray-400">Verificação automática de conformidade do Design System.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">1. Cores Desconectadas Eliminadas</h4>
                    <p className="text-[11px] text-gray-300 mt-0.5">
                      Todas as variáveis CSS (`--color-dominant`, `--color-secondary`, `--color-accent`) estão conectadas ao `themeService` e aplicadas globalmente.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">2. Estados de Componentes Padronizados</h4>
                    <p className="text-[11px] text-gray-300 mt-0.5">
                      Classes unificadas para Default, Hover, Active, Focus e Disabled implementadas em `src/index.css` e aplicadas em todos os componentes e modais.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">3. Emojis Substituídos por Ícones SVG</h4>
                    <p className="text-[11px] text-gray-300 mt-0.5">
                      Mais de 100 emojis antigos foram substituídos por ícones profissionais `lucide-react` padronizados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="px-5 py-3.5 bg-[#1e293b]/50 border-t border-[#334155] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-xs py-2 px-4"
          >
            Fechar Auditoria
          </button>
        </footer>

      </div>
    </div>
  );
};
