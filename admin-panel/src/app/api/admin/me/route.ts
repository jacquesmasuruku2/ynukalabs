import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = await prisma.adminSession.findUnique({
      where: { token },
      include: { adminUser: true },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.adminUser.id,
        email: session.adminUser.email,
        name: session.adminUser.name,
        avatarUrl: session.adminUser.avatarUrl,
        provider: session.adminUser.provider,
        role: session.adminUser.role,
      },
    });
  } catch (error) {
    console.error('Admin me error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
