import Container from '@/shared/ui/common/Container';
import { H1, Lead } from '@/shared/ui/typography';
import ContactForm from '@/features/auth/LoginPanel';
import NavOffset from '@/shared/ui/layout/NavOffset';

export const revalidate = 600;

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <main
      /* Navbar yüksekliği kadar + 24px boşluk oluştur */
      style={{ paddingTop: 'calc(var(--navbar-h, 96px) + 24px)', paddingBottom: '64px' }}
    >
      {/* header yüksekliğini ölçüp --navbar-h değişkenine yaz */}
      <NavOffset />

      <Container>
        <header style={{ marginBottom: 16, textAlign: 'center' }}>
          <H1>İletişim</H1>
          <Lead>Formu doldurun, en kısa sürede dönüş yapalım.</Lead>
        </header>

        {/* formu ortala */}
        <section style={{ display: 'grid', justifyItems: 'center' }}>
          <ContactForm locale={locale} />
        </section>
      </Container>
    </main>
  );
}
