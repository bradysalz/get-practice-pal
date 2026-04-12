import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getAuthState } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthState();

  if (auth.isConfigured && !auth.user) {
    redirect("/login");
  }

  return (
    <AppShell
      authConfigured={auth.isConfigured}
      userEmail={auth.user?.email ?? null}
    >
      {children}
    </AppShell>
  );
}
