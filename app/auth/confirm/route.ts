import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const client = await getSupabaseServerClient();

  if (!client) {
    return NextResponse.redirect(new URL("/login?error=Supabase%20is%20not%20configured", request.url));
  }

  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") ?? "/sessions";
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const code = requestUrl.searchParams.get("code");

  if (tokenHash && type) {
    const { error } = await client.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=Magic%20link%20confirmation%20failed", request.url));
}
