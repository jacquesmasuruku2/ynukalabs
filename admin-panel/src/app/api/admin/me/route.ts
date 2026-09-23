import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSuperAdminEmail, isSuperAdminRole, resolveAdminRole } from '@/lib/adminRoles';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = await prisma.adminSession.findUnique({
      where: { token },
      include: { adminUser: true },
    });

    if (!session || new Date(session.expiresAt) < new Date() || !session.adminUser.isActive) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    await prisma.adminSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } });

    const role = resolveAdminRole(session.adminUser.email, session.adminUser.role);
    const user = session.adminUser.role === role ? session.adminUser : await prisma.adminUser.update({ where: { id: session.adminUser.id }, data: { role } });

    const isPremiumNow = isSuperAdminRole(user.role) || isSuperAdminEmail(user.email) || (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date());

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
        role: user.role,
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        isSuperAdmin: isSuperAdminRole(user.role) || isSuperAdminEmail(user.email),
        isPremium: isPremiumNow,
        premiumPlan: user.premiumPlan || null,
        premiumExpiresAt: user.premiumExpiresAt?.toISOString() || null,
      },
      session: {
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Admin me error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
