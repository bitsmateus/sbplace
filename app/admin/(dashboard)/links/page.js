import LinksManager from "@/components/admin/LinksManager";
import { effectiveLink, listLinks } from "@/lib/links";
import { isRedeConfigured } from "@/lib/rede";

export const dynamic = "force-dynamic";

export const metadata = { title: "Links de pagamento — painel SB Place" };

export default function LinksPage() {
  const links = listLinks().map(effectiveLink);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Links de pagamento</h1>
      <p className="mt-1 max-w-xl text-sm text-mist">
        Gere um link com o valor combinado e mande para o cliente pagar no cartão. Cada link vale para
        um pagamento só e, quando pago, aparece em Pedidos.
      </p>
      <div className="mt-8">
        <LinksManager links={links} redeReady={isRedeConfigured()} />
      </div>
    </div>
  );
}
