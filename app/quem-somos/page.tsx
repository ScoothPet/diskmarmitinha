import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Boxes, HeartHandshake, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Quem somos",
  description: "Desde 1990, a Disk Marmitinha evoluiu de fábrica de marmitex para um atacarejo completo de embalagens, utilidades e casa.",
};

const values = [
  { icon: BadgeCheck, title: "Qualidade", text: "Selecionamos marcas e fornecedores com cuidado em cada linha de produtos." },
  { icon: Boxes, title: "Variedade", text: "Mais de 20 mil itens para casa, cozinha, organização, limpeza e negócios." },
  { icon: HeartHandshake, title: "Atendimento próximo", text: "Uma empresa familiar que conhece os clientes pelo nome." },
  { icon: Sparkles, title: "Casa & estilo", text: "Utilidades bonitas e funcionais para deixar a rotina mais leve." },
];

const timeline = [
  { year: "1990", text: "O Sr. José Ferreira e a esposa, Maria de Fátima, chegam a Belo Horizonte e começam a fabricar marmitex." },
  { year: "Expansão", text: "O nome Disk Marmitinha se torna referência em embalagens na região e o mix cresce para descartáveis e limpeza." },
  { year: "Duas lojas", text: "A unidade de Lagoa Santa amplia o atendimento, agora com utilidades, organização, mesa posta e decoração." },
  { year: "Hoje", text: "Disk Marmitinha Casa & Estilo: um atacarejo completo para a casa, a empresa e o condomínio." },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-mist-200 bg-mist-50">
        <div className="container-site grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow text-gold-500">Quem somos</p>
            <h1 className="heading-xl mt-4 text-balance text-navy-800">
              Uma história de família, <strong className="font-semibold">desde 1990</strong>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-700">
              Tudo começou quando o Sr. José Ferreira deixou o interior de Minas em busca de novas oportunidades na capital. Ao lado da esposa, Maria de Fátima, enfrentou desafios e construiu uma trajetória de muito trabalho, honestidade e dedicação.
            </p>
          </div>
          <div className="relative aspect-[682/350] overflow-hidden rounded-3xl shadow-lift">
            <Image
              src="/images/historia-1990.jpg"
              alt="Foto antiga da família e da equipe na primeira loja da Disk Marmitinha"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container-site grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading
            eyebrow="Nossa trajetória"
            title={<>De fábrica de marmitex a <strong className="font-semibold">casa & estilo</strong></>}
            description="A marca nasceu fabricando marmitex e o nome ficou forte e reconhecido. Com o tempo, evoluímos e fomos muito além das embalagens."
          />
          <ol className="relative grid gap-10 border-l border-mist-300 pl-8">
            {timeline.map((t) => (
              <li key={t.year} className="relative">
                <span aria-hidden="true" className="absolute top-2 -left-[37px] size-3 rounded-full border-2 border-white bg-navy-800 ring-4 ring-mist-100" />
                <p className="font-display text-[28px] leading-none font-semibold text-navy-800">{t.year}</p>
                <p className="mt-3 text-[16px] leading-relaxed text-ink-700">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-navy-900 py-20 text-white sm:py-28">
        <div className="container-site">
          <SectionHeading light eyebrow="Por que a Disk Marmitinha" title={<>O que nos <strong className="font-semibold">move</strong></>} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                <Icon aria-hidden="true" className="size-7 text-gold-300" strokeWidth={1.5} />
                <h2 className="mt-5 font-display text-[24px] font-semibold">{title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-mist-200">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-site grid gap-5 md:grid-cols-3">
          {["/images/mesa-cafe.jpg", "/images/fruteira.jpg", "/images/manta.jpg"].map((src) => (
            <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src={src} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="container-site mt-12 flex flex-wrap items-center justify-between gap-6">
          <p className="heading-md max-w-xl text-navy-800">Venha conhecer nossas lojas em Belo Horizonte e Lagoa Santa.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/unidades" className="btn-primary">
              Ver unidades
            </Link>
            <Link href="/catalogo" className="btn-outline">
              Explorar catálogo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
