import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sponsor = await prisma.sponsoredArticle.findUnique({
      where: { id },
    });

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsored article not found' }, { status: 404 });
    }

    return NextResponse.json(sponsor);
  } catch (error) {
    console.error('Error fetching sponsored article:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsored article' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const sponsor = await prisma.sponsoredArticle.update({
      where: { id },
      data: {
        title: body.title,
        imageUrl: body.imageUrl,
        targetUrl: body.targetUrl,
        sponsorName: body.sponsorName,
        categoryBadge: body.categoryBadge,
        isActive: body.isActive,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      },
    });

    return NextResponse.json(sponsor);
  } catch (error) {
    console.error('Error updating sponsored article:', error);
    return NextResponse.json({ error: 'Failed to update sponsored article' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.sponsoredArticle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sponsored article:', error);
    return NextResponse.json({ error: 'Failed to delete sponsored article' }, { status: 500 });
  }
}
