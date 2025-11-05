'use client';
export async function revalidateTags(tags: string[]) {
  try {
    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': process.env.NEXT_PUBLIC_REVALIDATE_SECRET || '' },
      body: JSON.stringify({ tags }),
    });
    return res.ok;
  } catch { return false; }
}