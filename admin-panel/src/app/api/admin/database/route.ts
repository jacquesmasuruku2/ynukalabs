import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ connected: true });
  } catch {
    return NextResponse.json({ connected: false }, { status: 503 });
  }
}