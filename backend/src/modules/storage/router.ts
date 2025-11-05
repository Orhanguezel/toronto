import type { FastifyInstance } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import {
  publicServe,
  uploadToBucket,
  signPut,
  signMultipart,
} from "./controller";

const BASE = "/storage";

export async function registerStorage(app: FastifyInstance) {
  // provider URL'ye yönlendiren public CDN benzeri uç
  app.get<{ Params: { bucket: string; "*": string } }>(
    `${BASE}/:bucket/*`,
    { config: { public: true } },
    publicServe
  );

  // server-side upload (FormData)
  app.post<{ Params: { bucket: string }; Querystring: { path?: string; upsert?: string } }>(
    `${BASE}/:bucket/upload`,
    { preHandler: [requireAuth] }, // public değil; token gerekiyor
    uploadToBucket
  );

  // imza uçları
  app.post(
    `${BASE}/uploads/sign-put`,
    { preHandler: [requireAuth] },
    signPut
  );

  app.post(
    `${BASE}/uploads/sign-multipart`,
    { preHandler: [requireAuth] },
    signMultipart
  );
}
