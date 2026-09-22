import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';
import { requireAdmin } from '@/lib/admin-session';
import { claimContentOwnership } from '@/lib/admin-content-access';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    const members = await prisma.teamMember.findMany({
      where: { isActive: true, ...(slug ? { slug } : {}) },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
    return jsonCors(members);
  } catch (error) {
    return jsonCors({ error: 'Failed to fetch team members', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const body = await request.json();
    const member = await prisma.teamMember.create({
      data: {
        name: body.name,
        slug: body.slug,
        role: body.role,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        imageAlt: body.imageAlt || null,
        xUrl: body.xUrl || null,
        linkedinUrl: body.linkedinUrl || null,
        telegramUrl: body.telegramUrl || null,
        portfolioUrl: body.portfolioUrl || null,
        displayOrder: body.displayOrder != null ? Number(body.displayOrder) : 0,
        isActive: body.isActive !== false,
        legacyId: body.legacyId || null,
      },
    });
    await claimContentOwnership('team-member', member.id, session);
    return jsonCors(member, { status: 201 });
  } catch (error) {
    return jsonCors({ error: 'Failed to create team member', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
