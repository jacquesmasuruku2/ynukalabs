import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';
import { requireAdmin } from '@/lib/admin-session';
import { claimContentOwnership } from '@/lib/admin-content-access';

function serializeArticle<T extends { views: bigint }>(article: T) {
  return { ...article, views: Number(article.views) };
}

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const admin = searchParams.get('admin') === '1';
    const limit = Math.min(Number(searchParams.get('limit') || 100), 500);
    const now = new Date();

    if (id || slug) {
      const article = await prisma.article.findFirst({
        where: id ? { id } : { slug: slug! },
        include: { category: true, author: true },
      });
      if (!article || (!admin && article.publishedAt > now)) {
        return jsonCors({ error: 'Article not found' }, { status: 404 });
      }
      return jsonCors(serializeArticle(article));
    }

    const articles = await prisma.article.findMany({
      where: admin ? {} : { publishedAt: { lte: now } },
      include: { category: true, author: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return jsonCors(articles.map(serializeArticle));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return jsonCors(
      {
        error: 'Failed to fetch articles',
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
    const article = await prisma.article.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        categoryId: body.categoryId,
        authorId: body.authorId || null,
        defaultLocale: body.defaultLocale || 'fr',
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
        featured: body.featured || false,
        isPremium: body.isPremium || false,
        premiumPrice: body.premiumPrice ? parseFloat(body.premiumPrice) : null,
        readTime: body.readTime,
        mainImageUrl: body.mainImageUrl,
        mainImageAlt: body.mainImageAlt || null,
        externalLink: body.externalLink || null,
        additionalImages: body.additionalImages || [],
        additionalImageDescriptions: body.additionalImageDescriptions || [],
      },
      include: { category: true, author: true },
    });
    await claimContentOwnership('article', article.id, session);
    return jsonCors(serializeArticle(article), { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return jsonCors(
      {
        error: 'Failed to create article',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
