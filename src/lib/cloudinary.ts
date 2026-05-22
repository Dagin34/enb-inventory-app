import { v2 as cloudinary } from 'cloudinary';

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error('Cloudinary credentials are not set in environment variables');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Match pattern: /upload/v{version}/{public_id}.{ext}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Upload image buffer to Cloudinary with retry
 */
export async function uploadImage(
  buffer: Buffer,
  folder: string = 'inventory-app'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'auto',
          timeout: 60000, // 60 seconds
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Image upload failed: ${error.message}`));
          } else {
            resolve({
              url: result!.secure_url,
              publicId: result!.public_id,
            });
          }
        }
      )
      .end(buffer);
  });
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error) => {
      if (error && error.http_code !== 404) {
        // 404 is fine - image doesn't exist
        reject(new Error(`Failed to delete image: ${error.message}`));
      } else {
        resolve();
      }
    });
  });
}

export default cloudinary;