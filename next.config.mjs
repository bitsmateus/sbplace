/** @type {import('next').NextConfig} */

// Arquivos de /public não têm "impressão digital" no nome, então não dá para
// cachear "para sempre": 1 dia no navegador e, depois, atualiza em 2º plano.
const staticCache = [
  { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
];

const nextConfig = {
  experimental: {
    // O proxy.js protege /api/admin e, por padrão, só armazena 10MB do corpo da
    // requisição — fotos grandes de celular seriam cortadas no upload.
    proxyClientMaxBodySize: "25mb",
  },
  async headers() {
    return [
      "/hero.webp",
      "/hero-800.webp",
      "/cafe.webp",
      "/cafe-480.webp",
      "/historia.webp",
      "/logo.png",
      "/icon.png",
      "/podcast/:path*",
      "/videos/:path*",
    ].map((source) => ({ source, headers: staticCache }));
  },
};

export default nextConfig;
