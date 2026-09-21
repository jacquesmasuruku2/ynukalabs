import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    const sections = await prisma.resourceSection.findMany({
      where: slug ? { slug, isActive: true } : { isActive: true },
      include: {
        items: {
          orderBy: { title: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return jsonCors(sections);
  } catch (error) {
    console.error('Error fetching resource sections:', error);
    return jsonCors(
      {
        error: 'Failed to fetch resource sections',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const section = await prisma.resourceSection.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description || null,
        displayOrder: Number(body.displayOrder || 0),
        isActive: body.isActive !== false,
      },
    });

    return jsonCors(section, { status: 201 });
  } catch (error) {
    console.error('Error creating resource section:', error);
    return jsonCors(
      {
        error: 'Failed to create resource section',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
