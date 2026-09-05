import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Paintbrush, Palette, RotateCcw, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { themeService, PaletteTheme, PaletteColorItem } from '../services/theme';

interface ThemeSelectorProps {
  onPaletteChanged?: (palette: PaletteTheme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onPaletteChanged }) => {
  const [currentPalette, setCurrentPalette] = useState<PaletteTheme>(themeService.getCurrentPalette());
  const [palettes, setPalettes] = useState<PaletteTheme[]>(themeService.getAllPalettes());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ID da paleta sendo editada nos slots 60/30/10
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);

  // Custom palette builder state (for completely manual HEX)
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customName, setCustomName] = useState('Minha Paleta Personalizada');
  const [customDominant, setCustomDominant] = useState('#0a0c16');
  const [customSecondary, setCustomSecondary] = useState('#161a2e');
  const [customAccent, setCustomAccent] = useState('#6366f1');

  useEffect(() => {
    // Subscribe to external changes
    const unsub = themeService.subscribe((p) => {
      setCurrentPalette(p);
      setPalettes(themeService.getAllPalettes());
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectPalette = (palette: PaletteTheme) => {
    const updated = themeService.setPalette(palette.id);
    setCurrentPalette(updated);
    if (onPaletteChanged) onPaletteChanged(updated);
    showToast(`Paleta "${palette.name}" ativada!`);
  };

  // Atribui uma cor específica de uma paleta para o papel 60%, 30% ou 10%
  const handleAssignRole = (
    palette: PaletteTheme,
    role: 'dominant' | 'secondary' | 'accent',
    colorHex: string
  ) => {
    const dominant = role === 'dominant' ? colorHex : palette.dominant;
    const secondary = role === 'secondary' ? colorHex : palette.secondary;
    const accent = role === 'accent' ? colorHex : palette.accent;

    const updated = themeService.updatePaletteRoles(palette.id, dominant, secondary, accent);
    setCurrentPalette(themeService.getCurrentPalette());
    setPalettes(themeService.getAllPalettes());

    const roleName =
      role === 'dominant' ? '60% (Fundo)' : role === 'secondary' ? '30% (Cards)' : '10% (CTA)';
    showToast(`Cor ${colorHex} definida como ${roleName}!`);
  };

  // Restaura padrão do grupo
  const handleResetGroup = (paletteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = themeService.resetPaletteRoles(paletteId);
    setCurrentPalette(themeService.getCurrentPalette());
    setPalettes(themeService.getAllPalettes());
    showToast('Cores originais do grupo restauradas!');
  };

  const handleApplyCustomPalette = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustom: PaletteTheme = {
      id: 'custom-user-palette',
      name: customName || 'Personalizada',
      subtitle: `60% ${customDominant} · 30% ${customSecondary} · 10% ${customAccent}`,
      description: 'Paleta personalizada definida pelo usuário na regra 60/30/10.',
      isDark: true,
      dominant: customDominant,
      secondary: customSecondary,
      secondaryElevated: customSecondary,
      border: `${customAccent}40`,
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      accent: customAccent,
      accentHover: customAccent,
      accentText: '#ffffff',
      colors: [
        { name: 'Fundo', hex: customDominant, role: '60% Dominante' },
        { name: 'Cards', hex: customSecondary, role: '30% Estrutura' },
        { name: 'Destaque', hex: customAccent, role: '10% Destaque' },
      ],
    };

    const applied = themeService.saveCustomPalette(newCustom);
    setCurrentPalette(applied);
    setPalettes(themeService.getAllPalettes());
    setShowCustomBuilder(false);
    if (onPaletteChanged) onPaletteChanged(applied);
    showToast(`Paleta personalizada criada e ativada!`);
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-lg border border-purple-400/40 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-300" />
            {toastMessage}
          </span>
        </div>
      )}

      {/* Explanatory Rule Banner 60/30/10 */}
      <div className="p-3 rounded-2xl bg-[#151728] border border-purple-500/20 text-xs text-gray-300 space-y-2">
        <div className="flex items-center justify-between text-purple-300 font-bold">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Harmonia 60 / 30 / 10 & Escolha Livre</span>
          </div>
          <span className="text-[10px] text-gray-400 font-normal">
            {palettes.length} grupos
          </span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Você pode ativar qualquer grupo e <strong>escolher qual cor do grupo fica no 60% (Fundo), 30% (Cards) e 10% (CTA)</strong>:
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-[#0c0d16] border border-white/10">
            <span className="block text-[11px] font-black text-white">60%</span>
            <span className="block text-[9.5px] text-gray-400 font-medium">Fundo Dominante</span>
          </div>
          <div className="p-2 rounded-xl bg-[#1c1f38] border border-white/10">
            <span className="block text-[11px] font-black text-purple-200">30%</span>
            <span className="block text-[9.5px] text-gray-400 font-medium">Cards & Estrutura</span>
          </div>
          <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/50">
            <span className="block text-[11px] font-black text-purple-300">10%</span>
            <span className="block text-[9.5px] text-purple-200 font-medium">Botões / CTA</span>
          </div>
        </div>
      </div>

      {/* Palette Choices List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-gray-200">Grupos de Cores</span>
          <button
            type="button"
            onClick={() => setShowCustomBuilder(!showCustomBuilder)}
            className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition"
          >
            <Paintbrush className="w-3 h-3" />
            {showCustomBuilder ? 'Fechar editor livre' : 'Editor Livre'}
          </button>
        </div>

        {/* Custom Colors Editor (Expands when clicked) */}
        {showCustomBuilder && (
          <form
            onSubmit={handleApplyCustomPalette}
            className="p-3.5 rounded-2xl bg-[#111322] border border-purple-500/40 space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Criar Nova Paleta Manualmente
              </span>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                Nome da Paleta
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ex: Noite Estrelada"
                className="w-full bg-[#181a2e] border border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* 60% Dominant */}
              <div className="space-y-1">
                <label className="block text-[9.5px] font-bold text-gray-300">
                  60% Fundo
                </label>
                <div className="flex items-center space-x-1.5 bg-[#181a2e] border border-gray-700 p-1.5 rounded-xl">
                  <input
                    type="color"
                    value={customDominant}
                    onChange={(e) => setCustomDominant(e.target.value)}
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={customDominant}
                    onChange={(e) => setCustomDominant(e.target.value)}
                    className="w-full text-[10px] font-mono text-gray-200 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* 30% Secondary */}
              <div className="space-y-1">
                <label className="block text-[9.5px] font-bold text-gray-300">
                  30% Cards
                </label>
                <div className="flex items-center space-x-1.5 bg-[#181a2e] border border-gray-700 p-1.5 rounded-xl">
                  <input
                    type="color"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-full text-[10px] font-mono text-gray-200 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* 10% Accent */}
              <div className="space-y-1">
                <label className="block text-[9.5px] font-bold text-gray-300">
                  10% CTA
                </label>
                <div className="flex items-center space-x-1.5 bg-[#181a2e] border border-gray-700 p-1.5 rounded-xl">
                  <input
                    type="color"
                    value={customAccent}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={customAccent}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    className="w-full text-[10px] font-mono text-gray-200 bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl text-white font-bold text-xs bg-purple-600 hover:bg-purple-500 transition shadow-md cursor-pointer"
            >
              Salvar & Ativar Paleta Manual
            </button>
          </form>
        )}

        {/* Existing Palettes Cards */}
        <div className="space-y-3 max-h-[48vh] overflow-y-auto pr-0.5 no-scrollbar">
          {palettes.map((p) => {
            const isSelected = currentPalette.id === p.id;
            const isEditingThis = editingPaletteId === p.id;

            return (
              <div
                key={p.id}
                className={`w-full p-3.5 rounded-2xl border transition-all text-left relative overflow-hidden ${
                  isSelected
                    ? 'border-purple-500 bg-[#161a30] shadow-[0_4px_16px_rgba(124,58,237,0.25)]'
                    : 'border-gray-800/80 bg-[#0f1120] hover:border-gray-700'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[9px] font-extrabold text-purple-300 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" />
                        Ativa
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Botão de personalizar funções 60/30/10 das cores deste grupo */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPaletteId(isEditingThis ? null : p.id);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                        isEditingThis
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300'
                      }`}
                      title="Escolha qual cor do grupo vai no 60%, 30% e 10%"
                    >
                      <Sliders className="w-3 h-3 text-purple-300" />
                      <span>Escolher 60/30/10</span>
                      {isEditingThis ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {!isSelected && (
                      <button
                        type="button"
                        onClick={() => handleSelectPalette(p)}
                        className="px-2 py-1 rounded-lg bg-[#222744] hover:bg-[#2d345b] text-[10px] font-bold text-white transition cursor-pointer"
                      >
                        Ativar
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtitle and description */}
                <p className="text-[10.5px] text-gray-300 font-medium mb-1">{p.subtitle}</p>
                {p.description && (
                  <p className="text-[10px] text-gray-400 italic mb-2.5 leading-relaxed">
                    {p.description}
                  </p>
                )}

                {/* 60 / 30 / 10 Proportional Visual Bar */}
                <div className="w-full h-4 rounded-lg overflow-hidden flex border border-white/10 shadow-inner mb-2.5">
                  <div
                    style={{ width: '60%', backgroundColor: p.dominant }}
                    className="flex items-center justify-center text-[8.5px] font-bold text-white/90 drop-shadow-xs"
                    title={`60% Fundo: ${p.dominant}`}
                  >
                    60%
                  </div>
                  <div
                    style={{ width: '30%', backgroundColor: p.secondary }}
                    className="flex items-center justify-center text-[8.5px] font-bold text-white/90 drop-shadow-xs"
                    title={`30% Cards: ${p.secondary}`}
                  >
                    30%
                  </div>
                  <div
                    style={{ width: '10%', backgroundColor: p.accent }}
                    className="flex items-center justify-center text-[8.5px] font-bold text-white drop-shadow-xs"
                    title={`10% CTA: ${p.accent}`}
                  >
                    10%
                  </div>
                </div>

                {/* All Swatches Chips of this group */}
                {p.colors && p.colors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {p.colors.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-1 px-1.5 py-0.5 rounded-lg bg-black/40 border border-white/5"
                        title={`${c.name} (${c.hex})`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[8.5px] text-gray-300 font-medium truncate max-w-[70px]">
                          {c.name}
                        </span>
                        <span className="text-[8px] text-gray-400 font-mono">
                          {c.hex}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* EXPANDABLE: ESCOLHA QUAL COR SERÁ 60%, 30% E 10% DESTE GRUPO */}
                {isEditingThis && (
                  <div className="mt-3 p-3 rounded-xl bg-black/40 border border-purple-500/40 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-200 flex items-center gap-1.5">
                        <Sliders className="w-3 h-3 text-purple-400" />
                        Definir funções das cores neste grupo:
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleResetGroup(p.id, e)}
                        className="text-[9.5px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
                        title="Voltar às cores originais do grupo"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        Restaurar padrão
                      </button>
                    </div>

                    {/* SLOT 1: 60% Fundo Dominante */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-white flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/30"
                            style={{ backgroundColor: p.dominant }}
                          />
                          60% Fundo (Canvas Dominante):
                        </span>
                        <span className="font-mono text-purple-300 font-semibold">{p.dominant}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.colors.map((c, idx) => {
                          const isRoleActive = p.dominant.toLowerCase() === c.hex.toLowerCase();
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAssignRole(p, 'dominant', c.hex)}
                              className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg border text-[9.5px] cursor-pointer transition ${
                                isRoleActive
                                  ? 'border-purple-400 bg-purple-950/60 text-white font-bold ring-1 ring-purple-400'
                                  : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span>{c.name}</span>
                              {isRoleActive && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* SLOT 2: 30% Cards / Estrutura */}
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-white flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/30"
                            style={{ backgroundColor: p.secondary }}
                          />
                          30% Cards & Estrutura:
                        </span>
                        <span className="font-mono text-purple-300 font-semibold">{p.secondary}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.colors.map((c, idx) => {
                          const isRoleActive = p.secondary.toLowerCase() === c.hex.toLowerCase();
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAssignRole(p, 'secondary', c.hex)}
                              className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg border text-[9.5px] cursor-pointer transition ${
                                isRoleActive
                                  ? 'border-purple-400 bg-purple-950/60 text-white font-bold ring-1 ring-purple-400'
                                  : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span>{c.name}</span>
                              {isRoleActive && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* SLOT 3: 10% CTA / Botão de Ação */}
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-white flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/30"
                            style={{ backgroundColor: p.accent }}
                          />
                          10% CTA / Botão de Ação:
                        </span>
                        <span className="font-mono text-purple-300 font-semibold">{p.accent}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.colors.map((c, idx) => {
                          const isRoleActive = p.accent.toLowerCase() === c.hex.toLowerCase();
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAssignRole(p, 'accent', c.hex)}
                              className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg border text-[9.5px] cursor-pointer transition ${
                                isRoleActive
                                  ? 'border-purple-400 bg-purple-950/60 text-white font-bold ring-1 ring-purple-400'
                                  : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span>{c.name}</span>
                              {isRoleActive && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Botão de ativar esta combinação personalizada */}
                    <button
                      type="button"
                      onClick={() => handleSelectPalette(p)}
                      className="w-full py-2 rounded-xl text-white font-bold text-xs bg-purple-600 hover:bg-purple-500 transition shadow cursor-pointer mt-2"
                    >
                      Aplicar Esta Combinação no Aplicativo
                    </button>
                  </div>
                )}

                {/* Mock UI Elements Preview in Miniature */}
                <div
                  className="p-2 rounded-xl border flex items-center justify-between text-[10.5px] mt-2 transition-colors duration-200"
                  style={{
                    backgroundColor: p.dominant,
                    borderColor: p.border,
                    color: p.textPrimary,
                  }}
                >
                  <div
                    className="px-2.5 py-1 rounded-lg border flex items-center gap-1 font-semibold"
                    style={{
                      backgroundColor: p.secondary,
                      borderColor: p.border,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.accent }} />
                    Card (30%)
                  </div>

                  <div
                    className="px-2.5 py-1 rounded-lg font-bold text-[10px] shadow-sm flex items-center gap-1"
                    style={{
                      backgroundColor: p.accent,
                      color: p.accentText,
                    }}
                  >
                    CTA (10%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
