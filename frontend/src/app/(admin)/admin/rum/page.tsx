'use client';
import { useEffect, useState } from 'react';

export default function Rum(){
  const [data, set] = useState<any[]>([]);
  useEffect(()=>{ fetch('/api/_admin/rum/summary').then(r=>r.json()).then(set); },[]);
  return (
    <div>
      <h1>Web Vitals (24h)</h1>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead><tr><th>Metric</th><th>p50</th><th>p90</th><th>p99</th></tr></thead>
        <tbody>
          {data.map((r:any)=> <tr key={r.name}><td>{r.name}</td><td>{Number(r.p50).toFixed(0)}</td><td>{Number(r.p90).toFixed(0)}</td><td>{Number(r.p99).toFixed(0)}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}