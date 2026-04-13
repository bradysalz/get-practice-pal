"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { NavLink } from "@/components/nav-link";
import { navigationItems } from "@/lib/navigation";

type AppShellProps = {
  authConfigured: boolean;
  children: ReactNode;
  userEmail: string | null;
};

export function AppShell({ authConfigured, children, userEmail }: AppShellProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[var(--page-max-width)] px-4 py-4 md:gap-6 md:px-6 md:py-6">
        <div
          className={`fixed inset-0 z-40 bg-neutral/35 transition md:hidden ${
            isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />
        <aside
          className={`fixed inset-y-4 left-4 z-50 w-[min(20rem,calc(100vw-2rem))] transition md:static md:z-auto md:block md:w-72 ${
            isOpen ? "translate-x-0" : "-translate-x-[120%] md:translate-x-0"
          }`}
        >
          <div className="app-shell-surface flex h-full flex-col p-5 md:sticky md:top-6 md:min-h-[calc(100vh-3rem)]">
            <Link href="/sessions" className="space-y-1">
              <p className="eyebrow">PracticePal</p>
              <h1 className="font-display text-3xl font-semibold text-base-content">Practice tracking</h1>
            </Link>
            <nav className="mt-8 flex flex-col gap-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  onNavigate={() => setIsOpen(false)}
                />
              ))}
            </nav>
            <div className="mt-auto space-y-4">
              <div className="border-2 border-base-300 bg-base-200 p-4 text-sm leading-6 font-medium text-base-content/80">
                {authConfigured
                  ? userEmail ?? "Signed in"
                  : "Supabase is not configured yet."}
              </div>
              {authConfigured && userEmail ? (
                <form action="/auth/signout" method="post">
                  <button className="btn btn-ghost w-full justify-start border-base-300/80">
                    Sign out
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </aside>
        <main className="flex-1 md:pl-0">
          <div className="app-shell-surface mb-4 flex items-center justify-between px-4 py-3 md:hidden">
            <div>
              <p className="eyebrow">PracticePal</p>
              <p className="text-sm text-base-content/70">Responsive side rail</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm border-base-300/80"
              onClick={() => setIsOpen((open) => !open)}
            >
              {isOpen ? "Close" : "Menu"}
            </button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
