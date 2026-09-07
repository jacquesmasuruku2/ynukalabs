import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function mainSiteApiUrl(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL;
  return baseUrl ? `${baseUrl.replace(/\/$/, '')}/api/job-offers/${id}` : null;
}

async function proxyToMainSite(request: NextRequest, id: string, method: 'GET' | 'PUT' | 'DELETE') {
  const url = mainSiteApiUrl(id);
  if (!url) return null;
  const response = await fetch(url, {
    method,
    headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined,
    body: method === 'PUT' ? await request.text() : undefined,
    cache: 'no-store',
  });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!process.env.DATABASE_URL) {
      const proxiedResponse = await proxyToMainSite(request, id, 'GET');
      if (proxiedResponse) return proxiedResponse;
      return NextResponse.json({ error: 'DATABASE_URL ou NEXT_PUBLIC_MAIN_SITE_URL est requis.' }, { status: 503 });
    }
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!jobOffer) {
      return NextResponse.json(
        { error: 'Job offer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(jobOffer);
  } catch (error) {
    console.error('Error fetching job offer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job offer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!process.env.DATABASE_URL) {
      const proxiedResponse = await proxyToMainSite(request, id, 'PUT');
      if (proxiedResponse) return proxiedResponse;
      return NextResponse.json({ error: 'DATABASE_URL ou NEXT_PUBLIC_MAIN_SITE_URL est requis.' }, { status: 503 });
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

    const data: any = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      description,
      location,
      type,
      salary,
      deadline: deadline ? new Date(deadline) : null,
    };

    if (requirements !== undefined) data.requirements = requirements;
    if (details !== undefined) data.details = details;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (companyId !== undefined) data.companyId = companyId;
    if (publishedAt) data.publishedAt = new Date(publishedAt);
    if (featured !== undefined) data.featured = featured;

    const jobOffer = await prisma.jobOffer.update({
      where: { id },
      data,
    });

    return NextResponse.json(jobOffer);
  } catch (error) {
    console.error('Error updating job offer:', error);
    return NextResponse.json(
      { error: 'Failed to update job offer', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!process.env.DATABASE_URL) {
      const proxiedResponse = await proxyToMainSite(request, id, 'DELETE');
      if (proxiedResponse) return proxiedResponse;
      return NextResponse.json({ error: 'DATABASE_URL ou NEXT_PUBLIC_MAIN_SITE_URL est requis.' }, { status: 503 });
    }
    await prisma.jobOffer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job offer:', error);
    return NextResponse.json(
      { error: 'Failed to delete job offer' },
      { status: 500 }
    );
  }
}
