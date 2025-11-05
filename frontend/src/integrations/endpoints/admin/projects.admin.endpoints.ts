// src/integrations/endpoints/projects.admin.ts

import { baseApi } from "@/integrations/baseApi";
import { routes } from "@/integrations/routes";

/** Admin tarafında minimal tipler */
export type Project = {
  id: string;
  slug: string;
  title: string;
  cover_url?: string | null;
  price_from?: number | null;
  status?: string | null;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  image_asset_id?: string | null;
  image_url?: string | null;
  title?: string | null;
  alt?: string | null;
  caption?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type ListArgs = { q?: string; page?: number; pageSize?: number } | void;
type Paged<T> = { items: T[]; total: number };

/** exactOptionalPropertyTypes güvenli param builder */
function buildParams(p?: Record<string, any>) {
  const out: Record<string, any> = {};
  if (!p) return out;
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return out;
}

export const projectsAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    /** GET /admin/projects (prefix '/admin' üstten geliyor, routes bunu içerir) */
    listProjectsAdmin: b.query<Paged<Project>, ListArgs>({
      query: (p) => {
        const params = buildParams(p as any);
        return Object.keys(params).length
          ? { url: routes.admin.projects.list, params }
          : { url: routes.admin.projects.list };
      },
      // Body array + x-total-count header olabilir → tek formata dönüştürelim
      transformResponse: (base, meta): Paged<Project> => {
        // base Array ise header’dan total al, değilse olduğu gibi bırak
        const total = Number(meta?.response?.headers?.get("x-total-count") ?? 0);
        if (Array.isArray(base)) return { items: base as Project[], total: total || (base as any[]).length };
        // {items,total} gelirse dokunma
        if ((base as any)?.items && typeof (base as any)?.total === "number") return base as Paged<Project>;
        // Güvenli fallback
        return { items: [], total: 0 };
      },
      providesTags: ["Projects"],
    }),

    /** GET /admin/projects/:id */
    getProjectAdmin: b.query<Project, { id: string }>({
      query: ({ id }) => ({ url: routes.admin.projects.byId(id) }),
      providesTags: (_r, _e, { id }) => [{ type: "Projects", id }, "Projects"],
    }),

    /** GET /admin/projects/by-slug/:slug (opsiyonel ama backend var) */
    getProjectBySlugAdmin: b.query<Project, { slug: string }>({
      query: ({ slug }) => ({ url: `${routes.admin.projects.list}/by-slug/${encodeURIComponent(slug)}` }),
      providesTags: (_r, _e, { slug }) => [{ type: "Projects", id: `slug:${slug}` }, "Projects"],
    }),

    /** POST /admin/projects */
    createProjectAdmin: b.mutation<{ id: string }, Partial<Project>>({
      query: (body) => ({ url: routes.admin.projects.list, method: "POST", body }),
      invalidatesTags: ["Projects"],
    }),

    /** PATCH /admin/projects/:id  (backend PATCH kullanıyor) */
    updateProjectAdmin: b.mutation<{ ok: true } | Project, { id: string } & Partial<Project>>({
      query: ({ id, ...body }) => ({ url: routes.admin.projects.byId(id), method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Projects", id }, "Projects"],
    }),

    /** DELETE /admin/projects/:id */
    removeProjectAdmin: b.mutation<{ ok: true } | void, { id: string }>({
      query: ({ id }) => ({ url: routes.admin.projects.byId(id), method: "DELETE" }),
      invalidatesTags: ["Projects"],
    }),

    /* ----------------- GALLERY (Admin) ----------------- */

    /** GET /admin/projects/:id/images */
    listProjectImagesAdmin: b.query<ProjectImage[], { projectId: string }>({
      query: ({ projectId }) => ({ url: `${routes.admin.projects.byId(projectId)}/images` }),
      providesTags: (_r, _e, { projectId }) => [{ type: "Projects", id: projectId }, "Projects"],
    }),

    /** POST /admin/projects/:id/images */
    createProjectImageAdmin: b.mutation<ProjectImage, { projectId: string; data: Partial<ProjectImage> }>({
      query: ({ projectId, data }) => ({
        url: `${routes.admin.projects.byId(projectId)}/images`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_r, _e, { projectId }) => [{ type: "Projects", id: projectId }, "Projects"],
    }),

    /** PATCH /admin/projects/:id/images/:imageId */
    updateProjectImageAdmin: b.mutation<ProjectImage, { projectId: string; imageId: string; data: Partial<ProjectImage> }>({
      query: ({ projectId, imageId, data }) => ({
        url: `${routes.admin.projects.byId(projectId)}/images/${imageId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_r, _e, { projectId }) => [{ type: "Projects", id: projectId }, "Projects"],
    }),

    /** DELETE /admin/projects/:id/images/:imageId */
    removeProjectImageAdmin: b.mutation<{ ok: true } | void, { projectId: string; imageId: string }>({
      query: ({ projectId, imageId }) => ({
        url: `${routes.admin.projects.byId(projectId)}/images/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { projectId }) => [{ type: "Projects", id: projectId }, "Projects"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListProjectsAdminQuery,
  useGetProjectAdminQuery,
  useGetProjectBySlugAdminQuery,
  useCreateProjectAdminMutation,
  useUpdateProjectAdminMutation,
  useRemoveProjectAdminMutation,
  useListProjectImagesAdminQuery,
  useCreateProjectImageAdminMutation,
  useUpdateProjectImageAdminMutation,
  useRemoveProjectImageAdminMutation,
} = projectsAdminApi;
