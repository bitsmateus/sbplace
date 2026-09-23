import BikeForm from "@/components/admin/BikeForm";

export default function NovaBicicletaPage() {
  return (
    <div>
      <h1 className="font-display text-3xl uppercase tracking-tight">
        Nova bicicleta
      </h1>
      <div className="mt-8">
        <BikeForm />
      </div>
    </div>
  );
}
