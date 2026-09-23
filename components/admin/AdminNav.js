"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const LINKS = [
  { href: "/admin", label: "Bicicletas", match: (p) => p === "/admin" || p.startsWith("/admin/bicicletas") },
  { href: "/admin/configuracoes", label: "Configurações", match: (p) => p.startsWith("/admin/configuracoes") },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 text-sm sm:gap-2">
      {LINKS.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-2 transition sm:px-4 ${
              active
                ? "bg-paper/10 font-semibold text-paper"
                : "text-mist hover:text-paper"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
      <Link
        href="/"
        target="_blank"
        className="hidden rounded-full px-4 py-2 text-mist transition hover:text-paper sm:block"
      >
        Ver site ↗
      </Link>
      <LogoutButton />
    </nav>
  );
}
