import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendAdminPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const genericResponse = NextResponse.json({
    success: true,
    message: 'Si ce compte existe, un lien de réinitialisation a été envoyé.',
  });

  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return genericResponse;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.adminPasswordReset.deleteMany({ where: { adminUserId: user.id } });
    await prisma.adminPasswordReset.create({
      data: { adminUserId: user.id, tokenHash, expiresAt },
    });

    const baseUrl = process.env.ADMIN_PANEL_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    try {
      await sendAdminPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
    } catch (emailError) {
      await prisma.adminPasswordReset.deleteMany({ where: { adminUserId: user.id } });
      console.error('Admin password reset email failed:', emailError);
    }

    return genericResponse;
  } catch (error) {
    console.error('Admin forgot password error:', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}
