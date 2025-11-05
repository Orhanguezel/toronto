import Container from '@/shared/ui/common/Container';
import { H1, Lead } from '@/shared/ui/typography';
import NavOffset from '@/shared/ui/layout/NavOffset';
import LoginPanel from '@/features/auth/LoginPanel';

export const revalidate = 600;

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <main
      // Navbar yüksekliği + 24px boşluk, altta 64px nefes
      style={{ paddingTop: 'calc(var(--navbar-h, 96px) + 24px)', paddingBottom: '64px' }}
    >
      {/* header yüksekliğini ölçüp --navbar-h yaz */}
      <NavOffset />

      <Container>
        <header style={{ marginBottom: 16, textAlign: 'center' }}>
          <H1>Yönetim Girişi</H1>
          <Lead>Hesabınla giriş yap veya hızlıca kayıt ol.</Lead>
        </header>

        {/* Paneli ortala */}
        <section style={{ display: 'grid', justifyItems: 'center' }}>
          <LoginPanel locale={locale} />
        </section>
      </Container>
    </main>
  );
}
