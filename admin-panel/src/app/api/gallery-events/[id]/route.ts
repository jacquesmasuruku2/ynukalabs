import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';
import { requireAdmin } from '@/lib/admin-session';
import { requireContentOwner } from '@/lib/admin-content-access';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.galleryEvent.findUnique({ where: { id } });
  return event ? jsonCors(event) : jsonCors({ error: 'Gallery event not found' }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('gallery-event', id, session!);
    if (accessResponse) return accessResponse;
    const body = await request.json();
    const event = await prisma.galleryEvent.update({
      where: { id },
      data: {
        title: body.title,
        subtitle: body.subtitle || null,
        date: body.date ? new Date(body.date) : null,
        description: body.description || null,
        images: body.images || [],
      },
    });
    return jsonCors(event);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to update gallery event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('gallery-event', id, session!);
    if (accessResponse) return accessResponse;
    await prisma.galleryEvent.delete({ where: { id } });
    return jsonCors({ success: true });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to delete gallery event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
