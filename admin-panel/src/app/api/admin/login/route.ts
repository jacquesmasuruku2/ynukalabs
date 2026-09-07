import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, provider = 'email' } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (provider === 'google') {
      const user = await prisma.adminUser.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user || !user.googleId || !user.isActive) {
        return NextResponse.json({ error: 'Compte Google admin introuvable' }, { status: 401 });
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
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(String(password), user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, provider: user.provider, role: user.role } });
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
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
