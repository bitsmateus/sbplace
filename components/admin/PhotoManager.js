"use client";

import { useRef, useState } from "react";
import { uploadUrl } from "@/lib/uploads";

const MAX_SIZE = 20 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// Várias fotos de uma vez, arrastar-e-soltar para enviar, arrastar para
// reordenar, "Definir como capa" e remover. A 1ª foto é a capa no site.
export default function PhotoManager({ images, setImages, onError }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(0); // qtd de fotos em envio
  const [dropActive, setDropActive] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  async function uploadFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    onError("");

    const valid = [];
    for (const f of files) {
      if (!TYPES.includes(f.type)) {
        onError(`"${f.name}": formato não suportado (use JPG, PNG, WEBP ou AVIF).`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        onError(`"${f.name}": arquivo muito grande (máximo 20MB).`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length === 0) return;

    setUploading(valid.length);
    for (const file of valid) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Falha ao enviar a foto.");
        // adiciona assim que cada foto termina (a lista vai enchendo)
        setImages((prev) => [...prev, data.filename]);
      } catch (err) {
        onError(`"${file.name}": ${err.message}`);
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }
  }

  function move(from, to) {
    setImages((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  return (
    <div>
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <li
              key={img}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => {
                e.preventDefault();
                if (overIndex !== i) setOverIndex(i);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={`group relative overflow-hidden rounded-xl border bg-ink-soft transition ${
                overIndex === i && dragIndex !== null && dragIndex !== i
                  ? "border-gold"
                  : "border-line"
              } ${dragIndex === i ? "opacity-40" : ""}`}
            >
              <div className="aspect-[4/3] cursor-grab active:cursor-grabbing">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadUrl(img, 320)}
                  srcSet={`${uploadUrl(img, 320)} 1x, ${uploadUrl(img, 640)} 2x`}
                  loading="lazy"
                  decoding="async"
                  alt={`Foto ${i + 1}`}
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </div>

              {i === 0 ? (
                <span className="absolute left-2 top-2 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase text-ink">
                  Capa
                </span>
              ) : (
                <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] text-mist">
                  {i + 1}
                </span>
              )}

              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((x) => x !== img))}
                aria-label={`Remover foto ${i + 1}`}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/80 text-paper transition hover:bg-accent hover:text-ink"
              >
                ×
              </button>

              <div className="flex items-center justify-between gap-1 border-t border-line px-2 py-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label="Mover para a esquerda"
                  className="h-10 w-10 shrink-0 rounded-full text-mist transition hover:bg-paper/10 hover:text-paper disabled:opacity-30"
                >
                  ←
                </button>
                {i !== 0 ? (
                  <button
                    type="button"
                    onClick={() => move(i, 0)}
                    className="rounded-full px-3 py-2.5 text-mist transition hover:bg-paper/10 hover:text-paper"
                  >
                    <span className="hidden sm:inline">Definir capa</span>
                    <span className="sm:hidden">Capa</span>
                  </button>
                ) : (
                  <span className="text-fog">Foto principal</span>
                )}
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === images.length - 1}
                  aria-label="Mover para a direita"
                  className="h-10 w-10 shrink-0 rounded-full text-mist transition hover:bg-paper/10 hover:text-paper disabled:opacity-30"
                >
                  →
                </button>
              </div>
            </li>
          ))}

          {Array.from({ length: uploading }).map((_, i) => (
            <li
              key={`up-${i}`}
              className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-line bg-ink-soft text-xs text-mist"
            >
              Enviando…
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(e) => {
          if (dragIndex !== null) return; // arrastando uma foto da lista, não um arquivo
          e.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={(e) => {
          if (dragIndex !== null) return;
          e.preventDefault();
          setDropActive(false);
          uploadFiles(e.dataTransfer.files);
        }}
        className={`mt-4 rounded-xl border border-dashed p-6 text-center transition ${
          dropActive ? "border-gold bg-gold/10" : "border-line"
        }`}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading > 0}
          className="inline-flex h-11 items-center rounded-full bg-paper px-6 text-sm font-semibold text-ink transition hover:bg-gold disabled:opacity-60"
        >
          {uploading > 0 ? `Enviando ${uploading}…` : "+ Adicionar fotos"}
        </button>
        <p className="mt-3 text-sm text-mist">
          ou arraste as fotos para cá. Pode escolher várias de uma vez.
        </p>
        <p className="mt-1 text-xs text-fog">
          JPG, PNG, WEBP ou AVIF, até 20MB cada. As fotos são otimizadas
          automaticamente para o site carregar rápido.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => {
            uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 1 && (
        <p className="mt-3 text-xs text-fog">
          Arraste as fotos para mudar a ordem. A primeira é a capa no catálogo e
          na página da bike.
        </p>
      )}
    </div>
  );
}
