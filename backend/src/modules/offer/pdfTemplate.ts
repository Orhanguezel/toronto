// =============================================================
// FILE: src/modules/offer/pdfTemplate.ts
// Ensotek – Offer PDF HTML Template
//   - Teklif PDF'inde kullanılacak HTML + inline CSS
//   - Kaynak: OfferRow (offers tablosu)
//   - Dil: site_settings.app_locales + offer.locale
//   - Firma bilgisi + logo: site_settings.company_brand
// =============================================================

import type { OfferRow } from "./schema";
import { getAppLocales } from "@/modules/siteSettings/service";
import { db } from "@/db/client";
import { siteSettings } from "@/modules/siteSettings/schema";
import { and, inArray, eq } from "drizzle-orm";

type PdfTemplateContext = OfferRow & {
  site_name?: string | null;

  /** Opsiyonel: service layer join ile gelen ürün adı */
  product_name?: string | null;

  /** Opsiyonel: service layer join ile gelen hizmet adı */
  service_name?: string | null;
};

function safe(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function safeText(value: unknown): string {
  // HTML injection riskine karşı basic escape
  const s = safe(value);
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Bizim gerçek label setimiz TR / EN / DE için var.
// Tarih / para formatları da bunlara göre.
type LabelLocale = "tr" | "en" | "de";

function formatDate(d: Date | string | null | undefined, locale: LabelLocale) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const intlLocale =
    locale === "tr" ? "tr-TR" : locale === "de" ? "de-DE" : "en-US";

  try {
    return date.toLocaleDateString(intlLocale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return date.toISOString().substring(0, 10);
  }
}

function formatMoney(
  value: string | number | null | undefined,
  currency: string | null | undefined,
  locale: LabelLocale,
) {
  if (value == null) return "";

  const raw = typeof value === "string" ? value.trim() : value;
  if (raw === "") return "";

  const num = typeof raw === "number" ? raw : Number(raw);
  if (Number.isNaN(num)) return typeof value === "string" ? value : "";

  const c = currency || "EUR";
  const intlLocale =
    locale === "tr" ? "tr-TR" : locale === "de" ? "de-DE" : "en-US";

  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: c,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${num.toFixed(2)} ${c}`;
  }
}



function normalizeNumberish(input: string): string {
  // "1.234,56" -> "1234.56"
  // "123,45"   -> "123.45"
  // "19%"      -> "19"
  let s = input.trim();

  // remove percent
  s = s.replace(/%/g, "").trim();

  // remove spaces
  s = s.replace(/\s+/g, "");

  // if both comma and dot exist, assume dot thousands + comma decimal
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/\./g, "").replace(",", ".");
    return s;
  }

  // if only comma, treat as decimal separator
  if (s.includes(",") && !s.includes(".")) {
    s = s.replace(",", ".");
    return s;
  }

  return s;
}

function parseDecimal(v: unknown): number | null {
  if (v == null) return null;

  // number
  if (typeof v === "number") return Number.isFinite(v) ? v : null;

  // string
  if (typeof v === "string") {
    const s = normalizeNumberish(v);
    if (!s) return null;
    const n = Number(s);
    return Number.isNaN(n) || !Number.isFinite(n) ? null : n;
  }

  // Decimal / Big / custom driver object -> toString()
  if (typeof v === "object") {
    const s = (v as any)?.toString?.();
    if (typeof s === "string" && s.trim()) return parseDecimal(s);
  }

  return null;
}


function parseJsonRecord(v: unknown): Record<string, unknown> | null {
  if (!v) return null;
  if (typeof v === "object") return v as Record<string, unknown>;
  if (typeof v !== "string") return null;
  try {
    const parsed = JSON.parse(v);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : { raw: parsed };
  } catch {
    return null;
  }
}

function pickFirstString(...vals: unknown[]): string | null {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

// -------------------------------------------------------------
// app_locales → dinamik locale çözümü
// -------------------------------------------------------------

let cachedAppLocales: string[] | null = null;

async function ensureAppLocales(): Promise<string[]> {
  if (cachedAppLocales && cachedAppLocales.length) return cachedAppLocales;

  try {
    const list = await getAppLocales();
    if (list && list.length) {
      cachedAppLocales = list;
      return list;
    }
  } catch (err) {
    console.error("offer_pdf:getAppLocales_failed", err);
  }

  // fallback
  cachedAppLocales = ["tr", "en"];
  return cachedAppLocales;
}

/**
 * Runtime locale:
 *   - Önce offer.locale (örn: "tr", "en", "de", "tr-TR" vs.)
 *   - app_locales içinde aynı / prefix match olanı bul
 *   - Bulunamazsa app_locales[0] (örn: "tr")
 */
async function resolveRuntimeLocale(rawLocale?: string | null): Promise<string> {
  const appLocales = await ensureAppLocales();
  const defaultLocale = appLocales[0] || "en";

  if (!rawLocale) return defaultLocale;

  const lc = rawLocale.toLowerCase();

  // exact match
  const exact = appLocales.find((l) => l.toLowerCase() === lc);
  if (exact) return exact;

  // prefix match ("tr-TR" -> "tr")
  const prefix = appLocales.find((l) => lc.startsWith(l.toLowerCase()));
  if (prefix) return prefix;

  return defaultLocale;
}

/**
 * Label set için desteklediğimiz diller: "tr" | "en" | "de"
 * Runtime locale ne olursa olsun (örneğin "es"), label tarafında
 * en yakınını seçiyoruz.
 */
function toLabelLocale(runtimeLocale: string): LabelLocale {
  const lc = runtimeLocale.toLowerCase();
  if (lc.startsWith("tr")) return "tr";
  if (lc.startsWith("de")) return "de";
  return "en";
}

// -------------------------------------------------------------
// Firma bilgisi (company_brand) – site_settings’den
// -------------------------------------------------------------

type CompanyBrandSettings = {
  name: string;
  shortName: string | null;
  website: string | null;
  logoUrl: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
};

const companyBrandCache = new Map<string, CompanyBrandSettings>();

async function getCompanyBrandSettings(
  runtimeLocale: string,
): Promise<CompanyBrandSettings> {
  const cached = companyBrandCache.get(runtimeLocale);
  if (cached) return cached;

  const langPart = runtimeLocale.split("-")[0].toLowerCase();

  const candidateLocales = Array.from(
    new Set<string>([runtimeLocale, langPart, "en", "tr"]),
  );

  let brand: CompanyBrandSettings = {
    name: "Ensotek",
    shortName: null,
    website: null,
    logoUrl: null,
    logoWidth: null,
    logoHeight: null,
  };

  try {
    const rows = await db
      .select({
        locale: siteSettings.locale,
        value: siteSettings.value,
      })
      .from(siteSettings)
      .where(
        and(
          eq(siteSettings.key, "company_brand"),
          inArray(siteSettings.locale, candidateLocales),
        ),
      );

    let picked: { locale: string; value: string } | undefined;

    for (const loc of candidateLocales) {
      const row = rows.find((r) => r.locale === loc);
      if (row) {
        picked = row as { locale: string; value: string };
        break;
      }
    }

    if (picked) {
      try {
        const parsed = JSON.parse(picked.value);
        brand = {
          name: parsed.name || brand.name,
          shortName: typeof parsed.shortName === "string" ? parsed.shortName : null,
          website: typeof parsed.website === "string" ? parsed.website : null,
          logoUrl:
            parsed.logo && typeof parsed.logo.url === "string" ? parsed.logo.url : null,
          logoWidth:
            parsed.logo && typeof parsed.logo.width === "number" ? parsed.logo.width : null,
          logoHeight:
            parsed.logo && typeof parsed.logo.height === "number" ? parsed.logo.height : null,
        };
      } catch (err) {
        console.error("offer_pdf:parse_company_brand_failed", err);
      }
    }
  } catch (err) {
    console.error("offer_pdf:load_company_brand_failed", err);
  }

  companyBrandCache.set(runtimeLocale, brand);
  return brand;
}

// -------------------------------------------------------------
// i18n – TR / EN / DE label fallback set
// -------------------------------------------------------------

const LABELS: Record<
  LabelLocale,
  {
    title: string;
    quoteNo: string;
    date: string;
    validity: string;
    status: string;

    customerInfo: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    formLanguage: string;
    product: string;
    service: string;

    summary: string;
    subject: string;
    noMessage: string;

    pricing: string;
    net: string;
    vat: string; // label base
    shipping: string;
    total: string;
    pricingEmpty: string;

    notes: string;
    notesLegal: (validUntilStr: string) => string;
    internalNotes: string;

    footerLeft: (siteName: string) => string;
    footerRight: string;
  }
> = {
  tr: {
    title: "Teklif",
    quoteNo: "Teklif No",
    date: "Tarih",
    validity: "Geçerlilik",
    status: "Durum",

    customerInfo: "Müşteri Bilgileri",
    name: "Ad Soyad",
    company: "Firma",
    email: "E-posta",
    phone: "Telefon",
    country: "Ülke",
    formLanguage: "Form dili",
    product: "Ürün",
    service: "Hizmet",

    summary: "Teklif Özeti",
    subject: "Konu",
    noMessage: "Müşteri mesajı bulunmamaktadır.",

    pricing: "Fiyatlandırma",
    net: "Net Tutar",
    vat: "KDV",
    shipping: "Nakliye",
    total: "Genel Toplam",
    pricingEmpty:
      "Fiyatlandırma henüz eklenmemiştir; bu belge ön teklif niteliğindedir.",

    notes: "Notlar",
    notesLegal: (validUntilStr) =>
      `Bu belge bilgilendirme amaçlıdır. Nihai fiyat ve ticari koşullar, ${validUntilStr ? `${validUntilStr} tarihine kadar geçerli olup ` : ""
      }Ensotek tarafından yazılı olarak onaylandığında geçerli olacaktır.`,
    internalNotes: "İdari not (dahili kullanım)",

    footerLeft: (siteName) => `${siteName} – Otomatik Teklif Sistemi`,
    footerRight: "Bu PDF sistem tarafından oluşturulmuştur, imza gerektirmez.",
  },

  en: {
    title: "Offer",
    quoteNo: "Offer No",
    date: "Date",
    validity: "Valid Until",
    status: "Status",

    customerInfo: "Customer Information",
    name: "Name",
    company: "Company",
    email: "Email",
    phone: "Phone",
    country: "Country",
    formLanguage: "Form language",
    product: "Product",
    service: "Service",

    summary: "Offer Summary",
    subject: "Subject",
    noMessage: "No customer message has been provided.",

    pricing: "Pricing",
    net: "Net Amount",
    vat: "VAT",
    shipping: "Shipping",
    total: "Grand Total",
    pricingEmpty:
      "Pricing has not been added yet; this document should be considered a preliminary offer.",

    notes: "Notes",
    notesLegal: (validUntilStr) =>
      `This document is for information purposes only. Final prices and commercial terms become valid only after written confirmation by Ensotek${validUntilStr ? ` and are valid until ${validUntilStr}.` : "."
      }`,
    internalNotes: "Internal note",

    footerLeft: (siteName) => `${siteName} – Automated Offer System`,
    footerRight:
      "This PDF is generated by the system and does not require a signature.",
  },

  de: {
    title: "Angebot",
    quoteNo: "Angebots-Nr.",
    date: "Datum",
    validity: "Gültig bis",
    status: "Status",

    customerInfo: "Kundendaten",
    name: "Name",
    company: "Firma",
    email: "E-Mail",
    phone: "Telefon",
    country: "Land",
    formLanguage: "Formularsprache",
    product: "Produkt",
    service: "Leistung",

    summary: "Angebotsübersicht",
    subject: "Betreff",
    noMessage: "Es wurde keine Kundenmitteilung angegeben.",

    pricing: "Preisübersicht",
    net: "Nettobetrag",
    vat: "MwSt.",
    shipping: "Versand",
    total: "Gesamtbetrag",
    pricingEmpty:
      "Preise wurden noch nicht hinterlegt; dieses Dokument ist ein unverbindlicher Vorab-Entwurf.",

    notes: "Hinweise",
    notesLegal: (validUntilStr) =>
      `Dieses Dokument dient ausschließlich Informationszwecken. Endgültige Preise und Konditionen gelten erst nach schriftlicher Bestätigung durch Ensotek${validUntilStr ? ` und sind bis zum ${validUntilStr} gültig.` : "."
      }`,
    internalNotes: "Interne Notiz",

    footerLeft: (siteName) => `${siteName} – Automatisiertes Angebotssystem`,
    footerRight:
      "Dieses PDF wurde automatisch erstellt und benötigt keine Unterschrift.",
  },
};

// -------------------------------------------------------------
// MAIN RENDER (async, app_locales + label + firma bilgisi)
// -------------------------------------------------------------

export async function renderOfferPdfHtml(ctx: PdfTemplateContext): Promise<string> {
  // 1) Runtime locale: app_locales + offer.locale
  const runtimeLocale = await resolveRuntimeLocale(ctx.locale || undefined);

  // 2) Label dili: TR / EN / DE fallback
  const labelLocale = toLabelLocale(runtimeLocale);
  const t = LABELS[labelLocale];

  // 3) Firma bilgisi (company_brand) + siteName
  const companyBrand = await getCompanyBrandSettings(runtimeLocale);
  const siteName = companyBrand.name || ctx.site_name || "Ensotek";

  const offerNo = ctx.offer_no || ctx.id;
  const createdAtStr = formatDate(ctx.created_at ?? null, labelLocale);
  const validUntilStr = formatDate(ctx.valid_until ?? null, labelLocale);

  // ---- Form data parse (service/product name fallback vs.) ----
  const formData = parseJsonRecord((ctx as any).form_data);
  const formProductName = formData
    ? pickFirstString(
      formData.product_name,
      formData.productName,
      formData.product_title,
      formData.productTitle,
      formData.product,
      formData.item_name,
      formData.itemName,
    )
    : null;

  const formServiceName = formData
    ? pickFirstString(
      formData.service_name,
      formData.serviceName,
      formData.service_title,
      formData.serviceTitle,
      formData.service,
      formData.requested_service,
      formData.requestedService,
    )
    : null;

  // Ürün gösterimi: önce join (ctx.product_name), sonra form_data.
  // Sadece product_id varsa ID'yi yazdırmıyoruz (kullanıcı talebi).
  const productDisplay =
    pickFirstString(ctx.product_name, formProductName) ?? null;

  // Hizmet gösterimi: önce join (ctx.service_name), sonra form_data.
  const serviceDisplay =
    pickFirstString(ctx.service_name, formServiceName) ?? null;

  // ---- Tutarlar (net, KDV oranına göre, nakliye, toplam) ----
  const currency = ctx.currency;

  const netNum = parseDecimal((ctx as any).net_total);
  const vatNumFromRow = parseDecimal((ctx as any).vat_total);
  const grossNumFromRow = parseDecimal((ctx as any).gross_total);
  const shippingNum = parseDecimal((ctx as any).shipping_total);

  let vatNum: number | null = vatNumFromRow;
  let grossNum: number | null = grossNumFromRow;

  // Opsiyonel: ctx.vat_rate % (örn: 19, "19", "19.00", "19%")
  const vatRateRaw = (ctx as any).vat_rate as number | string | null | undefined;
  const vatRate = parseDecimal(vatRateRaw);

  // Eğer row'da KDV tutarı yoksa ama oran + net varsa → dinamik hesapla
  if (vatNum == null && vatRate != null && netNum != null) {
    const ratio = vatRate / 100;
    if (Number.isFinite(ratio)) {
      vatNum = netNum * ratio;
    }
  }

  // Eğer toplam yoksa → net + kdv + nakliye
  if (grossNum == null && netNum != null) {
    grossNum = netNum + (vatNum ?? 0) + (shippingNum ?? 0);
  }

  const netStr =
    netNum != null ? formatMoney(netNum.toFixed(2), currency, labelLocale) : "";

  const vatStr =
    vatNum != null ? formatMoney(vatNum.toFixed(2), currency, labelLocale) : "";

  const shippingStr =
    shippingNum != null
      ? formatMoney(shippingNum.toFixed(2), currency, labelLocale)
      : "";

  const grossStr =
    grossNum != null
      ? formatMoney(grossNum.toFixed(2), currency, labelLocale)
      : "";

  // VAT label: oran varsa "KDV (19%)" gibi göster
  const vatLabel =
    vatRate != null && Number.isFinite(vatRate)
      ? `${t.vat} (${vatRate.toFixed(0)}%)`
      : `${t.vat}`;

  const logoUrl = companyBrand.logoUrl;
  const logoWidth = companyBrand.logoWidth || 160;
  const logoHeight = companyBrand.logoHeight || 60;

  const countryDisplay = ctx.country_code ? String(ctx.country_code).toUpperCase() : "";
  const formLangDisplay = runtimeLocale || "";

  return `<!DOCTYPE html>
<html lang="${safeText(runtimeLocale)}">
<head>
  <meta charset="UTF-8" />
  <title>${safeText(siteName)} – ${safeText(t.title)} ${safeText(offerNo)}</title>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      color: #222;
    }
    body {
      padding: 24mm 18mm 20mm 18mm;
      background: #fff;
    }
    .page { width: 100%; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      border-bottom: 2px solid #0b5ed7;
      padding-bottom: 8px;
    }
    .header-left {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    .header-logo {
      max-height: 40px;
      max-width: 180px;
      display: block;
    }
    .header-left-title {
      font-size: 18px;
      font-weight: 700;
      color: #0b5ed7;
    }
    .header-left-sub {
      font-size: 12px;
      font-weight: 400;
      color: #444;
    }
    .header-right {
      text-align: right;
      font-size: 11px;
      line-height: 1.4;
    }
    .section-title {
      font-size: 13px;
      font-weight: 600;
      margin: 16px 0 6px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #555;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1.2fr 1.2fr;
      gap: 8px 32px;
      font-size: 11px;
    }
    .details-grid div { line-height: 1.4; }
    .label {
      font-weight: 600;
      color: #555;
      display: inline-block;
      min-width: 110px;
    }
    .muted { color: #777; }
    .box {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 10px 12px;
      margin-top: 4px;
      background: #fafafa;
    }
    .amounts {
      margin-top: 12px;
      width: 280px;
      margin-left: auto;
      font-size: 11px;
    }
    .amounts table {
      width: 100%;
      border-collapse: collapse;
    }
    .amounts td { padding: 4px 0; vertical-align: top; }
    .amounts td.label { text-align: left; }
    .amounts td.value {
      text-align: right;
      font-weight: 600;
      white-space: nowrap;
    }
    .amounts tr.total-row td {
      border-top: 1px solid #ccc;
      padding-top: 6px;
      font-size: 12px;
    }
    .text-block {
      font-size: 11px;
      line-height: 1.5;
      margin-top: 8px;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 24px;
      font-size: 9px;
      color: #888;
      border-top: 1px solid #e0e0e0;
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${logoUrl
      ? `<img src="${safeText(logoUrl)}" alt="${safeText(
        siteName,
      )}" class="header-logo" width="${Number(logoWidth)}" height="${Number(logoHeight)}" />`
      : ""
    }
        <div>
          <div class="header-left-title">${safeText(siteName)}</div>
          <div class="header-left-sub">${safeText(t.title)}</div>
        </div>
      </div>
      <div class="header-right">
        <div><span class="label">${safeText(t.quoteNo)}:</span> ${safeText(offerNo)}</div>
        <div><span class="label">${safeText(t.date)}:</span> ${safeText(createdAtStr)}</div>
        ${validUntilStr
      ? `<div><span class="label">${safeText(t.validity)}:</span> ${safeText(validUntilStr)}</div>`
      : ""
    }
      </div>
    </div>

    <div class="section-title">${safeText(t.customerInfo)}</div>
    <div class="details-grid">
      <div>
        <div><span class="label">${safeText(t.name)}:</span> ${safeText(ctx.customer_name)}</div>
        ${ctx.company_name
      ? `<div><span class="label">${safeText(t.company)}:</span> ${safeText(ctx.company_name)}</div>`
      : ""
    }
        <div><span class="label">${safeText(t.email)}:</span> ${safeText(ctx.email)}</div>
        ${ctx.phone
      ? `<div><span class="label">${safeText(t.phone)}:</span> ${safeText(ctx.phone)}</div>`
      : ""
    }
        ${countryDisplay
      ? `<div><span class="label">${safeText(t.country)}:</span> ${safeText(countryDisplay)}</div>`
      : ""
    }
        ${formLangDisplay
      ? `<div><span class="label">${safeText(t.formLanguage)}:</span> ${safeText(formLangDisplay)}</div>`
      : ""
    }
      </div>

      <div>
        ${productDisplay
      ? `<div><span class="label">${safeText(t.product)}:</span> ${safeText(productDisplay)}</div>`
      : ""
    }
        ${serviceDisplay
      ? `<div><span class="label">${safeText(t.service)}:</span> ${safeText(serviceDisplay)}</div>`
      : ""
    }
      </div>
    </div>

    <div class="section-title">${safeText(t.summary)}</div>
    <div class="box">
      ${ctx.subject
      ? `<div><span class="label">${safeText(t.subject)}:</span> ${safeText(ctx.subject)}</div>`
      : ""
    }
      ${ctx.message
      ? `<div class="text-block">${safeText(ctx.message)}</div>`
      : `<div class="muted">${safeText(t.noMessage)}</div>`
    }
    </div>

    <div class="section-title">${safeText(t.pricing)}</div>
    <div class="amounts">
      <table>
        <tbody>
          ${netStr
      ? `<tr>
                  <td class="label">${safeText(t.net)}:</td>
                  <td class="value">${safeText(netStr)}</td>
                </tr>`
      : ""
    }
          ${vatStr
      ? `<tr>
                  <td class="label">${safeText(vatLabel)}:</td>
                  <td class="value">${safeText(vatStr)}</td>
                </tr>`
      : ""
    }
          ${shippingStr
      ? `<tr>
                  <td class="label">${safeText(t.shipping)}:</td>
                  <td class="value">${safeText(shippingStr)}</td>
                </tr>`
      : ""
    }
          ${grossStr
      ? `<tr class="total-row">
                  <td class="label">${safeText(t.total)}:</td>
                  <td class="value">${safeText(grossStr)}</td>
                </tr>`
      : ""
    }
          ${!netStr && !vatStr && !shippingStr && !grossStr
      ? `<tr>
                  <td colspan="2" class="muted">
                    ${safeText(t.pricingEmpty)}
                  </td>
                </tr>`
      : ""
    }
        </tbody>
      </table>
    </div>

    <div class="section-title">${safeText(t.notes)}</div>
    <div class="box">
      <div class="muted" style="font-size: 10px; line-height: 1.4;">
        ${safeText(t.notesLegal(validUntilStr))}
      </div>
      ${ctx.admin_notes
      ? `
        <div class="text-block" style="margin-top: 8px; border-top: 1px dashed #d0d0d0; padding-top: 6px; font-size: 10px;">
          ${safeText(ctx.admin_notes)}
        </div>`
      : ""
    }
    </div>

    <div class="footer">
      <div>${safeText(t.footerLeft(siteName))}</div>
      <div>${safeText(t.footerRight)}</div>
    </div>
  </div>
</body>
</html>`;
}
