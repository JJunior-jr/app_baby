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
  // 0. PALETA ATUAL DO APP (PADRÃO)
  {
    id: 'deep-purple',
    name: 'Noite Cósmica (Atual)',
    subtitle: '60% Fundo Escuro · 30% Cards Índigo · 10% Roxo Vibrante',
    description: 'A paleta padrão original do aplicativo, suave para os olhos em uso noturno.',
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

  // 1. PURPLE SUNSET
  {
    id: 'purple-sunset',
    name: '1. Purple Sunset',
    subtitle: '60% Dark Ultramarine · 30% Dark Raspberry · 10% Flame Orange',
    description: 'Electric purple and hot pink melt into fiery orange and sunshine gold for a dazzling sunset spectrum.',
    isDark: true,
    dominant: '#390099',
    secondary: '#9e0059',
    secondaryElevated: '#750042',
    border: '#9e005980',
    textPrimary: '#ffffff',
    textSecondary: '#ffd6ea',
    accent: '#ff5400',
    accentHover: '#ff0054',
    accentText: '#ffffff',
    colors: [
      { name: 'Dark Ultramarine', hex: '#390099', role: '60% Dominante' },
      { name: 'Dark Raspberry', hex: '#9e0059', role: '30% Estrutura' },
      { name: 'Hot Fuchsia', hex: '#ff0054', role: 'Acento Secundário' },
      { name: 'Flame Orange', hex: '#ff5400', role: '10% Destaque' },
      { name: 'Amber Flame', hex: '#ffbd00', role: 'Realce' },
    ],
  },

  // 2. AUTUMN HARVEST
  {
    id: 'autumn-harvest',
    name: '2. Autumn Harvest',
    subtitle: '60% Dark Coffee · 30% Dark Wine · 10% Camel',
    description: 'Toasted reds, brown sugar, and mellow golds conjure spicy autumn winds and countryside warmth.',
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

  // 3. FIERY PALETTE
  {
    id: 'fiery-palette',
    name: '3. Fiery Palette',
    subtitle: '60% Dark Teal · 30% Crimson Violet · 10% Princeton Orange',
    description: 'Rich burgundy and wine tones anchor burnt orange and gold; cool navy brings fierce, adventurous spirit.',
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

  // 4. SUNNY BEACH DAY
  {
    id: 'sunny-beach-day',
    name: '4. Sunny Beach Day',
    subtitle: '60% Charcoal Blue · 30% Verdigris · 10% Burnt Peach',
    description: 'Golden sand meets turquoise waves under a deep blue sky, kissed by coral and sunlit amber warmth.',
    isDark: true,
    dominant: '#264653',
    secondary: '#2a9d8f',
    secondaryElevated: '#207d72',
    border: '#2a9d8f60',
    textPrimary: '#ffffff',
    textSecondary: '#e9c46a',
    accent: '#e76f51',
    accentHover: '#f4a261',
    accentText: '#ffffff',
    colors: [
      { name: 'Charcoal Blue', hex: '#264653', role: '60% Dominante' },
      { name: 'Verdigris', hex: '#2a9d8f', role: '30% Estrutura' },
      { name: 'Sandy Brown', hex: '#f4a261', role: 'Acento Secundário' },
      { name: 'Burnt Peach', hex: '#e76f51', role: '10% Destaque' },
      { name: 'Jasmine', hex: '#e9c46a', role: 'Realce' },
    ],
  },

  // 5. BOLD BERRY
  {
    id: 'bold-berry',
    name: '5. Bold Berry',
    subtitle: '60% Crimson Violet · 30% Cherry Rose · 10% Blush Rose',
    description: 'Caramel, blush, berry velvet, and deepest violet exude playful boldness with a magnetic charm.',
    isDark: true,
    dominant: '#450920',
    secondary: '#a53860',
    secondaryElevated: '#822749',
    border: '#da627d50',
    textPrimary: '#fff1f2',
    textSecondary: '#ffa5ab',
    accent: '#da627d',
    accentHover: '#ffa5ab',
    accentText: '#ffffff',
    colors: [
      { name: 'Crimson Violet', hex: '#450920', role: '60% Dominante' },
      { name: 'Cherry Rose', hex: '#a53860', role: '30% Estrutura' },
      { name: 'Blush Rose', hex: '#da627d', role: '10% Destaque' },
      { name: 'Cotton Candy', hex: '#ffa5ab', role: 'Acento Secundário' },
      { name: 'Soft Apricot', hex: '#f9dbbd', role: 'Realce' },
    ],
  },

  // 6. EARTHY FOREST HUES
  {
    id: 'earthy-forest-hues',
    name: '6. Earthy Forest Hues',
    subtitle: '60% Pine Teal · 30% Hunter Green · 10% Dry Sage',
    description: 'Olive green, rich moss, and earthy taupes conjure tranquil forests and the rejuvenating outdoors.',
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

  // 7. SKY BLUE FRESHNESS
  {
    id: 'sky-blue-freshness',
    name: '7. Sky Blue Freshness',
    subtitle: '60% Baltic Blue · 30% Steel Blue · 10% Lime Moss',
    description: 'Sky blues and zesty greens meet soft white, bursting vitality, clarity, youthfulness, and peace.',
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
    name: '9. Warm Neutrals',
    subtitle: '60% Powder Petal · 30% Linen · 10% Light Bronze',
    description: 'Earthy browns and mossy greens paired with buttery creams and blush for a sophisticated coziness.',
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
    name: '10. Rustic Charm',
    subtitle: '60% Carbon Black · 30% Charcoal Brown · 10% Spicy Paprika',
    description: 'Wheat beige, charcoal, and rust mingle for cozy, inviting warmth and earthy, rustic character.',
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
    name: '11. Silver Lining',
    subtitle: '60% Charcoal · 30% Grey · 10% Platinum',
    description: 'Sculpted grays progress from iron to pearl, evoking sleek modernity and muted, serene presence.',
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
    name: '12. Deep Blue Waters',
    subtitle: '60% Yale Blue · 30% Baltic Blue · 10% Sky Blue (Light)',
    description: 'Deep blues, icy tones, and silver light conjure ocean depths and peaceful aquatic adventures.',
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
    name: '13. Ocean Breeze',
    subtitle: '60% Blue Slate · 30% Glaucous · 10% Vibrant Coral',
    description: 'Cool grays, gentle blues, and a splash of peachy red capture easygoing days and brisk sea air.',
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
        baseList.push(custom);
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

  applyTheme(palette: PaletteTheme): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Apply CSS Variables adhering to 60/30/10
    root.style.setProperty('--color-dominant', palette.dominant);
    root.style.setProperty('--color-secondary', palette.secondary);
    root.style.setProperty('--color-secondary-elevated', palette.secondaryElevated);
    root.style.setProperty('--color-border', palette.border);
    root.style.setProperty('--color-text-primary', palette.textPrimary);
    root.style.setProperty('--color-text-secondary', palette.textSecondary);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-accent-hover', palette.accentHover);
    root.style.setProperty('--color-accent-text', palette.accentText);

    // Apply color scheme attribute for browser elements
    root.style.colorScheme = palette.isDark ? 'dark' : 'light';
    root.setAttribute('data-theme', palette.id);
    root.setAttribute('data-mode', palette.isDark ? 'dark' : 'light');

    // Update body background
    if (document.body) {
      document.body.style.backgroundColor = palette.dominant;
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
