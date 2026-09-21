import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

const ACTIVE_MS = 2 * 60 * 1000;
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

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

function mapVisitor(r: {
  id: string;
  sessionId: string;
  path: string;
  pageTitle: string | null;
  userEmail: string | null;
  userName: string | null;
  language: string | null;
  userAgent: string | null;
  firstSeenAt?: Date;
  lastSeenAt?: Date;
  createdAt?: Date;
}, now: number, active = false) {
  const stamp = r.lastSeenAt || r.createdAt || new Date();
  return {
    id: r.id,
    sessionId: r.sessionId,
    path: r.path,
    pageTitle: r.pageTitle,
    userEmail: r.userEmail,
    userName: r.userName,
    language: r.language,
    device: summarizeUa(r.userAgent),
    isAnonymous: !r.userEmail,
    isActive: active,
    firstSeenAt: r.firstSeenAt || null,
    lastSeenAt: r.lastSeenAt || null,
    createdAt: r.createdAt || null,
    secondsAgo: Math.max(0, Math.round((now - new Date(stamp).getTime()) / 1000)),
  };
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
    const forcePageView = body.pageView === true;
    const now = new Date();

    const existing = await prisma.sitePresence.findUnique({ where: { sessionId } });
    const pathChanged = !existing || existing.path !== path;

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

    if (forcePageView || pathChanged || !existing) {
      await prisma.sitePageView.create({
        data: {
          sessionId,
          path,
          pageTitle,
          referrer,
          userAgent,
          language,
          userEmail,
          userName,
        },
      });
    }

    return jsonCors({ ok: true, id: row.id, anonymous: !userEmail });
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
    const recentSince = new Date(now - 24 * 60 * 60 * 1000);
    const staleBefore = new Date(now - RETENTION_MS);

    await prisma.sitePresence.deleteMany({ where: { lastSeenAt: { lt: staleBefore } } });
    await prisma.sitePageView.deleteMany({ where: { createdAt: { lt: staleBefore } } });

    const [activeRows, pageViews, todayViews] = await Promise.all([
      prisma.sitePresence.findMany({
        where: { lastSeenAt: { gte: activeSince } },
        orderBy: { lastSeenAt: 'desc' },
        take: 200,
      }),
      prisma.sitePageView.findMany({
        where: { createdAt: { gte: recentSince } },
        orderBy: { createdAt: 'desc' },
        take: 300,
      }),
      prisma.sitePageView.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const byPath: Record<string, number> = {};
    for (const v of pageViews) {
      byPath[v.path] = (byPath[v.path] || 0) + 1;
    }
    const topPages = Object.entries(byPath)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([path, count]) => ({ path, count }));

    const anonymousActive = activeRows.filter((r) => !r.userEmail).length;
    const connectedActive = activeRows.filter((r) => !!r.userEmail).length;

    return jsonCors({
      activeCount: activeRows.length,
      anonymousActive,
      connectedActive,
      todayViews,
      recentViewsCount: pageViews.length,
      windowSeconds: ACTIVE_MS / 1000,
      topPages,
      visitors: activeRows.map((r) => mapVisitor(r, now, true)),
      pageViews: pageViews.map((v) =>
        mapVisitor(
          {
            id: v.id,
            sessionId: v.sessionId,
            path: v.path,
            pageTitle: v.pageTitle,
            userEmail: v.userEmail,
            userName: v.userName,
            language: v.language,
            userAgent: v.userAgent,
            createdAt: v.createdAt,
          },
          now,
          false
        )
      ),
    });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to fetch presence', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
