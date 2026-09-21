import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

async function ensureConversation(registrationId: string, fullName: string, eventTitle?: string | null) {
  const existing = await prisma.eventConversation.findUnique({
    where: { registrationId },
  });
  if (existing) return existing;

  return prisma.eventConversation.create({
    data: {
      registrationId,
      messages: {
        create: {
          senderType: 'system',
          senderName: 'Ynuka Labs',
          body: eventTitle
            ? `Bienvenue ${fullName} ! Votre inscription à « ${eventTitle} » est bien reçue. Échangez ici avec notre équipe — nous vous répondrons rapidement.`
            : `Bienvenue ${fullName} ! Votre inscription est bien reçue. Échangez ici avec notre équipe.`,
        },
      },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventId = body.eventId || body.event_id;
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const fullName = body.fullName || body.full_name || body.name;
    if (!eventId || !email || !fullName) {
      return jsonCors({ error: 'eventId, email and name required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return jsonCors({ error: 'Event not found' }, { status: 404 });
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_email: { eventId, email } },
      include: { conversation: true },
    });

    if (existing) {
      await ensureConversation(existing.id, existing.fullName, event.titleFr || event.title);
      const refreshed = await prisma.eventRegistration.findUnique({
        where: { id: existing.id },
        include: { conversation: true, event: true },
      });
      return jsonCors({ ...refreshed, alreadyRegistered: true });
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        fullName: String(fullName).trim(),
        email,
        phone: body.phone || null,
        organization: body.organization || null,
        message: body.message || null,
        avatarUrl: body.avatarUrl || body.avatar || null,
        googleSub: body.googleSub || null,
        status: 'registered',
      },
    });

    await ensureConversation(registration.id, registration.fullName, event.titleFr || event.title);

    const full = await prisma.eventRegistration.findUnique({
      where: { id: registration.id },
      include: { conversation: true, event: true },
    });

    return jsonCors(full, { status: 201 });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to register', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const eventId = searchParams.get('eventId');
    const email = searchParams.get('email')?.trim().toLowerCase();
    const admin = searchParams.get('admin') === '1';
    const id = searchParams.get('id');

    if (id) {
      const registration = await prisma.eventRegistration.findUnique({
        where: { id },
        include: {
          event: true,
          conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
        },
      });
      if (!registration) return jsonCors({ error: 'Not found' }, { status: 404 });
      if (!admin && email && registration.email.toLowerCase() !== email) {
        return jsonCors({ error: 'Forbidden' }, { status: 403 });
      }
      return jsonCors(registration);
    }

    if (admin && eventId) {
      const rows = await prisma.eventRegistration.findMany({
        where: { eventId },
        include: {
          conversation: { include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return jsonCors(rows);
    }

    if (email && eventId) {
      const registration = await prisma.eventRegistration.findUnique({
        where: { eventId_email: { eventId, email } },
        include: {
          event: true,
          conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
        },
      });
      return jsonCors(registration);
    }

    if (email) {
      const rows = await prisma.eventRegistration.findMany({
        where: { email },
        include: { event: true, conversation: true },
        orderBy: { createdAt: 'desc' },
      });
      return jsonCors(rows);
    }

    if (eventId) {
      const count = await prisma.eventRegistration.count({ where: { eventId } });
      return jsonCors({ count });
    }

    return jsonCors({ error: 'eventId or email required' }, { status: 400 });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to fetch registrations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
