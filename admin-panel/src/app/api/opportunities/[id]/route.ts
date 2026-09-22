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
  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  return opportunity ? jsonCors(opportunity) : jsonCors({ error: 'Opportunity not found' }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('opportunity', id, session!);
    if (accessResponse) return accessResponse;
    const body = await request.json();
    const opportunity = await prisma.opportunity.update({
      where: { id },
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
      },
    });
    return jsonCors(opportunity);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to update opportunity', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('opportunity', id, session!);
    if (accessResponse) return accessResponse;
    await prisma.opportunity.delete({ where: { id } });
    return jsonCors({ success: true });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to delete opportunity', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
