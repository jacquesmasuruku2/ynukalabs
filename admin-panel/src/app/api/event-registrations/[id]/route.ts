import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';
import { sendEventSelectionEmail } from '@/lib/email';

export async function OPTIONS() {
  return corsOptions();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = String(body.status || '').trim();
    if (!['registered', 'selected', 'rejected', 'waitlisted'].includes(status)) {
      return jsonCors({ error: 'Invalid status' }, { status: 400 });
    }

    const previous = await prisma.eventRegistration.findUnique({
      where: { id },
      include: { event: true, conversation: true },
    });
    if (!previous) return jsonCors({ error: 'Not found' }, { status: 404 });

    const registration = await prisma.eventRegistration.update({
      where: { id },
      data: { status },
      include: { event: true, conversation: true },
    });

    const eventTitle = registration.event.titleFr || registration.event.title;
      const siteBase = (
        process.env.PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_MAIN_SITE_URL ||
        'http://localhost:8080'
      ).replace(/\/$/, '');
      const exchangeLink = `${siteBase}/events/${registration.eventId}/espace`;

    if (status === 'selected' && previous.status !== 'selected') {
      let conversationId = registration.conversation?.id;
      if (!conversationId) {
        const conv = await prisma.eventConversation.create({
          data: { registrationId: registration.id },
        });
        conversationId = conv.id;
      }

      const teamMessage =
        body.message ||
        `Félicitations ${registration.fullName} ! Vous avez été sélectionné(e) pour participer à « ${eventTitle} ». Notre équipe reste disponible ici pour toute question.`;

      await prisma.eventMessage.create({
        data: {
          conversationId,
          senderType: 'team',
          senderName: 'Équipe Ynuka Labs',
          body: teamMessage,
        },
      });

      await prisma.siteNotification.create({
        data: {
          userEmail: registration.email,
          type: 'event_selected',
          title: 'Vous êtes sélectionné(e) !',
          body: `Bonne nouvelle : vous avez été sélectionné(e) pour « ${eventTitle} ».`,
          link: exchangeLink,
        },
      });

      try {
        await sendEventSelectionEmail({
          to: registration.email,
          name: registration.fullName,
          eventTitle,
          exchangeUrl: exchangeLink,
          customMessage: body.message || undefined,
        });
      } catch (emailErr) {
        console.warn('Selection email skipped:', emailErr);
      }
    }

    if (status === 'rejected' && previous.status !== 'rejected') {
      let conversationId = registration.conversation?.id;
      if (!conversationId) {
        const conv = await prisma.eventConversation.create({
          data: { registrationId: registration.id },
        });
        conversationId = conv.id;
      }
      await prisma.eventMessage.create({
        data: {
          conversationId,
          senderType: 'team',
          senderName: 'Équipe Ynuka Labs',
          body:
            body.message ||
            `Merci pour votre intérêt pour « ${eventTitle} ». Malheureusement, nous n'avons pas pu retenir votre candidature cette fois-ci. N'hésitez pas à postuler aux prochaines sessions.`,
        },
      });
      await prisma.siteNotification.create({
        data: {
          userEmail: registration.email,
          type: 'event_rejected',
          title: 'Mise à jour de votre inscription',
          body: `Votre inscription à « ${eventTitle} » a été mise à jour.`,
          link: exchangeLink,
        },
      });
    }

    const full = await prisma.eventRegistration.findUnique({
      where: { id },
      include: {
        event: true,
        conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
      },
    });

    return jsonCors(full);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to update registration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.eventRegistration.delete({ where: { id } });
    return jsonCors({ ok: true });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to delete', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
