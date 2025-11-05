// =============================================================
// FILE: src/modules/contact/controller.ts (PUBLIC)
// =============================================================
import type { FastifyRequest, FastifyReply } from "fastify";
import { ContactCreateSchema } from "./validation";
import { repoCreateContact } from "./repository";

type CreateReq = FastifyRequest<{ Body: unknown }>;

export async function createContactPublic(req: CreateReq, reply: FastifyReply) {
  const parsed = ContactCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: "INVALID_BODY", details: parsed.error.flatten() });
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

  const created = await repoCreateContact(req.server, { ...parsed.data, ip, user_agent: ua });
  return reply.code(201).send(created);
}
