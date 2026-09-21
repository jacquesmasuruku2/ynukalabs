import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!token || password.length < 8) {
      return NextResponse.json({ error: 'Le token et un mot de passe d’au moins 8 caractères sont requis.' }, { status: 400 });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const reset = await prisma.adminPasswordReset.findUnique({
      where: { tokenHash },
      include: { adminUser: true },
    });

    if (!reset || reset.expiresAt < new Date() || !reset.adminUser.isActive) {
      return NextResponse.json({ error: 'Lien de réinitialisation invalide ou expiré.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.adminUser.update({
        where: { id: reset.adminUserId },
        data: { passwordHash, provider: 'email', updatedAt: new Date() },
      }),
      prisma.adminPasswordReset.delete({ where: { id: reset.id } }),
      prisma.adminSession.deleteMany({ where: { adminUserId: reset.adminUserId } }),
    ]);

    return NextResponse.json({ success: true, message: 'Mot de passe mis à jour.' });
  } catch (error) {
    console.error('Admin reset password error:', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}
