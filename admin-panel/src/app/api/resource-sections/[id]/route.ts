import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const section = await prisma.resourceSection.findUnique({
      where: { id },
      include: { items: { orderBy: { title: 'asc' } } },
    });

    if (!section) {
      return NextResponse.json({ error: 'Resource section not found' }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resource section' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const section = await prisma.resourceSection.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description || null,
        displayOrder: Number(body.displayOrder || 0),
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update resource section' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.resourceSection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete resource section' }, { status: 500 });
  }
}
