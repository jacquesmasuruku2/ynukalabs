import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

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
      const opportunity = await prisma.opportunity.findUnique({ where: { id } });
      if (!opportunity || (!admin && !opportunity.published)) {
        return jsonCors({ error: 'Opportunity not found' }, { status: 404 });
      }
      return jsonCors(opportunity);
    }

    const opportunities = await prisma.opportunity.findMany({
      where: {
        ...(admin ? {} : { published: true }),
        ...(slug ? { slug } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return jsonCors(opportunities);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to fetch opportunities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const opportunity = await prisma.opportunity.create({
      data: {
        title: body.title,
        titleFr: body.titleFr || null,
        slug: body.slug,
        excerpt: body.excerpt || null,
        excerptFr: body.excerptFr || null,
        content: body.content || null,
        contentFr: body.contentFr || null,
        category: body.category || 'General',
        coverUrl: body.coverUrl || null,
        published: !!body.published,
        legacyId: body.legacyId || null,
      },
    });
    return jsonCors(opportunity, { status: 201 });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to create opportunity', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
