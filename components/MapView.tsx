'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  lat: number;
  lng: number;
  zoom: number;
  role: 'tracker' | 'tracked';
  onMoveEnd: (lat: number, lng: number, zoom: number) => void;
}

function ChangeView({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      map.setView([lat, lng], zoom, { animate: false });
    }
  }, [lat, lng, zoom, map]);
  
  return null;
}

function MapEventsHandler({ role, onMoveEnd }: { role: 'tracker' | 'tracked'; onMoveEnd: (lat: number, lng: number, zoom: number) => void }) {
  const lastEmit = useRef<{ lat: number; lng: number; zoom: number } | null>(null);
  
  useMapEvents({
    moveend: (e) => {
      if (role !== 'tracker') return;
      
      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      if (lastEmit.current && 
          Math.abs(lastEmit.current.lat - center.lat) < 0.0001 &&
          Math.abs(lastEmit.current.lng - center.lng) < 0.0001 &&
          Math.abs(lastEmit.current.zoom - zoom) < 0.1) {
        return;
      }
      
      lastEmit.current = { lat: center.lat, lng: center.lng, zoom };
      onMoveEnd(center.lat, center.lng, zoom);
    },
    zoomend: (e) => {
      if (role !== 'tracker') return;
      
      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      lastEmit.current = { lat: center.lat, lng: center.lng, zoom };
      onMoveEnd(center.lat, center.lng, zoom);
    },
  });
  
  return null;
}

export default function MapView({ lat, lng, zoom, role, onMoveEnd }: MapViewProps) {
  const isTracker = role === 'tracker';
  
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      scrollWheelZoom={isTracker}
      doubleClickZoom={isTracker}
      dragging={isTracker}
      zoomControl={isTracker}
      style={{ width: '100%', height: '100%' }}
      zoomAnimation={false}
      fadeAnimation={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <ChangeView lat={lat} lng={lng} zoom={zoom} />
      <MapEventsHandler role={role} onMoveEnd={onMoveEnd} />
    </MapContainer>
  );
}
