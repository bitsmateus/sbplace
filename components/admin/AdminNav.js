"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const LINKS = [
  { href: "/admin", label: "Início", match: (p) => p === "/admin" },
  { href: "/admin/bicicletas", label: "Bicicletas", match: (p) => p.startsWith("/admin/bicicletas") },
  { href: "/admin/pedidos", label: "Pedidos", match: (p) => p.startsWith("/admin/pedidos") },
  { href: "/admin/links", label: "Links", match: (p) => p.startsWith("/admin/links") },
  { href: "/admin/equipe", label: "Equipe", match: (p) => p.startsWith("/admin/equipe") },
  { href: "/admin/configuracoes", label: "Configurações", match: (p) => p.startsWith("/admin/configuracoes") },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 flex w-[calc(100%+2rem)] items-center gap-1 overflow-x-auto whitespace-nowrap px-4 text-sm lg:mx-0 lg:w-auto lg:overflow-visible lg:px-0 sm:gap-2">
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
