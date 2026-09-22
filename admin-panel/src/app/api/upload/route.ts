import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { response: authResponse } = await requireAdmin();
    if (authResponse) return authResponse;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'Images_blogs';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    if (isCloudinaryConfigured()) {
      const result = await uploadToCloudinary(Buffer.from(await file.arrayBuffer()), { folder });
      return NextResponse.json({ success: true, url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type });
    }

    // Keep the existing upload service as a fallback until Cloudinary is configured.
    const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3001';
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('folder', folder);

    console.log('Forwarding upload to:', `${mainSiteUrl}/api/upload`);

    const upstreamResponse = await fetch(`${mainSiteUrl}/api/upload`, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!upstreamResponse.ok) {
      const errorData = await upstreamResponse.json().catch(() => ({}));
      console.error('Upload API error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Upload failed' },
        { status: upstreamResponse.status }
      );
    }

    const data = await upstreamResponse.json();
    console.log('Upload success:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}