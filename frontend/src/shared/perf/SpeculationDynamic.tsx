// Server Component
import { cookies } from 'next/headers';

type Rule = { targets: string[] };
type Payload = { rules?: Rule[] };

export default async function SpeculationDynamic() {
  const ck = await cookies(); // ← await şart
  const seg = ck.get('seg')?.value ?? 'en-d';

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ORIGIN ?? ''}/perf/speculation?seg=${encodeURIComponent(seg)}`,
    { next: { revalidate: 300 } }
  );

  const data = (res.ok ? await res.json() : {}) as Payload;
  const rules = data.rules ?? [];

  const prerender = rules.flatMap((r) => r.targets?.slice(0, 2) ?? []);
  const prefetch  = rules.flatMap((r) => r.targets?.slice(2, 6) ?? []);
  const json = { prerender, prefetch };

  // XSS güvenliği: </script> vb. kırmaz
  const payload = JSON.stringify(json).replace(/</g, '\\u003c');

  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}
