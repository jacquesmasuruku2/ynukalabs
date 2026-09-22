import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { requireContentOwner } from '@/lib/admin-content-access';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('author', id, session!);
    if (accessResponse) return accessResponse;
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }
    return NextResponse.json(author);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch author' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('author', id, session!);
    if (accessResponse) return accessResponse;
    const body = await request.json();
    const author = await prisma.author.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        bio: body.bio,
        role: body.role,
        email: body.email,
        imageUrl: body.imageUrl,
        imageAlt: body.imageAlt,
      },
    });
    return NextResponse.json(author);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;
    const { id } = await params;
    const accessResponse = await requireContentOwner('author', id, session!);
    if (accessResponse) return accessResponse;
    await prisma.author.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Author deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 });
  }
}
