// Sistema de Gerenciamento de Cores e Paletas 60/30/10
export interface PaletteColorItem {
  name: string;
  hex: string;
  role?: '60% Dominante' | '30% Estrutura' | '10% Destaque' | 'Acento Secundário' | 'Realce';
}

export interface PaletteTheme {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  isDark: boolean;
  // 60% - Cor Dominante (Canvas & Fundo)
  dominant: string;
  // 30% - Cor Secundária (Estrutura, Cards, Navegação)
  secondary: string;
  secondaryElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  // 10% - Cor de Destaque (Accent, CTAs, Botões de Ação)
  accent: string;
  accentHover: string;
  accentText: string;
  // Amostras completas do grupo de cores
  colors: PaletteColorItem[];
}

export const THEME_STORAGE_KEY = 'baby_john_palette_theme_id';
export const CUSTOM_THEME_STORAGE_KEY = 'baby_john_custom_palette_data';
export const PALETTE_OVERRIDES_STORAGE_KEY = 'baby_john_palette_overrides';
export const FONT_STORAGE_KEY = 'baby_john_font_family_id';
export const RADIUS_STORAGE_KEY = 'baby_john_border_radius_id';
export const GLOW_STORAGE_KEY = 'baby_john_glow_intensity_id';

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: string;
  description: string;
  sample: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', sans-serif",
    category: 'Geométrica & Moderna',
    description: 'Padrão do app. Excelente legibilidade técnica e estética contemporânea.',
    sample: '05h 15m · Soneca tranquila',
  },
  {
    id: 'quicksand',
    name: 'Quicksand',
    family: "'Quicksand', sans-serif",
    category: 'Arredondada & Afetiva',
    description: 'Terminações arredondadas e amigáveis, perfeita para bebês e maternidade.',
    sample: '05h 15m · Soneca tranquila',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    family: "'Poppins', sans-serif",
    category: 'Marcante & Expressiva',
    description: 'Geometria balanceada com forte peso visual em títulos e números.',
    sample: '05h 15m · Soneca tranquila',
  },
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', sans-serif",
    category: 'Neutra & Alta Densidade',
    description: 'Projetada especificamente para telas e interfaces de alta usabilidade.',
    sample: '05h 15m · Soneca tranquila',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    category: 'Elegante & Clean',
    description: 'Linhas refinadas e ar futurista minimalista.',
    sample: '05h 15m · Soneca tranquila',
  },
  {
    id: 'nunito',
    name: 'Nunito',
    family: "'Nunito', sans-serif",
    category: 'Suave & Acolhedora',
    description: 'Curvas generosas com sensação macia e acolhedora.',
    sample: '05h 15m · Soneca tranquila',
  },
];

export interface RadiusOption {
  id: string;
  name: string;
  cardRadius: string;
  description: string;
}

export const RADIUS_OPTIONS: RadiusOption[] = [
  {
    id: 'compact',
    name: 'Padrão (12px - rounded-xl)',
    cardRadius: '12px',
    description: 'Bordas arredondadas modernas, sólidas e elegantes (rounded-xl).',
  },
  {
    id: 'smooth',
    name: 'Suave (16px - rounded-2xl)',
    cardRadius: '16px',
    description: 'Equilíbrio visual suave e agradável ao toque.',
  },
];

export interface GlowOption {
  id: string;
  name: string;
  intensity: 'none' | 'subtle';
  filter: string;
  description: string;
}

export const GLOW_OPTIONS: GlowOption[] = [
  {
    id: 'none',
    name: 'Nenhum / Sólido Clean',
    intensity: 'none',
    filter: 'none',
    description: 'Sem efeitos de brilho ou blur. Aparência limpa e profissional.',
  },
  {
    id: 'subtle',
    name: 'Suave Discreto',
    intensity: 'subtle',
    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))',
    description: 'Sombra suave de profundidade sem neon.',
  },
];

// Helper para calcular luminância e contraste ideal de texto (Preto ou Branco)
export function getContrastTextColor(hexColor: string): string {
  if (!hexColor) return '#ffffff';
  let cleanHex = hexColor.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#0f172a' : '#ffffff';
}

export function isColorDark(hexColor: string): boolean {
  if (!hexColor) return true;
  let cleanHex = hexColor.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 140;
}

export const DEFAULT_PALETTES: PaletteTheme[] = [
  // 1. MINIMAL DARK (Padrão Sólido)
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    subtitle: 'Fundo escuro neutro com acento azul sólido',
    description: 'Design minimalista focado em clareza, alto contraste e conforto visual.',
    isDark: true,
    dominant: '#0f172a',
    secondary: '#1e293b',
    secondaryElevated: '#334155',
    border: '#334155',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    accentText: '#ffffff',
    colors: [
      { name: 'Slate 900 (Fundo)', hex: '#0f172a', role: '60% Dominante' },
      { name: 'Slate 800 (Cards)', hex: '#1e293b', role: '30% Estrutura' },
      { name: 'Slate 700 (Bordas)', hex: '#334155', role: 'Acento Secundário' },
      { name: 'Blue 500 (Destaque)', hex: '#3b82f6', role: '10% Destaque' },
      { name: 'Slate 400 (Textos)', hex: '#94a3b8', role: 'Realce' },
    ],
  },

  // 2. MINIMAL LIGHT (Claro Sólido)
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    subtitle: 'Fundo claro limpo com cards brancos sólidos',
    description: 'Visual diurno clássico e clean com cartões brancos e bordas sutis.',
    isDark: false,
    dominant: '#f8fafc',
    secondary: '#ffffff',
    secondaryElevated: '#f1f5f9',
    border: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    accent: '#2563eb',
    accentHover: '#1d4ed8',
    accentText: '#ffffff',
    colors: [
      { name: 'Slate 50 (Fundo)', hex: '#f8fafc', role: '60% Dominante' },
      { name: 'Pure White (Cards)', hex: '#ffffff', role: '30% Estrutura' },
      { name: 'Slate 200 (Bordas)', hex: '#e2e8f0', role: 'Acento Secundário' },
      { name: 'Royal Blue (Destaque)', hex: '#2563eb', role: '10% Destaque' },
      { name: 'Slate 600 (Textos)', hex: '#64748b', role: 'Realce' },
    ],
  },

  // 3. MINIMAL EMERALD
  {
    id: 'minimal-emerald',
    name: 'Minimal Emerald',
    subtitle: 'Fundo escuro com acento verde esmeralda',
    description: 'Tom acolhedor e focado em saúde e bem-estar do bebê.',
    isDark: true,
    dominant: '#0f172a',
    secondary: '#1e293b',
    secondaryElevated: '#334155',
    border: '#334155',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#10b981',
    accentHover: '#059669',
    accentText: '#ffffff',
    colors: [
      { name: 'Slate 900', hex: '#0f172a', role: '60% Dominante' },
      { name: 'Slate 800', hex: '#1e293b', role: '30% Estrutura' },
      { name: 'Slate 700', hex: '#334155', role: 'Acento Secundário' },
      { name: 'Emerald 500', hex: '#10b981', role: '10% Destaque' },
      { name: 'Emerald 300', hex: '#6ee7b7', role: 'Realce' },
    ],
  },

  // 4. MINIMAL SLATE
  {
    id: 'minimal-slate',
    name: 'Minimal Slate',
    subtitle: 'Monocromático sóbrio de alta densidade',
    description: 'Paleta sóbria em tons de carvão e ardósia.',
    isDark: true,
    dominant: '#020617',
    secondary: '#0f172a',
    secondaryElevated: '#1e293b',
    border: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#64748b',
    accentHover: '#475569',
    accentText: '#ffffff',
    colors: [
      { name: 'Slate 950', hex: '#020617', role: '60% Dominante' },
      { name: 'Slate 900', hex: '#0f172a', role: '30% Estrutura' },
      { name: 'Slate 800', hex: '#1e293b', role: 'Acento Secundário' },
      { name: 'Slate 500', hex: '#64748b', role: '10% Destaque' },
      { name: 'Slate 400', hex: '#94a3b8', role: 'Realce' },
    ],
  },
];

type ThemeListener = (palette: PaletteTheme) => void;
const listeners: ThemeListener[] = [];

export const themeService = {
  getOverrides(): Record<string, Partial<PaletteTheme>> {
    try {
      const raw = localStorage.getItem(PALETTE_OVERRIDES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveOverrides(overrides: Record<string, Partial<PaletteTheme>>): void {
    localStorage.setItem(PALETTE_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
  },

  getAllPalettes(): PaletteTheme[] {
    const overrides = this.getOverrides();
    let baseList = [...DEFAULT_PALETTES];

    // Check custom created palettes
    const customJson = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
    if (customJson) {
      try {
        const custom: PaletteTheme = JSON.parse(customJson);
        const existingIdx = baseList.findIndex((p) => p.id === custom.id || p.id === 'custom-user-palette');
        if (existingIdx >= 0) {
          baseList[existingIdx] = {
            ...custom,
            id: 'custom-user-palette',
            name: 'Minha paleta Personalizada',
          };
        } else {
          baseList.push(custom);
        }
      } catch {
        // ignore
      }
    }

    // Merge any user role choices (60%, 30%, 10%) per palette
    return baseList.map((palette) => {
      const ov = overrides[palette.id];
      if (!ov) return palette;
      return {
        ...palette,
        ...ov,
      };
    });
  },

  getCurrentPalette(): PaletteTheme {
    const activeId = localStorage.getItem(THEME_STORAGE_KEY) || 'minimal-dark';
    const all = this.getAllPalettes();
    return all.find((p) => p.id === activeId) || all[0];
  },

  setPalette(paletteId: string): PaletteTheme {
    const all = this.getAllPalettes();
    const found = all.find((p) => p.id === paletteId) || all[0];
    localStorage.setItem(THEME_STORAGE_KEY, found.id);
    this.applyTheme(found);
    listeners.forEach((fn) => fn(found));
    return found;
  },

  // Permite ao usuário redefinir as cores de 60%, 30% e 10% do grupo
  updatePaletteRoles(
    paletteId: string,
    dominant: string,
    secondary: string,
    accent: string
  ): PaletteTheme {
    const overrides = this.getOverrides();
    const isDarkBg = isColorDark(dominant);
    const accentTextColor = getContrastTextColor(accent);

    overrides[paletteId] = {
      dominant,
      secondary,
      secondaryElevated: secondary,
      accent,
      accentHover: accent,
      accentText: accentTextColor,
      isDark: isDarkBg,
      textPrimary: isDarkBg ? '#ffffff' : '#0f172a',
      textSecondary: isDarkBg ? '#cbd5e1' : '#475569',
      border: isDarkBg ? `${accent}40` : `${accent}30`,
    };

    this.saveOverrides(overrides);
    const activeId = localStorage.getItem(THEME_STORAGE_KEY);
    if (activeId === paletteId) {
      return this.setPalette(paletteId);
    }
    const updated = this.getAllPalettes().find((p) => p.id === paletteId)!;
    listeners.forEach((fn) => fn(this.getCurrentPalette()));
    return updated;
  },

  // Restaura as cores originais daquele grupo
  resetPaletteRoles(paletteId: string): PaletteTheme {
    const overrides = this.getOverrides();
    delete overrides[paletteId];
    this.saveOverrides(overrides);
    return this.setPalette(paletteId);
  },

  saveCustomPalette(palette: PaletteTheme): PaletteTheme {
    localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(palette));
    return this.setPalette(palette.id);
  },

  getFontFamilyId(): string {
    return localStorage.getItem(FONT_STORAGE_KEY) || 'plus-jakarta';
  },

  getFont(): FontOption {
    const id = this.getFontFamilyId();
    return FONT_OPTIONS.find((f) => f.id === id) || FONT_OPTIONS[0];
  },

  setFontFamily(fontId: string): FontOption {
    const found = FONT_OPTIONS.find((f) => f.id === fontId) || FONT_OPTIONS[0];
    localStorage.setItem(FONT_STORAGE_KEY, found.id);
    this.applyTheme(this.getCurrentPalette());
    listeners.forEach((fn) => fn(this.getCurrentPalette()));
    return found;
  },

  getRadiusId(): string {
    return localStorage.getItem(RADIUS_STORAGE_KEY) || 'compact';
  },

  getRadius(): RadiusOption {
    const id = this.getRadiusId();
    return RADIUS_OPTIONS.find((r) => r.id === id) || RADIUS_OPTIONS[0];
  },

  setRadius(radiusId: string): RadiusOption {
    const found = RADIUS_OPTIONS.find((r) => r.id === radiusId) || RADIUS_OPTIONS[0];
    localStorage.setItem(RADIUS_STORAGE_KEY, found.id);
    this.applyTheme(this.getCurrentPalette());
    listeners.forEach((fn) => fn(this.getCurrentPalette()));
    return found;
  },

  getGlowId(): string {
    return localStorage.getItem(GLOW_STORAGE_KEY) || 'none';
  },

  getGlow(): GlowOption {
    const id = this.getGlowId();
    return GLOW_OPTIONS.find((g) => g.id === id) || GLOW_OPTIONS[0];
  },

  setGlow(glowId: string): GlowOption {
    const found = GLOW_OPTIONS.find((g) => g.id === glowId) || GLOW_OPTIONS[0];
    localStorage.setItem(GLOW_STORAGE_KEY, found.id);
    this.applyTheme(this.getCurrentPalette());
    listeners.forEach((fn) => fn(this.getCurrentPalette()));
    return found;
  },

  applyTheme(palette: PaletteTheme): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Apply Color CSS Variables adhering to 60/30/10
    root.style.setProperty('--color-dominant', palette.dominant);
    root.style.setProperty('--color-secondary', palette.secondary);
    root.style.setProperty('--color-secondary-elevated', palette.secondaryElevated);
    root.style.setProperty('--color-border', palette.border);
    root.style.setProperty('--color-text-primary', palette.textPrimary);
    root.style.setProperty('--color-text-secondary', palette.textSecondary);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-accent-hover', palette.accentHover);
    root.style.setProperty('--color-accent-text', palette.accentText);

    // 2. Apply Typography Variable
    const font = this.getFont();
    root.style.setProperty('--font-family-app', font.family);

    // 3. Apply Shape & Radius Variables
    const radius = this.getRadius();
    root.style.setProperty('--app-card-radius', radius.cardRadius);

    // 4. Apply Glow Effect Variable
    const glow = this.getGlow();
    root.style.setProperty('--app-glow-filter', glow.filter);

    // Apply color scheme attribute for browser elements
    root.style.colorScheme = palette.isDark ? 'dark' : 'light';
    root.setAttribute('data-theme', palette.id);
    root.setAttribute('data-mode', palette.isDark ? 'dark' : 'light');

    // Update body background and font family
    if (document.body) {
      document.body.style.backgroundColor = palette.dominant;
      document.body.style.fontFamily = font.family;
    }
  },

  initTheme(): PaletteTheme {
    const current = this.getCurrentPalette();
    this.applyTheme(current);
    return current;
  },

  subscribe(listener: ThemeListener): () => void {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },
};
