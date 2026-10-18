"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadUrl } from "@/lib/uploads";

const MAX_SIZE = 20 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function emptyMember() {
  return { name: "", role: "", photo: "", hidden: false };
}

// Cadastro da equipe que aparece na seção "A loja" do site: foto, nome e
// cargo. A ordem da lista é a ordem que o site mostra.
export default function TeamForm({ team }) {
  const router = useRouter();
  const [members, setMembers] = useState(
    team && team.length > 0 ? team : [emptyMember()]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function update(index, field, value) {
    setSaved(false);
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function move(index, delta) {
    setSaved(false);
    setMembers((prev) => {
      const to = index + delta;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function remove(index) {
    setSaved(false);
    setMembers((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [emptyMember()];
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    const payload = {
      team: members
        .filter((m) => m.name.trim() || m.role.trim() || m.photo)
        .map((m) => ({
          name: m.name.trim(),
          role: m.role.trim(),
          photo: m.photo || "",
          hidden: Boolean(m.hidden),
        })),
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar.");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="space-y-4">
        {members.map((m, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-xl border border-line bg-ink-soft p-4 sm:flex-row"
          >
            <PhotoField
              photo={m.photo}
              name={m.name}
              onChange={(file) => update(i, "photo", file)}
              onError={setError}
            />

            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={m.name}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder="Nome (ex: William Fagundes)"
                className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-mist focus:outline-none"
              />
              <input
                type="text"
                value={m.role}
                onChange={(e) => update(i, "role", e.target.value)}
                placeholder="Cargo (ex: Consultor)"
                className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-mist focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-fog">
                  <input
                    type="checkbox"
                    checked={Boolean(m.hidden)}
                    onChange={(e) => update(i, "hidden", e.target.checked)}
                    className="h-4 w-4 accent-gold"
                  />
                  Não mostrar no site
                </label>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Mover para cima"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-mist transition hover:text-paper disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === members.length - 1}
                    aria-label="Mover para baixo"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-mist transition hover:text-paper disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="inline-flex min-h-9 items-center px-3 text-xs text-accent hover:text-accent-dark"
                  >
                    remover
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setMembers((prev) => [...prev, emptyMember()])}
        className="inline-flex min-h-11 items-center text-sm text-mist hover:text-paper"
      >
        + Adicionar pessoa
      </button>

      {error && <p className="text-sm text-accent">{error}</p>}
      {saved && !error && <p className="text-sm text-mist">Equipe salva.</p>}

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-7 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-accent-dark disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar equipe"}
        </button>
      </div>
    </form>
  );
}

function PhotoField({ photo, name, onChange, onError }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    onError("");
    if (!TYPES.includes(file.type)) {
      onError("Formato não suportado (use JPG, PNG, WEBP ou AVIF).");
      return;
    }
    if (file.size > MAX_SIZE) {
      onError("Arquivo muito grande (máximo 20MB).");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Falha ao enviar a foto.");
      onChange(data.filename);
    } catch (err) {
      onError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative block h-32 w-24 overflow-hidden rounded-lg border border-line bg-ink text-center transition hover:border-mist"
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={uploadUrl(photo, 320)}
            alt={name || "Foto"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center px-2 text-xs text-fog">
            {uploading ? "enviando..." : "+ foto"}
          </span>
        )}
        {photo && uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/70 text-xs text-paper">
            enviando...
          </span>
        )}
      </button>
      {photo && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-1 block w-full text-center text-xs text-fog hover:text-paper"
        >
          remover foto
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
