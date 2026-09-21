import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
    if (!email) return jsonCors({ error: 'email required' }, { status: 400 });

    const unreadOnly = request.nextUrl.searchParams.get('unread') === '1';
    const rows = await prisma.siteNotification.findMany({
      where: {
        userEmail: email,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return jsonCors(rows);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to fetch notifications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    if (!email) return jsonCors({ error: 'email required' }, { status: 400 });

    if (body.markAllRead) {
      await prisma.siteNotification.updateMany({
        where: { userEmail: email, read: false },
        data: { read: true },
      });
      return jsonCors({ ok: true });
    }

    const id = body.id;
    if (!id) return jsonCors({ error: 'id required' }, { status: 400 });

    const notif = await prisma.siteNotification.findFirst({
      where: { id, userEmail: email },
    });
    if (!notif) return jsonCors({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.siteNotification.update({
      where: { id },
      data: { read: true },
    });
    return jsonCors(updated);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to update notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
