import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ADMIN_ROLE } from '@/lib/adminRoles';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')?.trim() || '';
    if (!token) return NextResponse.json({ error: 'Token manquant.' }, { status: 400 });
    const invite = await prisma.adminInvite.findUnique({ where: { tokenHash: crypto.createHash('sha256').update(token).digest('hex') }, include: { invitedBy: { select: { name: true, email: true } } } });
    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) return NextResponse.json({ error: 'Invitation invalide ou expirée.' }, { status: 400 });
    return NextResponse.json({ email: invite.email, name: invite.name, invitedBy: invite.invitedBy.name || invite.invitedBy.email, expiresAt: invite.expiresAt.toISOString() });
  } catch (error) {
    console.error('Accept invite GET error:', error);
    return NextResponse.json({ error: 'Impossible de vérifier l’invitation. Vérifiez que la migration AdminInvite est appliquée.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : password;
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!token || password.length < 8) return NextResponse.json({ error: 'Le token et un mot de passe d’au moins 8 caractères sont requis.' }, { status: 400 });
    if (password !== confirmPassword) return NextResponse.json({ error: 'La confirmation du mot de passe ne correspond pas.' }, { status: 400 });
    const invite = await prisma.adminInvite.findUnique({ where: { tokenHash: crypto.createHash('sha256').update(token).digest('hex') }, include: { adminUser: true } });
    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) return NextResponse.json({ error: 'Invitation invalide ou expirée.' }, { status: 400 });
    const adminUser = await prisma.adminUser.update({ where: { id: invite.adminUserId! }, data: { name: name || invite.name || invite.email.split('@')[0], passwordHash: await bcrypt.hash(password, 12), role: ADMIN_ROLE.ADMIN, isActive: true, emailVerified: true, provider: 'email' } });
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
    await prisma.$transaction([prisma.adminInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date(), adminUserId: adminUser.id, name: adminUser.name } }), prisma.adminSession.create({ data: { adminUserId: adminUser.id, token: sessionToken, expiresAt } }), prisma.adminUser.update({ where: { id: adminUser.id }, data: { lastLoginAt: new Date() } })]);
    const response = NextResponse.json({ success: true, message: 'Mot de passe créé. Vous êtes connecté.' });
    response.cookies.set('admin_session_token', sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: expiresAt });
    return response;
  } catch (error) { console.error('Accept invite error:', error); return NextResponse.json({ error: 'Impossible de finaliser l’invitation.' }, { status: 500 }); }
}