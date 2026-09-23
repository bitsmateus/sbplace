import Link from "next/link";
import { notFound } from "next/navigation";
import { getBikeById } from "@/lib/bikes";
import BikeForm from "@/components/admin/BikeForm";

export const dynamic = "force-dynamic";

export default async function EditarBicicletaPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const initialFlash = sp?.criada
    ? "Bicicleta cadastrada! Agora ela já pode ser editada."
    : sp?.duplicada
      ? "Cópia criada como Oculta. Ajuste os dados e mude a situação para publicar."
      : "";
  const bike = getBikeById(Number(id));

  if (!bike) notFound();

  return (
    <div>
      <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-mist transition hover:text-paper">
        ← Voltar para a lista
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{bike.name}</h1>
      <p className="mt-1 text-sm text-mist">Editar bicicleta</p>
      <div className="mt-8">
        {/* key: ao trocar de bike, o formulário recomeça com os dados dela */}
        <BikeForm key={bike.id} bike={bike} initialFlash={initialFlash} />
      </div>
    </div>
  );
}
