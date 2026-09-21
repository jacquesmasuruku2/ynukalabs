import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';
import { sendNewsletterConfirmationEmail } from '@/lib/email';
import {
  isKnownNewsletterInterest,
} from '@/lib/newsletterInterests';

async function sendConfirmationSafely(email: string, name?: string | null) {
  try {
    await sendNewsletterConfirmationEmail({ to: email, name });
  } catch (error) {
    console.error('Newsletter confirmation email failed:', error);
  }
}

function queueConfirmationEmail(email: string, name?: string | null) {
  void sendConfirmationSafely(email, name);
}

export async function OPTIONS() {
  return corsOptions();
}

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

    return jsonCors(serialized);
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return jsonCors({ error: 'Failed to fetch subscribers', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
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
      return jsonCors({ error: 'Email invalide.' }, { status: 400 });
    }

    const validInterests = interests.filter((interest: string) =>
      isKnownNewsletterInterest(interest)
    );

    const existingSubscriber = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      const wasInactive = !existingSubscriber.isActive || !!existingSubscriber.unsubscribedAt;

      if (!wasInactive) {
        return jsonCors(
          {
            error: 'Cette adresse email est déjà inscrite à la newsletter.',
            code: 'ALREADY_SUBSCRIBED',
            subscriber: existingSubscriber,
          },
          { status: 409 }
        );
      }

      const updated = await prisma.newsletterSubscription.update({
        where: { email },
        data: {
          name: name || existingSubscriber.name,
          interests: validInterests.length > 0 ? validInterests : existingSubscriber.interests,
          isActive: true,
          unsubscribedAt: null,
        },
      });

      queueConfirmationEmail(email, updated.name);

      return jsonCors({
        message: 'Abonnement réactivé avec succès.',
        subscriber: updated,
        reactivated: true,
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

    queueConfirmationEmail(email, subscriber.name);

    return jsonCors({
      message: 'Abonné ajouté avec succès.',
      subscriber,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating newsletter subscriber:', error);
    return jsonCors({
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
      return jsonCors({ error: 'Identifiant manquant.' }, { status: 400 });
    }

    await prisma.newsletterSubscription.delete({
      where: { id },
    });

    return jsonCors({ message: 'Abonné supprimé avec succès.' });
  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error);
    return jsonCors({
      error: 'Impossible de supprimer cet abonné.',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
