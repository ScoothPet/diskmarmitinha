import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { PageHero } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";
import { faqGroups } from "@/lib/faq";
import { site, whatsappLink } from "@/lib/site";
import { FaqBrowser } from "./faq-browser";

export const metadata: Metadata = {
  title: "Ajuda (FAQ)",
  description: "Dúvidas frequentes sobre orçamento, entrega, retirada, pagamento e atendimento da Disk Marmitinha Casa & Estilo.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqGroups.flatMap((g) =>
    g.items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a.join(" ") },
    })),
  ),
};

export default function HelpPage() {
  return (
    <>
      <PageHero
        eyebrow="Ajuda"
        title="Perguntas frequentes"
        description="Tudo sobre orçamento, entrega, retirada, pagamento e atendimento. Se a sua dúvida não estiver aqui, fale com a nossa equipe."
      />
      <section className="py-12 sm:py-16">
        <div className="container-site">
          <FaqBrowser />
        </div>
      </section>
      <section className="pb-20 sm:pb-24">
        <div className="container-site">
          <div className="flex flex-col gap-6 rounded-3xl bg-navy-900 p-8 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow text-gold-300">Ainda com dúvidas?</p>
              <h2 className="heading-md mt-2">Nossa equipe responde em horário comercial</h2>
              <p className="mt-2 text-[15px] text-mist-200">{site.hoursShort}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={whatsappLink("Olá! Tenho uma dúvida.")} className="btn-whats">
                <WhatsAppIcon className="size-5" />
                Falar no WhatsApp
              </a>
              <Link href="/contato" className="btn-ghost-light">
                <Mail aria-hidden="true" className="size-4" />
                Outros contatos
              </Link>
            </div>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
