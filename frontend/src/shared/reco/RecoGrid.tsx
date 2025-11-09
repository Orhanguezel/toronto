// ./RecoGrid.tsx
import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';

/** API dönüşümü için esnek ama minimum sözleşme */
export type RecoItem = {
  id: string | number;
  title: string;
  href: string;           // dahili yol (örn: "/tr/products/slug") ya da tam URL
  image?: string | null;  // opsiyonel görsel
  meta?: string | null;   // küçük alt bilgi (kategori vs.)
  priceText?: string | null; // "₺1.299", "Free", vb.
};

export default function RecoGrid({ items }: { items: RecoItem[] }) {
  if (!items?.length) return null;
  return (
    <Grid role="list">
      {items.map((it) => (
        <Card key={String(it.id)} role="listitem">
          {it.href.startsWith('http') ? (
            <A href={it.href} target="_blank" rel="noopener noreferrer">
              <CardInner item={it} />
            </A>
          ) : (
            <Link href={it.href as Route}>
              <AInner>
                <CardInner item={it} />
              </AInner>
            </Link>
          )}
        </Card>
      ))}
    </Grid>
  );
}

/* ============ Presentational ============ */

function CardInner({ item }: { item: RecoItem }) {
  return (
    <>
      <Media aria-hidden>
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={false}
          />
        ) : (
          <NoImg>{initials(item.title)}</NoImg>
        )}
      </Media>
      <Body>
        {item.meta ? <Meta>{item.meta}</Meta> : null}
        <Title title={item.title}>{item.title}</Title>
        {item.priceText ? <Price>{item.priceText}</Price> : null}
      </Body>
    </>
  );
}

/* ============ Styles ============ */

const Grid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
`;

const Card = styled.article`
  background: ${({ theme }) => theme.cards.background};
  border: 1px solid ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  overflow: hidden;
  transition: transform ${({ theme }) => theme.transition.fast},
              box-shadow ${({ theme }) => theme.transition.fast},
              border-color ${({ theme }) => theme.transition.fast};

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.borderBrighter};
  }
`;

const A = styled.a`
  display: grid;
  grid-template-rows: 140px auto;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  &:hover { text-decoration: none; }
`;

const AInner = styled.span`
  /* Link child'ı olarak block davranışı */
  display: grid;
  grid-template-rows: 140px auto;
`;

const Media = styled.div`
  position: relative;
  height: 140px;
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  img {
    object-fit: cover;
  }
`;

const NoImg = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-weight: 700;
  letter-spacing: .5px;
  color: ${({ theme }) => theme.colors.textLight};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.inputBackgroundSofter},
    ${({ theme }) => theme.colors.inputBackground}
  );
`;

const Body = styled.div`
  padding: 12px;
`;

const Meta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 4px;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.small};
  line-height: 1.35;
  margin: 0 0 6px 0;
  color: ${({ theme }) => theme.colors.title};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Price = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

/* ============ Helpers ============ */

function initials(t: string) {
  const parts = t.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join('');
}
