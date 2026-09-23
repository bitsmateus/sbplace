import Link from "next/link";
import BikeForm from "@/components/admin/BikeForm";

export default function NovaBicicletaPage() {
  return (
    <div>
      <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-mist transition hover:text-paper">
        ← Voltar para a lista
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Nova bicicleta</h1>
      <p className="mt-1 text-sm text-mist">
        Preencha em ordem. Ela começa como <strong className="text-paper">Oculta</strong> e só aparece no site quando você mudar a situação.
      </p>
      <div className="mt-8">
        <BikeForm />
      </div>
    </div>
  );
}
