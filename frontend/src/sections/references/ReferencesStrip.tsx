// SERVER COMPONENT — bu dosyada **'use client' yok**
import Image from "next/image";
import Container from "@/shared/ui/common/Container"; // Server içinden client child kullanmak OK
import { getReferences } from "@/lib/api/public";
import LogoCarousel from "./LogoCarousel"; // ✅ client child

export const revalidate = 900; // cache: 15 dk (isteğe göre)

type Item = { name: string; logo_url: string; url?: string | null };

export default async function ReferencesStrip({ locale }: { locale: string }) {
  let logos: Item[] = [];
  try {
    const raw = await getReferences(locale);
    logos = Array.isArray(raw) ? raw.filter(x => x?.logo_url) : [];
  } catch (err) {
    // SSR'i düşürme; boş geç
    console.error("getReferences failed:", err);
    logos = [];
  }

  // Data yoksa sessizce hiç render etme (ya da skeleton gösterebilirsin)
  if (!logos.length) return null;

  return (
    <section id="references" aria-label="Referanslar" style={{ paddingBlock: 24 }}>
      <Container>
        {/* SSR’de küçük bir grid: hızlı first paint */}
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 24,
            alignItems: "center",
          }}
        >
          {logos.slice(0, 12).map((x) => (
            <li key={x.name} style={{ display: "flex", justifyContent: "center" }}>
              <a
                href={x.url || "#"}
                aria-label={x.name}
                target={x.url ? "_blank" : undefined}
                rel={x.url ? "noopener noreferrer" : undefined}
              >
                <Image
                  src={x.logo_url}
                  alt={x.name}
                  width={140}
                  height={48}
                  style={{ objectFit: "contain", opacity: 0.95 }}
                />
              </a>
            </li>
          ))}
        </ul>
      </Container>

      {/* CSR tarafında akıcı carousel (aynı veriyi kullanır) */}
      <div style={{ marginTop: 16 }}>
        <LogoCarousel initial={logos} />
      </div>
    </section>
  );
}
