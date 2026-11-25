import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

export async function GET() {
  const { response: authResponse } = await requireAdmin();
  if (authResponse) return authResponse;

  try {
    const applications = await prisma.jobApplication.findMany({
      include: {
        jobOffer: {
          select: {
            title: true,
            location: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job applications' },
      { status: 500 }
    );
  }
}
