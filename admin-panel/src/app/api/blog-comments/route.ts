import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  const articleId = request.nextUrl.searchParams.get('articleId')?.trim();
  if (!articleId) return jsonCors({ error: 'articleId requis.' }, { status: 400 });

  const comments = await prisma.blogComment.findMany({
    where: { articleId, approved: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true, authorName: true, content: true, createdAt: true },
  });
  return jsonCors(comments.map((comment) => ({ id: comment.id, author_name: comment.authorName, content: comment.content, created_at: comment.createdAt.toISOString() })));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const articleId = typeof body.articleId === 'string' ? body.articleId.trim() : '';
    const authorName = typeof body.authorName === 'string' ? body.authorName.trim() : '';
    const authorEmail = typeof body.authorEmail === 'string' ? body.authorEmail.trim().toLowerCase() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!articleId || !authorName || !authorEmail || !content) return jsonCors({ error: 'Tous les champs sont requis.' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) return jsonCors({ error: 'Adresse email invalide.' }, { status: 400 });

    const article = await prisma.article.findUnique({ where: { id: articleId }, select: { id: true } });
    if (!article) return jsonCors({ error: 'Article introuvable.' }, { status: 404 });
    const comment = await prisma.blogComment.create({ data: { articleId, authorName, authorEmail, content }, select: { id: true, authorName: true, content: true, createdAt: true } });
    return jsonCors({ id: comment.id, author_name: comment.authorName, content: comment.content, created_at: comment.createdAt.toISOString() }, { status: 201 });
  } catch (error) {
    console.error('Blog comment error:', error);
    return jsonCors({ error: 'Impossible de publier le commentaire.' }, { status: 500 });
  }
}