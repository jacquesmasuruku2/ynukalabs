import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

function createApiKey() {
  return `pk_live_${randomBytes(24).toString('hex')}`;
}

async function getOrCreateSettings() {
  return prisma.adminSettings.upsert({
    where: { id: 'global' },
    update: {},
    create: { id: 'global', publicApiKey: createApiKey() },
  });
}

export async function GET() {
  const { session, response } = await requireAdmin();
  if (response) return response;
  const settings = await getOrCreateSettings();
  return NextResponse.json({ settings, user: session!.adminUser });
}

export async function PATCH(request: Request) {
  const { session, response } = await requireAdmin();
  if (response) return response;
  const body = await request.json();
  const { siteName, contactEmail, emailNotifications, securityAlerts, weeklyReports } = body;
  if (!siteName?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail || '')) {
    return NextResponse.json({ error: 'Nom du site et email valides requis' }, { status: 400 });
  }
  const settings = await prisma.adminSettings.upsert({
    where: { id: 'global' },
    update: { siteName: siteName.trim(), contactEmail: contactEmail.trim(), emailNotifications: Boolean(emailNotifications), securityAlerts: Boolean(securityAlerts), weeklyReports: Boolean(weeklyReports), updatedById: session!.adminUserId },
    create: { id: 'global', siteName: siteName.trim(), contactEmail: contactEmail.trim(), emailNotifications: Boolean(emailNotifications), securityAlerts: Boolean(securityAlerts), weeklyReports: Boolean(weeklyReports), publicApiKey: createApiKey(), updatedById: session!.adminUserId },
  });
  return NextResponse.json({ settings });
}

export async function POST() {
  const { session, response } = await requireAdmin();
  if (response) return response;
  const settings = await prisma.adminSettings.upsert({ where: { id: 'global' }, update: { publicApiKey: createApiKey(), updatedById: session!.adminUserId }, create: { id: 'global', publicApiKey: createApiKey(), updatedById: session!.adminUserId } });
  return NextResponse.json({ publicApiKey: settings.publicApiKey });
}