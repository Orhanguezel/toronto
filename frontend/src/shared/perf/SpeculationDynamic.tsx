// Server Component
import { cookies } from 'next/headers';
export default async function SpeculationDynamic(){
  const seg = cookies().get('seg')?.value || 'en-d';
  const data = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/perf/speculation?seg=${seg}`, { next:{ revalidate: 300 } }).then(r=>r.json());
  const prerender = data.rules.flatMap((r:any)=> r.targets.slice(0,2));
  const prefetch = data.rules.flatMap((r:any)=> r.targets.slice(2,6));
  const json = { prerender, prefetch };
  return <script type="speculationrules" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}