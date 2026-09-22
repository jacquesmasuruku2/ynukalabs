import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  const token = (await cookies()).get('admin_session_token')?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { token } });
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_session_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });

  return response;
}
