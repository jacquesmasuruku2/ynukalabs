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
  const partner = await prisma.partner.findUnique({ where: { id } });
  return partner ? jsonCors(partner) : jsonCors({ error: 'Partner not found' }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('partner', id, session!);
    if (accessResponse) return accessResponse;
    const body = await request.json();
    const partner = await prisma.partner.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug || null,
        description: body.description || null,
        logoUrl: body.logoUrl || null,
        websiteUrl: body.websiteUrl || null,
        displayOrder: body.displayOrder != null ? Number(body.displayOrder) : 0,
        isActive: body.isActive !== false,
      },
    });
    return jsonCors(partner);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to update partner', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('partner', id, session!);
    if (accessResponse) return accessResponse;
    await prisma.partner.delete({ where: { id } });
    return jsonCors({ success: true });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to delete partner', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
