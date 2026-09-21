import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: articleId } = await params;
    
    // Increment views
    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        views: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      views: Number(article.views) 
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json({ 
      error: 'Failed to increment views',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
