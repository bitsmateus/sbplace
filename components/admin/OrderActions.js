"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-mist focus:outline-none";
const primaryBtn =
  "inline-flex h-11 items-center justify-center rounded-full bg-paper px-6 text-sm font-semibold text-ink transition hover:bg-gold disabled:opacity-50";
const ghostBtn =
  "inline-flex h-11 items-center justify-center rounded-full border border-line px-6 text-sm text-mist transition hover:text-paper disabled:opacity-50";

// Ações do pedido no painel: conferir pagamento, enviar, entregar, cancelar e
// anotações internas.
export default function OrderActions({ order }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [carrier, setCarrier] = useState(order.shipping?.carrier || "");
  const [trackingCode, setTrackingCode] = useState(order.shipping?.trackingCode || "");
  const [notes, setNotes] = useState(order.notes || "");
  const [reason, setReason] = useState("");
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  async function send(body) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar.");
      setConfirmingCancel(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const { status } = order;
  const canShip = status === "pago" || status === "enviado";
  const canCancel = status !== "cancelado" && status !== "entregue";

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {(status === "verificar_pagamento" || status === "aguardando_pagamento") && (
        <section className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-5">
          <h2 className="font-semibold text-amber-200">Conferir pagamento</h2>
          <p className="mt-1 text-sm text-amber-100/80">
            Não recebemos uma resposta definitiva da Rede. Consulte a cobrança pela referência do
            pedido (ou confira no portal da Rede antes de enviar qualquer coisa).
          </p>
          <button type="button" disabled={busy} onClick={() => send({ action: "recheck" })} className={`${primaryBtn} mt-4`}>
            {busy ? "Consultando..." : "Consultar na Rede"}
          </button>
        </section>
      )}

      {canShip && (
        <section className="rounded-xl border border-line bg-ink-soft p-5">
          <h2 className="font-semibold text-paper">
            {status === "enviado" ? "Dados do envio" : "Marcar como enviado"}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-fog">
              Transportadora / serviço
              <input
                className={`${inputClass} mt-1`}
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="Ex: Correios SEDEX, Jadlog"
              />
            </label>
            <label className="block text-xs text-fog">
              Código de rastreio
              <input
                className={`${inputClass} mt-1`}
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Opcional"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => send({ action: "ship", carrier, trackingCode })}
            className={`${primaryBtn} mt-4`}
          >
            {status === "enviado" ? "Salvar dados do envio" : "Marcar como enviado"}
          </button>
        </section>
      )}

      {status === "enviado" && (
        <section className="rounded-xl border border-line bg-ink-soft p-5">
          <h2 className="font-semibold text-paper">Entrega</h2>
          <p className="mt-1 text-sm text-mist">Quando o cliente receber a bike, finalize o pedido.</p>
          <button type="button" disabled={busy} onClick={() => send({ action: "deliver" })} className={`${primaryBtn} mt-4`}>
            Marcar como entregue
          </button>
        </section>
      )}

      <section className="rounded-xl border border-line bg-ink-soft p-5">
        <h2 className="font-semibold text-paper">Anotações internas</h2>
        <textarea
          className={`${inputClass} mt-3 min-h-24`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Só a equipe vê isto."
        />
        <button type="button" disabled={busy} onClick={() => send({ action: "notes", notes })} className={`${ghostBtn} mt-3`}>
          Salvar anotações
        </button>
      </section>

      {canCancel && (
        <section className="rounded-xl border border-red-400/30 p-5">
          <h2 className="font-semibold text-red-300">Cancelar pedido</h2>
          {!confirmingCancel ? (
            <button type="button" onClick={() => setConfirmingCancel(true)} className={`${ghostBtn} mt-3`}>
              Cancelar este pedido...
            </button>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-mist">
                A bike volta para o catálogo como <strong>disponível</strong>.{" "}
                {status === "pago" || status === "enviado" ? (
                  <strong className="text-red-300">
                    O dinheiro NÃO é devolvido automaticamente: faça o estorno no portal da Rede.
                  </strong>
                ) : null}
              </p>
              <input
                className={inputClass}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo (opcional)"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => send({ action: "cancel", reason })}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-red-500 px-6 text-sm font-semibold text-paper transition hover:bg-red-400 disabled:opacity-50"
                >
                  Confirmar cancelamento
                </button>
                <button type="button" onClick={() => setConfirmingCancel(false)} className={ghostBtn}>
                  Voltar
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
