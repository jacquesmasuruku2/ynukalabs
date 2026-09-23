import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSuperAdminEmail, isSuperAdminRole, resolveAdminRole } from '@/lib/adminRoles';

export function hasPremiumAccess(user: { isPremium?: boolean | null; premiumExpiresAt?: Date | string | null; role?: string | null; email?: string | null } | null | undefined) {
  if (!user) return false;
  if (isSuperAdminRole(user.role) || isSuperAdminEmail(String(user.email || ''))) return true;
  if (!user.isPremium || !user.premiumExpiresAt) return false;
  return new Date(user.premiumExpiresAt) > new Date();
}

export async function getAdminSession() {
  const token = (await cookies()).get('admin_session_token')?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { adminUser: true },
  });

  if (!session || session.expiresAt < new Date() || !session.adminUser.isActive) return null;

  const expectedRole = resolveAdminRole(session.adminUser.email, session.adminUser.role);
  if (session.adminUser.role !== expectedRole) {
    session.adminUser = await prisma.adminUser.update({ where: { id: session.adminUser.id }, data: { role: expectedRole } });
  }
  await prisma.adminSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } });
  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, response: null };
}

export async function requireSuperAdmin() {
  const { session, response } = await requireAdmin();
  if (response) return { session: null, response };
  if (!isSuperAdminRole(session!.adminUser.role) && !isSuperAdminEmail(session!.adminUser.email)) {
    return { session: null, response: NextResponse.json({ error: 'Réservé au super-administrateur.' }, { status: 403 }) };
  }
  return { session, response: null };
}

export async function requirePremiumAccess() {
  const { session, response } = await requireAdmin();
  if (response) return { session: null, response };
  if (!hasPremiumAccess(session!.adminUser)) {
    return { session: null, response: NextResponse.json({ error: 'Réservé aux comptes Premium.' }, { status: 403 }) };
  }
  return { session, response: null };
}