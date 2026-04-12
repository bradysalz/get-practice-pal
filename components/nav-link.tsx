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
      className={`group flex items-center gap-3 rounded-[1.15rem] border px-4 py-3 transition ${
        isActive
          ? "border-primary/20 bg-primary/8 text-base-content"
          : "border-transparent text-base-content/75 hover:border-base-300/70 hover:bg-base-200/85 hover:text-base-content"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
          isActive
            ? "bg-primary text-primary-content"
            : "bg-base-200 text-base-content/75 group-hover:bg-white group-hover:text-primary"
        }`}
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
