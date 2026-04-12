"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { NavLink } from "@/components/nav-link";
import { navigationItems } from "@/lib/navigation";

export function AppShell({ children }: { children: ReactNode }) {
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
          <div className="flex h-full flex-col rounded-[2rem] border border-base-300/70 bg-base-100/92 p-5 shadow-sm backdrop-blur md:sticky md:top-6 md:min-h-[calc(100vh-3rem)]">
            <Link href="/sessions" className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">
                PracticePal
              </p>
              <h1 className="text-2xl font-semibold text-base-content">Practice-first tracking</h1>
            </Link>
            <p className="mt-3 text-sm leading-6 text-base-content/70">
              A focused shell for sessions, setlists, library structure, and progress.
            </p>
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
            <div className="mt-auto rounded-[1.5rem] bg-secondary/10 p-4 text-sm leading-6 text-base-content/80">
              Active session recovery, auth, and persistent user state will slot into this shell next.
            </div>
          </div>
        </aside>
        <main className="flex-1 md:pl-0">
          <div className="mb-4 flex items-center justify-between rounded-[1.5rem] border border-base-300/70 bg-base-100/75 px-4 py-3 shadow-sm backdrop-blur md:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
                PracticePal
              </p>
              <p className="text-sm text-base-content/70">Menu-based side rail</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm rounded-xl border border-base-300"
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
