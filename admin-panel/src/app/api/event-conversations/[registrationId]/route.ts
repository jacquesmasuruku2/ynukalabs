import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

async function markIncomingAsRead(
  conversationId: string,
  viewer: 'user' | 'team'
) {
  const incomingType = viewer === 'user' ? 'team' : 'user';
  await prisma.eventMessage.updateMany({
    where: {
      conversationId,
      senderType: incomingType,
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await params;
    const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
    const admin = request.nextUrl.searchParams.get('admin') === '1';

    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
      },
    });
    if (!registration) return jsonCors({ error: 'Not found' }, { status: 404 });
    if (!admin && (!email || registration.email.toLowerCase() !== email)) {
      return jsonCors({ error: 'Forbidden' }, { status: 403 });
    }

    let conversation = registration.conversation;
    if (!conversation) {
      conversation = await prisma.eventConversation.create({
        data: {
          registrationId,
          messages: {
            create: {
              senderType: 'system',
              senderName: 'Ynuka Labs',
              body: 'Bienvenue dans votre espace d’échange avec l’équipe Ynuka Labs.',
              readAt: new Date(),
            },
          },
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    } else {
      await markIncomingAsRead(conversation.id, admin ? 'team' : 'user');
      conversation = await prisma.eventConversation.findUnique({
        where: { id: conversation.id },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    return jsonCors({
      registration,
      conversation,
      messages: conversation?.messages ?? [],
    });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to load conversation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await params;
    const body = await request.json();
    const messageBody = String(body.body || body.message || '').trim();
    const senderType = body.senderType === 'team' ? 'team' : 'user';
    const senderEmail = String(body.senderEmail || body.email || '')
      .trim()
      .toLowerCase();
    const senderName = String(body.senderName || body.name || '').trim() || null;

    if (!messageBody) {
      return jsonCors({ error: 'Message required' }, { status: 400 });
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: { conversation: true },
    });
    if (!registration) return jsonCors({ error: 'Not found' }, { status: 404 });

    if (senderType === 'user') {
      if (!senderEmail || registration.email.toLowerCase() !== senderEmail) {
        return jsonCors({ error: 'Forbidden' }, { status: 403 });
      }
    }

    let conversationId = registration.conversation?.id;
    if (!conversationId) {
      const conv = await prisma.eventConversation.create({
        data: { registrationId },
      });
      conversationId = conv.id;
    }

    const message = await prisma.eventMessage.create({
      data: {
        conversationId,
        senderType,
        senderEmail: senderEmail || null,
        senderName,
        body: messageBody,
        readAt: null,
      },
    });

    await prisma.eventConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    if (senderType === 'team') {
      const siteBase = (
        process.env.PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_MAIN_SITE_URL ||
        'http://localhost:8080'
      ).replace(/\/$/, '');
      await prisma.siteNotification.create({
        data: {
          userEmail: registration.email,
          type: 'event_message',
          title: 'Nouveau message de l’équipe',
          body: messageBody.slice(0, 180),
          link: `${siteBase}/events/${registration.eventId}/espace`,
        },
      });
    }

    return jsonCors(message, { status: 201 });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/** Marquer comme lus les messages entrants (vue active du destinataire). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await params;
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const admin = body.admin === true || body.admin === '1';

    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: { conversation: true },
    });
    if (!registration) return jsonCors({ error: 'Not found' }, { status: 404 });
    if (!admin && (!email || registration.email.toLowerCase() !== email)) {
      return jsonCors({ error: 'Forbidden' }, { status: 403 });
    }
    if (!registration.conversation) {
      return jsonCors({ ok: true, updated: 0 });
    }

    const result = await prisma.eventMessage.updateMany({
      where: {
        conversationId: registration.conversation.id,
        senderType: admin ? 'user' : 'team',
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return jsonCors({ ok: true, updated: result.count });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to mark read', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
