type Variant = { w:number; h:number; crop?: 'fill'|'thumb'|'crop'; g?: 'auto'|'face'|'center'|'north'|'south'|'east'|'west'|`${number},${number}` };
export function clUrl(publicIdOrUrl: string, v: Variant){
  const base = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD||'demo'}`;
  const tr = [`f_auto`, `q_auto`, `w_${v.w}`, `h_${v.h}`, `c_${v.crop||'fill'}`, `g_${v.g||'auto'}`].join(',');
  if (/^https?:\/\//.test(publicIdOrUrl)) return publicIdOrUrl.replace('/upload/', `/upload/${tr}/`);
  return `${base}/image/upload/${tr}/${publicIdOrUrl}`;
}