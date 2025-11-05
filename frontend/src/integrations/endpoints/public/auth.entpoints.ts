// src/integrations/endpoints/public/auth.entpoints.ts

import { baseApi } from "@/integrations/baseApi";
import { routes } from "@/integrations/routes";

export type Role = "admin" | "moderator" | "user";
export type AuthUser = {
  id: string; email: string;
  full_name?: string | null; phone?: string | null;
  email_verified?: number | boolean; is_active?: number | boolean; role?: Role;
};
export type TokenResponse = { access_token: string; token_type: "bearer"; user: AuthUser };
export type MeResponse = { user: { id: string; email: string | null; role: Role } };
export type StatusResponse = { authenticated: boolean; is_admin: boolean; user?: { id: string; email: string | null; role: Role } };
export type GoogleStartResponse = { url: string };

export type SignupBody = {
  email: string; password: string; full_name?: string; phone?: string;
  options?: { emailRedirectTo?: string; data?: { full_name?: string; phone?: string } };
};
export type PasswordGrantBody = { grant_type: "password"; email: string; password: string };
export type UpdateBody = { email?: string; password?: string };
export type GoogleBody = { id_token: string };

export const authApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    signup: b.mutation<TokenResponse, SignupBody>({
      query: (body) => ({ url: routes.auth.v1.signup, method: "POST", body }),
      invalidatesTags: ["Auth"] as const,                    // <<<<< as const
    }),
    passwordLogin: b.mutation<TokenResponse, PasswordGrantBody>({
      query: (body) => ({ url: routes.auth.v1.token, method: "POST", body }),
      invalidatesTags: ["Auth"] as const,
    }),
    refresh: b.mutation<{ access_token: string; token_type: "bearer" }, void>({
      query: () => ({ url: routes.auth.v1.refresh, method: "POST" }),
      invalidatesTags: ["Auth"] as const,
    }),
    googleLogin: b.mutation<TokenResponse, GoogleBody>({
      query: (body) => ({ url: routes.auth.v1.google, method: "POST", body }),
      invalidatesTags: ["Auth"] as const,
    }),
    googleStart: b.mutation<GoogleStartResponse, { redirectTo?: string } | void>({
      query: (body) => ({ url: routes.auth.v1.googleStart, method: "POST", body }),
    }),
    me: b.query<MeResponse, void>({
      query: () => ({ url: routes.auth.v1.user }),
      providesTags: ["Auth"] as const,
    }),
    status: b.query<StatusResponse, void>({
      query: () => ({ url: routes.auth.v1.status }),
      providesTags: ["Auth"] as const,
    }),
    updateProfile: b.mutation<MeResponse, UpdateBody>({
      query: (body) => ({ url: routes.auth.v1.user, method: "PUT", body }),
      invalidatesTags: ["Auth"] as const,
    }),
    logout: b.mutation<void, void>({
      query: () => ({ url: routes.auth.v1.logout, method: "POST" }),
      invalidatesTags: ["Auth"] as const,
    }),
  }),
});

export const {
  useSignupMutation,
  usePasswordLoginMutation,
  useRefreshMutation,
  useGoogleLoginMutation,
  useGoogleStartMutation,
  useMeQuery,
  useStatusQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
} = authApi;
