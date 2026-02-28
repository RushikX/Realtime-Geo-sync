import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json({ sessionId, data: session });
}
