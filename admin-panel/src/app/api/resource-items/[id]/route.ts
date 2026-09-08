import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await prisma.resourceItem.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: 'Resource item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resource item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const item = await prisma.resourceItem.update({
      where: { id },
      data: {
        sectionId: body.sectionId || null,
        title: body.title,
        titleFr: body.titleFr || null,
        description: body.description || null,
        descriptionFr: body.descriptionFr || null,
        category: body.category || null,
        url: body.url || null,
        filePath: body.filePath || null,
        fileType: body.fileType || null,
        iconKey: body.iconKey || 'bookOpen',
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update resource item' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.resourceItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete resource item' }, { status: 500 });
  }
}
