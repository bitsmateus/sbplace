"use client";

import { useState } from "react";

// Player limpo para vídeos do YouTube: mostra só a capa e um botão de play.
// O YouTube só é carregado quando a pessoa clica (página rápida, sem
// rastreadores antes do clique, e nada de logo/sugestões antes de dar play).
export default function VideoPlayer({ videoId, title, cover, duration }) {
  const [playing, setPlaying] = useState(false);
  // Capa: a sua (se informada), senão a miniatura do YouTube em duas
  // qualidades. Se nenhuma existir, sobra o fundo escuro com o botão de play.
  const covers = [
    cover,
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  ].filter(Boolean);
  const [coverIdx, setCoverIdx] = useState(0);
  const coverSrc = covers[coverIdx];

  if (!videoId) {
    return (
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-ink">
        <div
          aria-hidden
          className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-gold/15 blur-3xl"
        />
        <p className="relative text-sm font-medium text-mist">
          Vídeo em breve
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-ink shadow-2xl shadow-ink/25">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Reproduzir vídeo: ${title}`}
          className="group absolute inset-0 block h-full w-full cursor-pointer"
        >
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-[#222] via-ink to-ink"
          />
          {coverSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverSrc}
              alt=""
              onError={() => setCoverIdx((i) => i + 1)}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          )}
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/20"
          />

          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink shadow-xl transition duration-300 group-hover:scale-110 group-hover:bg-gold md:h-24 md:w-24"
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-1"
            >
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          </span>

          <span className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-left text-paper md:bottom-6 md:left-8 md:right-8">
            <span className="text-sm font-medium md:text-base">{title}</span>
            {duration && (
              <span className="rounded-full bg-ink/60 px-3 py-1 text-xs font-medium backdrop-blur">
                {duration}
              </span>
            )}
          </span>
        </button>
      )}
    </div>
  );
}
