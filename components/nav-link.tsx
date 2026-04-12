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
      className={`flex items-center gap-3 rounded-[1.15rem] px-4 py-3 transition ${
        isActive
          ? "bg-primary text-primary-content shadow-sm"
          : "text-base-content/75 hover:bg-base-200 hover:text-base-content"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
