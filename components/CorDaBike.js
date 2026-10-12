"use client";

// Guarda qual cor o cliente escolheu na página da bike, para o botão do
// WhatsApp mandar essa cor junto na mensagem. Fica num contexto porque as
// bolinhas (na galeria) e o botão de compra estão em lugares diferentes da
// página.
import { createContext, useContext, useMemo, useState } from "react";

const Contexto = createContext(null);

export function CorDaBikeProvider({ children }) {
  const [cor, setCor] = useState(null);
  const valor = useMemo(() => ({ cor, setCor }), [cor]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCorDaBike() {
  return useContext(Contexto) || { cor: null, setCor: () => {} };
}
