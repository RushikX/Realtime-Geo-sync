'use client';

import styles from './LeaveButton.module.css';

interface LeaveButtonProps {
  onClick: () => void;
  className?: string;
}

export default function LeaveButton({ onClick, className }: LeaveButtonProps) {
  return (
    <button className={`${styles.button} ${className ?? ''}`} onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      <span>Leave</span>
    </button>
  );
}
