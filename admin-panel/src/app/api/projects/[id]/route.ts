import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

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
    const { id } = await params;
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
    const { id } = await params;
    await prisma.project.delete({ where: { id } });
    return jsonCors({ success: true });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to delete project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
