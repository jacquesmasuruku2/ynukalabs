import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, googleId, avatarUrl } = body;

    if (!email || !googleId) {
      return NextResponse.json({ error: 'Informations Google manquantes' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    let user = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      user = await prisma.adminUser.create({
        data: {
          email: normalizedEmail,
          name: name || 'Admin Google',
          avatarUrl: avatarUrl || null,
          provider: 'google',
          googleId,
          role: 'admin',
          isActive: true,
          emailVerified: true,
        },
      });
    } else {
      user = await prisma.adminUser.update({
        where: { email: normalizedEmail },
        data: {
          name: name || user.name,
          avatarUrl: avatarUrl || user.avatarUrl,
          provider: 'google',
          googleId,
          role: user.role || 'admin',
          isActive: true,
          emailVerified: true,
        },
      });
    }

    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, provider: 'google', role: user.role } });
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12);

    await prisma.adminSession.create({
      data: { adminUserId: user.id, token, expiresAt },
    });

    response.cookies.set('admin_session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error('Admin Google login error:', error);
    return NextResponse.json({ error: 'Erreur lors de la connexion Google' }, { status: 500 });
  }
}
