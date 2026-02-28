'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import Pusher from 'pusher-js';

interface PusherSocket {
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  bind: (event: string, callback: (data: unknown) => void) => void;
  unbind: (event: string, callback?: (data: unknown) => void) => void;
}

interface SocketContextType {
  socket: PusherSocket | null;
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectionStatus: 'disconnected',
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<PusherSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    setConnectionStatus('connecting');

    pusher.bind('connected', () => {
      setConnectionStatus('connected');
    });

    pusher.bind('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    pusher.bind('error', () => {
      setConnectionStatus('disconnected');
    });

    setSocket(pusher as unknown as PusherSocket);
    setConnectionStatus('connected');

    return () => {
      (pusher as unknown as PusherSocket).unsubscribe('all');
      pusher.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected: socket !== null, connectionStatus }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
