import { cache } from 'react';
const fetchReco = cache(async (id:string)=> fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/api/reco/${id}`, { next:{ revalidate: 300 } }).then(r=>r.json()));
export default async function Recommended({ id }:{ id:string }){
  const { items } = await fetchReco(id);
  return <RecoGrid items={items} />;
}