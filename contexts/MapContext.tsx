'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}

interface MapContextType {
  mapState: MapState;
  setMapState: (state: MapState) => void;
  isTracking: boolean;
  setIsTracking: (tracking: boolean) => void;
  requestSync: () => void;
  lastUpdate: number;
}

const defaultMapState: MapState = {
  lat: 40.7128,
  lng: -74.006,
  zoom: 13,
};

const MapContext = createContext<MapContextType>({
  mapState: defaultMapState,
  setMapState: () => {},
  isTracking: false,
  setIsTracking: () => {},
  requestSync: () => {},
  lastUpdate: 0,
});

export function MapProvider({ children }: { children: ReactNode }) {
  const [mapState, setMapState] = useState<MapState>(defaultMapState);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);

  const requestSync = useCallback(() => {
    setLastUpdate(Date.now());
  }, []);

  return (
    <MapContext.Provider value={{ mapState, setMapState, isTracking, setIsTracking, requestSync, lastUpdate }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  return useContext(MapContext);
}
