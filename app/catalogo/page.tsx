import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/catalog-browser";
import { PageHero } from "@/components/ui";
import { totalProducts } from "@/lib/catalog";
import { searchProducts } from "@/lib/catalog-server";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Embalagens, descartáveis, utensílios, panelas, organização, limpeza, mesa posta, decoração, jardinagem e mais. Monte sua lista e peça o orçamento.",
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 120) : "";
  const initial = searchProducts({ q: query });
  return (
    <>
      <PageHero
        eyebrow="Catálogo"
        title="Monte sua lista de orçamento"
        description={`São ${totalProducts.toLocaleString("pt-BR")} produtos das nossas lojas. Escolha os itens, ajuste as quantidades e envie tudo de uma vez. Respondemos com valores e prazo pelo WhatsApp.`}
      />
      <section className="py-12 sm:py-16">
        <div className="container-site">
          <CatalogBrowser key={query} initial={initial} initialQuery={query} />
        </div>
      </section>
    </>
  );
}
