import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: true,
      },
    });
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...article,
      views: Number(article.views),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const article = await prisma.article.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        categoryId: body.categoryId,
        authorId: body.authorId || null,
        defaultLocale: body.defaultLocale || 'fr',
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
        featured: body.featured,
        isPremium: body.isPremium,
        premiumPrice: body.premiumPrice ? parseFloat(body.premiumPrice) : null,
        readTime: body.readTime ? String(body.readTime) : null,
        mainImageUrl: body.mainImageUrl || null,
        mainImageAlt: body.mainImageAlt || null,
        externalLink: body.externalLink || null,
        additionalImages: body.additionalImages || [],
        additionalImageDescriptions: body.additionalImageDescriptions || [],
      },
      include: {
        category: true,
        author: true,
      },
    });
    return NextResponse.json({
      ...article,
      views: Number(article.views),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.article.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
