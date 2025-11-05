// src/app/[locale]/references/ReferencesStrip.tsx  (SERVER)
import Image from 'next/image';
import Container from '@/shared/ui/common/Container';
import { getReferences } from '@/lib/api/public';
import LogoCarousel from './LogoCarousel'; // ✅ doğrudan client component

export default async function ReferencesStrip({ locale }: { locale: string }) {
  const logos = await getReferences(locale);
  return (
    <section aria-label="Referanslar">
      <Container>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {logos.map((x) => (
            <Image key={x.name} src={x.logo_url} alt={x.name} width={120} height={48} />
          ))}
        </div>
      </Container>

      {/* Client component normal import ile render edilir */}
      <LogoCarousel initial={logos} />
    </section>
  );
}
