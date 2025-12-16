// =============================================================
// FILE: src/modules/contact/controller.ts (PUBLIC)
// =============================================================
import type { FastifyRequest, FastifyReply } from "fastify";
import { ContactCreateSchema } from "./validation";
import { repoCreateContact } from "./repository";
import type { ContactView } from "./schema";
import { sendMail } from "@/modules/mail/service";
import { getSmtpSettings } from "@/modules/siteSettings/service";
import { renderEmailTemplateByKey } from "@/modules/email-templates/service";

type CreateReq = FastifyRequest<{ Body: unknown }>;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Contact form gönderildiğinde:
 * 1) Admin'e template tabanlı mail (contact_admin_notification)
 * 2) Kullanıcıya otomatik cevap (contact_user_autoreply)
 */
async function sendContactEmails(contact: ContactView, locale: string | null) {
  // Admin maili nereye gidecek?
  const smtpCfg = await getSmtpSettings();
  const adminTo =
    smtpCfg.fromEmail ||
    smtpCfg.username ||
    contact.email; // son çare: kullanıcıya da gitsin

  // ---------------------------
  // 1) Admin Notification
  // ---------------------------
  const adminParams = {
    name: escapeHtml(contact.name),
    email: escapeHtml(contact.email),
    phone: escapeHtml(contact.phone),
    subject: escapeHtml(contact.subject),
    message: escapeHtml(contact.message),
    ip: contact.ip ? escapeHtml(contact.ip) : "",
    user_agent: contact.user_agent ? escapeHtml(contact.user_agent) : "",
  };

  const adminRendered = await renderEmailTemplateByKey(
    "contact_admin_notification",
    adminParams,
    locale,
  );

  if (adminRendered) {
    if (adminRendered.missing_variables?.length) {
      throw new Error(
        `email_template_missing_params:contact_admin_notification:${adminRendered.missing_variables.join(
          ",",
        )}`,
      );
    }

    await sendMail({
      to: adminTo,
      subject: adminRendered.subject,
      html: adminRendered.html,
    });
  } else {
    throw new Error("email_template_not_found:contact_admin_notification");
  }

  // ---------------------------
  // 2) User Auto-reply
  // ---------------------------
  const userParams = {
    name: escapeHtml(contact.name),
    subject: escapeHtml(contact.subject),
  };

  const userRendered = await renderEmailTemplateByKey(
    "contact_user_autoreply",
    userParams,
    locale,
  );

  if (userRendered) {
    if (userRendered.missing_variables?.length) {
      throw new Error(
        `email_template_missing_params:contact_user_autoreply:${userRendered.missing_variables.join(
          ",",
        )}`,
      );
    }

    await sendMail({
      to: contact.email,
      subject: userRendered.subject,
      html: userRendered.html,
    });
  }
}

export async function createContactPublic(req: CreateReq, reply: FastifyReply) {
  const parsed = ContactCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply
      .code(400)
      .send({ error: "INVALID_BODY", details: parsed.error.flatten() });
  }

  // Basit honeypot: website doluysa drop et
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return reply.code(200).send({ ok: true }); // sessiz discard
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.socket as any)?.remoteAddress ||
    null;

  const ua = (req.headers["user-agent"] as string) || null;

  const created = await repoCreateContact({
    ...parsed.data,
    ip,
    user_agent: ua,
  });

  // Locale'i Fastify request’ten al (metahub i18n pipeline’ına uygun)
  const locale = ((req as any).locale ?? null) as string | null;

  // Mail gönder; hata olursa logla ama kullanıcıya hata gösterme
  try {
    await sendContactEmails(created, locale);
  } catch (err: any) {
    req.log?.error?.({ err }, "contact_email_send_failed");
  }

  return reply.code(201).send(created);
}
