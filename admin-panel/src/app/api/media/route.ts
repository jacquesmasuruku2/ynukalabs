import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const serializeMedia = (media: { duration: bigint | null; views: bigint } & Record<string, unknown>) => ({
  ...media,
  duration: media.duration === null ? null : Number(media.duration),
  views: Number(media.views),
});

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
      include: { category: true, author: true },
    });

    return NextResponse.json(media.map(serializeMedia));
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Impossible de charger les médias.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    const slug = String(body.slug || '').trim();
    const url = String(body.url || '').trim();

    if (!title || !slug || !url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: 'Titre, slug et URL HTTPS requis.' }, { status: 400 });
    }

    const media = await prisma.media.create({
      data: {
        type: body.type || 'SONG',
        title,
        slug,
        description: body.description ? String(body.description).trim() : null,
        url,
        thumbnailUrl: body.thumbnailUrl ? String(body.thumbnailUrl).trim() : null,
        duration: body.duration ? BigInt(Math.max(0, Number(body.duration))) : null,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
        featured: Boolean(body.featured),
      },
    });

    return NextResponse.json(serializeMedia(media), { status: 201 });
  } catch (error) {
    console.error('Error creating media:', error);
    return NextResponse.json(
      { error: 'Impossible de publier ce média.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
