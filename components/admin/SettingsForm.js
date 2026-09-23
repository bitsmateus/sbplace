"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ settings }) {
  const router = useRouter();

  const [about, setAbout] = useState(settings.about || "");
  const [hours, setHours] = useState(settings.hours || "");
  const [addressLine, setAddressLine] = useState(settings.addressLine || "");
  const [legalName, setLegalName] = useState(settings.legalName || "");
  const [cnpj, setCnpj] = useState(settings.cnpj || "");
  const [differentials, setDifferentials] = useState(
    settings.differentials && settings.differentials.length > 0
      ? settings.differentials
      : [{ title: "", description: "" }]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function updateDifferential(index, field, value) {
    setDifferentials((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addDifferential() {
    setDifferentials((prev) => [...prev, { title: "", description: "" }]);
  }

  function removeDifferential(index) {
    setDifferentials((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    const payload = {
      about,
      hours,
      addressLine,
      legalName,
      cnpj,
      differentials: differentials.filter(
        (d) => d.title.trim() || d.description.trim()
      ),
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível salvar.");
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-10">
      <div>
        <label className="block text-xs uppercase tracking-wide text-fog">
          Sobre a loja
        </label>
        <p className="mt-1 text-xs text-fog">
          Aparece na home, na seção &quot;Sobre a SB Place&quot;.
        </p>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows={5}
          placeholder="Conte a história da loja, o que vocês oferecem, o que diferencia o atendimento..."
          className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-fog">
          Endereço completo
        </label>
        <p className="mt-1 text-xs text-fog">
          Rua, número e bairro. Aparece no rodapé, no Contato e no mapa.
        </p>
        <input
          type="text"
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          placeholder="Ex: Rua XV de Novembro, 123 - Centro"
          className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-wide text-fog">
            Razão social
          </label>
          <input
            type="text"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="Ex: SB Place Comércio de Bicicletas Ltda"
            className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-fog">
            CNPJ
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0000-00"
            className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
          />
        </div>
      </div>
      <p className="-mt-4 text-xs text-fog">
        Aparecem no rodapé do site. Deixe em branco para não exibir.
      </p>

      <div>
        <label className="block text-xs uppercase tracking-wide text-fog">
          Horário de funcionamento
        </label>
        <p className="mt-1 text-xs text-fog">
          Uma linha por período. Ex: &quot;Segunda a sexta: 8h às 12h e 13h30 às
          19h&quot;.
        </p>
        <textarea
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          rows={4}
          placeholder={
            "Segunda a sexta: 8h às 12h e 13h30 às 19h\nSábado: 8h às 12h\nDomingo: fechado"
          }
          className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-fog">
          Diferenciais / serviços
        </label>
        <p className="mt-1 text-xs text-fog">
          Aparecem como cards na home. Ex: &quot;Manutenção&quot;, &quot;Bike fit&quot;,
          &quot;Parcelamento&quot;.
        </p>

        <div className="mt-3 space-y-4">
          {differentials.map((d, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-lg border border-line bg-ink-soft p-4 sm:flex-row sm:items-start"
            >
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={d.title}
                  onChange={(e) => updateDifferential(i, "title", e.target.value)}
                  placeholder="Título (ex: Manutenção)"
                  className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-mist focus:outline-none"
                />
                <input
                  type="text"
                  value={d.description}
                  onChange={(e) =>
                    updateDifferential(i, "description", e.target.value)
                  }
                  placeholder="Descrição curta"
                  className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-mist focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => removeDifferential(i)}
                className="inline-flex min-h-11 shrink-0 items-center self-start px-3 text-xs text-accent hover:text-accent-dark"
              >
                remover
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addDifferential}
          className="mt-3 inline-flex min-h-11 items-center text-sm text-mist hover:text-paper"
        >
          + Adicionar diferencial
        </button>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}
      {saved && !error && (
        <p className="text-sm text-mist">Configurações salvas.</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-7 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-accent-dark disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}
