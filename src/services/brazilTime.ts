/**
 * Utility functions for Brazil Time (Horário de Brasília - UTC-3 / America/Sao_Paulo)
 */

/**
 * Returns current hour in Brazil (0 to 23)
 */
export const getBrazilHour = (date: Date = new Date()): number => {
  try {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      hour12: false,
    });
    const formatted = formatter.format(date);
    const parsed = parseInt(formatted, 10);
    return isNaN(parsed) ? date.getHours() : parsed;
  } catch {
    // Fallback: estimate Brasília time (UTC-3)
    const utcHour = date.getUTCHours();
    return (utcHour - 3 + 24) % 24;
  }
};

/**
 * Returns formatted time string in Brazil (e.g., "14:35")
 */
export const getBrazilTimeString = (date: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    const h = getBrazilHour(date);
    const m = date.getMinutes();
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
};

/**
 * Determines whether it is currently daytime in Brazil.
 * Standard daytime is defined from 06:00 to 17:59 (inclusive).
 * Nighttime is 18:00 to 05:59.
 */
export const isDaytimeInBrazil = (date: Date = new Date()): boolean => {
  const hour = getBrazilHour(date);
  return hour >= 6 && hour < 18;
};

/**
 * Returns dynamic sleep emoji based on Brazil time:
 * - Daytime (06h - 18h): ☀️ (Sol / Soneca diurna)
 * - Nighttime (18h - 06h): 🌙 (Lua / Sono noturno)
 */
export const getBrazilSleepEmoji = (date: Date = new Date()): string => {
  return isDaytimeInBrazil(date) ? '☀️' : '🌙';
};

/**
 * Returns label for sleep based on Brazil time:
 * - Daytime: 'Soneca'
 * - Nighttime: 'Sono noturno'
 */
export const getBrazilSleepLabel = (date: Date = new Date()): string => {
  return isDaytimeInBrazil(date) ? 'Soneca' : 'Sono noturno';
};
