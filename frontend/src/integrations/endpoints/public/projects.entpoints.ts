// src/integrations/endpoints/projects.ts

import { baseApi } from "@/integrations/baseApi";
import { routes } from "@/integrations/routes";

export type ProjectCard = { slug: string; title: string; cover_url?: string | null; price_from?: number | null };
export type ProjectDetail = ProjectCard & {
  summary?: string | null;
  body?: string | null;
  gallery?: string[];
  video_url?: string | null;
};

export type ProjectImagePublic = {
  id: string;
  image_url?: string | null;
  image_asset_id?: string | null;
  title?: string | null;
  alt?: string | null;
  caption?: string | null;
  display_order: number;
  is_active: boolean;
};

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    /** GET /projects (public) */
    listProjects: b.query<ProjectCard[], void>({
      query: () => ({ url: routes.projects.list }),
      providesTags: ["Projects"],
    }),

    /** GET /projects/by-slug/:slug (public) */
    getProjectBySlug: b.query<ProjectDetail | null, string>({
      query: (slug) => ({ url: routes.projects.bySlug(slug) }),
      providesTags: (_r, _e, slug) => [{ type: "Projects", id: `slug:${slug}` }, "Projects"],
    }),

    /** GET /projects/:id (public) */
    getProjectById: b.query<ProjectDetail | null, string>({
      query: (id) => ({ url: routes.projects.byId(id) }),
      providesTags: (_r, _e, id) => [{ type: "Projects", id }, "Projects"],
    }),

    /** GET /projects/:id/images (public gallery) */
    listProjectImages: b.query<ProjectImagePublic[], string>({
      query: (projectId) => ({ url: `${routes.projects.byId(projectId)}/images` }),
      providesTags: (_r, _e, projectId) => [{ type: "Projects", id: projectId }, "Projects"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListProjectsQuery,
  useGetProjectBySlugQuery,
  useGetProjectByIdQuery,
  useListProjectImagesQuery,
} = projectsApi;
