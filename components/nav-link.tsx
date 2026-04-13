"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  icon: string;
  label: string;
  onNavigate?: () => void;
};

export function NavLink({ href, icon, label, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 border-2 px-4 py-3 transition-all ${
        isActive
          ? "border-primary bg-primary/10 text-base-content font-semibold"
          : "border-transparent text-base-content/70 hover:border-base-300 hover:bg-base-200 hover:text-base-content"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center text-lg transition ${
          isActive
            ? "bg-primary text-primary-content"
            : "bg-base-200 text-base-content/70 group-hover:bg-base-300 group-hover:text-base-content"
        }`}
      >
        {icon}
      </span>
      <span className="font-semibold tracking-tight">{label}</span>
    </Link>
  );
}
