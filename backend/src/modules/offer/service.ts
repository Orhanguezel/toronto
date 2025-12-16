// =============================================================
// FILE: src/modules/offer/service.ts
// Ensotek – Offer Module Service
//   - PDF (Puppeteer) → uploads/offers/*.pdf
//   - Fallback txt dosyası (pdf-error.txt)
//   - Email templates + notifications
//   - ✅ PDF için product/service isimlerini i18n tablolardan çeker (locale fallback)
// =============================================================

import puppeteer from "puppeteer";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { randomUUID } from "crypto";
import { eq, and, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { siteSettings } from "@/modules/siteSettings/schema";
import { notifications, type NotificationType } from "@/modules/notifications/schema";

import { offersTable, type OfferRow } from "./schema";
import { updateOffer } from "./repository";
import { renderOfferPdfHtml } from "./pdfTemplate";

import { renderEmailTemplateByKey } from "@/modules/email-templates/service";
import { sendMail } from "@/modules/mail/service";

// ✅ Product/Service schemas (i18n)
import { products, productI18n } from "@/modules/products/schema";
import { services, servicesI18n } from "@/modules/services/schema";

import type { OfferListItem } from "./repository";

// -------------------------------------------------------------
// Dosya yolları (FS) + public URL pattern
// -------------------------------------------------------------

const UPLOADS_ROOT_DIR = path.resolve(process.cwd(), "uploads");
const OFFERS_DIR = path.join(UPLOADS_ROOT_DIR, "offers");

async function ensureOffersDir() {
    await fs.mkdir(OFFERS_DIR, { recursive: true });
}

// -------------------------------------------------------------
// Puppeteer executable path resolution
// -------------------------------------------------------------

const POSSIBLE_EXECUTABLE_PATHS: string[] = [
    process.env.PUPPETEER_EXECUTABLE_PATH || "",
    process.env.CHROME_PATH || "",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
].filter(Boolean);

function resolvePuppeteerExecutable(): string | undefined {
    for (const p of POSSIBLE_EXECUTABLE_PATHS) {
        if (fsSync.existsSync(p)) {
            console.log("[offer] Using puppeteer executable:", p);
            return p;
        }
    }
    console.warn(
        "[offer] No explicit puppeteer executable found, Puppeteer will use its bundled browser (if installed).",
    );
    return undefined;
}

// -------------------------------------------------------------
// site_settings helpers
// -------------------------------------------------------------

async function getSiteSettingValue(key: string): Promise<unknown | null> {
    const rows = await db
        .select({ value: siteSettings.value })
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1);

    if (!rows.length) return null;
    return rows[0].value ?? null;
}

function parseToStringArray(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
        return value
            .split(/[;,]+/)
            .map((v) => v.trim())
            .filter(Boolean);
    }
    return [String(value)].filter(Boolean);
}

async function getOffersAdminEmails(): Promise<string[]> {
    const raw = await getSiteSettingValue("offers_admin_email");
    return parseToStringArray(raw);
}

async function getOffersAdminUserIds(): Promise<string[]> {
    const raw = await getSiteSettingValue("offers_admin_user_ids");
    return parseToStringArray(raw);
}

// -------------------------------------------------------------
// Locale helpers (offer.locale → prefix → en → tr)
// -------------------------------------------------------------

function uniq(arr: string[]) {
    return Array.from(new Set(arr.filter(Boolean)));
}

function buildLocaleCandidates(rawLocale?: string | null): string[] {
    const lc = (rawLocale || "").trim();
    const langPart = lc.includes("-") ? lc.split("-")[0] : lc;
    return uniq([lc, langPart, "en", "tr"].map((x) => x?.trim()).filter(Boolean));
}

// -------------------------------------------------------------
// form_data helper
// -------------------------------------------------------------

function parseJsonRecord(v: unknown): Record<string, unknown> | null {
    if (!v) return null;
    if (typeof v === "object") return v as Record<string, unknown>;
    if (typeof v !== "string") return null;
    try {
        const parsed = JSON.parse(v);
        if (typeof parsed === "object" && parsed !== null) return parsed as Record<string, unknown>;
        return { raw: parsed };
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
// Product/Service name resolve (i18n)
// -------------------------------------------------------------

async function getProductTitleById(opts: {
    productId: string;
    locale?: string | null;
}): Promise<string | null> {
    const { productId, locale } = opts;
    const candidates = buildLocaleCandidates(locale);

    try {
        // Not: product_i18n PK: (product_id, locale)
        // Önce candidate locale’lerde var mı bak, ilk bulduğunu dön.
        const rows = await db
            .select({
                locale: productI18n.locale,
                title: productI18n.title,
            })
            .from(productI18n)
            .where(and(eq(productI18n.product_id, productId), inArray(productI18n.locale, candidates)));

        for (const loc of candidates) {
            const hit = rows.find((r) => r.locale === loc);
            if (hit?.title) return hit.title;
        }

        // En azından base table var mı (debug için) — title yoksa null
        const base = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);

        if (!base.length) return null;
        return null;
    } catch (err) {
        console.error("offer:getProductTitleById_failed", err);
        return null;
    }
}

async function getServiceNameById(opts: {
    serviceId: string;
    locale?: string | null;
}): Promise<string | null> {
    const { serviceId, locale } = opts;
    const candidates = buildLocaleCandidates(locale);

    try {
        const rows = await db
            .select({
                locale: servicesI18n.locale,
                name: servicesI18n.name,
            })
            .from(servicesI18n)
            .where(and(eq(servicesI18n.service_id, serviceId), inArray(servicesI18n.locale, candidates)));

        for (const loc of candidates) {
            const hit = rows.find((r) => r.locale === loc);
            if (hit?.name) return hit.name;
        }

        // base var mı kontrol
        const base = await db
            .select({ id: services.id })
            .from(services)
            .where(eq(services.id, serviceId))
            .limit(1);

        if (!base.length) return null;
        return null;
    } catch (err) {
        console.error("offer:getServiceNameById_failed", err);
        return null;
    }
}

// -------------------------------------------------------------
// Notifications helper
// -------------------------------------------------------------

async function createNotificationForAdmins(opts: {
    title: string;
    message: string;
    type: NotificationType;
}) {
    const adminUserIds = await getOffersAdminUserIds();
    if (!adminUserIds.length) return;

    const rows = adminUserIds.map((uid) => ({
        id: randomUUID(),
        user_id: uid,
        title: opts.title,
        message: opts.message,
        type: opts.type,
    }));

    await db.insert(notifications).values(rows);
}

// -------------------------------------------------------------
// PDF üretim (Puppeteer) – HTML → Uint8Array
// -------------------------------------------------------------

export async function generateOfferPdfBuffer(
    offer: OfferRow & { site_name?: string | null; product_name?: string | null; service_name?: string | null },
): Promise<Uint8Array> {
    const html = await renderOfferPdfHtml(offer);

    const execPath = resolvePuppeteerExecutable();

    const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    if (execPath) {
        (launchOptions as any).executablePath = execPath;
    }

    const browser = await puppeteer.launch(launchOptions);

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                right: "15mm",
                bottom: "20mm",
                left: "15mm",
            },
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

// -------------------------------------------------------------
// PDF / TXT'i diske kaydet – uploads/offers
// Public URL: /uploads/offers/<file>
// -------------------------------------------------------------

async function saveOfferFileToLocalStorage(
    buffer: Uint8Array | Buffer,
    fileName: string,
): Promise<{ pdf_url: string; pdf_asset_id: string | null }> {
    await ensureOffersDir();

    const safeName =
        fileName.replace(/[^A-Za-z0-9_.-]/g, "-") || `offer-${Date.now()}.pdf`;
    const absPath = path.join(OFFERS_DIR, safeName);

    await fs.writeFile(absPath, buffer);

    const pdf_url = `/uploads/offers/${safeName}`;

    return {
        pdf_url,
        pdf_asset_id: null,
    };
}

async function saveOfferErrorFile(
    offerId: string,
    err: unknown,
): Promise<{ pdf_url: string; pdf_asset_id: string | null }> {
    const text = [
        `PDF generation failed for offer ${offerId}.`,
        "",
        "Error:",
        err instanceof Error ? err.message : String(err),
        "",
        "This file is created as a fallback placeholder.",
    ].join("\n");

    const buffer = Buffer.from(text, "utf8");
    const fileName = `${offerId}-pdf-error.txt`;

    return saveOfferFileToLocalStorage(buffer, fileName);
}

// -------------------------------------------------------------
// Teklif için PDF üret + offers tablosuna pdf_url/pdf_asset_id yaz
//   ✅ PDF context'e product_name / service_name eklenir
// -------------------------------------------------------------

export async function generateAndAttachOfferPdf(
    offer: OfferRow,
): Promise<{ pdf_url: string | null; pdf_asset_id: string | null }> {
    const siteTitleRaw = await getSiteSettingValue("site_title");
    const siteName = (typeof siteTitleRaw === "string" && siteTitleRaw) || "Ensotek";

    // service_id: offer tablosunda varsa al; yoksa form_data içinden dene
    const formData = parseJsonRecord((offer as any).form_data);
    const serviceId =
        pickFirstString((offer as any).service_id, formData?.service_id, formData?.serviceId) ?? null;

    // product_id zaten offer’da var (senin repo/validation’a göre)
    const productId = offer.product_id ?? null;

    // i18n isimleri çöz
    const [product_name, service_name] = await Promise.all([
        productId ? getProductTitleById({ productId, locale: offer.locale ?? null }) : Promise.resolve(null),
        serviceId ? getServiceNameById({ serviceId, locale: offer.locale ?? null }) : Promise.resolve(null),
    ]);

    try {
        const buffer = await generateOfferPdfBuffer({
            ...offer,
            site_name: siteName,
            product_name,
            service_name,
        });

        const fileName = (offer.offer_no || `offer-${offer.id}`) + ".pdf";

        const { pdf_url, pdf_asset_id } = await saveOfferFileToLocalStorage(buffer, fileName);

        await updateOffer(offer.id, { pdf_url, pdf_asset_id } as any);

        return { pdf_url, pdf_asset_id };
    } catch (err) {
        console.error("generateAndAttachOfferPdf_failed", err);

        const { pdf_url, pdf_asset_id } = await saveOfferErrorFile(offer.id, err);

        await updateOffer(offer.id, { pdf_url, pdf_asset_id } as any);

        return { pdf_url, pdf_asset_id };
    }
}

// -------------------------------------------------------------
// Mail helper – email_templates üzerinden render + sendMail
// -------------------------------------------------------------

type OfferEmailContext = {
    offer: OfferRow;
    pdf_url?: string | null;
    pdf_asset_id?: string | null;
};

async function sendCustomerOfferMail(ctx: OfferEmailContext): Promise<boolean> {
    const o = ctx.offer;
    const locale = o.locale || "en";

    const params: Record<string, unknown> = {
        customer_name: o.customer_name,
        company_name: o.company_name,
        offer_no: o.offer_no ?? o.id,
        email: o.email,
        phone: o.phone,

        currency: o.currency,
        net_total: o.net_total,
        vat_rate: (o as any).vat_rate ?? null,
        vat_total: o.vat_total,
        shipping_total: (o as any).shipping_total ?? null,
        gross_total: o.gross_total,

        valid_until:
            o.valid_until instanceof Date ? o.valid_until.toISOString().substring(0, 10) : null,

        pdf_url: ctx.pdf_url ?? o.pdf_url ?? null,
    };

    const rendered = await renderEmailTemplateByKey("offer_sent_customer", params, locale);

    if (!rendered) {
        console.warn("offer_sent_customer template not found, skipping mail");
        return false;
    }

    if (rendered.missing_variables.length > 0) {
        console.warn("offer_sent_customer missing variables:", rendered.missing_variables);
        return false;
    }

    await sendMail({
        to: o.email,
        subject: rendered.subject,
        html: rendered.html,
    });

    return true;
}

async function sendAdminOfferMail(ctx: OfferEmailContext): Promise<boolean> {
    const o = ctx.offer;
    const locale = o.locale || "en";

    const adminEmails = await getOffersAdminEmails();
    if (!adminEmails.length) return false;

    const params: Record<string, unknown> = {
        customer_name: o.customer_name,
        company_name: o.company_name,
        offer_no: o.offer_no ?? o.id,
        email: o.email,
        phone: o.phone,

        currency: o.currency,
        net_total: o.net_total,
        vat_rate: (o as any).vat_rate ?? null,
        vat_total: o.vat_total,
        shipping_total: (o as any).shipping_total ?? null,
        gross_total: o.gross_total,

        valid_until:
            o.valid_until instanceof Date ? o.valid_until.toISOString().substring(0, 10) : null,

        pdf_url: ctx.pdf_url ?? o.pdf_url ?? null,
    };

    const rendered = await renderEmailTemplateByKey("offer_sent_admin", params, locale);

    if (!rendered) {
        console.warn("offer_sent_admin template not found, skipping admin mail");
        return false;
    }

    if (rendered.missing_variables.length > 0) {
        console.warn("offer_sent_admin missing variables:", rendered.missing_variables);
        return false;
    }

    for (const to of adminEmails) {
        await sendMail({
            to,
            subject: rendered.subject,
            html: rendered.html,
        });
    }

    return true;
}

// -------------------------------------------------------------
// Public form submit → admin'e notification + opsiyonel mail
// -------------------------------------------------------------

export async function triggerNewOfferNotifications(offer: OfferRow) {
    const title = "Yeni Teklif Talebi";
    const message = `Yeni teklif talebi oluşturuldu.
Müşteri: ${offer.customer_name}
E-posta: ${offer.email}
Teklif ID: ${offer.id}`;

    await createNotificationForAdmins({
        title,
        message,
        type: "offer_created" as NotificationType,
    });

    try {
        const adminEmails = await getOffersAdminEmails();
        if (!adminEmails.length) return;

        const params: Record<string, unknown> = {
            customer_name: offer.customer_name,
            company_name: offer.company_name,
            email: offer.email,
            phone: offer.phone,
            offer_id: offer.id,
            message: offer.message,
        };

        const rendered = await renderEmailTemplateByKey(
            "offer_request_received_admin",
            params,
            offer.locale ?? "en",
        );

        if (!rendered || rendered.missing_variables.length > 0) return;

        for (const to of adminEmails) {
            await sendMail({
                to,
                subject: rendered.subject,
                html: rendered.html,
            });
        }
    } catch (err) {
        console.error("offer_request_admin_mail_failed", err);
    }
}

// -------------------------------------------------------------
// Admin → "Teklifi Gönder" aksiyonu
//   - sent/email_sent_at sadece müşteri maili gerçekten gönderildiyse yazılır.
//   - sonuç döndürür (UI/Controller doğru karar verir)
// -------------------------------------------------------------

export async function sendOfferEmailsAndNotifications(
    offer: OfferRow,
    opts: { pdf_url?: string | null; pdf_asset_id?: string | null },
): Promise<{ customerSent: boolean; adminSent: boolean }> {
    const pdf_url = opts.pdf_url ?? offer.pdf_url ?? null;
    const pdf_asset_id = opts.pdf_asset_id ?? offer.pdf_asset_id ?? null;

    const ctx: OfferEmailContext = { offer, pdf_url, pdf_asset_id };

    let customerSent = false;
    let adminSent = false;

    try {
        customerSent = await sendCustomerOfferMail(ctx);
    } catch (err) {
        console.error("sendCustomerOfferMail failed", err);
        customerSent = false;
    }

    try {
        adminSent = await sendAdminOfferMail(ctx);
    } catch (err) {
        console.error("sendAdminOfferMail failed", err);
        adminSent = false;
    }

    // Müşteri maili gönderilmediyse status/email_sent_at yazma ve “gönderildi” bildirimi üretme
    if (!customerSent) {
        return { customerSent, adminSent };
    }

    const title = "Teklif Gönderildi";
    const message = `Bir teklif müşteriye gönderildi.
Teklif No: ${offer.offer_no ?? offer.id}
Müşteri: ${offer.customer_name}
E-posta: ${offer.email}`;

    await createNotificationForAdmins({
        title,
        message,
        type: "offer_sent" as NotificationType,
    });

    await db
        .update(offersTable)
        .set({
            email_sent_at: new Date() as any,
            status: offer.status === "sent" ? offer.status : ("sent" as any),
        })
        .where(eq(offersTable.id, offer.id));

    return { customerSent, adminSent };
}



async function sendCustomerOfferMailOnly(offer: OfferRow): Promise<boolean> {
    const locale = offer.locale || "en";

    const params: Record<string, unknown> = {
        customer_name: offer.customer_name,
        company_name: offer.company_name,
        offer_no: offer.offer_no ?? offer.id,
        email: offer.email,
        phone: offer.phone,
        currency: offer.currency,
        net_total: offer.net_total,
        vat_total: offer.vat_total,
        gross_total: offer.gross_total,
        valid_until: offer.valid_until instanceof Date
            ? offer.valid_until.toISOString().substring(0, 10)
            : offer.valid_until
                ? String(offer.valid_until).substring(0, 10)
                : null,
        pdf_url: offer.pdf_url ?? null,
    };

    const rendered = await renderEmailTemplateByKey("offer_sent_customer", params, locale);

    if (!rendered) return false;
    if (rendered.missing_variables.length > 0) return false;

    await sendMail({ to: offer.email, subject: rendered.subject, html: rendered.html });
    return true;
}

// ✅ sadece mail gönder, email_sent_at set et, status=sent set et
export async function sendOfferEmailOnly(
    offer: OfferListItem,
): Promise<{ customerSent: boolean; adminSent?: boolean }> {
    // pdf zorunlu
    if (!offer.pdf_url) {
        return { customerSent: false };
    }

    // Mevcut mail+notification fonksiyonunu PDF bilgisi ile çağır
    const res = await sendOfferEmailsAndNotifications(offer as any, {
        pdf_url: offer.pdf_url,
        pdf_asset_id: offer.pdf_asset_id ?? null,
    });

    // customer mail başarılıysa, email_sent_at + status güncelle
    if (res.customerSent) {
        await updateOffer(offer.id, {
            email_sent_at: new Date() as any,
            status: "sent" as any,
        } as any);
    }

    return res;
}
