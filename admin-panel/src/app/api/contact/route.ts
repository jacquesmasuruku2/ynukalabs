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
    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return jsonCors(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return jsonCors({ error: 'Failed to fetch messages', messages: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.message) {
      return jsonCors({ error: 'name, email and message required' }, { status: 400 });
    }

    const subject =
      body.subject || (body.phone ? `Tél: ${body.phone}` : null);
    const subjectText = typeof subject === 'string' ? subject : '';
    const isPartnershipInquiry = /partenair|partner/i.test(subjectText);

    const message = await prisma.contactMessage.create({
      data: {
        name: body.name,
        email: body.email,
        subject: subjectText || null,
        message: body.message,
        status: 'new',
      },
    });

    // Si le sujet indique un partenariat, aussi enregistrer dans Partnership
    // pour l’onglet Partenariats de /form-submissions
    if (isPartnershipInquiry) {
      try {
        await prisma.partnership.create({
          data: {
            companyName: body.companyName || body.name,
            contactName: body.name,
            email: body.email,
            phone: body.phone || null,
            type: 'partnership_inquiry',
            description: [subjectText, body.message].filter(Boolean).join('\n\n'),
            websiteUrl: body.websiteUrl || body.companyWebsite || null,
            status: 'pending',
          },
        });
      } catch (err) {
        console.error('Partnership mirror from contact failed:', err);
      }
    }

    return jsonCors(message, { status: 201 });
  } catch (error) {
    console.error('Error creating contact message:', error);
    return jsonCors(
      { error: 'Failed to create message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
