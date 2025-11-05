export function reportWebVitals(metric: any) {
  try { navigator.sendBeacon('/api/rum', JSON.stringify(metric)); } catch {}
}