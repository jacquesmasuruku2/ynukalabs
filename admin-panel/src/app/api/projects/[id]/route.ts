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
  const project = await prisma.project.findUnique({ where: { id } });
  return project ? jsonCors(project) : jsonCors({ error: 'Project not found' }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('project', id, session!);
    if (accessResponse) return accessResponse;
    const body = await request.json();
    const project = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        category: body.category || 'General',
        description: body.description || null,
        status: body.status || 'active',
        featuredImage: body.featuredImage || null,
        repositoryUrl: body.repositoryUrl || null,
        liveUrl: body.liveUrl || null,
        showOnHome: !!body.showOnHome,
      },
    });
    return jsonCors(project);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to update project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('project', id, session!);
    if (accessResponse) return accessResponse;
    await prisma.project.delete({ where: { id } });
    return jsonCors({ success: true });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to delete project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
