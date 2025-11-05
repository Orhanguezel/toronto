export default async function SpeculationMC(){
  const seg = 'tr-m'; // cookie'den/headers'tan
  const data = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/perf/speculation/dynamic?seg=${seg}`, { next:{ revalidate: 300 } }).then(r=>r.json());
  return <script type="speculationrules" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}