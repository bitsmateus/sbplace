"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, CATEGORIES } from "@/lib/bike-constants";

function categoryLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label || value;
}

export default function AdminBikesTable({ bikes }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await fetch(`/api/admin/bikes/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-line bg-ink-soft text-xs uppercase tracking-wide text-fog">
          <tr>
            <th className="px-5 py-3">Bicicleta</th>
            <th className="px-5 py-3">Categoria</th>
            <th className="px-5 py-3">Preço</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Destaque</th>
            <th className="px-5 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {bikes.map((bike) => (
            <tr key={bike.id} className="border-b border-line last:border-0">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-soft">
                    {bike.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/uploads/${bike.images[0]}`}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <span className="font-medium text-paper">{bike.name}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-mist">
                {categoryLabel(bike.category)}
                {bike.condition === "seminova" && (
                  <span className="ml-2 rounded-full bg-[#CDAA5E] px-2 py-0.5 text-[10px] font-semibold uppercase text-ink">
                    Seminova
                  </span>
                )}
              </td>
              <td className="px-5 py-4 text-mist">
                {formatPrice(bike.priceCents)}
              </td>
              <td className="px-5 py-4">
                <StatusPill status={bike.status} />
              </td>
              <td className="px-5 py-4 text-mist">
                {bike.featured ? "Sim" : "—"}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/bicicletas/${bike.id}`}
                    className="text-mist hover:text-paper"
                  >
                    Editar
                  </Link>
                  {confirmId === bike.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(bike.id)}
                        disabled={deletingId === bike.id}
                        className="text-accent hover:text-accent-dark"
                      >
                        {deletingId === bike.id ? "..." : "Confirmar"}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-fog hover:text-mist"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(bike.id)}
                      className="text-fog hover:text-accent"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STATUS_STYLES = {
  disponivel: "text-paper",
  reservada: "text-accent",
  vendida: "text-fog",
};

const STATUS_LABELS = {
  disponivel: "Disponível",
  reservada: "Reservada",
  vendida: "Vendida",
};

function StatusPill({ status }) {
  return (
    <span className={`text-sm ${STATUS_STYLES[status] || "text-mist"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
