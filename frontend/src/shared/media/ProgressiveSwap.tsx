'use client';
import { useEffect, useRef } from 'react';
export default function ProgressiveSwap({ low, mid, hi, alt, w, h }:{ low:string; mid:string; hi:string; alt:string; w:number; h:number }){
  const ref = useRef<HTMLImageElement>(null);
  useEffect(()=>{
    const img = ref.current!; const io = new IntersectionObserver(([e])=>{
      if (!e.isIntersecting) return;
      const midImg = new Image(); midImg.src = mid; midImg.onload = ()=>{ img.src = mid; requestIdleCallback?.(()=>{ const hiImg = new Image(); hiImg.src = hi; hiImg.onload = ()=> (img.src = hi); }); };
      io.disconnect();
    },{ rootMargin:'200px' }); io.observe(img); return ()=> io.disconnect();
  },[low,mid,hi]);
  return <img ref={ref} src={low} alt={alt} width={w} height={h} />;
}