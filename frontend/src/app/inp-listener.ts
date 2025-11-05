'use client';
import { onINP } from 'web-vitals/attribution';
export function initINP(){
  onINP((m)=>{
    navigator.sendBeacon('/api/rum', JSON.stringify({ name:'INP', value:m.value, url: location.pathname, device: 'auto' }));
  });
}