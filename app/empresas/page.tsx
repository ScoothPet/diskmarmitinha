import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, ClipboardList, Recycle, Store, Truck, UtensilsCrossed } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Empresas e condomínios",
  description: "Embalagens, descartáveis, limpeza e lixeiras para restaurantes, marmitarias, condomínios e empresas, com condições de atacado.",
};

const segments = [
  { icon: UtensilsCrossed, title: "Restaurantes e marmitarias", text: "Marmitex, potes, sacolas, descartáveis e utensílios para a cozinha profissional." },
  { icon: Building2, title: "Condomínios", text: "Limpeza, papel, sacos de lixo, lixeiras e coleta seletiva para áreas comuns." },
  { icon: Store, title: "Comércio e escritórios", text: "Papelaria, copa, higiene e itens de reposição para a rotina do negócio." },
];

const benefits = [
  { icon: ClipboardList, title: "Lista recorrente", text: "Envie sua lista de reposição e receba o orçamento completo de uma vez." },
  { icon: Truck, title: "Entrega ou retirada", text: "Frete grátis a partir de R$ 150 em BH e região, entrega para todo o Brasil ou retirada em BH e Lagoa Santa." },
  { icon: Recycle, title: "Coleta seletiva", text: "Lixeiras e coletores para cada tipo de resíduo e ambiente." },
];

export default function CompaniesPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-900 text-white">
        <Image src="/images/loja-corredor.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-50" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-900/90 to-navy-900/60" />
        <div className="container-site py-20 sm:py-28">
          <p className="eyebrow text-gold-300">Empresas, restaurantes e condomínios</p>
          <h1 className="heading-xl mt-4 max-w-3xl text-balance">
            Um fornecedor para abastecer <strong className="font-bold">todo o seu negócio</strong>
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-mist-200">
            Condições de atacado, variedade de mais de 20 mil itens e atendimento que entende a rotina de quem compra para reposição.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#cadastro" className="btn-light">
              Falar com o atendimento
            </a>
            <Link href="/orcamento" className="btn-ghost-light">
              Montar lista de compras
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container-site">
          <SectionHeading eyebrow="Para quem atendemos" title={<>Soluções para cada <strong className="font-semibold">segmento</strong></>} />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {segments.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-8">
                <span className="grid size-12 place-items-center rounded-xl bg-mist-100 text-navy-800">
                  <Icon aria-hidden="true" className="size-6" strokeWidth={1.5} />
                </span>
                <h2 className="heading-md mt-6 text-navy-800">{title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cadastro" className="scroll-mt-24 bg-mist-50 py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Atendimento para empresas"
              title={<>Conte o que sua empresa <strong className="font-semibold">precisa</strong></>}
              description="Preencha os dados e nossa equipe entra em contato pelo WhatsApp para entender o volume e a frequência das suas compras."
            />
            <ul className="mt-10 grid gap-6">
              {benefits.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-navy-800 shadow-soft">
                    <Icon aria-hidden="true" className="size-5" strokeWidth={1.6} />
                  </span>
                  <span>
                    <span className="block font-semibold text-navy-800">{title}</span>
                    <span className="mt-1 block text-[15px] text-ink-500">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <LeadForm variant="empresa" />
        </div>
      </section>
    </>
  );
}
