"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/bike-constants";
import { LINK_STATUS, MAX_LINK_INSTALLMENTS } from "@/lib/link-status";
import { formatPhone, onlyDigits } from "@/lib/order-constants";

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-mist focus:outline-none";
const primaryBtn =
  "inline-flex h-11 items-center justify-center rounded-full bg-paper px-6 text-sm font-semibold text-ink transition hover:bg-gold disabled:opacity-50";
const ghostBtn =
  "inline-flex h-9 items-center justify-center rounded-full border border-line px-4 text-xs text-mist transition hover:text-paper disabled:opacity-50";

const TONES = {
  ok: "border-emerald-400/60 bg-emerald-400/10 text-emerald-300",
  alert: "border-amber-400/60 bg-amber-400/10 text-amber-300",
  done: "border-gold/60 bg-gold/10 text-gold",
  wait: "border-line text-mist",
  bad: "border-red-400/60 bg-red-400/10 text-red-300",
};

// "1.234,56" / "1234.5" / "R$ 99" -> centavos
function parseMoney(text) {
  let s = String(text).replace(/[^\d.,]/g, "");
  if (!s) return 0;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function whatsappShare(link, url) {
  const phone = link.customerPhone;
  const full = phone && phone.length <= 11 ? `55${phone}` : phone;
  const text = `Olá${link.customerName ? `, ${link.customerName.split(" ")[0]}` : ""}! Segue o link para pagamento (${link.description} — ${formatPrice(link.amountCents)}):\n${url}`;
  return `https://wa.me/${full || ""}?text=${encodeURIComponent(text)}`;
}

function LinkRow({ link, onCancel, busy }) {
  const [copied, setCopied] = useState(false);
  const status = LINK_STATUS.find((s) => s.value === link.effectiveStatus);
  const url = typeof window !== "undefined" ? `${window.location.origin}/pagar/${link.token}` : "";
  const usable = link.effectiveStatus === "ativo";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  return (
    <li className="rounded-xl border border-line bg-ink-soft p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-paper">{link.description}</p>
          <p className="mt-0.5 text-sm text-mist">
            {formatPrice(link.amountCents)} · até {link.maxInstallments}x
            {link.customerName ? ` · ${link.customerName}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-fog">
            Criado em {formatDate(link.createdAt)}
            {link.expiresAt ? ` · válido até ${formatDate(link.expiresAt)}` : " · sem validade"}
            {link.requireAddress ? " · pede endereço de entrega" : ""}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${TONES[status?.tone] || TONES.wait}`}
        >
          {status?.label || link.effectiveStatus}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {usable && (
          <>
            <button type="button" onClick={copy} className={ghostBtn}>
              {copied ? "Copiado!" : "Copiar link"}
            </button>
            <a href={whatsappShare(link, url)} target="_blank" rel="noopener noreferrer" className={ghostBtn}>
              Enviar por WhatsApp
            </a>
            <button type="button" disabled={busy} onClick={() => onCancel(link)} className={ghostBtn}>
              Cancelar link
            </button>
          </>
        )}
        {link.orderId && (
          <Link href={`/admin/pedidos/${link.orderId}`} className={ghostBtn}>
            Ver pedido
          </Link>
        )}
        {link.effectiveStatus === "em_uso" && (
          <Link href="/admin/pedidos?status=verificar_pagamento" className={ghostBtn}>
            Ver pedidos a conferir
          </Link>
        )}
        {link.effectiveStatus === "expirado" && (
          <button type="button" disabled={busy} onClick={() => onCancel(link)} className={ghostBtn}>
            Desativar
          </button>
        )}
      </div>
    </li>
  );
}

// Criação de links de pagamento manuais e lista dos já criados.
export default function LinksManager({ links, redeReady }) {
  const router = useRouter();
  const [form, setForm] = useState({
    description: "",
    amount: "",
    maxInstallments: "12",
    customerName: "",
    customerPhone: "",
    requireAddress: false,
    expiresInDays: "7",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreated(null);
    const amountCents = parseMoney(form.amount);
    if (amountCents < 100) {
      setError("Informe o valor (mínimo R$ 1,00).");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          amountCents,
          maxInstallments: Number(form.maxInstallments),
          customerName: form.customerName,
          customerPhone: onlyDigits(form.customerPhone),
          requireAddress: form.requireAddress,
          expiresInDays: Number(form.expiresInDays),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível criar o link.");
      setCreated(data.link);
      setForm((prev) => ({ ...prev, description: "", amount: "", customerName: "", customerPhone: "" }));
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel(link) {
    if (!window.confirm(`Cancelar o link "${link.description}"? Quem abrir não conseguirá pagar.`)) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/links/${link.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível cancelar.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const createdUrl = created ? `${window.location.origin}/pagar/${created.token}` : "";

  async function copyCreated() {
    try {
      await navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie o link:", createdUrl);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[400px_1fr]">
      <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-line bg-ink-soft p-5 lg:self-start">
        <h2 className="font-semibold text-paper">Novo link de pagamento</h2>

        {!redeReady && (
          <p className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-200">
            A Rede ainda não está configurada: o link é criado, mas o cliente não conseguirá pagar até você
            definir <code>REDE_PV</code> e <code>REDE_TOKEN</code>.
          </p>
        )}

        <label className="block text-xs text-fog">
          O que está sendo cobrado
          <input
            className={inputClass}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Ex: Revisão completa + troca de pneus"
            maxLength={140}
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-fog">
            Valor (R$)
            <input
              className={inputClass}
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="1.500,00"
              required
            />
          </label>
          <label className="block text-xs text-fog">
            Parcelas (até)
            <select className={inputClass} value={form.maxInstallments} onChange={(e) => set("maxInstallments", e.target.value)}>
              {Array.from({ length: MAX_LINK_INSTALLMENTS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "À vista (1x)" : `${n}x sem juros`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-fog">
            Cliente (opcional)
            <input className={inputClass} value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Nome" />
          </label>
          <label className="block text-xs text-fog">
            WhatsApp (opcional)
            <input
              className={inputClass}
              inputMode="tel"
              value={form.customerPhone}
              onChange={(e) => set("customerPhone", formatPhone(e.target.value))}
              placeholder="(48) 99999-9999"
            />
          </label>
        </div>

        <label className="block text-xs text-fog">
          Validade
          <select className={inputClass} value={form.expiresInDays} onChange={(e) => set("expiresInDays", e.target.value)}>
            <option value="1">1 dia</option>
            <option value="3">3 dias</option>
            <option value="7">7 dias</option>
            <option value="15">15 dias</option>
            <option value="30">30 dias</option>
            <option value="0">Sem validade</option>
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-mist">
          <input
            type="checkbox"
            checked={form.requireAddress}
            onChange={(e) => set("requireAddress", e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Pedir endereço de entrega ao cliente
        </label>

        {error && (
          <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
          {busy ? "Gerando..." : "Gerar link"}
        </button>

        {created && (
          <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm">
            <p className="font-semibold text-emerald-200">Link criado!</p>
            <p className="mt-1 break-all text-emerald-100/90">{createdUrl}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={copyCreated} className={ghostBtn}>
                {copied ? "Copiado!" : "Copiar link"}
              </button>
              <a href={whatsappShare(created, createdUrl)} target="_blank" rel="noopener noreferrer" className={ghostBtn}>
                Enviar por WhatsApp
              </a>
            </div>
          </div>
        )}
      </form>

      <div>
        <h2 className="font-semibold text-paper">Links criados</h2>
        {links.length === 0 ? (
          <p className="mt-4 rounded-xl border border-line bg-ink-soft p-8 text-center text-sm text-mist">
            Nenhum link ainda.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {links.map((l) => (
              <LinkRow key={l.id} link={l} onCancel={handleCancel} busy={busy} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
