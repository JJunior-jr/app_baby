# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start dev server on port 3000 with hot reload
npm run dev

# Type-check the entire codebase (no emit, fast)
npm run lint

# Build for production
npm run build

# Clean build artifacts
npm run clean

# Preview production build locally
npm run preview
```

## Architecture Overview

**Baby John** is an offline-first React mobile diary app for tracking baby activities (feeding, sleep, diapers, meals, customs). The app runs entirely in the browser with localStorage persistence and a queued sync system for when connectivity returns.

### Core Services (Singleton Pattern)

All services are singletons located in `src/services/`:

- **`apiService`** — Activity CRUD operations with localStorage backend. Maintains two collections: activities and custom activity definitions. Includes seed data matching Portuguese UI ("Boa noite, Papai!", baby "John", dates August 18-19, 2026). Returns activities sorted descending by timestamp.

- **`authService`** — Mock JWT generation and user management. Creates realistic JWT tokens with HS256 header, payload (sub, name, email, babyName, role, iat, exp), and simulated signature. Maintains default user "Papai" with baby "John" (birthdate: 2026-04-10). No password validation—focus is on token structure for future FastAPI integration.

- **`syncService`** — Offline queue manager implementing a pub/sub pattern. Manages pending/failed/syncing/synced items in localStorage. Auto-syncs when device comes online (detected via navigator.onLine and window events). Includes simulated offline mode for testing. Max 50 queue items. Tracks last sync timestamp and result metadata.

- **`themeService`** — 13 built-in color palettes (DEFAULT_PALETTES) plus custom palette support using 60/30/10 color distribution rule (60% dominant background, 30% secondary cards/structure, 10% accent highlights). Each palette has dark/light mode, text colors, borders, and hover states. Applies via CSS custom properties. Supports per-palette color overrides without destroying defaults.

- **`feedbackService`** — User feedback collection with engagement tracking. Records interactions, activity creation milestones, and feature usage. Triggers contextual feedback prompts based on time-on-platform (8+ min), interaction count (8+), activity creation (every 5), or explicit feature milestones (calendar, reminders). Respects 15-minute cooldown between prompts. Returns FeedbackPromptTrigger with shouldShow flag and reason.

### Data Model (src/types/index.ts)

Key types:
- **ActivityItem** — Represents a single logged activity (amamentacao, sono, fralda, comeu, custom, etc.) with ISO timestamp, date/time strings, period (Noite/Tarde/Manhã), details object containing type-specific data.
- **OfflineSyncQueueItem** — Queued operation with id, operation type (CREATE_ACTIVITY, UPDATE_ACTIVITY, DELETE_ACTIVITY, CREATE_CUSTOM_ACTIVITY, SUBMIT_FEEDBACK), entity type/id, payload, and status (pending/syncing/synced/failed).
- **PaletteTheme** — Complete color palette definition with 60/30/10 roles, text colors, border, accent states, and color samples array.
- **UserProfile** — User identity with JWT token, baby name, and birthdate.

### App Structure

**Root component** (`src/App.tsx`):
- Single source of truth for all screen state (activeTab, selectedDate, filters, modals)
- Manages theme subscription and sync observer
- Loads data on mount; re-fetches after offline sync completes
- Routes to 5 screens via activeTab: inicio (home), diario (diary), rotinas (routines), insights, saude (health)
- Renders all modals at bottom of component tree (ActivityBottomSheet, BreastfeedingModal, DiaperModal, SleepModal, MealModal, FilterModal, ManageActivitiesModal, NewActivityModal, AuthModal, DockerVpsGuideModal, CalendarSyncModal, PermissionsDiagnosticsModal, FeedbackPromptModal, FeedbackManagementModal, OfflineSyncModal)
- BottomNav persists across all tabs

**Components** (`src/components/`):
- Screen components (HomeScreen, DiaryScreen, RoutinesScreen, InsightsScreen, HealthScreen) are stateless; receive handlers and state as props
- Modal components live in `modals/` subdirectory; manage their own form state
- StatusBar shows native mobile UI (time, WiFi, battery, offline indicator)
- BottomNav is a fixed dock with 5 tabs (fully rounded shape via TailwindCSS)

### Key Behaviors

**Offline-First Sync**:
1. When an activity is created/updated/deleted, `apiService` immediately enqueues it via `syncService.enqueue()` with status 'synced' or 'pending' depending on `navigator.onLine`.
2. SyncService listens for `window.online` events and auto-triggers `syncPendingQueue()`.
3. Each queued item has retryCount, errorMessage, and createdAt for debugging.
4. UI subscribes to `syncService.getSyncStatus()` to display pending count and sync progress.

**Theme System**:
- Applies CSS custom properties (--color-dominant, --color-secondary, etc.) to document root
- Sets `data-theme` and `data-mode` attributes for CSS selectors
- Supports per-palette color overrides stored separately from base palettes (allows reverting to defaults)
- Light and dark mode distinction via `isDark` boolean and adaptive text colors

**Feedback Prompts**:
- Evaluated on every interaction via `recordInteraction()` or feature-specific triggers
- Respects 15-minute cooldown to avoid harassment
- Reasons: time_on_platform (8+ min + 8+ interactions), activity_milestone (every 5 activities), feature_interaction (calendar/reminders), manual (user-initiated from settings)
- Suggested feature contextually picked based on trigger (e.g., 'amamentacao' after breastfeeding activity)

**Portuguese Localization**:
- All UI strings, period names (Noite, Tarde, Manhã), and activity types are in Portuguese
- Default user name "Papai", email is hardcoded
- Types use Portuguese naming: `amamentacao`, `fralda`, `sono`, `comeu`

### Data Persistence Strategy

All data lives in localStorage under v2 keys:
- Activities: `baby_john_activities_v2`
- Custom activities: `baby_john_custom_activities_v2`
- Sync queue: `baby_john_offline_queue_v2`
- User: `baby_john_user`
- JWT token: `baby_john_jwt_token`
- Theme ID: `baby_john_palette_theme_id`
- Engagement stats: `baby_john_engagement_stats_v1`
- Feedback list: `baby_john_user_feedbacks_v1`

Keys include version suffix to allow safe migrations. Services gracefully fall back to INITIAL_ACTIVITIES and DEFAULT_PALETTES if keys are missing or corrupted.

### Styling

- **Framework**: Tailwind CSS v4.1 via `@tailwindcss/vite` plugin
- **Colors**: Dynamic via CSS custom properties (not Tailwind predefined colors) to support runtime theme switching
- **Motion**: `motion` library for smooth animations
- **Icons**: `lucide-react` for SVG icons
- **Index CSS**: (`src/index.css`) defines global resets and CSS variables

### Development Notes

- TypeScript strict mode enabled; path alias `@/*` points to root
- React 19 with StrictMode in development
- Vite dev server runs on port 3000 with `--host=0.0.0.0` to allow external access
- HMR disabled in AI Studio (respects `DISABLE_HMR` env var)
- No external API calls; all data is mocked for demonstration
- Components use inline tailwind classes; no CSS modules or styled-components
- Feedback prompt evaluation happens periodically (45s interval) and on user actions

### Integration Points for Future Backend

- `apiService.getActivities()` and `apiService.createActivity()` currently use localStorage; replace with fetch() calls to FastAPI endpoints
- JWT tokens generated here match the expected header/payload structure; real backend should validate signatures
- `syncService.processItemToDatabase()` is a stub; wire to actual API calls here
- Calendar sync modal references external integrations but is UI-only
- Feedback service can POST to `/api/feedback` endpoint when backend is ready
