export async function signedUpload(file: File, folder = 'toronto'){
  const s = await fetch('/api/_admin/media/sign', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ folder }) }).then(r=>r.json());
  const body = new FormData();
  body.append('file', file);
  body.append('api_key', s.api_key);
  body.append('timestamp', s.timestamp);
  body.append('folder', s.folder);
  if (s.tags) body.append('tags', s.tags);
  body.append('signature', s.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${s.cloud_name}/auto/upload`, { method:'POST', body });
  if (!res.ok) throw new Error('Upload failed');
  return res.json(); // { public_id, secure_url, width, height, ... }
}