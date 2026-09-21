import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventId = body.eventId || body.event_id;
    if (!eventId || !body.email || !body.fullName && !body.full_name && !body.name) {
      return jsonCors({ error: 'eventId, email and name required' }, { status: 400 });
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        fullName: body.fullName || body.full_name || body.name,
        email: body.email,
        phone: body.phone || null,
        organization: body.organization || null,
        message: body.message || null,
        status: 'registered',
      },
    });
    return jsonCors(registration, { status: 201 });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to register', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get('eventId');
    if (!eventId) return jsonCors({ error: 'eventId required' }, { status: 400 });
    const count = await prisma.eventRegistration.count({ where: { eventId } });
    return jsonCors({ count });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to count registrations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
