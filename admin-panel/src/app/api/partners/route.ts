import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const admin = searchParams.get('admin') === '1';
    const limit = Math.min(Number(searchParams.get('limit') || 100), 500);

    const partners = await prisma.partner.findMany({
      where: admin ? {} : { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      take: limit,
    });
    return jsonCors(partners);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to fetch partners', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const partner = await prisma.partner.create({
      data: {
        name: body.name,
        slug: body.slug || null,
        description: body.description || null,
        logoUrl: body.logoUrl || null,
        websiteUrl: body.websiteUrl || null,
        displayOrder: body.displayOrder != null ? Number(body.displayOrder) : 0,
        isActive: body.isActive !== false,
        legacyId: body.legacyId || null,
      },
    });
    return jsonCors(partner, { status: 201 });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to create partner', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
