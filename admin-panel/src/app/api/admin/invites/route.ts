import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ADMIN_ROLE, isSuperAdminEmail } from '@/lib/adminRoles';
import { requireSuperAdmin } from '@/lib/admin-session';
import { sendAdminInviteEmail } from '@/lib/email';

function serializeInvite(invite: any) {
  return {
    id: invite.id, email: invite.email, name: invite.name,
    expiresAt: invite.expiresAt.toISOString(), acceptedAt: invite.acceptedAt?.toISOString() || null,
    createdAt: invite.createdAt.toISOString(),
    status: invite.acceptedAt ? 'accepted' : invite.expiresAt < new Date() ? 'expired' : 'pending',
    hasPassword: !!invite.adminUser?.passwordHash,
    isActive: invite.adminUser?.isActive ?? true,
    lastLoginAt: invite.adminUser?.lastLoginAt?.toISOString() || null,
    invitedBy: invite.invitedBy,
  };
}

export async function GET() {
  const { response } = await requireSuperAdmin();
  if (response) return response;
  const [invites, team] = await Promise.all([
    prisma.adminInvite.findMany({ orderBy: { createdAt: 'desc' }, include: { adminUser: { select: { id: true, name: true, isActive: true, lastLoginAt: true, passwordHash: true } }, invitedBy: { select: { name: true, email: true } } } }),
    prisma.adminUser.findMany({ where: { role: { in: [ADMIN_ROLE.ADMIN, ADMIN_ROLE.SUPER] } }, orderBy: { createdAt: 'asc' }, select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, passwordHash: true } }),
  ]);
  const activeSince = new Date(Date.now() - 12 * 1000);
  const sessions = await prisma.adminSession.findMany({
    where: { adminUserId: { in: team.map((member) => member.id) }, expiresAt: { gte: new Date() } },
    select: { adminUserId: true, lastSeenAt: true },
    orderBy: { lastSeenAt: 'desc' },
  });
  const sessionsByUser = new Map<string, Date[]>();
  for (const session of sessions) {
    const values = sessionsByUser.get(session.adminUserId) || [];
    values.push(session.lastSeenAt);
    sessionsByUser.set(session.adminUserId, values);
  }
  return NextResponse.json({
    invites: invites.map(serializeInvite),
    team: team.map((member) => {
      const lastActiveAt = sessionsByUser.get(member.id)?.[0] || member.lastLoginAt;
      const isOnline = sessionsByUser.get(member.id)?.some((seenAt) => seenAt >= activeSince) || false;
      return { ...member, lastLoginAt: member.lastLoginAt?.toISOString() || null, lastActiveAt: lastActiveAt?.toISOString() || null, isOnline, createdAt: member.createdAt.toISOString(), hasPassword: !!member.passwordHash, passwordHash: undefined, isSuperAdmin: member.role === ADMIN_ROLE.SUPER || isSuperAdminEmail(member.email) };
    }),
  });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSuperAdmin();
  if (response) return response;
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
    if (isSuperAdminEmail(email)) return NextResponse.json({ error: 'Cet email est déjà réservé au super-administrateur.' }, { status: 400 });
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing?.passwordHash) return NextResponse.json({ error: 'Un administrateur actif existe déjà avec cet email.' }, { status: 409 });
    const displayName = name || existing?.name || email.split('@')[0] || 'Administrateur';
    const adminUser = existing ? await prisma.adminUser.update({ where: { email }, data: { name: displayName, role: ADMIN_ROLE.ADMIN, isActive: true, provider: 'email' } }) : await prisma.adminUser.create({ data: { email, name: displayName, role: ADMIN_ROLE.ADMIN, provider: 'email', isActive: true, emailVerified: false } });
    const token = crypto.randomBytes(32).toString('hex');
    const invite = await prisma.$transaction(async (tx) => {
      await tx.adminInvite.deleteMany({ where: { email, acceptedAt: null } });
      return tx.adminInvite.create({ data: { email, name: displayName, tokenHash: crypto.createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), invitedById: session!.adminUserId, adminUserId: adminUser.id }, include: { adminUser: { select: { id: true, name: true, isActive: true, lastLoginAt: true, passwordHash: true } }, invitedBy: { select: { name: true, email: true } } } });
    });
    const baseUrl = (process.env.ADMIN_PANEL_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    await sendAdminInviteEmail({ to: email, name: displayName, inviterName: session!.adminUser.name || session!.adminUser.email, inviteUrl: `${baseUrl}/accept-invite?token=${encodeURIComponent(token)}` });
    return NextResponse.json({ success: true, message: 'Invitation envoyée par email.', invite: serializeInvite(invite) });
  } catch (error) {
    console.error('Admin invite error:', error);
    return NextResponse.json({ error: 'Impossible d’envoyer l’invitation.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { session, response } = await requireSuperAdmin();
  if (response) return response;
  const body = await request.json().catch(() => ({}));
  try {
    if (typeof body?.inviteId === 'string') { await prisma.adminInvite.delete({ where: { id: body.inviteId } }).catch(() => null); return NextResponse.json({ success: true }); }
    const userId = typeof body?.userId === 'string' ? body.userId : null;
    if (!userId) return NextResponse.json({ error: 'Identifiant manquant.' }, { status: 400 });
    if (userId === session!.adminUserId) return NextResponse.json({ error: 'Vous ne pouvez pas vous retirer vous-même.' }, { status: 400 });
    const target = await prisma.adminUser.findUnique({ where: { id: userId } });
    if (!target) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
    if (target.role === ADMIN_ROLE.SUPER || isSuperAdminEmail(target.email)) return NextResponse.json({ error: 'Impossible de supprimer le super-admin.' }, { status: 403 });
    await prisma.adminSession.deleteMany({ where: { adminUserId: userId } });
    await prisma.adminInvite.deleteMany({ where: { adminUserId: userId } });
    await prisma.adminUser.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (error) { console.error('Admin invite delete error:', error); return NextResponse.json({ error: 'Suppression impossible.' }, { status: 500 }); }
}