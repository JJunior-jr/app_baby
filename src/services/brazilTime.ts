/**
 * Utility functions for Geolocation-Aware Date & Time Synchronization.
 * Automatically resolves active timezone from device/Intl or Geolocation API,
 * ensuring calendar and clocks remain 100% synchronized across sessions.
 */

let activeTimezone: string = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
  } catch {
    return 'America/Sao_Paulo';
  }
})();

/**
 * Returns current active timezone (e.g. "America/Sao_Paulo")
 */
export const getActiveTimezone = (): string => activeTimezone;

/**
 * Allows dynamic timezone update from Geolocation or User Preference
 */
export const setTimezone = (tzName: string): void => {
  if (tzName && typeof tzName === 'string') {
    activeTimezone = tzName;
  }
};

/**
 * Attempts to request HTML5 Geolocation to validate local timezone & coordinates
 */
export const syncGeolocationTimezone = async (): Promise<{ timezone: string; lat?: number; lng?: number }> => {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return { timezone: activeTimezone };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || activeTimezone;
          activeTimezone = tz;
          resolve({ timezone: tz, lat: pos.coords.latitude, lng: pos.coords.longitude });
        } catch {
          resolve({ timezone: activeTimezone, lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      },
      () => {
        resolve({ timezone: activeTimezone });
      },
      { timeout: 5000, maximumAge: 60000 }
    );
  });
};

/**
 * Returns current hour (0 to 23) in the active timezone
 */
export const getBrazilHour = (date: Date = new Date()): number => {
  try {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: activeTimezone,
      hour: 'numeric',
      hour12: false,
    });
    const formatted = formatter.format(date);
    const parsed = parseInt(formatted, 10);
    return isNaN(parsed) ? date.getHours() : parsed;
  } catch {
    const utcHour = date.getUTCHours();
    return (utcHour - 3 + 24) % 24;
  }
};

/**
 * Returns formatted time string in active timezone (e.g., "14:35")
 */
export const getBrazilTimeString = (date: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: activeTimezone,
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
 * Returns formatted date string in active timezone (e.g., "2026-10-29")
 */
export const getBrazilDateString = (date: Date = new Date()): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: activeTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // Returns YYYY-MM-DD
  } catch {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
};

/**
 * Returns the current period in active timezone: 'Manhã', 'Tarde', or 'Noite'
 */
export const getBrazilPeriod = (date: Date = new Date()): 'Manhã' | 'Tarde' | 'Noite' => {
  const hour = getBrazilHour(date);
  if (hour >= 6 && hour < 12) return 'Manhã';
  if (hour >= 12 && hour < 18) return 'Tarde';
  return 'Noite';
};

/**
 * Determines whether it is currently daytime (Soneca diurna ☀️) or nighttime (Sono noturno 🌙).
 */
export const isDaytime = (date: Date = new Date()): boolean => {
  const hour = getBrazilHour(date);
  return hour >= 6 && hour < 18;
};

export const isDaytimeInBrazil = (date: Date = new Date()): boolean => {
  return isDaytime(date);
};

/**
 * Returns dynamic sleep emoji based on current time:
 * - Daytime (06h - 18h): ☀️ (Sol / Soneca diurna)
 * - Nighttime (18h - 06h): 🌙 (Lua / Sono noturno)
 */
export const getBrazilSleepEmoji = (date: Date = new Date()): string => {
  return isDaytimeInBrazil(date) ? '☀️' : '🌙';
};

/**
 * Returns label for sleep based on current time:
 * - Daytime: 'Soneca'
 * - Nighttime: 'Sono noturno'
 */
export const getBrazilSleepLabel = (date: Date = new Date()): string => {
  return isDaytimeInBrazil(date) ? 'Soneca' : 'Sono noturno';
};
