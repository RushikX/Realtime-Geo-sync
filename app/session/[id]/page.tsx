"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import HUDOverlay from '@/components/HUDOverlay';
import RoleBadge from '@/components/RoleBadge';
import ReSyncButton from '@/components/ReSyncButton';
import LeaveButton from '@/components/LeaveButton';
import styles from './page.module.css';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}

export default function SessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.id as string;
  // derive a per‑browser user ID for takeover/ownership semantics; read/write synchronously
  const [userId, setUserId] = useState<string>(() => {
    let id = localStorage.getItem('rtgs_user_id');
    if (!id) {
      id = 'u_' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem('rtgs_user_id', id);
    }
    return id;
  });
  const role = (searchParams.get('role') as 'tracker' | 'tracked') || 'tracked';

  const [mapState, setMapState] = useState<MapState>({ lat: 40.7128, lng: -74.006, zoom: 13 });
  const [isInSession, setIsInSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackerDisconnected, setTrackerDisconnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');


  // Initialize Pusher channel for this session and keep track of connection state
  useEffect(() => {
    // Lazy import to avoid SSR issues
    const Pusher = require('pusher-js');
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // connection events update status for loading indicator
    pusher.connection.bind('connected', () => setConnectionStatus('connected'));
    pusher.connection.bind('disconnected', () => setConnectionStatus('disconnected'));
    pusher.connection.bind('error', () => setConnectionStatus('disconnected'));

    const channel = pusher.subscribe(sessionId);

    channel.bind('session-joined', (data: { role: string }) => {
      setIsInSession(true);
      setError(null);
    });

    channel.bind('map-sync', (data: MapState) => {
      setMapState(data);
      setTrackerDisconnected(false);
    });

    channel.bind('tracker-disconnected', () => {
      if (role === 'tracked') setTrackerDisconnected(true);
    });

    // Cleanup on unmount
    return () => {
      pusher.unsubscribe(sessionId);
      pusher.disconnect();
    };
  }, [sessionId, role]);

  // Join once connection is established (don't send duplicate "unknown" payloads)
  useEffect(() => {
    if (connectionStatus !== 'connected') return;
    if (!userId) return;
    triggerEvent('join-session', { role, userId });
  }, [connectionStatus, triggerEvent, role, userId]);

  // After joining, fetch current state for initial sync
  useEffect(() => {
    if (!sessionId || !isInSession) return;
    fetch(`/api/pusher/state?sessionId=${sessionId}`)
      .then(res => res.json())
      .then((payload) => {
        const s = (payload as any).data || payload?.data;
        if (s && s.currentMapState) {
          setMapState(s.currentMapState);
        }
      })
      .catch(() => {});
  }, [sessionId, isInSession]);

  const handleMapMove = (lat: number, lng: number, zoom: number) => {
    if (role !== 'tracker') return;
    const newState = { lat, lng, zoom };
    setMapState(newState);
    if ((handleMapMove as any)._timeout) clearTimeout((handleMapMove as any)._timeout);
    (handleMapMove as any)._timeout = setTimeout(() => {
      triggerEvent('map-move', newState);
    }, 100);
  };

  const handleReSync = () => triggerEvent('request-sync', {});
  const handleLeave = () => {
    triggerEvent('leave-session', { role });
    router.push('/');
  };

  // helper to send events and propagate server errors into the UI
  async function triggerEvent(event: string, data: any) {
    try {
      const res = await fetch('/api/pusher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, event, data }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || 'Action failed');
      }
    } catch (e) {
      console.error('Event dispatch failed', e);
      setError('Network error');
    }
  }

  if (error) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorCard}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h2>Session Error</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/')} className={styles.backButton}>Back to Home</button>
        </div>
      </div>
    );
  }

  if (trackerDisconnected && role === 'tracked') {
    return (
      <div className={styles.disconnectedPage}>
        <div className={styles.disconnectedCard}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1l22 22"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
          <h2>Tracker Disconnected</h2>
          <p>The tracker has left the session</p>
          <button onClick={() => router.push('/')} className={styles.backButton}>Back to Home</button>
        </div>
      </div>
    );
  }

  if (!isInSession && connectionStatus !== 'connected') {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
        <p>Connecting to session...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MapView
        lat={mapState.lat}
        lng={mapState.lng}
        zoom={mapState.zoom}
        role={role}
        onMoveEnd={handleMapMove}
      />
      <HUDOverlay lat={mapState.lat} lng={mapState.lng} zoom={mapState.zoom} connectionStatus={connectionStatus} />
      <RoleBadge role={role} />
      <LeaveButton onClick={handleLeave} className={"leave-fixed"} />
      {role === 'tracked' && <ReSyncButton onClick={handleReSync} disabled={!isInSession} />}
      <div className={styles.sessionId}><span>Session:</span><code>{sessionId}</code></div>
    </div>
  );
}
