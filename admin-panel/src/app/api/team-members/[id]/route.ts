import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { requireContentOwner } from '@/lib/admin-content-access';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await prisma.teamMember.findUnique({ where: { id } });
  return member ? NextResponse.json(member) : NextResponse.json({ error: 'Team member not found' }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('team-member', id, session!);
    if (accessResponse) return accessResponse;
    const body = await request.json();
    const member = await prisma.teamMember.update({
      where: { id },
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
      },
    });
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update team member', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('team-member', id, session!);
    if (accessResponse) return accessResponse;
    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete team member', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}