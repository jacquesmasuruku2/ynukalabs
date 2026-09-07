import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get counts from database
    const [
      articlesCount,
      authorsCount,
      categoriesCount,
      totalViews,
      featuredArticlesCount,
      publishedThisMonth
    ] = await Promise.all([
      prisma.article.count(),
      prisma.author.count(),
      prisma.category.count(),
      prisma.article.aggregate({
        _sum: {
          views: true
        }
      }),
      prisma.article.count({
        where: {
          featured: true
        }
      }),
      prisma.article.count({
        where: {
          publishedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      })
    ]);

    const stats = {
      articles: articlesCount,
      authors: authorsCount,
      categories: categoriesCount,
      totalViews: Number(totalViews._sum.views || 0),
      featuredArticles: featuredArticlesCount,
      publishedThisMonth: publishedThisMonth,
      lives: 0,
      activeLives: 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
