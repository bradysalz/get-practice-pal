export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    url,
    anonKey,
    siteUrl,
    isConfigured: Boolean(url && anonKey),
  };
}
