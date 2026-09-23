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

export async function claimContentOwnership(resourceType: string, resourceId: string, session: AdminAccessSession | null) {
  if (!session || isSuperAdminSession(session) || hasPremiumAccess(session)) return;
  await prisma.adminContentOwnership.create({
    data: { resourceType, resourceId, adminUserId: session.adminUserId },
  }).catch(() => undefined);
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