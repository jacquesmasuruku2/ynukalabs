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
    const message = await prisma.contactMessage.create({
      data: {
        name: body.name,
        email: body.email,
        subject: body.subject || (body.phone ? `Tél: ${body.phone}` : null),
        message: body.message,
        status: 'new',
      },
    });
    return jsonCors(message, { status: 201 });
  } catch (error) {
    console.error('Error creating contact message:', error);
    return jsonCors(
      { error: 'Failed to create message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
