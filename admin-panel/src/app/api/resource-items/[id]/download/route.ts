import path from 'node:path';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCloudinaryDownloadUrl } from '@/lib/cloudinary';

export const runtime = 'nodejs';

const allowedFormats = new Set(['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx']);

function getCloudinaryAsset(item: { url: string | null; filePath: string | null; fileType: string | null }) {
  const storedPublicId = item.filePath && !/^https?:\/\//i.test(item.filePath) ? item.filePath : null;
  if (storedPublicId) {
    return {
      publicId: storedPublicId,
      format: (item.fileType || path.extname(storedPublicId).slice(1)).toLowerCase(),
    };
  }

  const urlValue = item.url || item.filePath;
  if (!urlValue) return null;

  try {
    const url = new URL(urlValue);
    if (url.hostname !== 'res.cloudinary.com') return null;

    const segments = url.pathname.split('/');
    const uploadIndex = segments.findIndex((segment, index) => segment === 'raw' && segments[index + 1] === 'upload');
    if (uploadIndex < 0) return null;

    const assetSegments = segments.slice(uploadIndex + 2);
    if (/^v\d+$/.test(assetSegments[0] || '')) assetSegments.shift();
    const publicId = decodeURIComponent(assetSegments.join('/'));
    return {
      publicId,
      format: (item.fileType || path.extname(publicId).slice(1)).toLowerCase(),
    };
  } catch {
    return null;
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await prisma.resourceItem.findUnique({
      where: { id },
      include: { section: { select: { isActive: true } } },
    });

    if (!item || !item.section?.isActive) {
      return NextResponse.json({ error: 'Ressource introuvable.' }, { status: 404 });
    }

    const asset = getCloudinaryAsset(item);
    if (!asset || !asset.publicId.startsWith('ynuka/resources/')) {
      return NextResponse.json({ error: 'Fichier téléchargeable introuvable.' }, { status: 404 });
    }
    if (!allowedFormats.has(asset.format)) {
      return NextResponse.json({ error: 'Format de fichier non pris en charge.' }, { status: 415 });
    }

    const downloadUrl = createCloudinaryDownloadUrl(asset.publicId, asset.format);
    return NextResponse.redirect(downloadUrl, {
      status: 302,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Resource download failed:', error);
    return NextResponse.json({ error: 'Impossible de préparer le téléchargement.' }, { status: 500 });
  }
}