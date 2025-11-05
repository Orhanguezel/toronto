// src/app/[locale]/contact/page.tsx
import Container from '@/shared/ui/common/Container';
import { H1, Lead } from '@/shared/ui/typography';
import ContactForm from '@/features/contact/ContactForm';

export const revalidate = 600;

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <main>
      <Container>
        <H1>İletişim</H1>
        <Lead>Formu doldurun, en kısa sürede dönüş yapalım.</Lead>
        <div style={{ height: 16 }} />
        <ContactForm locale={locale} />
      </Container>
    </main>
  );
}
