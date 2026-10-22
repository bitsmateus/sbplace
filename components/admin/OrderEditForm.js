"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCpf, formatPhone, onlyDigits } from "@/lib/order-constants";

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-mist focus:outline-none";
const ghostBtn =
  "inline-flex h-11 items-center justify-center rounded-full border border-line px-6 text-sm text-mist transition hover:text-paper disabled:opacity-50";

function formatCep(value) {
  const d = onlyDigits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

// Edição dos dados do cliente e do endereço de entrega. Valor, bike e
// pagamento não mudam (vêm da cobrança na Rede).
export default function OrderEditForm({ order }) {
  const router = useRouter();
  const hasAddress = Boolean(order.address?.street);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState(() => ({
    name: order.customer.name || "",
    cpf: formatCpf(order.customer.cpf || ""),
    email: order.customer.email || "",
    phone: formatPhone(order.customer.phone || ""),
    cep: formatCep(order.address?.cep || ""),
    street: order.address?.street || "",
    number: order.address?.number || "",
    complement: order.address?.complement || "",
    district: order.address?.district || "",
    city: order.address?.city || "",
    state: order.address?.state || "",
  }));

  function set(field, value) {
    setF((prev) => ({ ...prev, [field]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          customer: { name: f.name, cpf: f.cpf, email: f.email, phone: f.phone },
          address: {
            cep: f.cep, street: f.street, number: f.number, complement: f.complement,
            district: f.district, city: f.city, state: f.state,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <section className="rounded-xl border border-line bg-ink-soft p-5">
        <h2 className="font-semibold text-paper">Editar dados</h2>
        <p className="mt-1 text-sm text-mist">Corrija nome, contato ou endereço de entrega do cliente.</p>
        <button type="button" onClick={() => setOpen(true)} className={`${ghostBtn} mt-3`}>
          Editar cliente e endereço
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-line bg-ink-soft p-5">
      <h2 className="font-semibold text-paper">Editar dados</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-fog sm:col-span-2">
          Nome
          <input className={inputClass} value={f.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label className="block text-xs text-fog">
          CPF
          <input className={inputClass} value={f.cpf} onChange={(e) => set("cpf", formatCpf(e.target.value))} />
        </label>
        <label className="block text-xs text-fog">
          Telefone
          <input className={inputClass} value={f.phone} onChange={(e) => set("phone", formatPhone(e.target.value))} />
        </label>
        <label className="block text-xs text-fog sm:col-span-2">
          E-mail
          <input className={inputClass} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} />
        </label>
      </div>

      <div className="border-t border-line pt-4">
        <p className="text-xs uppercase tracking-wide text-fog">
          Endereço de entrega{hasAddress ? "" : " (opcional)"}
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-6">
          <label className="block text-xs text-fog sm:col-span-2">
            CEP
            <input className={inputClass} value={f.cep} onChange={(e) => set("cep", formatCep(e.target.value))} />
          </label>
          <label className="block text-xs text-fog sm:col-span-4">
            Rua
            <input className={inputClass} value={f.street} onChange={(e) => set("street", e.target.value)} />
          </label>
          <label className="block text-xs text-fog sm:col-span-2">
            Número
            <input className={inputClass} value={f.number} onChange={(e) => set("number", e.target.value)} />
          </label>
          <label className="block text-xs text-fog sm:col-span-4">
            Complemento
            <input className={inputClass} value={f.complement} onChange={(e) => set("complement", e.target.value)} />
          </label>
          <label className="block text-xs text-fog sm:col-span-3">
            Bairro
            <input className={inputClass} value={f.district} onChange={(e) => set("district", e.target.value)} />
          </label>
          <label className="block text-xs text-fog sm:col-span-2">
            Cidade
            <input className={inputClass} value={f.city} onChange={(e) => set("city", e.target.value)} />
          </label>
          <label className="block text-xs text-fog sm:col-span-1">
            UF
            <input className={inputClass} maxLength={2} value={f.state} onChange={(e) => set("state", e.target.value.toUpperCase())} />
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center justify-center rounded-full bg-paper px-6 text-sm font-semibold text-ink transition hover:bg-gold disabled:opacity-50"
        >
          {busy ? "Salvando..." : "Salvar alterações"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={ghostBtn}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
