'use client';
import styled from 'styled-components';
import Link from 'next/link';

const Wrap = styled.div`display:grid; grid-template-columns: 240px 1fr; min-height: 100vh;`;
const Aside = styled.aside`
  border-right: 1px solid rgba(255,255,255,.06);
  padding: 16px; display: grid; gap: 8px; position: sticky; top: 0; height: 100vh;
`;
const Main = styled.main`padding: 24px;`;
const Title = styled.div`font-weight: 700; margin-bottom: 8px;`;
const Nav = styled.nav`display:grid; gap:6px; a{opacity:.9}`;

export default function AdminLayout({ children }: { children: React.ReactNode }){
  return (
    <Wrap>
      <Aside>
        <Title>Admin</Title>
        <Nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/site-settings">Site Settings</Link>
          <Link href="/admin/references">References</Link>
          <Link href="/admin/projects">Projects</Link>
          <Link href="/admin/services">Services</Link>
          <Link href="/admin/ad-solutions">Ad Solutions</Link>
          <Link href="/admin/contact-inbox">Contact Inbox</Link>
        </Nav>
      </Aside>
      <Main>{children}</Main>
    </Wrap>
  );
}