import Link from "next/link";
import { notFound } from "next/navigation";
import OrderActions from "@/components/admin/OrderActions";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { getOrderById, orderCode } from "@/lib/orders";
import { formatCpf, formatPhone, orderStatusLabel } from "@/lib/order-constants";
import { formatPrice } from "@/lib/bike-constants";
import { uploadUrl } from "@/lib/uploads";

export const dynamic = "force-dynamic";

function formatDate(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function formatCep(cep) {
  return cep ? `${cep.slice(0, 5)}-${cep.slice(5)}` : "";
}

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-fog">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-paper">{children || "—"}</dd>
    </div>
  );
}

export default async function PedidoPage({ params }) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) notFound();

  const { customer, address, payment, shipping } = order;
  const phoneDigits = customer.phone.length <= 11 ? `55${customer.phone}` : customer.phone;

  return (
    <div>
      <Link href="/admin/pedidos" className="text-sm text-mist transition hover:text-paper">
        ← Pedidos
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Pedido {orderCode(order)}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-mist">Feito em {formatDate(order.createdAt)}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <section className="flex gap-4 rounded-xl border border-line bg-ink-soft p-5">
            {order.bikeImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={uploadUrl(order.bikeImage, 160)}
                alt=""
                className="h-24 w-24 shrink-0 rounded-lg bg-ink object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-fog">
                {order.source === "link" ? "Link de pagamento" : "Bike"}
              </p>
              {order.bikeSlug ? (
                <Link href={`/bicicletas/${order.bikeSlug}`} target="_blank" className="font-semibold text-paper hover:text-gold">
                  {order.bikeName} ↗
                </Link>
              ) : (
                <p className="font-semibold text-paper">{order.bikeName}</p>
              )}
              <p className="mt-2 text-lg font-semibold text-paper">{formatPrice(order.amountCents)}</p>
              <p className="text-sm text-mist">
                {order.installments}x de {formatPrice(order.installmentValueCents)} no cartão
                {order.source === "link" ? "" : " · frete grátis"}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-ink-soft p-5">
            <h2 className="font-semibold text-paper">Cliente</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nome">{customer.name}</Field>
              <Field label="CPF">{formatCpf(customer.cpf)}</Field>
              <Field label="E-mail">
                <a href={`mailto:${customer.email}`} className="hover:text-gold">{customer.email}</a>
              </Field>
              <Field label="Telefone">
                <a
                  href={`https://wa.me/${phoneDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold"
                >
                  {formatPhone(customer.phone)} ↗
                </a>
              </Field>
            </dl>
          </section>

          {address.street && (
          <section className="rounded-xl border border-line bg-ink-soft p-5">
            <h2 className="font-semibold text-paper">Entrega</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Endereço">
                {address.street}, {address.number}
                {address.complement ? ` — ${address.complement}` : ""}
              </Field>
              <Field label="Bairro">{address.district}</Field>
              <Field label="Cidade / UF">
                {address.city} / {address.state}
              </Field>
              <Field label="CEP">{formatCep(address.cep)}</Field>
              {shipping.carrier && <Field label="Transportadora">{shipping.carrier}</Field>}
              {shipping.trackingCode && <Field label="Rastreio">{shipping.trackingCode}</Field>}
            </dl>
          </section>
          )}

          <section className="rounded-xl border border-line bg-ink-soft p-5">
            <h2 className="font-semibold text-paper">Pagamento (Rede)</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Forma">Cartão de crédito {payment.cardLast4 ? `final ${payment.cardLast4}` : ""}</Field>
              <Field label="Referência">{orderCode(order)}</Field>
              <Field label="TID">{payment.tid}</Field>
              <Field label="NSU">{payment.nsu}</Field>
              <Field label="Autorização">{payment.authorizationCode}</Field>
              <Field label="Retorno">
                {payment.returnCode ? `${payment.returnCode} — ${payment.returnMessage || ""}` : ""}
              </Field>
            </dl>
          </section>

          <section className="rounded-xl border border-line bg-ink-soft p-5">
            <h2 className="font-semibold text-paper">Histórico</h2>
            <ol className="mt-4 space-y-3 border-l border-line pl-4">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="text-sm">
                  <p className="text-paper">{h.text}</p>
                  <p className="text-xs text-fog">
                    {orderStatusLabel(h.status)} · {formatDate(h.at)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <OrderActions order={order} />
      </div>
    </div>
  );
}
