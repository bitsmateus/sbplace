"use client";

import { useEffect, useRef, useState } from "react";
import { whatsappLink } from "@/lib/site-config";
import {
  DIAS_PARA_DESPACHO,
  calcularEntrega,
  formatarCep,
  formatarData,
  limparCep,
} from "@/lib/prazos-entrega";

// O CEP fica salvo no navegador do cliente: nas próximas seminovas que ele
// abrir, o prazo já aparece calculado.
const CHAVE_CEP = "sbplace:cep";
const BUSCA_CEP_CORREIOS = "https://buscacepinter.correios.com.br/app/endereco/index.php";

// Cidade e UF do CEP pelo ViaCEP (gratuito, sem chave). Se não responder em
// 4 segundos ou não conhecer o CEP, o prazo sai só pela faixa do CEP.
async function buscarCidade(cep) {
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 4000);
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: controle.signal,
    });
    if (!resposta.ok) return {};
    const dados = await resposta.json();
    if (dados.erro) return {};
    return { cidade: dados.localidade, uf: dados.uf };
  } catch {
    return {};
  } finally {
    clearTimeout(limite);
  }
}

function lerCepSalvo() {
  try {
    return localStorage.getItem(CHAVE_CEP) || "";
  } catch {
    return "";
  }
}

function salvarCep(cep) {
  try {
    localStorage.setItem(CHAVE_CEP, cep);
  } catch {
    // navegador sem armazenamento (aba anônima etc.): só não lembra o CEP
  }
}

// Campo "Calcule o prazo de entrega" da página da seminova: o cliente digita o
// CEP e vê o frete grátis, o prazo em dias úteis e a data prevista de chegada.
export default function PrazoEntrega({ bikeName, pageUrl }) {
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState({ status: "inicial" });
  const ultimoCep = useRef("");
  const pedidoAtual = useRef(0);
  const clienteMexeu = useRef(false);

  // Cliente que já consultou um CEP antes: o prazo aparece sozinho ao abrir a
  // página (só se ele ainda não começou a digitar outro CEP).
  useEffect(() => {
    const salvo = lerCepSalvo();
    if (!/^\d{8}$/.test(salvo)) return;
    let cancelado = false;
    buscarCidade(salvo).then((local) => {
      if (cancelado || clienteMexeu.current) return;
      const resultado = calcularEntrega(salvo, local);
      if (!resultado) return;
      ultimoCep.current = salvo;
      setCep(formatarCep(salvo));
      setEstado({ status: "pronto", resultado });
    });
    return () => {
      cancelado = true;
    };
  }, []);

  async function calcular(valor) {
    const digitos = limparCep(valor);
    if (digitos.length !== 8) {
      setEstado({ status: "erro", mensagem: "Digite os 8 números do CEP." });
      return;
    }
    ultimoCep.current = digitos;
    const pedido = ++pedidoAtual.current;
    setEstado({ status: "carregando" });

    const local = await buscarCidade(digitos);
    if (pedido !== pedidoAtual.current) return; // o cliente já mudou o CEP

    const resultado = calcularEntrega(digitos, local);
    if (!resultado) {
      setEstado({ status: "erro", mensagem: "CEP inválido. Confira os números." });
      return;
    }
    setEstado({ status: "pronto", resultado });
    salvarCep(digitos);
  }

  function aoDigitar(e) {
    clienteMexeu.current = true;
    const digitos = limparCep(e.target.value);
    setCep(formatarCep(digitos));
    if (digitos.length === 8) {
      // no celular o teclado numérico não tem "Enter": calcula ao completar
      if (digitos !== ultimoCep.current) calcular(digitos);
    } else if (estado.status !== "inicial") {
      ultimoCep.current = "";
      pedidoAtual.current += 1; // descarta uma busca que ainda esteja em andamento
      setEstado({ status: "inicial" });
    }
  }

  function aoEnviar(e) {
    e.preventDefault();
    clienteMexeu.current = true;
    calcular(cep);
  }

  const carregando = estado.status === "carregando";
  const erro = estado.status === "erro";

  return (
    <section
      aria-labelledby="prazo-entrega-titulo"
      className="mt-6 rounded-2xl border border-hairline p-4 md:p-5"
    >
      <h2
        id="prazo-entrega-titulo"
        className="flex items-center gap-2 text-base font-semibold text-ink"
      >
        <IconeCaminhao />
        Calcule o prazo de entrega
      </h2>

      <form onSubmit={aoEnviar} noValidate className="mt-3 flex gap-2">
        <label htmlFor="cep-entrega" className="sr-only">
          Seu CEP
        </label>
        <input
          id="cep-entrega"
          name="cep"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="Digite seu CEP"
          maxLength={9}
          value={cep}
          onChange={aoDigitar}
          aria-invalid={erro}
          aria-describedby={erro ? "cep-entrega-erro" : undefined}
          className="h-12 w-0 min-w-0 flex-1 rounded-full border border-hairline bg-paper px-4 text-base text-ink transition placeholder:text-stone/70 focus:border-ink focus:outline-none md:px-5"
        />
        <button
          type="submit"
          disabled={carregando}
          aria-busy={carregando}
          className="h-12 shrink-0 rounded-full border border-ink px-5 font-semibold text-ink transition hover:bg-ink hover:text-paper disabled:cursor-wait disabled:opacity-60 md:px-6"
        >
          Calcular
        </button>
      </form>

      <a
        href={BUSCA_CEP_CORREIOS}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex min-h-11 items-center px-1 text-sm text-stone underline underline-offset-4 transition hover:text-ink"
      >
        Não sei meu CEP
      </a>

      <div aria-live="polite">
        {erro && (
          <p id="cep-entrega-erro" className="mt-1 text-sm font-medium text-accent-dark">
            {estado.mensagem}
          </p>
        )}
        {estado.status === "pronto" && (
          <Resultado resultado={estado.resultado} bikeName={bikeName} pageUrl={pageUrl} />
        )}
      </div>
    </section>
  );
}

function Resultado({ resultado: r, bikeName, pageUrl }) {
  const destino = r.cidade ? `${r.cidade}/${r.uf}` : null;
  const mensagem = [
    `Olá! Vim pelo site da SB Place e tenho interesse na bike ${bikeName}.`,
    `Meu CEP é ${r.cep}${destino ? ` (${destino})` : ""} e o site mostrou entrega em até ${r.dias} dias úteis.`,
    pageUrl,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="mt-2 rounded-xl bg-bone p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="text-sm text-stone">
          {destino ? (
            <>
              Entrega para <strong className="font-semibold text-ink">{destino}</strong>
            </>
          ) : (
            <>
              Entrega para o <strong className="font-semibold text-ink">{r.interior}</strong>
            </>
          )}
        </p>
        <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
          Frete grátis
        </span>
      </div>

      <p className="mt-2 text-xl font-semibold text-ink">
        Chega em até {r.dias} dias úteis
      </p>
      <p className="mt-1 text-[15px] text-stone">
        Previsão: até{" "}
        <strong className="font-semibold text-ink">{formatarData(r.previsao)}</strong>, se
        fechar hoje
      </p>

      {r.naCidadeDaLoja && (
        <p className="mt-3 text-[15px] text-ink">
          Você está em Tubarão: se preferir, retire a bike direto na loja.
        </p>
      )}

      <p className="mt-3 text-xs leading-relaxed text-stone">
        Previsão aproximada, em dias úteis (sem sábados, domingos e feriados). Depois da
        compra, a bike é revisada, embalada e coletada pela transportadora em até{" "}
        {DIAS_PARA_DESPACHO} dias úteis; o prazo de entrega conta a partir do dia seguinte
        à coleta.
      </p>

      <a
        href={whatsappLink(mensagem)}
        data-ref="prazo-entrega"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink underline underline-offset-4 transition hover:text-accent-dark"
      >
        <IconeWhatsApp />
        Chamar no WhatsApp com meu CEP
      </a>
    </div>
  );
}

function IconeCaminhao() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function IconeWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.1L2 22l5-1.6A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.2 15l-.3-.2-2.9.9.9-2.8-.2-.3a8.1 8.1 0 0 1 6.7-12.6zm-3 4.1c-.2 0-.5 0-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 2.2.9 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.4-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.2.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.4-1.8-.2-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4.1-.2 0-.3 0-.5-.1-.1-.6-1.5-.9-2-.2-.5-.4-.5-.6-.5z" />
    </svg>
  );
}
