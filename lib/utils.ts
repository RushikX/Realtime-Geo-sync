export function formatCoordinate(value: number, type: 'lat' | 'lng'): string {
  const abs = Math.abs(value);
  const whole = Math.floor(abs);
  const decimal = ((abs - whole) * 60).toFixed(4);
  const direction = value >= 0 
    ? (type === 'lat' ? 'N' : 'E')
    : (type === 'lat' ? 'S' : 'W');
  return `${whole}° ${decimal}' ${direction}`;
}

export function formatZoom(zoom: number): string {
  return zoom.toFixed(1);
}

export function formatLatLng(lat: number, lng: number): { lat: string; lng: string } {
  return {
    lat: lat.toFixed(6),
    lng: lng.toFixed(6),
  };
}

export function generateSessionId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function(this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
