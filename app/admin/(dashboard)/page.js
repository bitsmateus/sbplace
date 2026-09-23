import Link from "next/link";
import { listBikes } from "@/lib/bikes";
import AdminBikesTable from "@/components/admin/AdminBikesTable";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  const bikes = listBikes({});

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-tight">
            Bicicletas
          </h1>
          <p className="mt-1 text-sm text-mist">
            {bikes.length} {bikes.length === 1 ? "cadastrada" : "cadastradas"}
          </p>
        </div>
        <Link
          href="/admin/bicicletas/nova"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-accent-dark"
        >
          + Nova bicicleta
        </Link>
      </div>

      <div className="mt-8">
        {bikes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-12 text-center text-mist">
            Nenhuma bicicleta cadastrada ainda. Clique em &ldquo;Nova
            bicicleta&rdquo; pra começar.
          </div>
        ) : (
          <AdminBikesTable bikes={bikes} />
        )}
      </div>
    </div>
  );
}
