import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSuperAdminEmail, isSuperAdminRole } from '@/lib/adminRoles';

export type AdminAccessSession = { adminUserId: string; adminUser: { email: string; role: string } };

export function isSuperAdminSession(session: AdminAccessSession) {
  return isSuperAdminRole(session.adminUser.role) || isSuperAdminEmail(session.adminUser.email);
}

export async function claimContentOwnership(resourceType: string, resourceId: string, session: AdminAccessSession | null) {
  if (!session || isSuperAdminSession(session)) return;
  await prisma.adminContentOwnership.create({
    data: { resourceType, resourceId, adminUserId: session.adminUserId },
  }).catch(() => undefined);
}

export async function requireContentOwner(resourceType: string, resourceId: string, session: AdminAccessSession) {
  if (isSuperAdminSession(session)) return null;
  const ownership = await prisma.adminContentOwnership.findUnique({
    where: { resourceType_resourceId: { resourceType, resourceId } },
    select: { adminUserId: true },
  });
  if (ownership?.adminUserId === session.adminUserId) return null;
  return NextResponse.json({ error: 'Vous ne pouvez modifier ou supprimer que vos propres contenus.' }, { status: 403 });
}