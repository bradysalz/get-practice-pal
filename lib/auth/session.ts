import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient, getSupabaseUser } from "@/lib/supabase/server";

export type AuthState = {
  isConfigured: boolean;
  user: User | null;
};

export async function getAuthState(): Promise<AuthState> {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return {
      isConfigured: false,
      user: null,
    };
  }

  return {
    isConfigured: true,
    user: await getSupabaseUser(),
  };
}

export async function requireUser() {
  const auth = await getAuthState();

  if (!auth.isConfigured) {
    throw new Error("Supabase is not configured.");
  }

  if (!auth.user) {
    redirect("/login");
  }

  return auth.user;
}

export async function requireSupabaseClient() {
  const client = await getSupabaseServerClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  return client;
}
