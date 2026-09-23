"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const INTERVAL_MS = 6000;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function episodeLabel(ep) {
  return `Episódio ${String(ep.number).padStart(2, "0")}`;
}

const videoUrl = (ep) => `https://www.youtube.com/watch?v=${ep.videoId}`;

// Episódio em destaque que alterna sozinho a cada 6 s. Passar o mouse (ou o
// foco do teclado) pausa; clicar num item da lista destaca aquele episódio.
// Quem prefere menos movimento (prefers-reduced-motion) não tem rotação
// automática.
export default function PodcastShowcase({ episodes }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0); // reinicia a barra de progresso
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  );

  const running = !paused && !reduceMotion && episodes.length > 1;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => {
      setActive((i) => (i + 1) % episodes.length);
      setCycle((c) => c + 1); // reinicia a barra de progresso
    }, INTERVAL_MS);
    return () => clearTimeout(id);
  }, [active, running, episodes.length]);

  const current = episodes[active];

  return (
    <div
      className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setCycle((c) => c + 1);
      }}
      onFocus={() => setPaused(true)}
      onBlur={() => {
        setPaused(false);
        setCycle((c) => c + 1);
      }}
    >
      <a
        href={videoUrl(current)}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink-soft">
          {episodes.map((ep, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={ep.videoId}
              src={ep.cover}
              width={640}
              height={360}
              loading="lazy"
              decoding="async"
              alt={i === active ? `${episodeLabel(ep)}: ${ep.guest}` : ""}
              aria-hidden={i !== active}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink transition group-hover:scale-110 group-hover:bg-paper"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          </span>
        </div>

        {/* aria-live avisa leitores de tela quando o destaque muda */}
        <div aria-live="polite" className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            {episodeLabel(current)} · {current.duration}
          </p>
          <h3 className="mt-1 text-xl font-semibold md:text-2xl">
            {current.guest}
          </h3>
          {current.role && <p className="text-mist">{current.role}</p>}
        </div>
      </a>

      <ul className="flex flex-col gap-3">
        {episodes.map((ep, i) => {
          const isActive = i === active;
          return (
            <li key={ep.videoId}>
              <button
                type="button"
                onClick={() => {
                  setActive(i);
                  setCycle((c) => c + 1);
                }}
                aria-current={isActive}
                aria-label={`Destacar ${episodeLabel(ep)}: ${ep.guest}`}
                className={`group relative flex w-full gap-4 overflow-hidden rounded-xl p-2 text-left transition ${
                  isActive ? "bg-paper/10" : "hover:bg-paper/5"
                }`}
              >
                <div className="relative aspect-video w-[42%] shrink-0 overflow-hidden rounded-lg bg-ink-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ep.cover}
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    alt=""
                    className={`h-full w-full object-cover transition duration-500 ${
                      isActive ? "" : "opacity-70 group-hover:opacity-100"
                    }`}
                  />
                </div>
                <div className="min-w-0 self-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                    {episodeLabel(ep)} · {ep.duration}
                  </p>
                  <h3 className="mt-1 text-base font-semibold leading-snug md:text-lg">
                    {ep.guest}
                  </h3>
                  {ep.role && (
                    <p className="mt-0.5 text-sm text-mist">{ep.role}</p>
                  )}
                </div>

                {/* barra de progresso dos 6 s do episódio em destaque */}
                {isActive && running && (
                  <span
                    key={cycle}
                    aria-hidden
                    className="absolute bottom-0 left-0 h-0.5 bg-gold"
                    style={{ animation: `podcast-progress ${INTERVAL_MS}ms linear forwards` }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
