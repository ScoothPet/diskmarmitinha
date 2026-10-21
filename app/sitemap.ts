import type { MetadataRoute } from "next";
import { categories } from "@/lib/catalog";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/catalogo", "/orcamento", "/empresas", "/quem-somos", "/unidades", "/ajuda", "/contato"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...categories.map((c) => ({ url: `${site.url}/catalogo/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
