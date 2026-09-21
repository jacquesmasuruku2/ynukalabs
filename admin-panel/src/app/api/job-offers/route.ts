import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function mainSiteApiUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL;
  return baseUrl ? `${baseUrl.replace(/\/$/, '')}/api/job-offers` : null;
}

async function proxyToMainSite(request: NextRequest, method: 'GET' | 'POST') {
  const url = mainSiteApiUrl();
  if (!url) return null;

  const response = await fetch(url, {
    method,
    headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
    body: method === 'POST' ? await request.text() : undefined,
    cache: 'no-store',
  });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      const proxiedResponse = await proxyToMainSite(request, 'GET');
      if (proxiedResponse) return proxiedResponse;
      return NextResponse.json({ error: 'DATABASE_URL ou NEXT_PUBLIC_MAIN_SITE_URL est requis pour gérer les offres.' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {};
    if (status === 'active') {
      where.deadline = { gte: new Date() };
    } else if (status === 'expired') {
      where.deadline = { lt: new Date() };
    }
    if (type) {
      where.type = type;
    }

    const jobOffers = await prisma.jobOffer.findMany({
      where,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    return NextResponse.json(jobOffers);
  } catch (error) {
    console.error('Error fetching job offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job offers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      const proxiedResponse = await proxyToMainSite(request, 'POST');
      if (proxiedResponse) return proxiedResponse;
      return NextResponse.json({ error: 'DATABASE_URL ou NEXT_PUBLIC_MAIN_SITE_URL est requis pour publier une offre.' }, { status: 503 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      requirements,
      details,
      imageUrl,
      location,
      type,
      salary,
      companyId,
      publishedAt,
      deadline,
      featured,
    } = body;

    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Title, description, and type are required' },
        { status: 400 }
      );
    }

    const data: any = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      description,
      details: details || {},
      imageUrl,
      location,
      type,
      salary,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      deadline: deadline ? new Date(deadline) : null,
      featured: featured || false,
    };

    if (requirements !== undefined) data.requirements = requirements;
    if (companyId !== undefined) data.companyId = companyId;

    const jobOffer = await prisma.jobOffer.create({
      data,
    });

    return NextResponse.json(jobOffer, { status: 201 });
  } catch (error) {
    console.error('Error creating job offer:', error);
    return NextResponse.json(
      { error: 'Failed to create job offer', details: String(error) },
      { status: 500 }
    );
  }
}
