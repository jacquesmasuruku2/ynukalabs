import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { requireResourceItemOwner } from '@/lib/admin-content-access';
import { deleteCloudinaryRawAsset, isCloudinaryConfigured } from '@/lib/cloudinary';

function getResourcePublicId(filePath: string | null) {
  if (!filePath) return null;
  if (!/^https?:\/\//i.test(filePath)) return filePath.startsWith('ynuka/resources/') ? filePath : null;

  try {
    const url = new URL(filePath);
    if (url.hostname !== 'res.cloudinary.com') return null;
    const segments = url.pathname.split('/');
    const uploadIndex = segments.findIndex((segment, index) => segment === 'raw' && segments[index + 1] === 'upload');
    if (uploadIndex < 0) return null;
    const assetSegments = segments.slice(uploadIndex + 2);
    if (/^v\d+$/.test(assetSegments[0] || '')) assetSegments.shift();
    const publicId = decodeURIComponent(assetSegments.join('/'));
    return publicId.startsWith('ynuka/resources/') ? publicId : null;
  } catch {
    return null;
  }
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await prisma.resourceItem.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: 'Resource item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resource item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { session, response } = await requireAdmin();
    if (response) return response;
    const currentItem = await prisma.resourceItem.findUnique({ where: { id }, select: { id: true, sectionId: true } });
    if (!currentItem) return NextResponse.json({ error: 'Ressource introuvable.' }, { status: 404 });
    const accessResponse = await requireResourceItemOwner(id, currentItem.sectionId, session!);
    if (accessResponse) return accessResponse;

    const body = await request.json();
    const item = await prisma.resourceItem.update({
      where: { id },
      data: {
        sectionId: body.sectionId || null,
        title: body.title,
        titleFr: body.titleFr || null,
        description: body.description || null,
        descriptionFr: body.descriptionFr || null,
        category: body.category || null,
        url: body.url || null,
        filePath: body.filePath || null,
        fileType: body.fileType || null,
        iconKey: body.iconKey || 'bookOpen',
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update resource item' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { session, response } = await requireAdmin();
    if (response) return response;

    const item = await prisma.resourceItem.findUnique({ where: { id }, select: { id: true, sectionId: true, filePath: true } });
    if (!item) return NextResponse.json({ error: 'Ressource introuvable.' }, { status: 404 });

    const accessResponse = await requireResourceItemOwner(id, item.sectionId, session!);
    if (accessResponse) return accessResponse;

    const publicId = getResourcePublicId(item.filePath);
    if (publicId && isCloudinaryConfigured()) {
      const cloudinaryResult = await deleteCloudinaryRawAsset(publicId);
      if (!['ok', 'not found'].includes(cloudinaryResult.result)) {
        return NextResponse.json({ error: 'Cloudinary n’a pas confirmé la suppression du fichier.' }, { status: 502 });
      }
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.resourceItem.delete({ where: { id } });
      await transaction.adminContentOwnership.deleteMany({ where: { resourceType: 'resource-item', resourceId: id } });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete resource item' }, { status: 500 });
  }
}
