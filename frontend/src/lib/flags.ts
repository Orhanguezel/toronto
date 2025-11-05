export async function getFlag(key: string, ctx: any){
  const res = await fetch(`${process.env.API_BASE_URL}/admin/flags/eval?key=${key}&locale=${ctx.locale||''}`, { headers: { Authorization: `Bearer ${process.env.API_TOKEN}` }, next: { revalidate: 60, tags: ['flags', `flag_${key}`] } });
  return res.ok ? (await res.json()).enabled : false;
}