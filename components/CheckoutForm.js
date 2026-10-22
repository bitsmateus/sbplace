"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/bike-constants";
import {
  formatCardNumber,
  formatCpf,
  formatPhone,
  isValidCardNumber,
  isValidCpf,
  isValidEmail,
  onlyDigits,
} from "@/lib/order-constants";

const inputClass =
  "mt-1.5 h-12 w-full rounded-xl border border-hairline bg-paper px-4 text-base text-ink placeholder:text-fog focus:border-ink focus:outline-none";
const labelClass = "block text-sm font-medium text-ink";
const CHAVE_CEP = "sbplace:cep";

function Field({ label, error, className = "", children }) {
  return (
    <label className={`${labelClass} ${className}`}>
      {label}
      {children}
      {error && <span className="mt-1 block text-sm font-normal text-red-600">{error}</span>}
    </label>
  );
}

// Checkout da seminova: dados do cliente, endereço de entrega e cartão. Os
// dados do cartão vão direto para a nossa API (que repassa à Rede) e nunca
// ficam salvos.
export default function CheckoutForm({ slug, priceCents, maxInstallments }) {
  const router = useRouter();
  const [f, setF] = useState({
    name: "", cpf: "", email: "", phone: "",
    cep: "", street: "", number: "", complement: "", district: "", city: "", state: "",
    cardNumber: "", holder: "", expiry: "", cvv: "", installments: "1",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cepStatus, setCepStatus] = useState("");
  const lastCep = useRef("");

  function set(field, value) {
    setF((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  }

  async function lookupCep(digits) {
    if (digits === lastCep.current) return;
    lastCep.current = digits;
    setCepStatus("Buscando endereço...");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal: controller.signal });
      const data = await res.json();
      if (!res.ok || data.erro) {
        setCepStatus("CEP não encontrado — preencha o endereço manualmente.");
        return;
      }
      setF((prev) => ({
        ...prev,
        street: prev.street || data.logradouro || "",
        district: prev.district || data.bairro || "",
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));
      setCepStatus("");
    } catch {
      setCepStatus("Não deu para buscar o endereço — preencha manualmente.");
    } finally {
      clearTimeout(timer);
    }
  }

  // CEP já consultado na página da bike
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAVE_CEP) || "";
      if (/^\d{8}$/.test(saved)) {
        queueMicrotask(() => onCep(saved));
      }
    } catch {
      // sem armazenamento: o cliente digita o CEP
    }
  }, []);

  function onCep(value) {
    const digits = onlyDigits(value).slice(0, 8);
    set("cep", digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits);
    if (digits.length === 8) lookupCep(digits);
    else lastCep.current = "";
  }

  function onExpiry(value) {
    const d = onlyDigits(value).slice(0, 4);
    set("expiry", d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  }

  function validate() {
    const e = {};
    if (f.name.trim().length < 5 || !f.name.trim().includes(" ")) e.name = "Informe o nome completo.";
    if (!isValidCpf(f.cpf)) e.cpf = "CPF inválido.";
    if (!isValidEmail(f.email)) e.email = "E-mail inválido.";
    const phone = onlyDigits(f.phone);
    if (phone.length < 10) e.phone = "Informe o telefone com DDD.";
    if (onlyDigits(f.cep).length !== 8) e.cep = "CEP inválido.";
    if (!f.street.trim()) e.street = "Informe a rua.";
    if (!f.number.trim()) e.number = "Informe o número.";
    if (!f.district.trim()) e.district = "Informe o bairro.";
    if (!f.city.trim()) e.city = "Informe a cidade.";
    if (f.state.trim().length !== 2) e.state = "UF com 2 letras.";
    if (!isValidCardNumber(f.cardNumber)) e.cardNumber = "Número do cartão inválido.";
    if (f.holder.trim().length < 3) e.holder = "Nome como está no cartão.";
    const [mm, yy] = f.expiry.split("/");
    const month = Number(mm);
    const year = 2000 + Number(yy);
    const now = new Date();
    if (!(month >= 1 && month <= 12) || !yy || yy.length !== 2) e.expiry = "Validade inválida (MM/AA).";
    else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      e.expiry = "Cartão vencido.";
    }
    if (onlyDigits(f.cvv).length < 3) e.cvv = "Código inválido.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (submitting) return;
    setFormError("");
    if (!validate()) {
      setFormError("Revise os campos destacados.");
      return;
    }
    setSubmitting(true);
    const [mm, yy] = f.expiry.split("/");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          installments: Number(f.installments),
          customer: { name: f.name, cpf: f.cpf, email: f.email, phone: f.phone },
          address: {
            cep: f.cep, street: f.street, number: f.number, complement: f.complement,
            district: f.district, city: f.city, state: f.state,
          },
          card: { number: f.cardNumber, holder: f.holder, month: mm, year: `20${yy}`, cvv: f.cvv },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível concluir o pagamento.");
      router.push(`/pedido/${data.token}`);
    } catch (err) {
      setFormError(err.message || "Erro de conexão. Tente novamente.");
      setSubmitting(false);
    }
  }

  const installmentOptions = Array.from({ length: maxInstallments }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold text-ink">Seus dados</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" error={errors.name} className="sm:col-span-2">
            <input className={inputClass} autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="CPF" error={errors.cpf}>
            <input className={inputClass} inputMode="numeric" autoComplete="off" value={f.cpf} onChange={(e) => set("cpf", formatCpf(e.target.value))} placeholder="000.000.000-00" />
          </Field>
          <Field label="WhatsApp / telefone" error={errors.phone}>
            <input className={inputClass} inputMode="tel" autoComplete="tel-national" value={f.phone} onChange={(e) => set("phone", formatPhone(e.target.value))} placeholder="(48) 99999-9999" />
          </Field>
          <Field label="E-mail" error={errors.email} className="sm:col-span-2">
            <input className={inputClass} type="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ink">Endereço de entrega</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-6">
          <Field label="CEP" error={errors.cep} className="sm:col-span-2">
            <input className={inputClass} inputMode="numeric" autoComplete="postal-code" value={f.cep} onChange={(e) => onCep(e.target.value)} placeholder="00000-000" />
          </Field>
          {cepStatus && <p className="self-end pb-3 text-sm text-stone sm:col-span-4">{cepStatus}</p>}
          <Field label="Rua" error={errors.street} className="sm:col-span-4">
            <input className={inputClass} autoComplete="address-line1" value={f.street} onChange={(e) => set("street", e.target.value)} />
          </Field>
          <Field label="Número" error={errors.number} className="sm:col-span-2">
            <input className={inputClass} value={f.number} onChange={(e) => set("number", e.target.value)} />
          </Field>
          <Field label="Complemento (opcional)" className="sm:col-span-3">
            <input className={inputClass} autoComplete="address-line2" value={f.complement} onChange={(e) => set("complement", e.target.value)} />
          </Field>
          <Field label="Bairro" error={errors.district} className="sm:col-span-3">
            <input className={inputClass} value={f.district} onChange={(e) => set("district", e.target.value)} />
          </Field>
          <Field label="Cidade" error={errors.city} className="sm:col-span-4">
            <input className={inputClass} autoComplete="address-level2" value={f.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="UF" error={errors.state} className="sm:col-span-2">
            <input className={inputClass} maxLength={2} autoComplete="address-level1" value={f.state} onChange={(e) => set("state", e.target.value.toUpperCase())} />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ink">Pagamento com cartão de crédito</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Número do cartão" error={errors.cardNumber} className="sm:col-span-2">
            <input className={inputClass} inputMode="numeric" autoComplete="cc-number" value={f.cardNumber} onChange={(e) => set("cardNumber", formatCardNumber(e.target.value))} placeholder="0000 0000 0000 0000" />
          </Field>
          <Field label="Nome impresso no cartão" error={errors.holder} className="sm:col-span-2">
            <input className={inputClass} autoComplete="cc-name" value={f.holder} onChange={(e) => set("holder", e.target.value)} />
          </Field>
          <Field label="Validade" error={errors.expiry}>
            <input className={inputClass} inputMode="numeric" autoComplete="cc-exp" value={f.expiry} onChange={(e) => onExpiry(e.target.value)} placeholder="MM/AA" />
          </Field>
          <Field label="Código de segurança" error={errors.cvv}>
            <input className={inputClass} inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={f.cvv} onChange={(e) => set("cvv", onlyDigits(e.target.value))} placeholder="CVV" />
          </Field>
          <Field label="Parcelas" className="sm:col-span-2">
            <select className={inputClass} value={f.installments} onChange={(e) => set("installments", e.target.value)}>
              {installmentOptions.map((n) => (
                <option key={n} value={n}>
                  {n}x de {formatPrice(Math.ceil(priceCents / n))} sem juros
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {formError && (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-14 w-full items-center justify-center rounded-full bg-ink px-8 text-base font-semibold text-paper transition hover:bg-accent hover:text-ink disabled:opacity-60"
        >
          {submitting ? "Processando pagamento..." : `Pagar ${formatPrice(priceCents)}`}
        </button>
        <p className="mt-3 text-center text-sm text-stone">
          {submitting
            ? "Não feche nem atualize esta página."
            : "Pagamento processado com segurança pela Rede (Itaú). Os dados do cartão não ficam salvos."}
        </p>
      </div>
    </form>
  );
}
