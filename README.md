# Real-Time Geo-Sync

Real-time map synchronization between a Tracker (master) and Tracked (viewer) user.
## Deployment Link
https://real-time-geo-sync-website.vercel.app/
## Features

- **Session-based**: Create or join sessions using unique 6-character IDs
- **Real-time sync**: Map movements sync instantly via Pusher
- **Role-based**: Tracker controls the map, Tracked follows along
- **HUD overlay**: Shows live coordinates, zoom level, and connection status
- **Dark theme**: Modern dark UI with CartoDB dark maps

## Setup

### 1. Get Pusher Credentials

1. Go to [pusher.com](https://pusher.com/channels) and create a free account
2. Create a new Channels app
3. Get your credentials from the "Keys" section

### 2. Configure Environment

Create `.env.local`:

```
NEXT_PUBLIC_PUSHER_KEY=your_key_here
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster_here
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`
   - `PUSHER_APP_ID`
   - `PUSHER_SECRET`
4. Deploy!

## Usage

### Creating a Session

1. Click "Create New Session"
2. Share the 6-character ID with the person you want to track
3. You are the Tracker

### Joining a Session

1. Enter the session ID
2. Click "Join"
3. You are the Tracked (following the map)

> **Note:** to properly test joining, open the tracker and tracked views in different browsers or on different machines. Using two tabs in the same browser will reuse the same `localStorage` ID and won’t behave like separate users.

## Tech Stack

- Next.js 14, React, TypeScript
- Leaflet (react-leaflet)
- Pusher (WebSocket)
- CSS Modules
