"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Recarrega os dados da página a cada `seconds` (ex: pedido aguardando a
// confirmação do banco). Para sozinho depois de `maxTimes` tentativas.
export default function AutoRefresh({ seconds = 6, maxTimes = 50 }) {
  const router = useRouter();
  useEffect(() => {
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      if (count > maxTimes) clearInterval(timer);
      else router.refresh();
    }, seconds * 1000);
    return () => clearInterval(timer);
  }, [router, seconds, maxTimes]);
  return null;
}
