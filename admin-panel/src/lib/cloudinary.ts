import { v2 as cloudinary } from 'cloudinary';

export function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_URL);
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