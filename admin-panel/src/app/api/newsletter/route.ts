import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const interestOptions = [
  { value: 'actualites', label: 'Actualités' },
  { value: 'economie', label: 'Économie' },
  { value: 'culture', label: 'Culture' },
  { value: 'sport', label: 'Sport' },
  { value: 'tech', label: 'Science & Tech' },
];

export async function GET() {
  try {
    const subscribers = await prisma.newsletterSubscription.findMany({
      orderBy: { subscribedAt: 'desc' },
    });

    const serialized = subscribers.map((s) => ({
      id: s.id,
      email: s.email,
      name: s.name,
      interests: Array.isArray(s.interests) ? s.interests : [],
      isActive: s.isActive,
      subscribedAt: s.subscribedAt?.toISOString(),
      unsubscribedAt: s.unsubscribedAt?.toISOString() || null,
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const interests = Array.isArray(body?.interests)
      ? body.interests.filter((item: unknown): item is string => typeof item === 'string')
      : [];

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 });
    }

    const validInterests = interests.filter((interest: string) =>
      interestOptions.some((option) => option.value === interest)
    );

    const existingSubscriber = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      const updated = await prisma.newsletterSubscription.update({
        where: { email },
        data: {
          name: name || existingSubscriber.name,
          interests: validInterests.length > 0 ? validInterests : existingSubscriber.interests,
          isActive: true,
          unsubscribedAt: null,
        },
      });

      return NextResponse.json({
        message: 'Abonné mis à jour avec succès.',
        subscriber: updated,
      });
    }

    const subscriber = await prisma.newsletterSubscription.create({
      data: {
        email,
        name: name || null,
        interests: validInterests.length > 0 ? validInterests : undefined,
        isActive: true,
        subscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Abonné ajouté avec succès.',
      subscriber,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating newsletter subscriber:', error);
    return NextResponse.json({
      error: 'Impossible d’ajouter cet abonné.',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = typeof body?.id === 'string' ? body.id : null;

    if (!id) {
      return NextResponse.json({ error: 'Identifiant manquant.' }, { status: 400 });
    }

    await prisma.newsletterSubscription.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Abonné supprimé avec succès.' });
  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error);
    return NextResponse.json({
      error: 'Impossible de supprimer cet abonné.',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
