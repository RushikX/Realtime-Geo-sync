# Real-Time Geo-Sync - Technical Specification

## 1. Project Overview

**Project Name:** Real-Time Geo-Sync  
**Type:** Web Application (Real-time Map Synchronization)  
**Core Functionality:** Synchronizes map movements between a Tracker (master) and Tracked (viewer) user in real-time via WebSocket  
**Target Users:** Anyone needing to share location/map views in real-time

---

## 2. Technical Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Real-time:** Socket.io (client & server)
- **Maps:** Leaflet.js via react-leaflet (free, no API key)
- **Styling:** CSS Modules with custom properties
- **State Management:** React Context + useState

---

## 3. UI/UX Specification

### Layout Structure

**Landing Page (`/`):**
- Centered card (max-width: 420px)
- Logo/Title at top
- Session ID input field
- "Create Session" button (becomes Tracker)
- "Join Session" button (becomes Tracked)
- Error message area

**Map Page (`/session/[id]`):**
- Full-screen map (100vw x 100vh)
- Floating HUD overlay (top-left corner)
- Role badge indicator (top-right corner)
- "Re-sync to Tracker" button (Tracked only, bottom-right)
- Leave session button (top-left, subtle)

### Visual Design

**Color Palette:**
- Background: `#0a0a0f` (deep night)
- Card Background: `#12121a` (dark slate)
- Primary Accent: `#00d4aa` (teal/cyan)
- Secondary Accent: `#ff6b6b` (coral red for Tracker)
- Success: `#4ade80` (green)
- Warning: `#fbbf24` (amber)
- Error: `#ef4444` (red)
- Text Primary: `#f8fafc` (near white)
- Text Secondary: `#94a3b8` (slate gray)
- Border: `#1e293b` (dark border)
- Map Overlay: `rgba(10, 10, 15, 0.85)`

**Typography:**
- Font Family: `"JetBrains Mono", "Fira Code", monospace` for data
- Font Family: `"Inter", system-ui, sans-serif` for UI text
- Heading: 28px, weight 700
- Body: 14px, weight 400
- Data Display: 13px, monospace
- Badge: 11px, uppercase, weight 600

**Spacing:**
- Base unit: 4px
- Small: 8px
- Medium: 16px
- Large: 24px
- XLarge: 32px

**Visual Effects:**
- Card shadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5)`
- Glow effect on primary buttons: `0 0 20px rgba(0, 212, 170, 0.3)`
- Border radius: 12px (cards), 8px (buttons), 6px (inputs)
- Backdrop blur on HUD: 12px

### Components

**1. SessionJoinCard**
- Input: Session ID (6-character alphanumeric)
- Buttons: "Create New Session" / "Join Existing"
- States: default, loading, error

**2. MapView**
- Full Leaflet map
- Dark tile theme (CartoDB Dark Matter)
- Draggable/zoomable based on role

**3. HUD Overlay**
- Semi-transparent panel
- Displays: Lat, Lng, Zoom Level, Connection Status
- Pulsing dot indicator for connection
- Update animation on value change

**4. RoleBadge**
- Tracker: Coral red background, "BROADCASTING" text
- Tracked: Teal background, "SYNCING" text
- Animated pulse effect

**5. ReSyncButton**
- Only visible to Tracked user
- Click triggers re-sync request to Tracker
- Loading spinner while awaiting response

**6. ConnectionStatus**
- Three states: Connected (green), Connecting (amber), Disconnected (red)
- Animated pulse for "Connecting" state

---

## 4. Functionality Specification

### Socket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `create-session` | Client→Server | `{ sessionId: string }` | Create new room |
| `join-session` | Client→Server | `{ sessionId: string, role: 'tracker'|'tracked' }` | Join existing room |
| `session-created` | Server→Client | `{ sessionId: string, role: 'tracker' }` | Confirmation |
| `session-joined` | Server→Client | `{ sessionId: string, role: 'tracked' }` | Confirmation |
| `session-error` | Server→Client | `{ message: string }` | Error message |
| `map-move` | Client→Server | `{ lat, lng, zoom }` | Tracker moves map |
| `map-sync` | Server→Client | `{ lat, lng, zoom }` | Sync to Tracked |
| `request-sync` | Client→Server | `{}` | Tracked requests re-sync |
| `sync-current` | Server→Client | `{ lat, lng, zoom }` | Current position sent |
| `tracker-disconnected` | Server→Client | `{}` | Notify tracked |
| `user-left` | Server→Client | `{ role: string }` | User left notification |

### Core Features

1. **Session Management**
   - Generate unique 6-char alphanumeric session ID
   - Join via ID input
   - Auto-assign roles: Creator = Tracker, Joiner = Tracked
   - Session persists while at least one user connected

2. **Map Synchronization**
   - Tracker controls: pan, zoom, tilt
   - Tracked observes: no manual control (or read-only)
   - Update frequency: throttled to 100ms (10 updates/sec)
   - Latency target: <100ms

3. **Debouncing Strategy**
   - Throttle socket emissions to 100ms during drag/zoom
   - Use `useCallback` with throttle for movement handlers

4. **Re-sync Feature**
   - Tracked can request current position
   - Tracker receives request, responds with current state

5. **Disconnect Handling**
   - If Tracker leaves: Notify Tracked, offer to become Tracker
   - If Tracked leaves: Tracker continues normally
   - Auto-cleanup on server after both leave

### Edge Cases

- Invalid session ID → Show error, redirect to home
- Session full (2 users) → Reject with "Session already in use"
- Network disconnect → Show reconnecting status, attempt auto-reconnect
- Browser refresh → Session state lost (acceptable)

---

## 5. File Structure

```
/app
  /api
    /socket/route.ts       # Socket.io server setup
  /page.tsx               # Landing page
  /session
    /[id]/page.tsx        # Map session page
/components
  /SessionJoinCard.tsx
  /MapView.tsx
  /HUDOverlay.tsx
  /RoleBadge.tsx
  /ReSyncButton.tsx
  /ConnectionStatus.tsx
/contexts
  /SocketContext.tsx       # Socket.io provider
  /MapContext.tsx          # Map state management
/lib
  /socket.ts               # Socket client utilities
  /utils.ts                # Helpers
/public
  /fonts
/styles
  /globals.css
  /SessionJoinCard.module.css
  /MapView.module.css
  /HUDOverlay.module.css
```

---

## 6. Acceptance Criteria

### Functional
- [ ] Can create a new session and receive session ID
- [ ] Can join existing session as Tracked
- [ ] Tracker map movements sync to Tracked in <200ms
- [ ] HUD displays accurate lat/lng/zoom
- [ ] Connection status reflects actual state
- [ ] Role badges display correctly
- [ ] Re-sync button works
- [ ] Disconnect handled gracefully

### Visual
- [ ] Dark theme applied consistently
- [ ] HUD overlay readable over map
- [ ] Role badges visually distinct
- [ ] Smooth animations on state changes
- [ ] Responsive on mobile devices

### Technical
- [ ] No memory leaks (cleanup listeners on unmount)
- [ ] Debouncing prevents flood of socket events
- [ ] Error states handled with user feedback
