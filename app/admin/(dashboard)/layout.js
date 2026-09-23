import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="border-b border-line">
        <div className="container-page flex h-16 items-center justify-between">
          <Link
            href="/admin"
            className="font-display text-lg uppercase tracking-wide"
          >
            SB Place <span className="text-fog">/ admin</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/admin"
              className="text-mist hover:text-paper"
            >
              Bicicletas
            </Link>
            <Link
              href="/admin/configuracoes"
              className="text-mist hover:text-paper"
            >
              Configurações
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-mist hover:text-paper"
            >
              Ver site ↗
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="container-page py-10">{children}</main>
    </div>
  );
}
