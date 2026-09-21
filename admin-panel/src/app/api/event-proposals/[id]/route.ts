import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const proposal = await prisma.eventProposal.findUnique({ where: { id } });
    if (!proposal) return jsonCors({ error: 'Not found' }, { status: 404 });
    return jsonCors(proposal);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to fetch proposal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const allowedStatus = ['pending', 'reviewed', 'accepted', 'rejected'];

    const data: { status?: string; adminNotes?: string | null } = {};
    if (typeof body.status === 'string' && allowedStatus.includes(body.status)) {
      data.status = body.status;
    }
    if (body.adminNotes !== undefined) {
      data.adminNotes = body.adminNotes || null;
    }

    const proposal = await prisma.eventProposal.update({
      where: { id },
      data,
    });

    return jsonCors(proposal);
  } catch (error) {
    return jsonCors(
      { error: 'Failed to update proposal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.eventProposal.delete({ where: { id } });
    return jsonCors({ success: true });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to delete proposal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
