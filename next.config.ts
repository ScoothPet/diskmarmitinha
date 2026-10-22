import type { NextConfig } from "next";

const indexable = process.env.NEXT_PUBLIC_INDEXABLE === "true";

// Categorias da primeira versão do site (itens ilustrativos) -> categorias do catálogo real
const categoriasAntigas: Record<string, string> = {
  descartaveis: "embalagens-e-descartaveis",
  embalagens: "embalagens-e-descartaveis",
  limpeza: "limpeza-e-higiene",
  "higiene-e-protecao": "limpeza-e-higiene",
  lixeiras: "limpeza-e-higiene",
  duraveis: "utensilios-de-cozinha",
  cozinha: "utensilios-de-cozinha",
  churrasco: "utensilios-de-cozinha",
  papelaria: "casa-e-ferramentas",
};

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  // O catálogo é lido do disco no servidor (lib/catalog-server.ts)
  outputFileTracingIncludes: { "/**": ["./data/catalogo/**"] },
  async redirects() {
    return Object.entries(categoriasAntigas).map(([de, para]) => ({
      source: `/catalogo/${de}`,
      destination: `/catalogo/${para}`,
      permanent: true,
    }));
  },
  async headers() {
    if (indexable) return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
