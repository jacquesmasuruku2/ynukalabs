import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

function parseDate(value: unknown): Date | null {
  if (!value || typeof value !== 'string') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit') || 100), 500);

    const proposals = await prisma.eventProposal.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        organization: true,
        title: true,
        description: true,
        category: true,
        eventDate: true,
        eventTime: true,
        timezone: true,
        format: true,
        locationOrLink: true,
        venue: true,
        onlineLink: true,
        audience: true,
        capacity: true,
        publicationChannel: true,
        externalEventUrl: true,
        registrationMode: true,
        registrationUrl: true,
        imageUrl: true,
        imageFilename: true,
        partners: true,
        speakers: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
        // imageData volontairement omis en liste (peut être très lourd)
      },
    });

    return jsonCors(proposals);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to fetch event proposals', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot anti-spam
    if (typeof body.website === 'string' && body.website.trim()) {
      return jsonCors({ success: true, status: 'pending', id: null });
    }

    const contactName = String(body.contact_name || body.contactName || '').trim();
    const contactEmail = String(body.contact_email || body.contactEmail || '').trim();
    const organization = String(body.organization || '').trim();
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const category = String(body.category || '').trim();
    const format = String(body.format || '').trim();

    if (!contactName || !contactEmail || !organization || !title || !description || !category || !format) {
      return jsonCors({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return jsonCors({ error: 'Email invalide' }, { status: 400 });
    }

    const imageDataRaw = typeof body.image_data === 'string' ? body.image_data : null;
    // Limite ~1.5 Mo de data URL pour éviter de saturer la DB
    const imageData =
      imageDataRaw && imageDataRaw.length > 0 && imageDataRaw.length < 1_500_000
        ? imageDataRaw
        : null;

    const proposal = await prisma.eventProposal.create({
      data: {
        contactName,
        contactEmail,
        contactPhone: body.contact_phone || body.contactPhone || null,
        organization,
        title,
        description,
        category,
        eventDate: parseDate(body.event_date || body.eventDate),
        eventTime: body.event_time || body.eventTime || null,
        timezone: body.timezone || null,
        format,
        locationOrLink: body.location_or_link || body.locationOrLink || null,
        venue: body.venue || null,
        onlineLink: body.online_link || body.onlineLink || null,
        audience: body.audience || null,
        capacity:
          body.capacity !== undefined && body.capacity !== null && body.capacity !== ''
            ? Number(body.capacity)
            : null,
        publicationChannel: body.publication_channel || body.publicationChannel || 'ynuka_agenda',
        externalEventUrl: body.external_event_url || body.externalEventUrl || null,
        registrationMode: body.registration_mode || body.registrationMode || null,
        registrationUrl: body.registration_url || body.registrationUrl || null,
        imageUrl: body.image_url || body.imageUrl || null,
        imageData,
        imageFilename: body.image_filename || body.imageFilename || null,
        partners: body.partners || null,
        speakers: body.speakers || null,
        status: 'pending',
      },
    });

    return jsonCors(
      {
        success: true,
        id: proposal.id,
        status: proposal.status,
        message: 'Demande d’événement reçue',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('EventProposal POST error:', error);
    return jsonCors(
      { error: 'Failed to create event proposal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
