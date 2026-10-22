import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/catalog-browser";
import { PageHero } from "@/components/ui";
import { searchProducts } from "@/lib/catalog-server";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Embalagens, descartáveis, utensílios, panelas, organização, limpeza, mesa posta, decoração, jardinagem e mais. Monte sua lista e peça o orçamento.",
};

// Página pronta em cache; atualizada quando um catálogo novo é publicado em /admin/catalogo
export const revalidate = 3600;

export default async function CatalogPage() {
  const initial = await searchProducts({});
  return (
    <>
      <PageHero
        eyebrow="Catálogo"
        title="Monte sua lista de orçamento"
        description="Escolha os produtos das nossas lojas, ajuste as quantidades e envie tudo de uma vez. Respondemos com valores e prazo pelo WhatsApp."
      />
      <section className="py-12 sm:py-16">
        <div className="container-site">
          <CatalogBrowser initial={initial} />
        </div>
      </section>
    </>
  );
}
