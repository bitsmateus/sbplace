import Link from "next/link";
import Logo from "@/components/Logo";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-ink/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo className="h-10" />
            <span className="hidden text-sm text-fog sm:inline">/ painel</span>
          </Link>
          <AdminNav />
        </div>
      </header>
      <main className="container-page py-8 md:py-10">{children}</main>
    </div>
  );
}
