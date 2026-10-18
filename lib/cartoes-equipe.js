// Cartões de contato dos consultores (/equipe/<slug>).
//
// Páginas acessíveis SOMENTE pelo link direto: não existe link para elas em
// nenhum menu, rodapé ou listagem do site, e cada página sai com noindex para
// não ser indexada pelos buscadores. O consultor manda o link no WhatsApp, na
// bio do Instagram ou num QR Code.
//
// Para publicar o cartão de outro consultor, basta acrescentar um objeto aqui
// e colocar a foto em /public/equipe/<slug>.webp (quadrada, 900x900).

const CARTOES = [
  {
    slug: "heliton",
    name: "Heliton Fuchter",
    role: "Consultor de vendas",
    bio: "6 anos trabalhando com produtos Specialized, focado em inovação e tecnologia.",
    photo: "/equipe/heliton.webp",
    // Número pessoal do consultor: o cartão leva o cliente direto para ele,
    // e não para o WhatsApp geral da loja.
    whatsapp: "5548988646069",
    whatsappDisplay: "(48) 98864-6069",
    instagram: "helitonfuchter",
  },
];

export function listarCartoes() {
  return CARTOES;
}

export function getCartaoBySlug(slug) {
  return CARTOES.find((c) => c.slug === slug) || null;
}

// Mensagem que já vai preenchida quando o cliente abre o WhatsApp pelo cartão.
export function cartaoWhatsappLink(cartao) {
  const texto = encodeURIComponent(
    `Olá, ${cartao.name.split(" ")[0]}! Vim pelo seu cartão de contato da SB Place.`,
  );
  return `https://wa.me/${cartao.whatsapp}?text=${texto}`;
}
