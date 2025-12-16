// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/library_admin.endpoints.ts
// Ensotek – Admin Library RTK Endpoints
// Base URL: /api/admin (baseApi üzerinden)
// - Library kayıtları
// - Library images (kapak / galeri görselleri)
// - Library files (PDF, Word, Excel, ZIP vb. indirilebilir dosyalar)
// =============================================================

import { baseApi } from "../../baseApi";
import type {
  LibraryDto,
  LibraryListQueryParams,
  LibraryCreatePayload,
  LibraryUpdatePayload,
  LibraryImageDto,
  LibraryImageCreatePayload,
  LibraryImageUpdatePayload,
  LibraryFileDto,
  LibraryFileCreatePayload,
  LibraryFileUpdatePayload,
} from "@/integrations/types/library.types";

type WithLocale<T> = T & { locale?: string };

/**
 * Query paramlarından undefined / boş stringleri temizlemek için
 */
const cleanParams = (
  params?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!params) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
};

export const libraryAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /* --------------------------------------------------------- */
    /* LIST – GET /api/admin/library                             */
    /* x-total-count header'ı varsa UI tarafında erişebilirsin   */
    /* locale: query + x-locale header (opsiyonel)               */
    /* --------------------------------------------------------- */
    listLibraryAdmin: build.query<
      LibraryDto[],
      WithLocale<LibraryListQueryParams> | void
    >({
      query: (params) => {
        const p = (params || {}) as WithLocale<LibraryListQueryParams>;
        const { locale, ...rest } = p;

        return {
          url: "/admin/library",
          method: "GET",
          params: cleanParams({ ...rest, locale }),
          headers: locale ? { "x-locale": locale } : undefined,
        };
      },
    }),

    /* --------------------------------------------------------- */
    /* GET BY ID – GET /api/admin/library/:id                    */
    /* locale: query + x-locale header (opsiyonel)               */
    /* --------------------------------------------------------- */
    getLibraryAdmin: build.query<
      LibraryDto,
      { id: string; locale?: string }
    >({
      query: ({ id, locale }) => ({
        url: `/admin/library/${id}`,
        method: "GET",
        params: cleanParams({ locale }),
        headers: locale ? { "x-locale": locale } : undefined,
      }),
    }),

    /* --------------------------------------------------------- */
    /* GET BY SLUG – GET /api/admin/library/by-slug/:slug        */
    /* locale: query + x-locale header (opsiyonel)               */
    /* --------------------------------------------------------- */
    getLibraryBySlugAdmin: build.query<
      LibraryDto,
      { slug: string; locale?: string }
    >({
      query: ({ slug, locale }) => ({
        url: `/admin/library/by-slug/${encodeURIComponent(slug)}`,
        method: "GET",
        params: cleanParams({ locale }),
        headers: locale ? { "x-locale": locale } : undefined,
      }),
    }),

    /* --------------------------------------------------------- */
    /* CREATE – POST /api/admin/library                          */
    /* Body: upsertLibraryBodySchema                             */
    /* i18n: body.locale + replicate_all_locales                 */
    /* --------------------------------------------------------- */
    createLibraryAdmin: build.mutation<LibraryDto, LibraryCreatePayload>({
      query: (body) => ({
        url: "/admin/library",
        method: "POST",
        body,
      }),
    }),

    /* --------------------------------------------------------- */
    /* UPDATE (PATCH) – PATCH /api/admin/library/:id             */
    /* Body: patchLibraryBodySchema                              */
    /* i18n: body.locale + apply_all_locales                     */
    /* --------------------------------------------------------- */
    updateLibraryAdmin: build.mutation<
      LibraryDto,
      { id: string; patch: LibraryUpdatePayload }
    >({
      query: ({ id, patch }) => ({
        url: `/admin/library/${id}`,
        method: "PATCH",
        body: patch,
      }),
    }),

    /* --------------------------------------------------------- */
    /* DELETE – DELETE /api/admin/library/:id                    */
    /* --------------------------------------------------------- */
    removeLibraryAdmin: build.mutation<void, string>({
      query: (id) => ({
        url: `/admin/library/${id}`,
        method: "DELETE",
      }),
    }),

    /* ================== IMAGES (gallery) ===================== */

    /* LIST IMAGES – GET /api/admin/library/:id/images           */
    /* locale: alt/caption için hangi dili döneceğini belirler   */
    listLibraryImagesAdmin: build.query<
      LibraryImageDto[],
      { id: string; locale?: string }
    >({
      query: ({ id, locale }) => ({
        url: `/admin/library/${id}/images`,
        method: "GET",
        params: cleanParams({ locale }),
        headers: locale ? { "x-locale": locale } : undefined,
      }),
    }),

    /* CREATE IMAGE – POST /api/admin/library/:id/images         */
    /* Body: upsertLibraryImageBodySchema                        */
    /* i18n: payload.locale + replicate_all_locales              */
    createLibraryImageAdmin: build.mutation<
      LibraryImageDto[],
      { id: string; payload: LibraryImageCreatePayload }
    >({
      query: ({ id, payload }) => ({
        url: `/admin/library/${id}/images`,
        method: "POST",
        body: payload,
      }),
    }),

    /* UPDATE IMAGE – PATCH /api/admin/library/:id/images/:imageId */
    /* Body: patchLibraryImageBodySchema                         */
    /* i18n: patch.locale + apply_all_locales                    */
    updateLibraryImageAdmin: build.mutation<
      LibraryImageDto[],
      {
        id: string;
        imageId: string;
        patch: LibraryImageUpdatePayload;
      }
    >({
      query: ({ id, imageId, patch }) => ({
        url: `/admin/library/${id}/images/${imageId}`,
        method: "PATCH",
        body: patch,
      }),
    }),

    /* DELETE IMAGE – DELETE /api/admin/library/:id/images/:imageId */
    removeLibraryImageAdmin: build.mutation<
      void,
      { id: string; imageId: string }
    >({
      query: ({ id, imageId }) => ({
        url: `/admin/library/${id}/images/${imageId}`,
        method: "DELETE",
      }),
    }),

    /* ================== FILES (PDF / DOCX / XLSX / ZIP) ====== */

    /**
     * LIST FILES – GET /api/admin/library/:id/files
     * - Bir library kaydına bağlı tüm dosyalar (PDF, Word, Excel, vb.)
     */
    listLibraryFilesAdmin: build.query<
      LibraryFileDto[],
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/admin/library/${id}/files`,
        method: "GET",
      }),
    }),

    /**
     * CREATE FILE – POST /api/admin/library/:id/files
     * Body: upsertLibraryFileParentBodySchema
     *
     * Tipik kullanım:
     *  1) Storage modülüne dosya upload (asset_id, mime_type, size_bytes)
     *  2) asset_id + name (+ mime_type, size_bytes) ile burada kayıt oluştur
     */
    createLibraryFileAdmin: build.mutation<
      LibraryFileDto[],
      { id: string; payload: LibraryFileCreatePayload }
    >({
      query: ({ id, payload }) => ({
        url: `/admin/library/${id}/files`,
        method: "POST",
        body: payload,
      }),
    }),

    /**
     * UPDATE FILE – PATCH /api/admin/library/:id/files/:fileId
     * Body: patchLibraryFileParentBodySchema
     */
    updateLibraryFileAdmin: build.mutation<
      LibraryFileDto[],
      {
        id: string;
        fileId: string;
        patch: LibraryFileUpdatePayload;
      }
    >({
      query: ({ id, fileId, patch }) => ({
        url: `/admin/library/${id}/files/${fileId}`,
        method: "PATCH",
        body: patch,
      }),
    }),

    /**
     * DELETE FILE – DELETE /api/admin/library/:id/files/:fileId
     */
    removeLibraryFileAdmin: build.mutation<
      void,
      { id: string; fileId: string }
    >({
      query: ({ id, fileId }) => ({
        url: `/admin/library/${id}/files/${fileId}`,
        method: "DELETE",
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  // library
  useListLibraryAdminQuery,
  useLazyListLibraryAdminQuery,
  useGetLibraryAdminQuery,
  useLazyGetLibraryAdminQuery,
  useGetLibraryBySlugAdminQuery,
  useLazyGetLibraryBySlugAdminQuery,
  useCreateLibraryAdminMutation,
  useUpdateLibraryAdminMutation,
  useRemoveLibraryAdminMutation,

  // images
  useListLibraryImagesAdminQuery,
  useLazyListLibraryImagesAdminQuery,
  useCreateLibraryImageAdminMutation,
  useUpdateLibraryImageAdminMutation,
  useRemoveLibraryImageAdminMutation,

  // files
  useListLibraryFilesAdminQuery,
  useLazyListLibraryFilesAdminQuery,
  useCreateLibraryFileAdminMutation,
  useUpdateLibraryFileAdminMutation,
  useRemoveLibraryFileAdminMutation,
} = libraryAdminApi;
