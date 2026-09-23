import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const commentId = typeof body.commentId === 'string' ? body.commentId.trim() : '';
    const authorName = typeof body.authorName === 'string' ? body.authorName.trim() : '';
    const authorEmail = typeof body.authorEmail === 'string' ? body.authorEmail.trim().toLowerCase() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!commentId || !authorName || !authorEmail || !content) {
      return jsonCors({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      return jsonCors({ error: 'Adresse email invalide.' }, { status: 400 });
    }

    const parentComment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!parentComment) {
      return jsonCors({ error: 'Commentaire introuvable.' }, { status: 404 });
    }

    const reply = await prisma.blogCommentReply.create({
      data: {
        commentId,
        authorName,
        authorEmail,
        content,
      },
      select: {
        id: true,
        authorName: true,
        content: true,
        createdAt: true,
      },
    });

    return jsonCors({
      id: reply.id,
      author_name: reply.authorName,
      content: reply.content,
      created_at: reply.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Blog comment reply error:', error);
    return jsonCors({ error: 'Impossible de publier la réponse.' }, { status: 500 });
  }
}
