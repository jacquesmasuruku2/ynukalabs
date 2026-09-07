import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const partnerships = await prisma.partnership.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(partnerships);
  } catch (error) {
    console.error('Error fetching partnership requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partnership requests', partnerships: [] },
      { status: 500 }
    );
  }
}
