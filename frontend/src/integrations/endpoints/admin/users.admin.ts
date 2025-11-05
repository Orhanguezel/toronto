import { baseApi } from "@/integrations/baseApi";
import { routes } from "@/integrations/routes";

export type Role = "admin" | "moderator" | "user";
export type AdminUser = {
  id: string; email: string;
  full_name?: string | null; phone?: string | null;
  email_verified: 0 | 1; is_active: 0 | 1;
  created_at?: string; last_login_at?: string | null; role?: Role;
};

export type ListQuery = {
  q?: string; role?: Role; is_active?: boolean;
  limit?: number; offset?: number;
  sort?: "created_at" | "email" | "last_login_at";
  order?: "asc" | "desc";
};

const buildParams = (p?: Record<string, any>) =>
  Object.fromEntries(Object.entries(p ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== ""));

export const usersAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listAdminUsers: b.query<AdminUser[], ListQuery | void>({
      query: (p) => {
        const params = buildParams(p as Record<string, any>);
        return Object.keys(params).length
          ? { url: routes.admin.users.base, params }
          : { url: routes.admin.users.base };
      },
      providesTags: ["Users"] as const,                             // <<<<< as const
    }),

    getAdminUser: b.query<AdminUser, { id: string }>({
      query: ({ id }) => ({ url: routes.admin.users.byId(id) }),
      providesTags: (_r, _e, { id }) => [{ type: "Users" as const, id }, "Users"] as const,
    }),

    patchAdminUser: b.mutation<{ ok: true; id: string; role?: Role }, { id: string; full_name?: string; phone?: string; is_active?: boolean | 0 | 1 }>({
      query: ({ id, ...body }) => ({ url: routes.admin.users.byId(id), method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Users" as const, id }, "Users"] as const,
    }),

    setAdminUserActive: b.mutation<{ ok: true }, { id: string; is_active: boolean | 0 | 1 }>({
      query: ({ id, ...body }) => ({ url: routes.admin.users.active(id), method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Users" as const, id }, "Users"] as const,
    }),

    setAdminUserRoles: b.mutation<{ ok: true }, { id: string; roles: Role[] }>({
      query: ({ id, ...body }) => ({ url: routes.admin.users.roles(id), method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Users" as const, id }, "Users"] as const,
    }),

    removeAdminUser: b.mutation<{ ok: true }, { id: string }>({
      query: ({ id }) => ({ url: routes.admin.users.byId(id), method: "DELETE" }),
      invalidatesTags: ["Users"] as const,
    }),
  }),
});

export const {
  useListAdminUsersQuery,
  useGetAdminUserQuery,
  usePatchAdminUserMutation,
  useSetAdminUserActiveMutation,
  useSetAdminUserRolesMutation,
  useRemoveAdminUserMutation,
} = usersAdminApi;
