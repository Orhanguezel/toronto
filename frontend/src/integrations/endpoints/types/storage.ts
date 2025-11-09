// ======================
// Storage: Types
// ======================

export type StorageAsset = {
  id: string;
  user_id: string | null;

  name: string;
  bucket: string;
  path: string;
  folder: string | null;

  mime: string;
  size: number;

  width: number | null;
  height: number | null;

  url: string | null;
  hash: string | null;

  provider: string;
  provider_public_id: string | null;
  provider_resource_type: "image" | "video" | "raw" | string | null;
  provider_format: string | null;
  provider_version: number | null;
  etag: string | null;

  metadata: Record<string, string> | null;

  created_at: string;
  updated_at: string;
};

export type StorageAssetI18n = {
  id: string;
  asset_id: string;
  locale: string;

  title: string | null;
  alt: string | null;
  caption: string | null;
  description: string | null;

  created_at: string;
  updated_at: string;
};

export type StorageAssetMerged = StorageAsset & {
  i18n?: Partial<Record<string, Partial<StorageAssetI18n>>>;
};

export type AdminListAssetsQuery = {
  q?: string;
  bucket?: string;
  folder?: string;
  mime_like?: string;
  order?: string;     // "created_at.desc" gibi
  limit?: number;
  offset?: number;
};

export type AdminListFoldersQuery = {
  bucket?: string;
  prefix?: string;    // folder ön eki
  limit?: number;
  offset?: number;
};

export type SignPutRequest = {
  bucket: string;
  path: string;       // hedef path (folder/name.ext)
  mime: string;
  size?: number;
};

export type SignMultipartRequest = {
  bucket: string;
  path: string;
  mime: string;
  parts: number;
  size?: number;
};

export type UploadFormDataArgs = {
  bucket: string;
  path?: string;
  upsert?: boolean;
  /** Tarayıcıdan oluşturulan FormData (file, opsiyonel extra fields) */
  formData: FormData;
};

export type BulkDeleteRequest = {
  ids: string[];
};

export type FolderItem = {
  name: string;   // "folder/alt" gibi
  count: number;  // o klasördeki varlık sayısı (opsiyonel olarak backend döndürüyor olabilir)
};
