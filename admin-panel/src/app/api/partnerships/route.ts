import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const where = status ? { status } : {};

    const partnerships = await prisma.partnership.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return jsonCors(partnerships);
  } catch (error) {
    console.error('Error fetching partnership requests:', error);
    return jsonCors(
      { error: 'Failed to fetch partnership requests', partnerships: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const companyName = String(body.companyName || body.company_name || '').trim();
    const contactName = String(
      body.contactName || body.contact_name || body.contactPerson || body.contact_person || ''
    ).trim();
    const email = String(body.email || '').trim();
    const type = String(
      body.type || body.partnershipType || body.partnership_type || 'sponsorship'
    ).trim();
    const phone = body.phone ? String(body.phone).trim() : null;
    const websiteUrl = body.websiteUrl || body.companyWebsite || body.company_website || null;
    const description = body.description || body.industry
      ? [body.industry ? `Secteur: ${body.industry}` : null, body.description || null]
          .filter(Boolean)
          .join('\n')
      : null;

    if (!companyName || !contactName || !email || !type) {
      return jsonCors(
        { error: 'companyName, contactName, email et type sont requis' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonCors({ error: 'Email invalide' }, { status: 400 });
    }

    const partnership = await prisma.partnership.create({
      data: {
        companyName,
        contactName,
        email,
        phone,
        type,
        description,
        websiteUrl: websiteUrl ? String(websiteUrl).trim() : null,
        imageUrl: body.imageUrl || null,
        status: 'pending',
      },
    });

    return jsonCors(
      {
        success: true,
        id: partnership.id,
        status: partnership.status,
        message: 'Demande de partenariat reçue',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating partnership:', error);
    return jsonCors(
      {
        error: 'Failed to create partnership',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
