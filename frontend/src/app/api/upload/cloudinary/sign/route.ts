import crypto from 'node:crypto';

export async function POST(req: Request) {
  const { folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'toronto' } = await req.json().catch(()=>({}));
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');
  return Response.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  });
}