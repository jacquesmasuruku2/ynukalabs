import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    const members = await prisma.teamMember.findMany({
      where: { isActive: true, ...(slug ? { slug } : {}) },
      orderBy: { name: 'asc' },
    });
    return cors(NextResponse.json(members));
  } catch (error) {
    return cors(NextResponse.json({ error: 'Failed to fetch team members', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 }));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const member = await prisma.teamMember.create({
      data: {
        name: body.name,
        slug: body.slug,
        role: body.role,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        imageAlt: body.imageAlt || null,
        xUrl: body.xUrl || null,
        linkedinUrl: body.linkedinUrl || null,
        telegramUrl: body.telegramUrl || null,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create team member', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}