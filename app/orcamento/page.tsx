import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { QuoteForm } from "./quote-form";

export const metadata: Metadata = {
  title: "Solicitar orçamento",
  description: "Envie sua lista de produtos, escolha entrega ou retirada e receba o orçamento pelo WhatsApp.",
};

export default function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Orçamento"
        title="Minha lista de orçamento"
        description="Confira os itens, informe como quer receber e envie. Nossa equipe responde pelo WhatsApp com valores e prazo."
      />
      <section className="bg-mist-50/60 py-10 sm:py-14">
        <div className="container-site">
          <QuoteForm />
        </div>
      </section>
    </>
  );
}
