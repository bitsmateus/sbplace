"use client";

import { useRef, useState } from "react";

// Player limpo para um arquivo de vídeo do próprio site (sem YouTube, sem
// logos nem "mais vídeos"). Mostra o primeiro quadro com um botão de play;
// depois do clique aparecem os controles nativos do navegador.
export default function LocalVideo({
  src,
  poster,
  title,
  duration,
  className = "aspect-[9/16]",
}) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);

  function start() {
    setStarted(true);
    videoRef.current?.play();
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-ink shadow-2xl shadow-ink/25 ${className}`}
    >
      <video
        ref={videoRef}
        // #t=0.1 faz o navegador mostrar um quadro real como capa
        src={poster ? src : `${src}#t=0.1`}
        poster={poster || undefined}
        preload="metadata"
        playsInline
        controls={started}
        onEnded={() => setStarted(false)}
        aria-label={title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {!started && (
        <button
          type="button"
          onClick={start}
          aria-label={`Reproduzir vídeo: ${title}`}
          className="group absolute inset-0 block h-full w-full cursor-pointer"
        >
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-ink/20"
          />
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink shadow-xl transition duration-300 group-hover:scale-110 group-hover:bg-gold md:h-20 md:w-20"
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-1"
            >
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          </span>
          <span className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-left text-paper">
            <span className="text-sm font-medium">{title}</span>
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
