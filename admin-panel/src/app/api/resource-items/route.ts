import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sectionId = request.nextUrl.searchParams.get('sectionId');
    const items = await prisma.resourceItem.findMany({
      where: sectionId ? { sectionId } : undefined,
      orderBy: { title: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching resource items:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch resource items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const item = await prisma.resourceItem.create({
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

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating resource item:', error);
    return NextResponse.json(
      {
        error: 'Failed to create resource item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
