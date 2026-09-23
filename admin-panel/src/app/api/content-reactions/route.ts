import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

const reactionValues = new Set(['thumb', 'heart']);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function summarizeReactions(rows: Array<{ reactionType: string }>) {
  const counts = { thumb: 0, heart: 0 };
  for (const row of rows) {
    if (row.reactionType === 'thumb') counts.thumb += 1;
    if (row.reactionType === 'heart') counts.heart += 1;
  }
  return counts;
}

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  const resourceType = request.nextUrl.searchParams.get('resourceType')?.trim();
  const resourceId = request.nextUrl.searchParams.get('resourceId')?.trim();
  const userEmail = request.nextUrl.searchParams.get('userEmail')?.trim();

  if (!resourceType || !resourceId) {
    return jsonCors({ error: 'resourceType et resourceId requis.' }, { status: 400 });
  }

  const rows = await prisma.contentReaction.findMany({
    where: { resourceType, resourceId },
    select: { reactionType: true },
  });

  const counts = summarizeReactions(rows);

  const userReaction = userEmail
    ? await prisma.contentReaction.findUnique({
        where: {
          resourceType_resourceId_userEmail: {
            resourceType,
            resourceId,
            userEmail: normalizeEmail(userEmail),
          },
        },
        select: { reactionType: true },
      })
    : null;

  return jsonCors({
    thumb: counts.thumb,
    heart: counts.heart,
    user: userReaction?.reactionType && reactionValues.has(userReaction.reactionType) ? userReaction.reactionType : null,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resourceType = typeof body.resourceType === 'string' ? body.resourceType.trim() : '';
    const resourceId = typeof body.resourceId === 'string' ? body.resourceId.trim() : '';
    const userEmail = typeof body.userEmail === 'string' ? normalizeEmail(body.userEmail) : '';
    const reactionType = typeof body.reactionType === 'string' ? body.reactionType.trim() : '';

    if (!resourceType || !resourceId || !userEmail) {
      return jsonCors({ error: 'resourceType, resourceId et userEmail requis.' }, { status: 400 });
    }

    if (!reactionValues.has(reactionType)) {
      return jsonCors({ error: 'reactionType invalide. Utilisez thumb ou heart.' }, { status: 400 });
    }

    const existing = await prisma.contentReaction.findUnique({
      where: {
        resourceType_resourceId_userEmail: {
          resourceType,
          resourceId,
          userEmail,
        },
      },
    });

    if (existing) {
      if (existing.reactionType === reactionType) {
        await prisma.contentReaction.delete({ where: { id: existing.id } });
      } else {
        await prisma.contentReaction.update({
          where: { id: existing.id },
          data: { reactionType },
        });
      }
    } else {
      await prisma.contentReaction.create({
        data: {
          resourceType,
          resourceId,
          userEmail,
          reactionType,
        },
      });
    }

    const rows = await prisma.contentReaction.findMany({
      where: { resourceType, resourceId },
      select: { reactionType: true },
    });

    const counts = summarizeReactions(rows);
    const nextUserReaction = existing?.reactionType === reactionType ? null : reactionType;

    return jsonCors({
      thumb: counts.thumb,
      heart: counts.heart,
      user: nextUserReaction,
    });
  } catch (error) {
    console.error('Content reaction error:', error);
    return jsonCors({ error: 'Impossible de mettre à jour la réaction.' }, { status: 500 });
  }
}
