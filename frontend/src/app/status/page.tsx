import Container from '@/shared/ui/common/Container';
export const dynamic = 'force-dynamic';
export default async function Status(){
  const api = await fetch(process.env.API_BASE_URL + '/health', { cache: 'no-store' }).then(r=>r.json()).catch(()=>null);
  const db  = api? 'ok' : 'down';
  return (
    <Container>
      <h1>Status</h1>
      <ul>
        <li>API: {api? 'UP':'DOWN'}</li>
        <li>DB: {db}</li>
      </ul>
    </Container>
  );
}