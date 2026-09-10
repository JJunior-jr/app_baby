import React, { useState, useEffect } from 'react';
import {
  Check,
  Sparkles,
  Palette,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Type,
  Box,
  SunMedium,
  Layers,
} from 'lucide-react';
import {
  themeService,
  PaletteTheme,
  PaletteColorItem,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
  GLOW_OPTIONS,
  FontOption,
  RadiusOption,
  GlowOption,
} from '../services/theme';
import { GooeyTabs } from './GooeyTabs';

interface ThemeSelectorProps {
  onPaletteChanged?: (palette: PaletteTheme) => void;
  initialTab?: 'colors' | 'typography' | 'shapes';
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onPaletteChanged,
  initialTab = 'colors',
}) => {
  const [currentPalette, setCurrentPalette] = useState<PaletteTheme>(themeService.getCurrentPalette());
  const [palettes, setPalettes] = useState<PaletteTheme[]>(themeService.getAllPalettes());
  const [currentFont, setCurrentFont] = useState<FontOption>(themeService.getFont());
  const [currentRadius, setCurrentRadius] = useState<RadiusOption>(themeService.getRadius());
  const [currentGlow, setCurrentGlow] = useState<GlowOption>(themeService.getGlow());
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'shapes'>(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ID da paleta sendo editada nos slots 60/30/10 (ou expandida)
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  const isCardExpanded = (id: string) => {
    return expandedCardIds[id] ?? false;
  };

  const toggleCardExpanded = (id: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? false),
    }));
  };

  const handleToggleAll = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    palettes.forEach((p) => {
      next[p.id] = expand;
    });
    setExpandedCardIds(next);
  };

  useEffect(() => {
    // Subscribe to external changes
    const unsub = themeService.subscribe((p) => {
      setCurrentPalette(p);
      setPalettes(themeService.getAllPalettes());
      setCurrentFont(themeService.getFont());
      setCurrentRadius(themeService.getRadius());
      setCurrentGlow(themeService.getGlow());
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectFont = (font: FontOption) => {
    const updated = themeService.setFontFamily(font.id);
    setCurrentFont(updated);
    showToast(`Fonte alterada para "${font.name}"!`);
  };

  const handleSelectRadius = (radius: RadiusOption) => {
    const updated = themeService.setRadius(radius.id);
    setCurrentRadius(updated);
    showToast(`Cantos definidos como "${radius.name}"!`);
  };

  const handleSelectGlow = (glow: GlowOption) => {
    const updated = themeService.setGlow(glow.id);
    setCurrentGlow(updated);
    showToast(`Brilho do arco definido como "${glow.name}"!`);
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

      {/* Navigation Tabs with Gooey Animation */}
      <GooeyTabs
        tabs={[
          { id: 'colors', label: 'Cores 60/30/10', icon: Palette },
          { id: 'typography', label: 'Tipografia', icon: Type },
          { id: 'shapes', label: 'Formas & Brilho', icon: Box },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'colors' | 'typography' | 'shapes')}
        layoutId="theme-subtabs"
        variant="dark"
        activeColor="#9333ea"
      />

      {/* TAB 1: CORES 60/30/10 */}
      {activeTab === 'colors' && (
        <div className="space-y-4 animate-in fade-in duration-150">
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
              <div className="p-2 rounded-xl bg-[#0c0d16] border border-white/10 gooey-card-hover cursor-default">
                <span className="block text-[11px] font-black text-white">60%</span>
                <span className="block text-[9.5px] text-gray-400 font-medium">Fundo Dominante</span>
              </div>
              <div className="p-2 rounded-xl bg-[#1c1f38] border border-white/10 gooey-card-hover cursor-default">
                <span className="block text-[11px] font-black text-purple-200">30%</span>
                <span className="block text-[9.5px] text-gray-400 font-medium">Cards & Estrutura</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/50 gooey-card-hover cursor-default">
                <span className="block text-[11px] font-black text-purple-300">10%</span>
                <span className="block text-[9.5px] text-purple-200 font-medium">Botões / CTA</span>
              </div>
            </div>
          </div>

          {/* Palette Choices List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-200">Grupos de Cores</span>
                <span className="text-[10px] text-gray-400 font-normal">({palettes.length})</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const anyExpanded = palettes.some((p) => isCardExpanded(p.id));
                  handleToggleAll(!anyExpanded);
                }}
                className="text-[10.5px] font-medium text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer transition px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 gooey-btn"
              >
                <Layers className="w-3 h-3 text-purple-400" />
                <span>{palettes.some((p) => isCardExpanded(p.id)) ? 'Recolher todos' : 'Expandir todos'}</span>
              </button>
            </div>

            {/* Existing Palettes Cards */}
            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-0.5 no-scrollbar">
              {palettes.map((p) => {
                const isSelected = currentPalette.id === p.id;
                const isExpanded = isCardExpanded(p.id);

                return (
                  <div
                    key={p.id}
                    className={`w-full p-3 rounded-2xl border transition-all text-left relative overflow-hidden gooey-card-hover ${
                      isSelected
                        ? 'border-gray-700 bg-[#161a30]'
                        : 'border-gray-800/80 bg-[#0f1120] hover:border-gray-700'
                    }`}
                  >
                    {/* Header row: Name, status, activate button, and retract/expand toggle */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="text-xs font-bold text-white truncate">{p.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" title="Ativa" />
                        )}
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {!isSelected && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPalette(p);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#222744] hover:bg-[#2d345b] text-[10px] font-bold text-white transition cursor-pointer gooey-btn"
                          >
                            Ativar
                          </button>
                        )}

                        {/* Botão Retrair / Expandir Card (apenas ícone, sem texto e sem tag chip) */}
                        <button
                          type="button"
                          onClick={() => toggleCardExpanded(p.id)}
                          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer gooey-btn"
                          title={isExpanded ? 'Retrair' : 'Expandir'}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-gray-200' : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                {/* Compact Mini Preview Bar (Clicking expands/retracts) */}
                <div
                  onClick={() => toggleCardExpanded(p.id)}
                  className="w-full h-2.5 rounded-full overflow-hidden flex border border-white/10 mt-2 cursor-pointer transition hover:opacity-90"
                  title="Clique para expandir/retrair opções deste grupo"
                >
                  <div
                    style={{ width: '60%', backgroundColor: p.dominant }}
                    title={`60% Fundo: ${p.dominant}`}
                  />
                  <div
                    style={{ width: '30%', backgroundColor: p.secondary }}
                    title={`30% Cards: ${p.secondary}`}
                  />
                  <div
                    style={{ width: '10%', backgroundColor: p.accent }}
                    title={`10% CTA: ${p.accent}`}
                  />
                </div>

                {/* EXPANDED CONTENT: 60/30/10 Proportional Visual Bar, Swatches, Role Selection & Preview */}
                {isExpanded && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-3 animate-in fade-in duration-150">
                    {/* 60 / 30 / 10 Proportional Visual Bar with percentages and codes */}
                    <div className="w-full h-4 rounded-lg overflow-hidden flex border border-white/10 shadow-inner">
                      <div
                        style={{ width: '60%', backgroundColor: p.dominant }}
                        className="flex items-center justify-center text-[8.5px] font-bold text-white/90 drop-shadow-xs truncate px-1"
                        title={`60% Fundo: ${p.dominant}`}
                      >
                        60% Fundo
                      </div>
                      <div
                        style={{ width: '30%', backgroundColor: p.secondary }}
                        className="flex items-center justify-center text-[8.5px] font-bold text-white/90 drop-shadow-xs truncate px-1"
                        title={`30% Cards: ${p.secondary}`}
                      >
                        30% Cards
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
                      <div className="flex flex-wrap gap-1">
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

                    {/* ESCOLHA QUAL COR SERÁ 60%, 30% E 10% DESTE GRUPO */}
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-gray-200">
                          Funções das cores neste grupo:
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
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-white flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/30"
                              style={{ backgroundColor: p.dominant }}
                            />
                            60% Fundo:
                          </span>
                          <span className="font-mono text-purple-300 font-semibold text-[9px]">{p.dominant}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {p.colors.map((c, idx) => {
                            const isRoleActive = p.dominant.toLowerCase() === c.hex.toLowerCase();
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAssignRole(p, 'dominant', c.hex)}
                                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${
                                  isRoleActive
                                    ? 'border-purple-400 bg-purple-950/60 text-white font-bold ring-1 ring-purple-400'
                                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                                  style={{ backgroundColor: c.hex }}
                                />
                                <span className="truncate max-w-[65px]">{c.name}</span>
                                {isRoleActive && <Check className="w-2 h-2 text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* SLOT 2: 30% Cards / Estrutura */}
                      <div className="space-y-1 pt-1 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-white flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/30"
                              style={{ backgroundColor: p.secondary }}
                            />
                            30% Cards & Estrutura:
                          </span>
                          <span className="font-mono text-purple-300 font-semibold text-[9px]">{p.secondary}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {p.colors.map((c, idx) => {
                            const isRoleActive = p.secondary.toLowerCase() === c.hex.toLowerCase();
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAssignRole(p, 'secondary', c.hex)}
                                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${
                                  isRoleActive
                                    ? 'border-purple-400 bg-purple-950/60 text-white font-bold ring-1 ring-purple-400'
                                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                                  style={{ backgroundColor: c.hex }}
                                />
                                <span className="truncate max-w-[65px]">{c.name}</span>
                                {isRoleActive && <Check className="w-2 h-2 text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* SLOT 3: 10% CTA / Botão de Ação */}
                      <div className="space-y-1 pt-1 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-white flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/30"
                              style={{ backgroundColor: p.accent }}
                            />
                            10% Botão / CTA:
                          </span>
                          <span className="font-mono text-purple-300 font-semibold text-[9px]">{p.accent}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {p.colors.map((c, idx) => {
                            const isRoleActive = p.accent.toLowerCase() === c.hex.toLowerCase();
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAssignRole(p, 'accent', c.hex)}
                                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${
                                  isRoleActive
                                    ? 'border-purple-400 bg-purple-950/60 text-white font-bold ring-1 ring-purple-400'
                                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                                  style={{ backgroundColor: c.hex }}
                                />
                                <span className="truncate max-w-[65px]">{c.name}</span>
                                {isRoleActive && <Check className="w-2 h-2 text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Mock UI Elements Preview in Miniature */}
                    <div
                      className="p-2 rounded-xl border flex items-center justify-between text-[10px] transition-colors duration-200"
                      style={{
                        backgroundColor: p.dominant,
                        borderColor: p.border,
                        color: p.textPrimary,
                      }}
                    >
                      <div
                        className="px-2 py-1 rounded-lg border flex items-center gap-1 font-semibold"
                        style={{
                          backgroundColor: p.secondary,
                          borderColor: p.border,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.accent }} />
                        Card (30%)
                      </div>

                      <div
                        className="px-2 py-1 rounded-lg font-bold text-[9.5px] shadow-sm flex items-center gap-1"
                        style={{
                          backgroundColor: p.accent,
                          color: p.accentText,
                        }}
                      >
                        CTA (10%)
                      </div>
                    </div>

                    {/* Botão de ativar esta paleta no app caso não esteja ativa */}
                    {!isSelected && (
                      <button
                        type="button"
                        onClick={() => handleSelectPalette(p)}
                        className="w-full py-1.5 rounded-xl text-white font-bold text-[11px] bg-purple-600 hover:bg-purple-500 transition shadow cursor-pointer gooey-btn"
                      >
                        Aplicar Esta Paleta no Aplicativo
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )}

      {/* TAB 2: TIPOGRAFIA (FONTES) */}
      {activeTab === 'typography' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Banner de Demonstração em Tempo Real */}
          <div
            className="p-4 rounded-2xl border transition-all text-left space-y-2 shadow-lg gooey-card-hover"
            style={{
              backgroundColor: currentPalette.secondary,
              borderColor: currentPalette.border,
              fontFamily: currentFont.family,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Fonte Ativa: {currentFont.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                {currentFont.category}
              </span>
            </div>

            <div className="pt-1">
              <div className="text-2xl font-black tracking-tight text-white">05h 15m</div>
              <div className="text-xs font-semibold text-gray-300 mt-0.5">
                DESDE A ÚLTIMA ATIVIDADE · BABY JOHN
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-xl text-xs font-bold shadow-sm gooey-btn"
                style={{
                  backgroundColor: currentPalette.accent,
                  color: currentPalette.accentText,
                }}
              >
                Registrar Agora
              </span>
              <span className="text-[11px] text-gray-400">
                Aa Bb Cc Dd Ee Ff · 1234567890
              </span>
            </div>
          </div>

          {/* Lista de Fontes Selecionáveis */}
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-0.5 no-scrollbar">
            <span className="text-xs font-bold text-gray-300 block px-1">
              Escolha a Família Tipográfica do App:
            </span>

            {FONT_OPTIONS.map((font) => {
              const isSelected = currentFont.id === font.id;

              return (
                <div
                  key={font.id}
                  onClick={() => handleSelectFont(font)}
                  className={`w-full p-3.5 rounded-2xl border transition-all text-left cursor-pointer relative gooey-card-hover ${
                    isSelected
                      ? 'border-purple-500 bg-[#161a30] shadow-[0_4px_16px_rgba(124,58,237,0.2)]'
                      : 'border-gray-800/80 bg-[#0f1120] hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className="text-sm font-bold text-white"
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9.5px] font-medium text-gray-400 border border-white/10">
                        {font.category}
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-extrabold text-purple-300 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Em uso
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-semibold hover:text-white transition">
                        Selecionar
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
                    {font.description}
                  </p>

                  {/* Amostra visual com a fonte real aplicada */}
                  <div
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                    style={{ fontFamily: font.family }}
                  >
                    <span className="text-white font-bold">{font.sample}</span>
                    <span className="text-purple-300 text-[11px] font-semibold">13:35 (BR)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FORMAS & BRILHO DOS ELEMENTOS */}
      {activeTab === 'shapes' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Seletor 1: Arredondamento dos Cantos (Border Radius) */}
          <div className="p-3.5 rounded-2xl bg-[#131526] border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Box className="w-4 h-4 text-purple-400" />
                Arredondamento dos Cantos (Cards & Botões)
              </span>
              <span className="text-[10px] text-purple-300 font-mono font-bold">
                {currentRadius.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {RADIUS_OPTIONS.map((opt) => {
                const isSelected = currentRadius.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectRadius(opt)}
                    className={`p-2.5 border text-center transition cursor-pointer flex flex-col items-center justify-between gooey-card-hover gooey-btn ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/40 text-white shadow-md'
                        : 'border-gray-800 bg-[#0d0f1e] text-gray-300 hover:border-gray-700'
                    }`}
                    style={{ borderRadius: opt.cardRadius }}
                  >
                    <div
                      className="w-10 h-6 border-2 border-purple-400/80 mb-1.5 transition-all"
                      style={{ borderRadius: opt.cardRadius }}
                    />
                    <span className="text-[10px] font-bold block">{opt.name.split(' ')[0]}</span>
                    <span className="text-[8.5px] text-gray-400 block">{opt.cardRadius}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10.5px] text-gray-400 leading-relaxed">
              {currentRadius.description}
            </p>
          </div>

          {/* Seletor 2: Intensidade do Brilho Neon (Glow dos Arcos) */}
          <div className="p-3.5 rounded-2xl bg-[#131526] border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <SunMedium className="w-4 h-4 text-amber-400" />
                Intensidade de Brilho dos Medidores (Glow)
              </span>
              <span className="text-[10px] text-amber-300 font-mono font-bold">
                {currentGlow.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {GLOW_OPTIONS.map((glow) => {
                const isSelected = currentGlow.id === glow.id;
                return (
                  <button
                    key={glow.id}
                    type="button"
                    onClick={() => handleSelectGlow(glow)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between gooey-card-hover gooey-btn ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/30 text-white shadow-md'
                        : 'border-gray-800 bg-[#0d0f1e] text-gray-300 hover:border-gray-700'
                    }`}
                  >
                    {/* Visual Glow Demonstration */}
                    <div className="w-8 h-8 flex items-center justify-center my-1">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-amber-400 transition-all duration-300"
                        style={{ filter: glow.filter }}
                      />
                    </div>
                    <span className="text-[10px] font-bold block">{glow.name.split(' ')[0]}</span>
                    <span className="text-[8.5px] text-gray-400 block">{glow.intensity}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10.5px] text-gray-400 leading-relaxed">
              {currentGlow.description}
            </p>
          </div>

          {/* Preview Completo ao Vivo */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2 gooey-card-hover">
            <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Prévia do Layout Customizado
            </span>
            <div
              className="p-3 border flex items-center justify-between transition-all"
              style={{
                backgroundColor: currentPalette.secondary,
                borderColor: currentPalette.border,
                borderRadius: currentRadius.cardRadius,
                fontFamily: currentFont.family,
              }}
            >
              <div>
                <div className="text-sm font-bold text-white">Cartão Dinâmico</div>
                <div className="text-[10px] text-gray-400">
                  Cantos: {currentRadius.cardRadius} · Fonte: {currentFont.name}
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 font-bold text-xs shadow-md transition gooey-btn"
                style={{
                  backgroundColor: currentPalette.accent,
                  color: currentPalette.accentText,
                  borderRadius: currentRadius.cardRadius,
                  filter: currentGlow.filter,
                }}
              >
                CTA (10%)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
