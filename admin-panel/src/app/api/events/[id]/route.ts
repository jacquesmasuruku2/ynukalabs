import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  return event ? jsonCors(event) : jsonCors({ error: 'Event not found' }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const event = await prisma.event.update({
      where: { id },
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
      },
    });
    return jsonCors(event);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to update event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return jsonCors({ success: true });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to delete event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
