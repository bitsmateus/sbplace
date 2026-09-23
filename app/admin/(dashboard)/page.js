import Link from "next/link";
import { listBikes } from "@/lib/bikes";
import BikesManager from "@/components/admin/BikesManager";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  const bikes = listBikes({});

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Bicicletas</h1>
          <p className="mt-1 text-sm text-mist">
            Cadastre, edite e organize as bikes que aparecem no site.
          </p>
        </div>
        <Link
          href="/admin/bicicletas/nova"
          className="inline-flex h-12 items-center justify-center rounded-full bg-paper px-7 text-sm font-semibold text-ink transition hover:bg-gold"
        >
          + Nova bicicleta
        </Link>
      </div>

      <div className="mt-8">
        <BikesManager bikes={bikes} />
      </div>
    </div>
  );
}
