import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSuperAdminEmail, isSuperAdminRole } from '@/lib/adminRoles';

export type AdminAccessSession = {
  adminUserId: string;
  adminUser: {
    email: string;
    role: string;
    isPremium?: boolean | null;
    premiumExpiresAt?: Date | string | null;
  };
};

export function isSuperAdminSession(session: AdminAccessSession) {
  return isSuperAdminRole(session.adminUser.role) || isSuperAdminEmail(session.adminUser.email);
}

export function hasPremiumAccess(session: AdminAccessSession) {
  if (isSuperAdminSession(session)) return true;
  return !!session.adminUser.isPremium && !!session.adminUser.premiumExpiresAt && new Date(session.adminUser.premiumExpiresAt) > new Date();
}

export async function claimContentOwnership(
  resourceType: string,
  resourceId: string,
  session: AdminAccessSession | null,
  options: { recordForPrivilegedUsers?: boolean } = {},
) {
  if (!session || (!options.recordForPrivilegedUsers && (isSuperAdminSession(session) || hasPremiumAccess(session)))) return;
  const createOwnership = prisma.adminContentOwnership.create({
    data: { resourceType, resourceId, adminUserId: session.adminUserId },
  });
  if (options.recordForPrivilegedUsers) {
    await createOwnership;
  } else {
    await createOwnership.catch(() => undefined);
  }
}

export async function requireContentOwner(resourceType: string, resourceId: string, session: AdminAccessSession) {
  if (isSuperAdminSession(session) || hasPremiumAccess(session)) return null;
  const ownership = await prisma.adminContentOwnership.findUnique({
    where: { resourceType_resourceId: { resourceType, resourceId } },
    select: { adminUserId: true },
  });
  if (ownership?.adminUserId === session.adminUserId) return null;
  return NextResponse.json({ error: 'Vous ne pouvez modifier ou supprimer que vos propres contenus.' }, { status: 403 });
}

export async function requireResourceItemOwner(resourceId: string, sectionId: string | null, session: AdminAccessSession) {
  if (isSuperAdminSession(session)) return null;

  const itemOwnership = await prisma.adminContentOwnership.findUnique({
    where: { resourceType_resourceId: { resourceType: 'resource-item', resourceId } },
    select: { adminUserId: true },
  });
  if (itemOwnership) {
    return itemOwnership.adminUserId === session.adminUserId
      ? null
      : NextResponse.json({ error: 'Vous ne pouvez gérer que vos propres ressources.' }, { status: 403 });
  }

  if (!sectionId) {
    return NextResponse.json({ error: 'Vous ne pouvez gérer que vos propres ressources.' }, { status: 403 });
  }

  const sectionOwnership = await prisma.adminContentOwnership.findUnique({
    where: { resourceType_resourceId: { resourceType: 'resource-section', resourceId: sectionId } },
    select: { adminUserId: true },
  });
  return sectionOwnership?.adminUserId === session.adminUserId
    ? null
    : NextResponse.json({ error: 'Vous ne pouvez gérer que vos propres ressources.' }, { status: 403 });
}