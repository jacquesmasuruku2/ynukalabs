import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, imageUrl, websiteUrl } = body;

    if (websiteUrl) {
      try {
        const parsedWebsiteUrl = new URL(websiteUrl);
        if (!['http:', 'https:'].includes(parsedWebsiteUrl.protocol)) throw new Error('Invalid protocol');
      } catch {
        return jsonCors(
          { error: 'Website URL must be a valid HTTP or HTTPS URL' },
          { status: 400 }
        );
      }
    }

    if (!status && imageUrl === undefined && websiteUrl === undefined) {
      return jsonCors({ error: 'Status is required' }, { status: 400 });
    }

    const partnership = await prisma.partnership.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
        ...(websiteUrl !== undefined ? { websiteUrl: websiteUrl || null } : {}),
      },
    });

    return jsonCors(partnership);
  } catch (error) {
    console.error('Error updating partnership:', error);
    return jsonCors({ error: 'Failed to update partnership' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.partnership.delete({ where: { id } });
    return jsonCors({ message: 'Partnership deleted successfully' });
  } catch (error) {
    console.error('Error deleting partnership:', error);
    return jsonCors({ error: 'Failed to delete partnership' }, { status: 500 });
  }
}
