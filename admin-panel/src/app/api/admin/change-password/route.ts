import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

export async function POST(request: Request) {
  const { session, response } = await requireAdmin();
  if (response) return response;
  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword || newPassword.length < 8) return NextResponse.json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' }, { status: 400 });
  if (!session!.adminUser.passwordHash || !(await bcrypt.compare(currentPassword, session!.adminUser.passwordHash))) return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
  await prisma.$transaction([prisma.adminUser.update({ where: { id: session!.adminUserId }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } }), prisma.adminSession.deleteMany({ where: { adminUserId: session!.adminUserId, id: { not: session!.id } } })]);
  return NextResponse.json({ success: true });
}