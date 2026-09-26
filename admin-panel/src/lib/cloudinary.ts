import { v2 as cloudinary } from 'cloudinary';

export function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_URL);
}

export function createCloudinaryDownloadUrl(publicId: string, format: string) {
  if (!isCloudinaryConfigured()) throw new Error('CLOUDINARY_URL is not configured');

  cloudinary.config({ secure: true });
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: 'raw',
    type: 'upload',
    expires_at: Math.floor(Date.now() / 1000) + 10 * 60,
    attachment: true,
  });
}

export async function deleteCloudinaryRawAsset(publicId: string) {
  if (!isCloudinaryConfigured()) throw new Error('CLOUDINARY_URL is not configured');

  cloudinary.config({ secure: true });
  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw',
    type: 'upload',
    invalidate: true,
  });
}

export async function uploadToCloudinary(buffer: Buffer, options: { folder: string; resourceType?: 'image' | 'raw' | 'auto'; publicId?: string; overwrite?: boolean; accessMode?: 'public' | 'authenticated' }) {
  if (!isCloudinaryConfigured()) throw new Error('CLOUDINARY_URL is not configured');

  cloudinary.config({ secure: true });
  return new Promise<{ secure_url: string; public_id: string; resource_type: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: options.folder, resource_type: options.resourceType || 'auto', public_id: options.publicId, overwrite: options.overwrite, access_mode: options.accessMode },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Cloudinary upload failed'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type });
      },
    );
    stream.end(buffer);
  });
}