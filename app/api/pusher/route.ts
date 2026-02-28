import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { getSession, setSession } from '@/lib/redis';

// Lightweight in-memory state per session (persists per server instance)
type SessionState = {
  tracker?: string | null;
  tracked?: string | null;
  currentMapState: { lat: number; lng: number; zoom: number };
};
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.info('[Pusher] /api/pusher payload:', body);
    const { sessionId, event, data } = body as { sessionId: string; event: string; data?: any };

    if (!sessionId || !event) {
      return NextResponse.json({ error: 'Invalid payload: missing sessionId or event' }, { status: 400 });
    }

    // Load persisted session if available; fall back to defaults
    let session = await getSession(sessionId);
    if (!session) {
      session = { tracker: null, tracked: null, currentMapState: { lat: 40.7128, lng: -74.006, zoom: 13 } };
    }

    switch (event) {
      case 'join-session': {
        const role = data?.role;
        const userId = data?.userId;
        if (!role || !userId) {
          return NextResponse.json({ error: 'Invalid payload: missing role or userId in join-session' }, { status: 400 });
        }
        if (role === 'tracker') {
          if (session.tracker && session.tracker === userId) {
            // already joined by this user
          }
          if (session.tracker && session.tracker !== userId) {
            return NextResponse.json({ error: 'Session already has a tracker' }, { status: 400 });
          }
          session.tracker = userId;
          pusher.trigger(sessionId, 'session-joined', { role: 'tracker' });
          if (session.tracked) {
            pusher.trigger(sessionId, 'map-sync', session.currentMapState);
          }
        } else if (role === 'tracked') {
          if (session.tracked && session.tracked === userId) {
            // already joined by this user
          }
          if (session.tracked && session.tracked !== userId) {
            return NextResponse.json({ error: 'Session already has a tracked user' }, { status: 400 });
          }
          session.tracked = userId;
          pusher.trigger(sessionId, 'session-joined', { role: 'tracked' });
          if (session.tracker) {
            pusher.trigger(sessionId, 'map-sync', session.currentMapState);
          }
        }
        // Persist
        await setSession(sessionId, session);
        return NextResponse.json({ success: true });
      }

      case 'map-move': {
        const { lat, lng, zoom } = data || {};
        if (typeof lat !== 'number' || typeof lng !== 'number' || typeof zoom !== 'number') {
          return NextResponse.json({ error: 'Invalid map-move payload: expected { lat, lng, zoom }' }, { status: 400 });
        }
        session.currentMapState = { lat, lng, zoom };
        await setSession(sessionId, session);
        pusher.trigger(sessionId, 'map-sync', { lat, lng, zoom });
        return NextResponse.json({ success: true });
      }

      case 'request-sync': {
        await setSession(sessionId, session);
        pusher.trigger(sessionId, 'map-sync', session.currentMapState);
        return NextResponse.json({ success: true });
      }

      case 'leave-session': {
        const { role } = data || {};
        if (role === 'tracker') {
          session.tracker = null;
          if (session.tracked) {
            pusher.trigger(sessionId, 'tracker-disconnected', {});
          }
        } else if (role === 'tracked') {
          session.tracked = null;
        }
        // Persist and prune if empty
        if (!session.tracker && !session.tracked) {
          // Could delete Redis entry entirely; for now, keep a tombstone by deleting from storage
          // Delete in Redis if desired (omitted here for simplicity)
        }
        await setSession(sessionId, session);
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: 'Unhandled event' }, { status: 400 });
  } catch (err) {
    console.error('Pusher error:', err);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
