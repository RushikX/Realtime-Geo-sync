'use client';

import { useState } from 'react';
import styles from './ReSyncButton.module.css';

interface ReSyncButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function ReSyncButton({ onClick, disabled }: ReSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    onClick();
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <button 
      className={styles.button}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <svg className={styles.spinner} width="18" height="18" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 70" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 4v6h-6"/>
          <path d="M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
          <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/>
        </svg>
      )}
      <span>Re-sync to Tracker</span>
    </button>
  );
}
