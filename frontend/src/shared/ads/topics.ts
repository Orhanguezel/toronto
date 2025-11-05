export async function getTopics(){
  // @ts-ignore
  if (!('browsingTopics' in document)) return [];
  // permission policy ve top‑level gerekli
  // @ts-ignore
  const topics = await (document as any).browsingTopics({}) as Array<{topic:number}>;
  return topics.map(t=> t.topic);
}