export default function PresetPreviewMatrix({ id, variants }:{ id:string; variants:Array<{ label:string; w:number; h:number }> }){
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:12 }}>
      {variants.map(v=> (
        <figure key={v.label}>
          <img alt={v.label} src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto,c_fill,w_${v.w},h_${v.h}/${id}`} style={{ width:'100%', height:'auto', aspectRatio: `${v.w}/${v.h}` }} />
          <figcaption style={{ opacity:.7 }}>{v.label} – {v.w}×{v.h}</figcaption>
        </figure>
      ))}
    </div>
  );
}