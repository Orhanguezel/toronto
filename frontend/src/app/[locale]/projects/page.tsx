// src/app/[locale]/projects/page.tsx
import Image from "next/image";
import Container from "@/shared/ui/common/Container";
import Link from "next/link";
import { getProjectsPaged, getProjectFilters } from "@/lib/api/public";
import { H1, Lead } from "@/shared/ui/typography";
import { Section } from "@/shared/ui/sections/Section";
import { Grid } from "@/shared/ui/grid/Grid";
import type { Metadata, Route } from "next";

export const revalidate = 120;
export const dynamic = "force-dynamic";

// ---- helpers
function parse(sp: Record<string, string | string[] | undefined>) {
  const take = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]);
  const n = (v?: string) => (v ? Number(v) : undefined);
  return {
    q: take("q")?.trim(),
    page: n(take("page")) || 1,
    pageSize: n(take("pageSize")) || 12,
    priceMin: n(take("priceMin")),
    priceMax: n(take("priceMax")),
    category: take("category") || "",
    tag: take("tag") || "",
  };
}

function buildQuery(current: Record<string, any>, patch: Record<string, any> = {}) {
  const next = { ...current, ...patch };
  const query: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(next)) {
    if (v == null || v === "" || Number.isNaN(v)) continue;
    query[k] = typeof v === "number" ? v : String(v);
  }
  return query;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp?.q?.trim();
  const title = q ? `Satılık Projeler – arama: ${q}` : "Satılık Projeler";
  return { title, description: "Toronto satılık projeler kataloğu" };
}

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const q = parse(sp);

  const [data, filters] = await Promise.all([
    getProjectsPaged(locale, q),
    getProjectFilters(locale),
  ]);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <main>
      <Section>
        <Container>
          <H1>Satılık Projeler</H1>
          <Lead>İhtiyacınıza uygun projeyi bulun. Arama ve fiyat filtrelerini kullanın.</Lead>

          {/* GET form – Client gerekmez */}
          <form
            method="get"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr repeat(3, 160px) 200px 200px auto",
              gap: 12,
              marginTop: 16,
            }}
          >
            <input name="q" defaultValue={q.q || ""} placeholder="Anahtar kelime" />
            <input name="priceMin" type="number" min={0} placeholder="Min ₺" defaultValue={q.priceMin ?? ""} />
            <input name="priceMax" type="number" min={0} placeholder="Max ₺" defaultValue={q.priceMax ?? ""} />
            <input name="pageSize" type="number" min={6} max={48} defaultValue={q.pageSize} />

            <select name="category" defaultValue={q.category}>
              <option value="">Kategori (tümü)</option>
              {filters.cats.map((c) => (
                <option key={c.slug} value={c.slug}>{c.title}</option>
              ))}
            </select>

            <select name="tag" defaultValue={q.tag}>
              <option value="">Etiket (tümü)</option>
              {filters.tags.map((t) => (
                <option key={t.slug} value={t.slug}>{t.title}</option>
              ))}
            </select>

            <button type="submit">Ara</button>
          </form>

          <div style={{ height: 16 }} />

          <Grid $min={260}>
            {data.items.map((p) => (
              <article key={p.slug}>
                <Link href={( `/${locale}/projects/${p.slug}` as unknown) as Route}>
                  {p.cover_url && (
                    <Image
                      src={p.cover_url}
                      alt={p.title}
                      width={640}
                      height={400}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ width: "100%", height: "auto" }}
                    />
                  )}
                  <h3>{p.title}</h3>
                  {p.price_from ? <p>Başlangıç: {p.price_from.toLocaleString()} ₺</p> : null}
                </Link>
              </article>
            ))}
          </Grid>

          <nav aria-label="Sayfalama" style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={{
                  pathname: ( `/${locale}/projects` as unknown) as Route,
                  query: buildQuery(q, { page: p }),
                }}
                aria-current={p === q.page ? "page" : undefined}
              >
                <span
                  style={{
                    padding: "6px 10px",
                    border: "1px solid rgba(255,255,255,.12)",
                    borderRadius: 8,
                    opacity: p === q.page ? 1 : 0.7,
                  }}
                >
                  {p}
                </span>
              </Link>
            ))}
          </nav>
        </Container>
      </Section>
    </main>
  );
}
