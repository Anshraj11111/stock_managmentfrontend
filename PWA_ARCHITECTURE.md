# PWA Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Application                        │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Landing Page (/landing)                             │  │ │
│  │  │  ┌────────────────────────────────────────────────┐  │  │ │
│  │  │  │  Install Popup (shows after 2 seconds)         │  │  │ │
│  │  │  │  - "Install Now" button                        │  │  │ │
│  │  │  │  - "Maybe Later" button                        │  │  │ │
│  │  │  │  - Captures beforeinstallprompt event          │  │  │ │
│  │  │  └────────────────────────────────────────────────┘  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  App.jsx (Main Application)                          │  │ │
│  │  │  ┌────────────────────────────────────────────────┐  │  │ │
│  │  │  │  OfflineIndicator (top banner)                 │  │  │ │
│  │  │  │  - Shows when offline                          │  │  │ │
│  │  │  │  - Dismissible                                 │  │  │ │
│  │  │  └────────────────────────────────────────────────┘  │  │ │
│  │  │                                                       │  │ │
│  │  │  ┌────────────────────────────────────────────────┐  │  │ │
│  │  │  │  Dashboard / Products / Bills / Reports        │  │  │ │
│  │  │  │  (All existing functionality preserved)        │  │  │ │
│  │  │  └────────────────────────────────────────────────┘  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  PWAContext (State Management)                       │  │ │
│  │  │  - installPromptEvent: Event | null                 │  │ │
│  │  │  - isInstallable: boolean                           │  │ │
│  │  │  - isOnline: boolean                                │  │ │
│  │  │  - isInstalled: boolean                             │  │ │
│  │  │  - handleInstall(): Promise<void>                   │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Service Worker (Workbox)                       │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │  Precache    │  │  Runtime     │  │  Auto-Update    │  │ │
│  │  │  - HTML      │  │  - API calls │  │  - Check for    │  │ │
│  │  │  - JS        │  │  - Images    │  │    new version  │  │ │
│  │  │  - CSS       │  │  - Fonts     │  │  - Auto-install │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Cache Storage                            │ │
│  │  - workbox-precache-v2 (static assets)                     │ │
│  │  - static-assets (JS, CSS)                                 │ │
│  │  - images (PNG, JPG, SVG)                                  │ │
│  │  - api-cache (API responses, 5 min TTL)                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│                      Backend API Server                           │
│  - Authentication endpoints (NOT cached)                          │
│  - Product management                                             │
│  - Billing system                                                 │
│  - Reports                                                        │
└──────────────────────────────────────────────────────────────────┘
```

## Installation Flow

```
User visits /landing
       ↓
Wait 2 seconds
       ↓
beforeinstallprompt event fires
       ↓
PWAContext captures event
       ↓
Install popup appears
       ↓
User clicks "Install Now"
       ↓
PWAContext.handleInstall() called
       ↓
Browser shows native install dialog
       ↓
User accepts
       ↓
App installs to home screen
       ↓
appinstalled event fires
       ↓
PWAContext updates state
       ↓
Popup hides
       ↓
Success toast shows
       ↓
✅ PWA Installed!
```

## Offline Flow

```
User opens app (online)
       ↓
Service worker registers
       ↓
Static assets cached
       ↓
User navigates app
       ↓
API calls cached (5 min)
       ↓
Network goes offline
       ↓
PWAContext detects offline
       ↓
OfflineIndicator appears
       ↓
User navigates to cached page
       ↓
Service worker serves from cache
       ↓
✅ Page loads offline!
       ↓
API calls fail gracefully
       ↓
User sees offline message
       ↓
Network comes back online
       ↓
PWAContext detects online
       ↓
OfflineIndicator hides
       ↓
API calls work again
       ↓
✅ Back online!
```

## Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Request Types                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼────────┐  ┌──────▼──────┐
            │ Static Assets  │  │  API Calls  │
            │ (JS, CSS, HTML)│  │             │
            └───────┬────────┘  └──────┬──────┘
                    │                   │
            ┌───────▼────────┐  ┌──────▼──────────────┐
            │ Cache First    │  │ Network First       │
            │ (30 days)      │  │ (5 min cache)       │
            └───────┬────────┘  └──────┬──────────────┘
                    │                   │
            ┌───────▼────────┐  ┌──────▼──────────────┐
            │ Check cache    │  │ Try network         │
            │ ↓              │  │ ↓                   │
            │ Found? Serve   │  │ Success? Serve      │
            │ ↓              │  │ ↓                   │
            │ Not found?     │  │ Failed? Check cache │
            │ Fetch network  │  │ ↓                   │
            │ ↓              │  │ Found? Serve        │
            │ Cache & serve  │  │ ↓                   │
            └────────────────┘  │ Not found? Error    │
                                └─────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Special Cases                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼────────┐  ┌──────▼──────────┐
            │ Auth Endpoints │  │ Translation JSON│
            │ (/api/auth/*)  │  │ (locales/*.json)│
            └───────┬────────┘  └──────┬──────────┘
                    │                   │
            ┌───────▼────────┐  ┌──────▼──────────┐
            │ NEVER CACHED   │  │ NEVER CACHED    │
            │ Always network │  │ Always fresh    │
            └────────────────┘  └─────────────────┘
```

## Component Hierarchy

```
App.jsx
├── PWAProvider (Context)
│   ├── State Management
│   │   ├── installPromptEvent
│   │   ├── isInstallable
│   │   ├── isOnline
│   │   └── isInstalled
│   └── Event Listeners
│       ├── beforeinstallprompt
│       ├── appinstalled
│       ├── online
│       └── offline
│
├── OfflineIndicator
│   ├── usePWA() hook
│   ├── Conditional render (isOnline)
│   └── Dismissible banner
│
└── Router
    ├── Landing Page
    │   └── Install Popup
    │       ├── usePWA() hook
    │       ├── Auto-show after 2s
    │       ├── Install button
    │       └── Dismiss button
    │
    └── Other Pages
        ├── Dashboard
        ├── Products
        ├── Bills
        └── Reports
```

## File Structure

```
frontend/
├── public/
│   ├── pwa-192x192.png          ← Need to create
│   ├── pwa-512x512.png          ← Need to create
│   ├── apple-touch-icon.png     ← Need to create
│   └── logo.svg                 ✅ Exists
│
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── InstallPWA.jsx           ✅ Created
│   │       └── OfflineIndicator.jsx     ✅ Created
│   │
│   ├── store/
│   │   └── PWAContext.jsx               ✅ Created
│   │
│   ├── pages/
│   │   └── auth/
│   │       └── Landing.jsx              ✅ Modified (popup added)
│   │
│   ├── App.jsx                          ✅ Modified (PWA integrated)
│   └── main.jsx                         ✅ Modified (SW registered)
│
├── vite.config.js                       ✅ Modified (PWA config)
├── index.html                           ✅ Modified (meta tags)
│
└── Documentation/
    ├── generate-icons.html              ✅ Icon generator
    ├── QUICK_START_PWA.md               ✅ Quick start guide
    ├── ICON_SETUP_INSTRUCTIONS.md       ✅ Icon setup guide
    ├── PWA_SETUP_COMPLETE.md            ✅ Complete status
    ├── PWA_IMPLEMENTATION_SUMMARY.md    ✅ Implementation summary
    └── PWA_ARCHITECTURE.md              ✅ This file
```

## Data Flow

### Install Flow
```
Browser Event → PWAContext → Landing Popup → User Action → Browser API → Installation
```

### Offline Detection Flow
```
Network Change → PWAContext → OfflineIndicator → User Notification
```

### Caching Flow
```
HTTP Request → Service Worker → Cache Check → Network Fetch → Cache Update → Response
```

### Update Flow
```
New Version Deployed → Service Worker Detects → Auto-Download → Auto-Install → Page Reload
```

## Key Technologies

- **Vite PWA Plugin**: Generates service worker and manifest
- **Workbox**: Handles caching strategies
- **React Context**: Manages PWA state
- **Browser APIs**: 
  - `beforeinstallprompt` event
  - `appinstalled` event
  - `navigator.onLine`
  - Service Worker API
  - Cache Storage API

## Security Considerations

- ✅ HTTPS required in production
- ✅ Authentication endpoints never cached
- ✅ Tokens stored securely (not in cache)
- ✅ Service worker scoped to app origin
- ✅ Cache expiration policies set
- ✅ Sensitive data excluded from caching

## Performance Optimizations

- ✅ Static assets cached for 30 days
- ✅ API responses cached for 5 minutes
- ✅ Stale-while-revalidate for JS/CSS
- ✅ Auto-cleanup of outdated caches
- ✅ Lazy loading with Suspense
- ✅ Translation files always fresh

---

**This architecture ensures:**
- Fast loading (cached assets)
- Offline functionality (service worker)
- Native app feel (standalone mode)
- Auto-updates (no manual refresh)
- Secure (HTTPS, no sensitive data cached)
- Maintainable (clear separation of concerns)
