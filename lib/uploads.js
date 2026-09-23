// Ajudantes para exibir as fotos enviadas pelo admin em vários tamanhos.
// A rota /uploads/... entrega versões redimensionadas via ?w=LARGURA
// (larguras permitidas: 160, 320, 480, 640, 800, 1200, 1600).
// Sem dependências de servidor: pode ser usado em Client Components.

export const uploadUrl = (file, width) =>
  width ? `/uploads/${file}?w=${width}` : `/uploads/${file}`;

// Retorna { src, srcSet } para <img>. Use junto com `sizes`, que diz ao
// navegador quanto espaço a imagem ocupa (ele escolhe a versão certa).
export function uploadImage(file, widths = [480, 800, 1200]) {
  const sorted = [...widths].sort((a, b) => a - b);
  return {
    src: uploadUrl(file, sorted[Math.floor(sorted.length / 2)]),
    srcSet: sorted.map((w) => `${uploadUrl(file, w)} ${w}w`).join(", "),
  };
}
