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
    const home = searchParams.get('home') === '1';
    const admin = searchParams.get('admin') === '1';
    const limit = Math.min(Number(searchParams.get('limit') || 100), 500);

    if (id) {
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project || (!admin && project.status !== 'active')) {
        return jsonCors({ error: 'Project not found' }, { status: 404 });
      }
      return jsonCors(project);
    }

    const projects = await prisma.project.findMany({
      where: {
        ...(admin ? {} : { status: 'active' }),
        ...(home ? { showOnHome: true } : {}),
        ...(slug ? { slug } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return jsonCors(projects);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to fetch projects', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = await prisma.project.create({
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
        legacyId: body.legacyId || null,
      },
    });
    return jsonCors(project, { status: 201 });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
