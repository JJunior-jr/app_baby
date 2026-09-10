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
    name: 'Compacto (12px)',
    cardRadius: '12px',
    description: 'Cantos mais sóbrios e estruturados, com aproveitamento de espaço.',
  },
  {
    id: 'smooth',
    name: 'Suave / Padrão (20px)',
    cardRadius: '20px',
    description: 'Equilíbrio visual moderno e agradável ao toque.',
  },
  {
    id: 'pill',
    name: 'Super Orgânico (28px)',
    cardRadius: '28px',
    description: 'Formas ultra suaves e acolhedoras com cantos arredondados pronunciados.',
  },
];

export interface GlowOption {
  id: string;
  name: string;
  intensity: 'subtle' | 'normal' | 'vibrant';
  filter: string;
  description: string;
}

export const GLOW_OPTIONS: GlowOption[] = [
  {
    id: 'subtle',
    name: 'Discreto / Suave',
    intensity: 'subtle',
    filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.15))',
    description: 'Arco minimalista com halo delicado e sem difusão exagerada.',
  },
  {
    id: 'normal',
    name: 'Normal Equilibrado',
    intensity: 'normal',
    filter: 'drop-shadow(0 0 10px var(--color-accent))',
    description: 'Brilho envolvente que acompanha a cor de destaque da paleta.',
  },
  {
    id: 'vibrant',
    name: 'Neon Vibrante (Estilo Imagens)',
    intensity: 'vibrant',
    filter: 'drop-shadow(0 0 16px var(--color-accent)) drop-shadow(0 0 6px #ffffff90)',
    description: 'Aura cósmica de alto contraste, igual às capturas com arco brilhante.',
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
  // 1. NOITE CÓSMICA
  {
    id: 'deep-purple',
    name: 'Noite cósmica',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#080913',
    secondary: '#13162a',
    secondaryElevated: '#1a1f38',
    border: '#232747',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#7c3aed',
    accentHover: '#6d28d9',
    accentText: '#ffffff',
    colors: [
      { name: 'Cosmic Black', hex: '#080913', role: '60% Dominante' },
      { name: 'Dark Indigo', hex: '#13162a', role: '30% Estrutura' },
      { name: 'Deep Violet', hex: '#1a1f38', role: 'Acento Secundário' },
      { name: 'Vibrant Purple', hex: '#7c3aed', role: '10% Destaque' },
      { name: 'Lavender Mist', hex: '#a855f7', role: 'Realce' },
    ],
  },

  // 2. FRALDA & SUNSET GLOW
  {
    id: 'image-fralda-sunset',
    name: 'Fralda & sunset glow',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#090d14',
    secondary: '#101723',
    secondaryElevated: '#162232',
    border: '#ff525240',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#ff5252',
    accentHover: '#ff7a00',
    accentText: '#ffffff',
    colors: [
      { name: 'Midnight Dark', hex: '#090d14', role: '60% Dominante' },
      { name: 'Dark Slate', hex: '#101723', role: '30% Estrutura' },
      { name: 'Sunset Coral', hex: '#ff5252', role: '10% Destaque' },
      { name: 'Neon Mint', hex: '#00e5a3', role: 'Acento Secundário' },
      { name: 'Flame Orange', hex: '#ff9f43', role: 'Realce' },
      { name: 'Golden Amber', hex: '#f59e0b', role: 'Realce' },
      { name: 'Cyan Sky', hex: '#00d2d3', role: 'Realce' },
    ],
  },

  // 3. AMAMENTAÇÃO & NEON BLOOM
  {
    id: 'image-peito-neon',
    name: 'Amamentação & Neon Bloom',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#0d0b1a',
    secondary: '#171329',
    secondaryElevated: '#221a3b',
    border: '#d946ef40',
    textPrimary: '#fdf4ff',
    textSecondary: '#d8b4fe',
    accent: '#d946ef',
    accentHover: '#c026d3',
    accentText: '#ffffff',
    colors: [
      { name: 'Cosmic Violet', hex: '#0d0b1a', role: '60% Dominante' },
      { name: 'Twilight Plum', hex: '#171329', role: '30% Estrutura' },
      { name: 'Hot Fuchsia', hex: '#d946ef', role: '10% Destaque' },
      { name: 'Orchid Lilac', hex: '#c084fc', role: 'Acento Secundário' },
      { name: 'Formula Mint', hex: '#2dd4bf', role: 'Realce' },
      { name: 'Ruby Magenta', hex: '#e11d48', role: 'Realce' },
      { name: 'Soft Rose', hex: '#f472b6', role: 'Realce' },
    ],
  },

  // 4. SONO CÓSMICO & CIANO NEON
  {
    id: 'image-sono-cosmico',
    name: 'Sono Cósmico & Ciano Neon',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#080a18',
    secondary: '#12152e',
    secondaryElevated: '#1a1e42',
    border: '#00d2d340',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#00d2d3',
    accentHover: '#0891b2',
    accentText: '#080a18',
    colors: [
      { name: 'Midnight Abyss', hex: '#080a18', role: '60% Dominante' },
      { name: 'Cosmic Navy', hex: '#12152e', role: '30% Estrutura' },
      { name: 'Electric Cyan', hex: '#00d2d3', role: '10% Destaque' },
      { name: 'Royal Indigo', hex: '#7c3aed', role: 'Acento Secundário' },
      { name: 'Lavender Periwinkle', hex: '#818cf8', role: 'Realce' },
      { name: 'Twilight Purple', hex: '#1b1633', role: 'Realce' },
      { name: 'Solar Amber', hex: '#f59e0b', role: 'Realce' },
    ],
  },

  // 5. AUTUMN HARVEST
  {
    id: 'autumn-harvest',
    name: 'Autumn harvest',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#432818',
    secondary: '#6f1d1b',
    secondaryElevated: '#99582a',
    border: '#bb945750',
    textPrimary: '#ffffff',
    textSecondary: '#ffe6a7',
    accent: '#bb9457',
    accentHover: '#99582a',
    accentText: '#2d1808',
    colors: [
      { name: 'Dark Coffee', hex: '#432818', role: '60% Dominante' },
      { name: 'Dark Wine', hex: '#6f1d1b', role: '30% Estrutura' },
      { name: 'Chocolate Brown', hex: '#99582a', role: 'Acento Secundário' },
      { name: 'Camel', hex: '#bb9457', role: '10% Destaque' },
      { name: 'Light Apricot', hex: '#ffe6a7', role: 'Realce' },
    ],
  },

  // 6. FLERY PALETTE
  {
    id: 'fiery-palette',
    name: 'Flery Palette',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#0f4c5c',
    secondary: '#5f0f40',
    secondaryElevated: '#9a031e',
    border: '#fb8b2440',
    textPrimary: '#ffffff',
    textSecondary: '#fed7aa',
    accent: '#fb8b24',
    accentHover: '#e36414',
    accentText: '#1c1917',
    colors: [
      { name: 'Dark Teal', hex: '#0f4c5c', role: '60% Dominante' },
      { name: 'Crimson Violet', hex: '#5f0f40', role: '30% Estrutura' },
      { name: 'Deep Crimson', hex: '#9a031e', role: 'Acento Secundário' },
      { name: 'Princeton Orange', hex: '#fb8b24', role: '10% Destaque' },
      { name: 'Autumn Leaf', hex: '#e36414', role: 'Realce' },
    ],
  },

  // 7. EARTHY FOREST HUES
  {
    id: 'earthy-forest-hues',
    name: 'Earthy Forest Hues',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#344e41',
    secondary: '#3a5a40',
    secondaryElevated: '#588157',
    border: '#a3b18a40',
    textPrimary: '#f5f5f4',
    textSecondary: '#dad7cd',
    accent: '#a3b18a',
    accentHover: '#588157',
    accentText: '#1c2821',
    colors: [
      { name: 'Pine Teal', hex: '#344e41', role: '60% Dominante' },
      { name: 'Hunter Green', hex: '#3a5a40', role: '30% Estrutura' },
      { name: 'Fern', hex: '#588157', role: 'Acento Secundário' },
      { name: 'Dry Sage', hex: '#a3b18a', role: '10% Destaque' },
      { name: 'Dust Grey', hex: '#dad7cd', role: 'Realce' },
    ],
  },

  // 8. SKY BLUE FRESHNESS
  {
    id: 'sky-blue-freshness',
    name: 'Sky Blue Freshness',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#05668d',
    secondary: '#427aa1',
    secondaryElevated: '#356385',
    border: '#ebf2fa30',
    textPrimary: '#ebf2fa',
    textSecondary: '#d0e0eb',
    accent: '#a5be00',
    accentHover: '#679436',
    accentText: '#172200',
    colors: [
      { name: 'Baltic Blue', hex: '#05668d', role: '60% Dominante' },
      { name: 'Steel Blue', hex: '#427aa1', role: '30% Estrutura' },
      { name: 'Sage Green', hex: '#679436', role: 'Acento Secundário' },
      { name: 'Lime Moss', hex: '#a5be00', role: '10% Destaque' },
      { name: 'Alice Blue', hex: '#ebf2fa', role: 'Realce' },
    ],
  },

  // 9. WARM NEUTRALS
  {
    id: 'warm-neutrals',
    name: 'warm Neutrals',
    subtitle: '',
    description: '',
    isDark: false,
    dominant: '#eddcd2',
    secondary: '#fff1e6',
    secondaryElevated: '#f0efeb',
    border: '#ddbea9',
    textPrimary: '#2d231e',
    textSecondary: '#6e5a51',
    accent: '#cb997e',
    accentHover: '#a5a58d',
    accentText: '#ffffff',
    colors: [
      { name: 'Powder Petal', hex: '#eddcd2', role: '60% Dominante' },
      { name: 'Linen', hex: '#fff1e6', role: '30% Estrutura' },
      { name: 'Parchment', hex: '#f0efeb', role: 'Acento Secundário' },
      { name: 'Light Bronze', hex: '#cb997e', role: '10% Destaque' },
      { name: 'Desert Sand', hex: '#ddbea9', role: 'Realce' },
      { name: 'Dry Sage', hex: '#a5a58d', role: 'Realce' },
      { name: 'Ash Grey', hex: '#b7b7a4', role: 'Realce' },
    ],
  },

  // 10. RUSTIC CHARM
  {
    id: 'rustic-charm',
    name: 'rustic charm',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#252422',
    secondary: '#403d39',
    secondaryElevated: '#54504b',
    border: '#ccc5b940',
    textPrimary: '#fffcf2',
    textSecondary: '#ccc5b9',
    accent: '#eb5e28',
    accentHover: '#d44d18',
    accentText: '#ffffff',
    colors: [
      { name: 'Carbon Black', hex: '#252422', role: '60% Dominante' },
      { name: 'Charcoal Brown', hex: '#403d39', role: '30% Estrutura' },
      { name: 'Silver', hex: '#ccc5b9', role: 'Acento Secundário' },
      { name: 'Spicy Paprika', hex: '#eb5e28', role: '10% Destaque' },
      { name: 'Floral White', hex: '#fffcf2', role: 'Realce' },
    ],
  },

  // 11. SILVER LINING
  {
    id: 'silver-lining',
    name: 'silver lining',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#2a2a2a',
    secondary: '#595959',
    secondaryElevated: '#7f7f7f',
    border: '#a5a5a550',
    textPrimary: '#f2f2f2',
    textSecondary: '#cccccc',
    accent: '#f2f2f2',
    accentHover: '#cccccc',
    accentText: '#181818',
    colors: [
      { name: 'Dark Carbon', hex: '#2a2a2a', role: '60% Dominante' },
      { name: 'Charcoal', hex: '#595959', role: '30% Estrutura' },
      { name: 'Grey', hex: '#7f7f7f', role: 'Acento Secundário' },
      { name: 'Silver', hex: '#a5a5a5', role: 'Realce' },
      { name: 'Dust Grey', hex: '#cccccc', role: 'Realce' },
      { name: 'Platinum', hex: '#f2f2f2', role: '10% Destaque' },
    ],
  },

  // 12. DEEP BLUE WATERS
  {
    id: 'deep-blue-waters',
    name: 'deep Blue Waters',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#16425b',
    secondary: '#2f6690',
    secondaryElevated: '#3a7ca5',
    border: '#3a7ca560',
    textPrimary: '#ffffff',
    textSecondary: '#d9dcd6',
    accent: '#81c3d7',
    accentHover: '#3a7ca5',
    accentText: '#0f2939',
    colors: [
      { name: 'Yale Blue', hex: '#16425b', role: '60% Dominante' },
      { name: 'Baltic Blue', hex: '#2f6690', role: '30% Estrutura' },
      { name: 'Steel Blue', hex: '#3a7ca5', role: 'Acento Secundário' },
      { name: 'Sky Blue (Light)', hex: '#81c3d7', role: '10% Destaque' },
      { name: 'Dust Grey', hex: '#d9dcd6', role: 'Realce' },
    ],
  },

  // 13. OCEAN BREEZE
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#232c37',
    secondary: '#495867',
    secondaryElevated: '#577399',
    border: '#bdd5ea40',
    textPrimary: '#f7f7ff',
    textSecondary: '#bdd5ea',
    accent: '#fe5f55',
    accentHover: '#e04f46',
    accentText: '#ffffff',
    colors: [
      { name: 'Dark Slate', hex: '#232c37', role: '60% Dominante' },
      { name: 'Blue Slate', hex: '#495867', role: '30% Estrutura' },
      { name: 'Glaucous', hex: '#577399', role: 'Acento Secundário' },
      { name: 'Vibrant Coral', hex: '#fe5f55', role: '10% Destaque' },
      { name: 'Pale Sky', hex: '#bdd5ea', role: 'Realce' },
      { name: 'Ghost White', hex: '#f7f7ff', role: 'Realce' },
    ],
  },

  // 14. MINHA PALETA PERSONALIZADA
  {
    id: 'custom-user-palette',
    name: 'Minha paleta Personalizada',
    subtitle: '',
    description: '',
    isDark: true,
    dominant: '#0c0e1a',
    secondary: '#16192e',
    secondaryElevated: '#1f2340',
    border: '#7c3aed40',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    accentText: '#ffffff',
    colors: [
      { name: 'Fundo (60%)', hex: '#0c0e1a', role: '60% Dominante' },
      { name: 'Cards (30%)', hex: '#16192e', role: '30% Estrutura' },
      { name: 'Destaque (10%)', hex: '#8b5cf6', role: '10% Destaque' },
      { name: 'Acento Secundário', hex: '#3b82f6', role: 'Acento Secundário' },
      { name: 'Realce 1', hex: '#06b6d4', role: 'Realce' },
      { name: 'Realce 2', hex: '#ec4899', role: 'Realce' },
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
    const activeId = localStorage.getItem(THEME_STORAGE_KEY) || 'deep-purple';
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
    return localStorage.getItem(RADIUS_STORAGE_KEY) || 'smooth';
  },

  getRadius(): RadiusOption {
    const id = this.getRadiusId();
    return RADIUS_OPTIONS.find((r) => r.id === id) || RADIUS_OPTIONS[1];
  },

  setRadius(radiusId: string): RadiusOption {
    const found = RADIUS_OPTIONS.find((r) => r.id === radiusId) || RADIUS_OPTIONS[1];
    localStorage.setItem(RADIUS_STORAGE_KEY, found.id);
    this.applyTheme(this.getCurrentPalette());
    listeners.forEach((fn) => fn(this.getCurrentPalette()));
    return found;
  },

  getGlowId(): string {
    return localStorage.getItem(GLOW_STORAGE_KEY) || 'normal';
  },

  getGlow(): GlowOption {
    const id = this.getGlowId();
    return GLOW_OPTIONS.find((g) => g.id === id) || GLOW_OPTIONS[1];
  },

  setGlow(glowId: string): GlowOption {
    const found = GLOW_OPTIONS.find((g) => g.id === glowId) || GLOW_OPTIONS[1];
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
