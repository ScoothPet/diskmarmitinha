import type { Metadata } from "next";
import { CatalogUpload } from "./upload";

export const metadata: Metadata = {
  title: "Atualizar catálogo",
  robots: { index: false, follow: false },
};

export default function AdminCatalogPage() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container-site max-w-3xl">
        <p className="eyebrow text-gold-500">Área restrita</p>
        <h1 className="heading-lg mt-3 text-navy-800">Atualizar catálogo</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-500">
          Envie as listas de produtos exportadas do VendasPCP das duas lojas. O site entende sozinho o que está à venda, cria nomes, descrições e
          categorias, e publica em poucos minutos. Preço e estoque não saem do seu computador: só é enviado se cada produto está à venda em cada loja.
        </p>
        <CatalogUpload />
      </div>
    </section>
  );
}
