import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

export async function PATCH(request: Request) {
  const { session, response } = await requireAdmin();
  if (response) return response;
  const { name, email } = await request.json();
  if (!name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return NextResponse.json({ error: 'Nom et email valides requis' }, { status: 400 });
  const existing = await prisma.adminUser.findFirst({ where: { email: email.trim(), id: { not: session!.adminUserId } } });
  if (existing) return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
  const user = await prisma.adminUser.update({ where: { id: session!.adminUserId }, data: { name: name.trim(), email: email.trim() }, select: { id: true, name: true, email: true } });
  return NextResponse.json({ user });
}