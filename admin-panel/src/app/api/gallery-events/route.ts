import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';
import { requireAdmin } from '@/lib/admin-session';
import { claimContentOwnership } from '@/lib/admin-content-access';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') || 50), 200);
    const events = await prisma.galleryEvent.findMany({
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
    return jsonCors(events);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to fetch gallery events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const body = await request.json();
    const event = await prisma.galleryEvent.create({
      data: {
        title: body.title,
        subtitle: body.subtitle || null,
        date: body.date ? new Date(body.date) : null,
        description: body.description || null,
        images: body.images || [],
        legacyId: body.legacyId || null,
      },
    });
    await claimContentOwnership('gallery-event', event.id, session);
    return jsonCors(event, { status: 201 });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to create gallery event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
