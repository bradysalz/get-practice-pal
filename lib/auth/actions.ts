"use server";

import { redirect } from "next/navigation";
import { requireSupabaseClient } from "@/lib/auth/session";
import { getSiteUrl } from "@/lib/utils/site-url";

function isDevPasswordLoginEnabled() {
  return process.env.ENABLE_DEV_PASSWORD_LOGIN === "true";
}

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

export async function signInWithPasswordAction(formData: FormData) {
  if (!isDevPasswordLoginEnabled()) {
    redirect("/login?error=Password%20login%20is%20disabled");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email%20and%20password%20are%20required");
  }

  const client = await requireSupabaseClient();
  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/sessions");
}

export async function signUpWithPasswordAction(formData: FormData) {
  if (!isDevPasswordLoginEnabled()) {
    redirect("/login?error=Password%20login%20is%20disabled");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email%20and%20password%20are%20required");
  }

  const client = await requireSupabaseClient();
  const siteUrl = await getSiteUrl();
  const { error, data } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/sessions`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    redirect("/sessions");
  }

  redirect(
    `/login?success=${encodeURIComponent(
      "Password account created. If Supabase requires confirmation, check your email once before using password login.",
    )}`,
  );
}
