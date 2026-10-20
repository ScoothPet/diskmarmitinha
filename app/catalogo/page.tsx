import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/catalog-browser";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Descartáveis, embalagens, limpeza, cozinha, organização, decoração e mais. Monte sua lista e peça o orçamento.",
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <>
      <PageHero
        eyebrow="Catálogo"
        title="Monte sua lista de orçamento"
        description="Escolha os produtos, ajuste as quantidades e envie tudo de uma vez. Respondemos com valores e prazo pelo WhatsApp."
      />
      <section className="py-12 sm:py-16">
        <div className="container-site">
          <CatalogBrowser initialQuery={typeof q === "string" ? q : ""} />
        </div>
      </section>
    </>
  );
}
