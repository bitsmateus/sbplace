import { notFound } from "next/navigation";
import { getBikeById } from "@/lib/bikes";
import BikeForm from "@/components/admin/BikeForm";

export const dynamic = "force-dynamic";

export default async function EditarBicicletaPage({ params }) {
  const { id } = await params;
  const bike = getBikeById(Number(id));

  if (!bike) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl uppercase tracking-tight">
        Editar bicicleta
      </h1>
      <div className="mt-8">
        <BikeForm bike={bike} />
      </div>
    </div>
  );
}
