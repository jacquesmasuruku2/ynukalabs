import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await prisma.teamMember.findUnique({ where: { id } });
  return member ? NextResponse.json(member) : NextResponse.json({ error: 'Team member not found' }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    const { id } = await params;
    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete team member', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}