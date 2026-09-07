import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      include: {
        category: true,
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Convert BigInt to number for JSON serialization
    const serializedArticles = articles.map(article => ({
      ...article,
      views: Number(article.views),
    }));
    
    return NextResponse.json(serializedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch articles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      include: {
        category: true,
        author: true,
      },
    });
    return NextResponse.json({
      ...article,
      views: Number(article.views),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ 
      error: 'Failed to create article',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
