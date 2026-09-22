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
    const { searchParams } = request.nextUrl;
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const admin = searchParams.get('admin') === '1';
    const limit = Math.min(Number(searchParams.get('limit') || 100), 500);

    if (id) {
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event || (!admin && !event.published)) {
        return jsonCors({ error: 'Event not found' }, { status: 404 });
      }
      return jsonCors(event);
    }

    const events = await prisma.event.findMany({
      where: {
        ...(admin ? {} : { published: true }),
        ...(slug ? { slug } : {}),
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
    return jsonCors(events);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to fetch events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const body = await request.json();
    const event = await prisma.event.create({
      data: {
        title: body.title,
        titleFr: body.titleFr || null,
        slug: body.slug || null,
        description: body.description || null,
        descriptionFr: body.descriptionFr || null,
        date: body.date ? new Date(body.date) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        time: body.time || null,
        location: body.location || null,
        type: body.type || null,
        capacity: body.capacity != null ? Number(body.capacity) : null,
        imageUrl: body.imageUrl || null,
        featuredImage: body.featuredImage || null,
        recapUrl: body.recapUrl || null,
        youtubeUrl: body.youtubeUrl || null,
        upcoming: body.upcoming !== false,
        published: body.published !== false,
        legacyId: body.legacyId || null,
      },
    });
    await claimContentOwnership('event', event.id, session);
    return jsonCors(event, { status: 201 });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to create event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
