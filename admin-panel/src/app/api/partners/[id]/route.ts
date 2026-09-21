import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

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
    const { id } = await params;
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
    const { id } = await params;
    await prisma.partner.delete({ where: { id } });
    return jsonCors({ success: true });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to delete partner', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
