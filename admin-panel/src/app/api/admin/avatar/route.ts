import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    const file = (await request.formData()).get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Format invalide. Utilisez JPEG, PNG, WebP ou GIF.' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'L’image dépasse 5 Mo.' }, { status: 400 });

    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : file.type === 'image/gif' ? 'gif' : 'jpg';
    const fileName = `${session!.adminUserId}-${Date.now()}.${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));

    const avatarUrl = `/uploads/avatars/${fileName}`;
    const user = await prisma.adminUser.update({
      where: { id: session!.adminUserId },
      data: { avatarUrl },
      select: { id: true, name: true, email: true, avatarUrl: true, provider: true, role: true, lastLoginAt: true },
    });
    return NextResponse.json({ success: true, user, avatarUrl });
  } catch (error) {
    console.error('Admin avatar upload error:', error);
    return NextResponse.json({ error: 'Échec du téléversement de l’avatar.' }, { status: 500 });
  }
}

export async function DELETE() {
  const { session, response } = await requireAdmin();
  if (response) return response;
  const user = await prisma.adminUser.update({
    where: { id: session!.adminUserId },
    data: { avatarUrl: null },
    select: { id: true, name: true, email: true, avatarUrl: true, provider: true, role: true, lastLoginAt: true },
  });
  return NextResponse.json({ success: true, user });
}