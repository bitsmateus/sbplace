"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NOTIFICATION_EVENTS } from "@/lib/notification-constants";
import { formatPhone } from "@/lib/order-constants";

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-mist focus:outline-none";
const ghostBtn =
  "inline-flex h-10 items-center justify-center rounded-full border border-line px-4 text-sm text-mist transition hover:text-paper disabled:opacity-50";

// Notificações de WhatsApp dos pedidos: qual template oficial (Meta) usar em
// cada evento, e envio de teste.
export default function NotificationsForm({ settings, nxReady }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testing, setTesting] = useState("");
  const [testResult, setTestResult] = useState({});

  function setEvent(event, field, value) {
    setSaved(false);
    setForm((prev) => ({
      ...prev,
      events: { ...prev.events, [event]: { ...prev.events[event], [field]: value } },
    }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar.");
      setForm(data.settings);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function test(event) {
    setTesting(event);
    setTestResult((prev) => ({ ...prev, [event]: null }));
    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, phone: testPhone }),
      });
      const data = await res.json().catch(() => ({}));
      setTestResult((prev) => ({
        ...prev,
        [event]: res.ok ? { ok: true, text: "Enviado! Confira o WhatsApp." } : { ok: false, text: data.error || "Falhou." },
      }));
    } catch {
      setTestResult((prev) => ({ ...prev, [event]: { ok: false, text: "Erro de conexão." } }));
    } finally {
      setTesting("");
    }
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      {!nxReady && (
        <p className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          A API da NX ainda não está configurada no servidor: defina <code>NX_API_URL</code>,{" "}
          <code>NX_API_ID</code> e <code>NX_API_TOKEN</code>. Até lá, nenhuma mensagem é enviada.
        </p>
      )}

      <p className="text-sm text-mist">
        Cada mensagem usa um <strong className="text-paper">template aprovado pela Meta</strong> no
        canal oficial da NX. Crie o template com as variáveis na ordem indicada, espere a aprovação
        e cole aqui o nome exato.
      </p>

      {NOTIFICATION_EVENTS.map((def) => {
        const ev = form.events[def.event];
        const result = testResult[def.event];
        return (
          <section key={def.event} className="rounded-xl border border-line bg-ink-soft p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-paper">{def.label}</h3>
                <p className="text-sm text-mist">{def.when}</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-mist">
                <input
                  type="checkbox"
                  checked={ev.enabled}
                  onChange={(e) => setEvent(def.event, "enabled", e.target.checked)}
                  className="h-4 w-4 accent-gold"
                />
                Enviar automaticamente
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
              <label className="block text-xs text-fog">
                Nome do template na Meta
                <input
                  className={inputClass}
                  value={ev.templateName}
                  onChange={(e) => setEvent(def.event, "templateName", e.target.value)}
                  placeholder={`ex: sbplace_${def.event}`}
                />
              </label>
              <label className="block text-xs text-fog">
                Idioma
                <input
                  className={inputClass}
                  value={ev.language}
                  onChange={(e) => setEvent(def.event, "language", e.target.value)}
                  placeholder="pt_BR"
                />
              </label>
            </div>

            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-mist hover:text-paper">
                Variáveis do template ({def.params.length}) e texto sugerido
              </summary>
              <ol className="mt-3 space-y-1 text-mist">
                {def.params.map(([key, desc], i) => (
                  <li key={key}>
                    <code className="text-gold">{`{{${i + 1}}}`}</code> {desc}
                  </li>
                ))}
              </ol>
              <p className="mt-3 rounded-lg border border-line bg-ink p-3 text-mist">{def.example}</p>
            </details>

            {nxReady && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={testing !== "" || !ev.templateName || testPhone.replace(/\D/g, "").length < 10}
                  onClick={() => test(def.event)}
                  className={ghostBtn}
                >
                  {testing === def.event ? "Enviando..." : "Enviar teste"}
                </button>
                {result && (
                  <span className={`text-sm ${result.ok ? "text-emerald-300" : "text-red-300"}`}>{result.text}</span>
                )}
              </div>
            )}
          </section>
        );
      })}

      <section className="space-y-4 rounded-xl border border-line bg-ink-soft p-5">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-mist">
          <input
            type="checkbox"
            checked={form.closeTicket}
            onChange={(e) => {
              setSaved(false);
              setForm((prev) => ({ ...prev, closeTicket: e.target.checked }));
            }}
            className="h-4 w-4 accent-gold"
          />
          Fechar o atendimento na NX depois de enviar (se o cliente responder, abre um novo)
        </label>
        {nxReady && (
          <label className="block max-w-xs text-xs text-fog">
            WhatsApp para os envios de teste
            <input
              className={inputClass}
              inputMode="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(formatPhone(e.target.value))}
              placeholder="(48) 99999-9999"
            />
          </label>
        )}
      </section>

      {error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-12 items-center justify-center rounded-full bg-paper px-7 text-sm font-semibold text-ink transition hover:bg-gold disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar notificações"}
        </button>
        {saved && <span className="text-sm text-emerald-300">Salvo.</span>}
      </div>
    </form>
  );
}
