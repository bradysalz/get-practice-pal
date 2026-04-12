import { headers } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function getSiteUrl() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const host = headerStore.get("host");
  const { siteUrl } = getSupabaseEnv();

  if (forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }

  if (host) {
    return `${host.includes("localhost") ? "http" : "https"}://${host}`;
  }

  if (siteUrl) {
    return siteUrl;
  }

  return "http://localhost:3000";
}
