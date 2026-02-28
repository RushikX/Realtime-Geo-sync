'use client';

import styles from './RoleBadge.module.css';

interface RoleBadgeProps {
  role: 'tracker' | 'tracked';
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const isTracker = role === 'tracker';
  
  return (
    <div className={`${styles.badge} ${isTracker ? styles.tracker : styles.tracked}`}>
      <span className={styles.icon}>
        {isTracker ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4.93 4.93l4.24 4.24"/>
            <path d="M14.83 14.83l4.24 4.24"/>
            <path d="M19.07 4.93l-4.24 4.24"/>
            <path d="M9.17 14.83l-4.24 4.24"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </span>
      <span className={styles.text}>
        {isTracker ? 'BROADCASTING' : 'SYNCING'}
      </span>
    </div>
  );
}
