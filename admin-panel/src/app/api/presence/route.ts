import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

const ACTIVE_MS = 2 * 60 * 1000; // 2 minutes
const STALE_MS = 24 * 60 * 60 * 1000; // 24h cleanup

export async function OPTIONS() {
  return corsOptions();
}

function summarizeUa(ua: string | null | undefined): string {
  if (!ua) return 'Inconnu';
  if (/Mobile|Android|iPhone/i.test(ua)) return 'Mobile';
  if (/iPad|Tablet/i.test(ua)) return 'Tablette';
  if (/Edg\//i.test(ua)) return 'Desktop · Edge';
  if (/Chrome\//i.test(ua)) return 'Desktop · Chrome';
  if (/Firefox\//i.test(ua)) return 'Desktop · Firefox';
  if (/Safari\//i.test(ua)) return 'Desktop · Safari';
  return 'Desktop';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = String(body.sessionId || '').trim();
    const path = String(body.path || '/').trim() || '/';
    if (!sessionId || sessionId.length > 80) {
      return jsonCors({ error: 'sessionId required' }, { status: 400 });
    }

    const pageTitle = body.pageTitle ? String(body.pageTitle).slice(0, 200) : null;
    const referrer = body.referrer ? String(body.referrer).slice(0, 500) : null;
    const userAgent = body.userAgent
      ? String(body.userAgent).slice(0, 400)
      : request.headers.get('user-agent')?.slice(0, 400) || null;
    const language = body.language ? String(body.language).slice(0, 32) : null;
    const userEmail = body.userEmail
      ? String(body.userEmail).trim().toLowerCase().slice(0, 200)
      : null;
    const userName = body.userName ? String(body.userName).slice(0, 120) : null;
    const now = new Date();

    const row = await prisma.sitePresence.upsert({
      where: { sessionId },
      create: {
        sessionId,
        path,
        pageTitle,
        referrer,
        userAgent,
        language,
        userEmail,
        userName,
        firstSeenAt: now,
        lastSeenAt: now,
      },
      update: {
        path,
        pageTitle,
        referrer: referrer ?? undefined,
        userAgent: userAgent ?? undefined,
        language: language ?? undefined,
        userEmail,
        userName,
        lastSeenAt: now,
      },
    });

    return jsonCors({ ok: true, id: row.id });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to update presence', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = request.nextUrl.searchParams.get('admin') === '1';
    if (!admin) {
      return jsonCors({ error: 'Forbidden' }, { status: 403 });
    }

    const now = Date.now();
    const activeSince = new Date(now - ACTIVE_MS);
    const staleBefore = new Date(now - STALE_MS);

    // Nettoyage léger des sessions trop anciennes
    await prisma.sitePresence.deleteMany({
      where: { lastSeenAt: { lt: staleBefore } },
    });

    const rows = await prisma.sitePresence.findMany({
      where: { lastSeenAt: { gte: activeSince } },
      orderBy: { lastSeenAt: 'desc' },
      take: 200,
    });

    const byPath: Record<string, number> = {};
    for (const r of rows) {
      byPath[r.path] = (byPath[r.path] || 0) + 1;
    }

    const topPages = Object.entries(byPath)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    return jsonCors({
      activeCount: rows.length,
      windowSeconds: ACTIVE_MS / 1000,
      topPages,
      visitors: rows.map((r) => ({
        id: r.id,
        sessionId: r.sessionId,
        path: r.path,
        pageTitle: r.pageTitle,
        userEmail: r.userEmail,
        userName: r.userName,
        language: r.language,
        device: summarizeUa(r.userAgent),
        firstSeenAt: r.firstSeenAt,
        lastSeenAt: r.lastSeenAt,
        secondsAgo: Math.max(0, Math.round((now - new Date(r.lastSeenAt).getTime()) / 1000)),
      })),
    });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to fetch presence', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
