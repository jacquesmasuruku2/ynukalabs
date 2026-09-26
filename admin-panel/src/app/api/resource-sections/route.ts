import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';
import { requireAdmin } from '@/lib/admin-session';
import { claimContentOwnership, isSuperAdminSession, type AdminAccessSession } from '@/lib/admin-content-access';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  try {
    const admin = request.nextUrl.searchParams.get('admin') === '1';
    let adminSession: AdminAccessSession | null = null;
    if (admin) {
      const { session, response } = await requireAdmin();
      if (response) return response;
      adminSession = session;
    }
    const slug = request.nextUrl.searchParams.get('slug');
    const sections = await prisma.resourceSection.findMany({
      where: slug
        ? { slug, ...(admin ? {} : { isActive: true }) }
        : admin
          ? {}
          : { isActive: true },
      include: {
        items: {
          orderBy: { title: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    if (!adminSession) return jsonCors(sections);

    const sectionIds = sections.map((section) => section.id);
    const itemIds = sections.flatMap((section) => section.items.map((item) => item.id));
    const ownerships = sectionIds.length || itemIds.length
      ? await prisma.adminContentOwnership.findMany({
          where: {
            OR: [
              ...(sectionIds.length ? [{ resourceType: 'resource-section', resourceId: { in: sectionIds } }] : []),
              ...(itemIds.length ? [{ resourceType: 'resource-item', resourceId: { in: itemIds } }] : []),
            ],
          },
          select: { resourceType: true, resourceId: true, adminUserId: true },
        })
      : [];
    const owners = new Map(ownerships.map((ownership) => [`${ownership.resourceType}:${ownership.resourceId}`, ownership.adminUserId]));
    const isSuperAdmin = isSuperAdminSession(adminSession);

    return jsonCors(sections.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        const itemOwner = owners.get(`resource-item:${item.id}`);
        const sectionOwner = owners.get(`resource-section:${section.id}`);
        return {
          ...item,
          canDelete: isSuperAdmin
            || itemOwner === adminSession.adminUserId
            || (!itemOwner && sectionOwner === adminSession.adminUserId),
        };
      }),
    })));
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
    const { session, response } = await requireAdmin();
    if (response) return response;
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
    await claimContentOwnership('resource-section', section.id, session);

    return jsonCors(section, { status: 201 });
  } catch (error) {
    console.error('Error creating resource section:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return jsonCors(
        { error: 'Une section avec ce slug existe déjà.', code: 'SLUG_CONFLICT' },
        { status: 409 }
      );
    }
    return jsonCors(
      {
        error: 'Failed to create resource section',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
