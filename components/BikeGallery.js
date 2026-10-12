"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BikePlaceholder from "./BikePlaceholder";
import CoresDaBike from "./CoresDaBike";
import { useCorDaBike } from "./CorDaBike";
import { uploadImage, uploadUrl } from "@/lib/uploads";
import { fotoDaCor } from "@/lib/cores-specialized";

function Arrow({ dir, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Foto anterior" : "Próxima foto"}
      className={`flex h-11 w-11 items-center justify-center rounded-full bg-paper/90 text-ink shadow-lg transition hover:bg-paper ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}

// Uma foto da galeria pode ser da loja (enviada no admin) ou a foto oficial
// daquela cor, no site da Specialized.
function src(item, largura) {
  return item.loja ? uploadUrl(item.ref, largura) : fotoDaCor(item.ref, largura);
}

function imgProps(item, larguras) {
  if (item.loja) return uploadImage(item.ref, larguras);
  const ordenadas = [...larguras].sort((a, b) => a - b);
  return {
    src: src(item, ordenadas[Math.floor(ordenadas.length / 2)]),
    srcSet: ordenadas.map((w) => `${src(item, w)} ${w}w`).join(", "),
  };
}

// Galeria da página da bike: foto grande, miniaturas, setas e ampliação em
// tela cheia (clique na foto). Setas do teclado, Esc e deslizar no celular.
// Nas bikes novas vêm também as bolinhas de cor: cada cor tem a sua foto.
export default function BikeGallery({ images, name, cores = [] }) {
  const { setCor } = useCorDaBike();

  const list = useMemo(() => {
    const daLoja = (images || []).map((ref) => ({ loja: true, ref }));
    const daCor = (cores || [])
      .map((cor, i) => (cor.foto ? { loja: false, ref: cor.foto, cor: i } : null))
      .filter(Boolean);
    return [...daLoja, ...daCor];
  }, [images, cores]);

  const count = list.length;
  const [active, setActive] = useState(0);
  const [corEscolhida, setCorEscolhida] = useState(0);
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);
  const touchX = useRef(null);

  const go = useCallback(
    (delta) => setActive((i) => (count ? (i + delta + count) % count : 0)),
    [count]
  );

  // A bolinha marcada é a da foto que está na tela; nas fotos da loja, que
  // não são de uma cor só, vale a última bolinha clicada.
  const corAtiva = list[active]?.cor ?? corEscolhida;

  useEffect(() => {
    if (cores.length) setCor(cores[corAtiva] || cores[0] || null);
  }, [corAtiva, cores, setCor]);

  function escolherCor(i) {
    setCorEscolhida(i);
    const alvo = list.findIndex((item) => item.cor === i);
    if (alvo > -1) setActive(alvo);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, go]);

  const onTouchStart = (e) => (touchX.current = e.changedTouches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  if (count === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-bone">
        <BikePlaceholder className="h-full w-full p-12 text-ink/15" />
      </div>
    );
  }

  return (
    <div>
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-bone"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ampliar foto"
          className="block h-full w-full cursor-zoom-in"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            {...imgProps(list[active], [640, 800, 1200])}
            sizes="(min-width: 768px) 540px, 100vw"
            width={1200}
            height={1200}
            fetchPriority="high"
            decoding="async"
            alt={`${name} — foto ${active + 1} de ${count}`}
            className="h-full w-full object-contain"
          />
        </button>

        {count > 1 && (
          <>
            <Arrow dir="prev" onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100" />
            <Arrow dir="next" onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100" />
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-paper backdrop-blur">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      <CoresDaBike cores={cores} ativa={corAtiva} onEscolher={escolherCor} />

      {count > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 md:gap-3">
          {list.map((item, i) => (
            <button
              key={item.ref + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className={`aspect-square overflow-hidden rounded-xl border-2 transition ${
                i === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src(item, 160)}
                srcSet={`${src(item, 160)} 1x, ${src(item, 320)} 2x`}
                width={160}
                height={160}
                alt=""
                loading="lazy"
                decoding="async"
                className={`h-full w-full ${item.loja ? "object-cover" : "object-contain"}`}
              />
            </button>
          ))}
        </div>
      )}

      {open && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${name}`}
          className="fixed inset-0 z-[60] flex flex-col bg-ink/95 backdrop-blur"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-between px-4 py-3 text-paper">
            <span className="text-sm">
              {active + 1} / {count}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-paper/10 text-2xl transition hover:bg-paper/20"
            >
              ×
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-16"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src(list[active], 1600)}
              alt={`${name} — foto ${active + 1} de ${count}`}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {count > 1 && (
              <>
                <span onClick={(e) => e.stopPropagation()} className="absolute left-3 top-1/2 -translate-y-1/2 md:left-6">
                  <Arrow dir="prev" onClick={() => go(-1)} />
                </span>
                <span onClick={(e) => e.stopPropagation()} className="absolute right-3 top-1/2 -translate-y-1/2 md:right-6">
                  <Arrow dir="next" onClick={() => go(1)} />
                </span>
              </>
            )}
          </div>

          {count > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4" onClick={(e) => e.stopPropagation()}>
              {list.map((item, i) => (
                <button
                  key={item.ref + i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition md:h-16 md:w-16 ${
                    i === active ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src(item, 160)} alt="" className={`h-full w-full ${item.loja ? "object-cover" : "object-contain"}`} />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
