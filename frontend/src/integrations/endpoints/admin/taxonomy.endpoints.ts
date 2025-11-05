import { baseApi } from "@/integrations/baseApi";
import { routes } from "@/integrations/routes";

export const taxonomyAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listCategoriesAdmin: b.query<{ id: string; slug: string; title: string }[], void>({
      query: () => ({ url: routes.admin.taxonomy.categories }),
      providesTags: ["ProjectsFilters"],
    }),
    listTagsAdmin: b.query<{ id: string; slug: string; title: string }[], void>({
      query: () => ({ url: routes.admin.taxonomy.tags }),
      providesTags: ["ProjectsFilters"],
    }),
    getProjectTaxonomy: b.query<{ categories: string[]; tags: string[] }, { id: string }>({
      query: ({ id }) => ({ url: routes.admin.projects.taxonomy(id) }),
      providesTags: ["Projects", "ProjectsFilters"],
    }),
    setProjectTaxonomy: b.mutation<{ ok: true }, { id: string; categories: string[]; tags: string[] }>({
      query: ({ id, categories, tags }) => ({
        url: routes.admin.projects.taxonomy(id),
        method: "PUT",
        body: { categories, tags },
      }),
      invalidatesTags: ["Projects", "ProjectsFilters"],
    }),
  }),
});

export const {
  useListCategoriesAdminQuery,
  useListTagsAdminQuery,
  useGetProjectTaxonomyQuery,
  useSetProjectTaxonomyMutation,
} = taxonomyAdminApi;
