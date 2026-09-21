import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

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
    const { id } = await params;
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
    const { id } = await params;
    await prisma.galleryEvent.delete({ where: { id } });
    return jsonCors({ success: true });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to delete gallery event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
