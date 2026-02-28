'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

function generateSessionId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function Home() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateSession = () => {
    const newId = generateSessionId();
    router.push(`/session/${newId}?role=tracker`);
  };

  const handleJoinSession = async () => {
    const trimmed = sessionId.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Session ID must be 6 characters');
      return;
    }
    if (!/^[A-Z0-9]{6}$/.test(trimmed)) {
      setError('Invalid session ID format');
      return;
    }
    setLoading(true);
    setError('');
    router.push(`/session/${trimmed}?role=tracked`);
  };

  return (
    <main className={styles.main}>
      <div className={styles.background}>
        <div className={styles.grid}></div>
        <div className={styles.glow}></div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        
        <h1 className={styles.title}>Real-Time Geo-Sync</h1>
        <p className={styles.subtitle}>Synchronize map movements in real-time</p>
        
        <div className={styles.divider}></div>
        
        <button 
          onClick={handleCreateSession}
          className={styles.primaryButton}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Create New Session
        </button>
        
        <div className={styles.orDivider}>
          <span>or</span>
        </div>
        
        <div className={styles.joinSection}>
          <label className={styles.label}>Join Existing Session</label>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => {
                setSessionId(e.target.value.toUpperCase().slice(0, 6));
                setError('');
              }}
              placeholder="ENTER ID"
              className={styles.input}
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinSession()}
            />
            <button 
              onClick={handleJoinSession}
              disabled={loading || sessionId.length !== 6}
              className={styles.secondaryButton}
            >
              Join
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
      
      <div className={styles.footer}>
        <p>Tracker controls the map • Tracked follows along</p>
      </div>
    </main>
  );
}
