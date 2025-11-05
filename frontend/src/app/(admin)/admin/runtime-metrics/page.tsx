'use client';
import { useContactList, useContactHandle } from '@/integrations/endpoints/admin/contact.endpoints';
import styled from 'styled-components';
import { Button } from '@/shared/ui/buttons/Button';

const Table = styled.table` width:100%; border-collapse: collapse; th,td{ padding:10px; border-bottom:1px solid rgba(255,255,255,.08); }`;

export default function ContactInbox() {
  const { data } = useContactList({ page: 1, pageSize: 50 });
  const [handle] = useContactHandle();
  return (
    <div>
      <h1>Contact Inbox</h1>
      <Table>
        <thead><tr><th>Ad</th><th>E‑posta</th><th>Mesaj</th><th>Locale</th><th>Tarih</th><th>Durum</th><th></th></tr></thead>
        <tbody>
          {(data?.items || []).map((m: any) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td><a href={`mailto:${m.email}`}>{m.email}</a></td>
              <td style={{ maxWidth: 480, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.message}</td>
              <td>{m.locale}</td>
              <td>{new Date(m.created_at).toLocaleString()}</td>
              <td>{m.handled_at ? '✓' : '-'}</td>
              <td>{!m.handled_at && <Button variant="ghost" onClick={async () => { await handle({ id: m.id }).unwrap(); location.reload(); }}>İşaretle</Button>}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}