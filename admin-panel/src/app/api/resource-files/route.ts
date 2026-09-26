import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

const allowedExtensions = new Set(['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx']);
const maxFileSize = 50 * 1024 * 1024;

function hasExpectedSignature(extension: string, bytes: Buffer) {
  if (extension === '.pdf') return bytes.subarray(0, 5).toString() === '%PDF-';

  const isZip = bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  const isOle = bytes.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  return ['.pptx', '.docx', '.xlsx'].includes(extension) ? isZip : isOle;
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: 'Le stockage Cloudinary n’est pas configuré.' }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
    }

    const extension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      return NextResponse.json({ error: 'Formats acceptés : PDF, PPT, PPTX, DOC, DOCX, XLS et XLSX.' }, { status: 400 });
    }
    if (file.size === 0 || file.size > maxFileSize) {
      return NextResponse.json({ error: 'Le fichier doit peser entre 1 octet et 50 Mo.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasExpectedSignature(extension, buffer)) {
      return NextResponse.json({ error: 'Le contenu du fichier ne correspond pas à son extension.' }, { status: 400 });
    }

    const baseName = path.basename(file.name, extension)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-|-$/g, '') || 'resource';
    const uploaded = await uploadToCloudinary(buffer, {
      folder: 'ynuka/resources',
      publicId: `${baseName}-${randomUUID()}${extension}`,
      resourceType: 'raw',
      accessMode: 'public',
    });

    return NextResponse.json({
      url: uploaded.secure_url,
      fileName: file.name,
      fileType: extension.slice(1).toUpperCase(),
    });
  } catch (error) {
    console.error('Resource file upload failed:', error);
    return NextResponse.json({ error: 'Impossible de téléverser ce fichier.' }, { status: 500 });
  }
}