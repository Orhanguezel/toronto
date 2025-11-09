import { baseApi } from "@/integrations/baseApi";
import type {
  StorageAsset,
  StorageAssetI18n,
  StorageAssetMerged,
  AdminListAssetsQuery,
  AdminListFoldersQuery,
  SignPutRequest,
  SignMultipartRequest,
  UploadFormDataArgs,
  BulkDeleteRequest,
  FolderItem,
} from "@/integrations/endpoints/types/storage";

function getTotal(meta: any): number {
  try {
    const v = meta?.response?.headers?.get?.("x-total-count");
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  } catch { return 0; }
}

export const storageAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({

    // -------- assets list/get --------
    adminListAssets: b.query<{ items: StorageAsset[]; total: number }, AdminListAssetsQuery | void>({
      query: (q) => ({ url: "/storage/assets", params: q ? { ...q } : undefined }),
      transformResponse: (items: StorageAsset[], meta) => ({ items, total: getTotal(meta) }),
      providesTags: (r) => [
        { type: "storage_assets" as const },
        ...(r?.items?.map?.((x) => ({ type: "storage_assets" as const, id: x.id })) ?? []),
      ],
    }),

    adminGetAsset: b.query<StorageAsset, { id: string }>({
      query: ({ id }) => ({ url: `/storage/assets/${encodeURIComponent(id)}` }),
      providesTags: (_r, _e, a) => [{ type: "storage_assets" as const, id: a.id }],
    }),

    adminGetAssetMerged: b.query<StorageAssetMerged, { id: string }>({
      query: ({ id }) => ({ url: `/storage/assets/${encodeURIComponent(id)}/merged` }),
      providesTags: (_r, _e, a) => [{ type: "storage_assets" as const, id: a.id }],
    }),

    // -------- create/patch/delete --------
    adminCreateAsset: b.mutation<StorageAsset, Partial<StorageAsset>>({
      query: (body) => ({ url: "/storage/assets", method: "POST", body }),
      invalidatesTags: [{ type: "storage_assets" as const }],
    }),

    adminPatchAsset: b.mutation<StorageAsset, { id: string; patch: Partial<StorageAsset> }>({
      query: ({ id, patch }) => ({
        url: `/storage/assets/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "storage_assets" as const },
        { type: "storage_assets" as const, id: a.id },
      ],
    }),

    adminPatchAssetI18n: b.mutation<StorageAssetI18n, { id: string; patch: Partial<StorageAssetI18n> & { locale: string } }>({
      query: ({ id, patch }) => ({
        url: `/storage/assets/${encodeURIComponent(id)}/i18n`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "storage_assets" as const },
        { type: "storage_assets" as const, id: a.id },
      ],
    }),

    adminDeleteAsset: b.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `/storage/assets/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, a) => [
        { type: "storage_assets" as const },
        { type: "storage_assets" as const, id: a.id },
      ],
    }),

    adminBulkDelete: b.mutation<{ ok: true }, BulkDeleteRequest>({
      query: (body) => ({ url: "/storage/assets/bulk-delete", method: "POST", body }),
      invalidatesTags: [{ type: "storage_assets" as const }],
    }),

    // -------- folders helper --------
    adminListFolders: b.query<FolderItem[], AdminListFoldersQuery | void>({
      query: (q) => ({ url: "/storage/folders", params: q ? { ...q } : undefined }),
      providesTags: (_r) => [{ type: "storage_folders" as const }],
    }),

    // -------- signed uploads (auth) --------
    signPut: b.mutation<any, SignPutRequest>({
      query: (body) => ({ url: "/storage/uploads/sign-put", method: "POST", body }),
    }),

    signMultipart: b.mutation<any, SignMultipartRequest>({
      query: (body) => ({ url: "/storage/uploads/sign-multipart", method: "POST", body }),
    }),

    // -------- server-side upload (FormData) --------
    uploadToBucket: b.mutation<
      { ok: true; asset?: StorageAsset },
      UploadFormDataArgs
    >({
      query: ({ bucket, path, upsert, formData }) => ({
        url: `/storage/${encodeURIComponent(bucket)}/upload`,
        method: "POST",
        params: {
          ...(path ? { path } : {}),
          ...(typeof upsert === "boolean" ? { upsert: String(upsert ? 1 : 0) } : {}),
        },
        body: formData,
        // fetchBaseQuery formData'yı kendisi ayarlıyor, Content-Type belirtme!
      }),
    }),

  }),
});

export const {
  useAdminListAssetsQuery,
  useLazyAdminListAssetsQuery,
  useAdminGetAssetQuery,
  useLazyAdminGetAssetQuery,
  useAdminGetAssetMergedQuery,
  useLazyAdminGetAssetMergedQuery,
  useAdminCreateAssetMutation,
  useAdminPatchAssetMutation,
  useAdminPatchAssetI18nMutation,
  useAdminDeleteAssetMutation,
  useAdminBulkDeleteMutation,
  useAdminListFoldersQuery,
  useLazyAdminListFoldersQuery,
  useSignPutMutation,
  useSignMultipartMutation,
  useUploadToBucketMutation,
} = storageAdminApi as any;
