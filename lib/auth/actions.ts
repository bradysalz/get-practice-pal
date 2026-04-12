"use server";

import { redirect } from "next/navigation";
import { requireSupabaseClient } from "@/lib/auth/session";
import { getSiteUrl } from "@/lib/utils/site-url";

export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect("/login?error=missing-email");
  }

  const client = await requireSupabaseClient();
  const siteUrl = await getSiteUrl();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/sessions`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/login?success=${encodeURIComponent(`Magic link sent to ${email}`)}`);
}
