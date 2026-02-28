'use client';

import { useState, useEffect } from 'react';
import styles from './HUDOverlay.module.css';
import { formatLatLng, formatZoom } from '@/lib/utils';

interface HUDOverlayProps {
  lat: number;
  lng: number;
  zoom: number;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export default function HUDOverlay({ lat, lng, zoom, connectionStatus }: HUDOverlayProps) {
  const [animatedLat, setAnimatedLat] = useState(lat);
  const [animatedLng, setAnimatedLng] = useState(lng);
  const [animatedZoom, setAnimatedZoom] = useState(zoom);

  useEffect(() => {
    setAnimatedLat(lat);
  }, [lat]);

  useEffect(() => {
    setAnimatedLng(lng);
  }, [lng]);

  useEffect(() => {
    setAnimatedZoom(zoom);
  }, [zoom]);

  const { lat: latStr, lng: lngStr } = formatLatLng(animatedLat, animatedLng);

  return (
    <div className={styles.hud}>
      <div className={styles.header}>
        <span className={styles.title}>POSITION DATA</span>
        <div className={styles.status}>
          <span 
            className={`${styles.statusDot} ${styles[connectionStatus]}`}
          />
          <span className={styles.statusText}>
            {connectionStatus === 'connected' ? 'CONNECTED' : 
             connectionStatus === 'connecting' ? 'CONNECTING' : 'DISCONNECTED'}
          </span>
        </div>
      </div>
      
      <div className={styles.dataGrid}>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>LATITUDE</span>
          <span className={styles.dataValue}>{latStr}</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>LONGITUDE</span>
          <span className={styles.dataValue}>{lngStr}</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>ZOOM</span>
          <span className={styles.dataValue}>{formatZoom(animatedZoom)}</span>
        </div>
      </div>
    </div>
  );
}
