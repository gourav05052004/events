import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(`Missing Cloudinary environment variables. Found: cloudName=${!!cloudName}, apiKey=${!!apiKey}, apiSecret=${!!apiSecret}`);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

/**
 * Upload a file to Cloudinary
 * @param buffer - File buffer
 * @param publicId - Public ID for the file
 * @returns URL of the uploaded file
 */
export async function uploadToCloudinary(buffer: Buffer, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('[uploadToCloudinary] Starting upload with publicId:', publicId);
    
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: 'events-app',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('[uploadToCloudinary] Upload failed:', error);
          reject(new Error(`Cloudinary upload error: ${error.message}`));
        } else if (result) {
          console.log('[uploadToCloudinary] Upload successful! URL:', result.secure_url);
          resolve(result.secure_url);
        } else {
          console.error('[uploadToCloudinary] No result returned');
          reject(new Error('Cloudinary upload returned no result'));
        }
      }
    );

    stream.on('error', (err) => {
      console.error('[uploadToCloudinary] Stream error:', err);
      reject(err);
    });

    stream.end(buffer);
  });
}

export default cloudinary;
