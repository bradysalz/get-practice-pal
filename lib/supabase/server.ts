import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

export async function getSupabaseUser() {
  const client = await getSupabaseServerClient();

  if (!client) {
    return null;
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  return user;
}
