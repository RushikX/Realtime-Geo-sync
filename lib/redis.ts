export type SessionState = {
  tracker?: string | null;
  tracked?: string | null;
  trackerUserId?: string | null;
  trackedUserId?: string | null;
  currentMapState: { lat: number; lng: number; zoom: number };
};

const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function getSession(sessionId: string): Promise<SessionState | null> {
  if (!REST_URL || !REST_TOKEN) return null;
  try {
    const res = await fetch(`${REST_URL}/get/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${REST_TOKEN}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const raw = json?.result ?? json;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setSession(sessionId: string, data: SessionState): Promise<void> {
  if (!REST_URL || !REST_TOKEN) return;
  try {
    await fetch(`${REST_URL}/set/${encodeURIComponent(sessionId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${REST_TOKEN}`,
      },
      body: JSON.stringify({ value: JSON.stringify(data) }),
    });
  } catch (e) {
    console.error('Redis set error', e);
  }
}
